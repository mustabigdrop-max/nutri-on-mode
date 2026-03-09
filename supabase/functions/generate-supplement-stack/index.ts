import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
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

    const anonClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!);
    const { data: { user }, error: authError } = await anonClient.auth.getUser(authHeader.replace("Bearer ", ""));
    if (authError || !user) throw new Error("Unauthorized");

    const { profile } = await req.json();

    // Fetch latest analyzed blood test
    const { data: bloodTests } = await supabase
      .from("blood_tests")
      .select("ai_analysis, test_date")
      .eq("user_id", user.id)
      .eq("status", "analyzed")
      .order("test_date", { ascending: false })
      .limit(1);

    const bloodAnalysis = bloodTests?.[0]?.ai_analysis || null;
    const bloodDate = bloodTests?.[0]?.test_date || null;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const systemPrompt = `Você é um nutricionista esportivo brasileiro expert em suplementação baseada em evidências.

Gere um stack de suplementação PERSONALIZADO usando tool calling. Considere:
- Objetivo do paciente
- Dados corporais (peso, altura, nível de atividade)
- Esporte praticado
- Condições de saúde e restrições alimentares
- Uso de GLP-1 (se aplicável, ajustar para absorção)
- Resultados de exames de sangue (se disponíveis) — priorize corrigir deficiências

Regras:
1. Máximo 8 suplementos no stack
2. Priorize essenciais primeiro, depois recomendados, depois opcionais
3. Se houver deficiências no exame de sangue, INCLUA suplementos específicos para corrigi-las
4. Inclua evidências científicas reais (autor, ano)
5. Alertas de interações se houver condições de saúde
6. Horários otimizados (manhã/tarde/noite/qualquer hora)`;

    const userPrompt = `Perfil do paciente:
- Objetivo: ${profile?.goal || "manutenção"}
- Peso: ${profile?.weight || "não informado"} kg
- Nível de atividade: ${profile?.activity || "moderado"}
- Esporte: ${profile?.sport || "nenhum"}
- Condições de saúde: ${(profile?.conditions || []).join(", ") || "nenhuma"}
- Restrições alimentares: ${(profile?.restrictions || []).join(", ") || "nenhuma"}
- Usa GLP-1: ${profile?.uses_glp1 ? "Sim" : "Não"}

${bloodAnalysis ? `Exame de sangue (${bloodDate}):
${JSON.stringify(bloodAnalysis, null, 2)}` : "Sem exame de sangue disponível."}

Gere o stack personalizado.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_stack",
              description: "Return a personalized supplement stack",
              parameters: {
                type: "object",
                properties: {
                  supplements: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string", description: "Nome do suplemento" },
                        dose: { type: "string", description: "Dosagem recomendada" },
                        timing: { type: "string", description: "Quando tomar" },
                        timingIcon: { type: "string", enum: ["morning", "afternoon", "night", "anytime"] },
                        reason: { type: "string", description: "Por que esse suplemento" },
                        evidence: { type: "string", description: "Evidência científica (autor, ano)" },
                        priority: { type: "string", enum: ["essential", "recommended", "optional"] },
                        warnings: { type: "string", description: "Avisos ou contraindicações (opcional)" },
                      },
                      required: ["name", "dose", "timing", "timingIcon", "reason", "evidence", "priority"],
                      additionalProperties: false,
                    },
                  },
                  blood_based_additions: {
                    type: "array",
                    description: "Suplementos adicionados especificamente por deficiências no exame",
                    items: {
                      type: "object",
                      properties: {
                        supplement: { type: "string" },
                        deficiency: { type: "string" },
                        marker_value: { type: "string" },
                      },
                      required: ["supplement", "deficiency", "marker_value"],
                      additionalProperties: false,
                    },
                  },
                  summary: { type: "string", description: "Resumo de 1-2 frases sobre o stack" },
                },
                required: ["supplements", "blood_based_additions", "summary"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "generate_stack" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Muitas requisições. Tente novamente em alguns segundos." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await response.text();
      console.error("AI error:", response.status, errText);
      throw new Error("AI generation failed");
    }

    const aiData = await response.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    
    let result;
    if (toolCall?.function?.arguments) {
      result = JSON.parse(toolCall.function.arguments);
    } else {
      // Fallback: parse from content
      const content = aiData.choices?.[0]?.message?.content || "";
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      result = jsonMatch ? JSON.parse(jsonMatch[0]) : { supplements: [], blood_based_additions: [], summary: "Não foi possível gerar." };
    }

    return new Response(JSON.stringify({
      success: true,
      supplements: result.supplements || [],
      blood_based_additions: result.blood_based_additions || [],
      summary: result.summary || "",
      has_blood_data: !!bloodAnalysis,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-supplement-stack error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
