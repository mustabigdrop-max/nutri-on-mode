import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing authorization");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from token
    const anonClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!);
    const { data: { user }, error: authError } = await anonClient.auth.getUser(authHeader.replace("Bearer ", ""));
    if (authError || !user) throw new Error("Unauthorized");

    const { blood_test_id, pdf_url } = await req.json();
    if (!blood_test_id || !pdf_url) throw new Error("Missing blood_test_id or pdf_url");

    // Download the PDF from storage
    const pathParts = pdf_url.split("/blood-tests/");
    const filePath = pathParts[pathParts.length - 1];
    
    const { data: fileData, error: downloadError } = await supabase
      .storage
      .from("blood-tests")
      .download(filePath);

    if (downloadError || !fileData) {
      console.error("Download error:", downloadError);
      throw new Error("Failed to download PDF");
    }

    // Convert to base64 for AI
    const arrayBuffer = await fileData.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

    // Get user profile for context
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const systemPrompt = `Você é um nutricionista especialista em interpretação de exames de sangue.
Analise o exame laboratorial do paciente e retorne APENAS um JSON válido com a seguinte estrutura:

{
  "markers": [
    {
      "name": "Nome do marcador (ex: Glicose, Colesterol Total)",
      "value": número,
      "unit": "unidade",
      "reference_range": "faixa referência",
      "status": "normal" | "low" | "high" | "critical",
      "interpretation": "breve interpretação nutricional"
    }
  ],
  "summary": "Resumo geral do exame em 2-3 frases",
  "risk_alerts": ["lista de alertas importantes"],
  "dietary_recommendations": [
    {
      "recommendation": "recomendação nutricional específica",
      "priority": "high" | "medium" | "low",
      "related_markers": ["marcadores relacionados"]
    }
  ],
  "suggested_plan_changes": {
    "increase_nutrients": ["nutrientes para aumentar"],
    "decrease_nutrients": ["nutrientes para diminuir"],
    "add_foods": ["alimentos para adicionar"],
    "avoid_foods": ["alimentos para evitar"],
    "protein_adjustment": null ou número (gramas sugeridos),
    "calorie_adjustment": null ou número (kcal sugeridos)
  }
}

Contexto do paciente:
- Peso: ${profile?.weight_kg || "não informado"} kg
- Altura: ${profile?.height_cm || "não informado"} cm  
- Objetivo: ${profile?.goal || "não informado"}
- Restrições: ${profile?.dietary_restrictions?.join(", ") || "nenhuma"}
- Condições: ${profile?.health_conditions?.join(", ") || "nenhuma"}
- Protocolo ativo: ${profile?.active_protocol || "padrão"}
- VET atual: ${profile?.vet_kcal || "não calculado"} kcal
- Proteína atual: ${profile?.protein_g || "não calculado"} g

IMPORTANTE: Retorne SOMENTE o JSON, sem markdown, sem explicações extras.`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analise este exame de sangue em PDF e forneça a interpretação nutricional completa."
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:application/pdf;base64,${base64}`
                }
              }
            ]
          }
        ],
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Muitas requisições. Tente novamente em alguns segundos." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes para análise de IA." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await aiResponse.text();
      console.error("AI error:", aiResponse.status, errText);
      throw new Error("AI analysis failed");
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content || "";

    // Parse JSON from AI response
    let analysis;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content);
    } catch {
      console.error("Failed to parse AI response:", content);
      analysis = { summary: content, markers: [], risk_alerts: [], dietary_recommendations: [], suggested_plan_changes: {} };
    }

    // Update blood test record
    const { error: updateError } = await supabase
      .from("blood_tests")
      .update({
        status: "analyzed",
        ai_analysis: analysis,
        suggested_changes: analysis.suggested_plan_changes || {},
        updated_at: new Date().toISOString(),
      })
      .eq("id", blood_test_id)
      .eq("user_id", user.id);

    if (updateError) {
      console.error("Update error:", updateError);
      throw new Error("Failed to save analysis");
    }

    return new Response(JSON.stringify({ success: true, analysis }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-blood-test error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
