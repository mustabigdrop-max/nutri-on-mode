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

    const { profile, goal, budget, currentSupplements, healthConditions, dietaryRestrictions } = await req.json();

    // Fetch latest blood test
    const { data: bloodTests } = await supabase
      .from("blood_tests")
      .select("ai_analysis, test_date")
      .eq("user_id", user.id)
      .eq("status", "analyzed")
      .order("test_date", { ascending: false })
      .limit(1);

    const bloodAnalysis = bloodTests?.[0]?.ai_analysis || null;

    // Fetch workout schedule
    const { data: workouts } = await supabase
      .from("workout_schedule")
      .select("workout_time, workout_type, day_of_week")
      .eq("user_id", user.id);

    // Fetch circadian profile
    const { data: circadian } = await supabase
      .from("circadian_profiles")
      .select("wake_time, sleep_time, chronotype")
      .eq("user_id", user.id)
      .limit(1);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const systemPrompt = `Você é um nutricionista esportivo brasileiro expert em suplementação baseada em evidências.

Gere um stack de suplementação PERSONALIZADO usando tool calling.

REGRAS DE ORÇAMENTO:
- Essencial (R$100-200): máximo 4 suplementos, priorize custo-benefício comprovado
- Intermediário (R$200-500): 5-6 suplementos, stack completo otimizado
- Avançado (R$500+): até 8 suplementos, máxima personalização

REGRAS DE TIMING:
- Creatina: qualquer horário, recomendado pós-treino com carb
- Whey: pós-treino (0-30min) ou manhã após jejum
- Cafeína: 30-45min pré-treino, NUNCA após 15h
- Beta-alanina: 30min pré-treino
- Magnésio: 30-60min antes de dormir
- Ômega-3: com refeição principal (manhã + noite)
- L-Carnitina: 30min antes do treino/cardio
- Vitamina D3: manhã com refeição gordurosa
- Probiótico: em jejum pela manhã
- Ashwagandha: noite para sono ou manhã para cortisol

ALERTAS DE INTERAÇÃO (verificar obrigatoriamente):
- Cafeína + ansiedade/hipertensão → reduzir dose ou remover
- Ferro + cálcio → separar horários
- Whey + intolerância à lactose → sugerir isolado/vegano
- Vitamina K2 + anticoagulante → alertar médico
- Berberina + metformina/diabetes → alertar médico
- Termogênico + cardiopatia → NÃO recomendar

REGRAS POR OBJETIVO:
Emagrecimento: Whey (preservar massa) > Cafeína (termogênico) > Ômega-3 > Vit D3+K2
Hipertrofia: Whey > Creatina 5g > Cafeína > Magnésio
Saúde Geral: Multi + Ômega-3 + Vit D3 + Magnésio + Probiótico
Performance: Creatina > Cafeína > Beta-alanina > Citrulina

Inclua evidências científicas reais (autor, ano).
Estime custo mensal de cada suplemento.`;

    const userPrompt = `Objetivo: ${goal || profile?.goal || "saude_geral"}
Orçamento: ${budget || "intermediario"}
Peso: ${profile?.weight_kg || "não informado"} kg
Nível atividade: ${profile?.activity_level || "moderado"}
Esporte: ${profile?.sport || "nenhum"}
Condições: ${(healthConditions || profile?.health_conditions || []).join(", ") || "nenhuma"}
Restrições: ${(dietaryRestrictions || profile?.dietary_restrictions || []).join(", ") || "nenhuma"}
Usa GLP-1: ${profile?.uses_glp1 ? "Sim" : "Não"}
Suplementos atuais: ${(currentSupplements || []).join(", ") || "nenhum"}

${workouts?.length ? `Treinos: ${workouts.map((w: any) => `Dia ${w.day_of_week}: ${w.workout_type} às ${w.workout_time}`).join(", ")}` : ""}
${circadian?.[0] ? `Cronotipo: ${circadian[0].chronotype}, Acorda: ${circadian[0].wake_time}, Dorme: ${circadian[0].sleep_time}` : ""}
${bloodAnalysis ? `Exame de sangue: ${JSON.stringify(bloodAnalysis)}` : "Sem exame disponível."}

Gere o stack personalizado com custos.`;

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
              description: "Return a personalized supplement stack with costs",
              parameters: {
                type: "object",
                properties: {
                  supplements: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        dose: { type: "string" },
                        timing: { type: "string" },
                        timingIcon: { type: "string", enum: ["morning", "afternoon", "night", "anytime"] },
                        reason: { type: "string" },
                        evidence: { type: "string" },
                        priority: { type: "string", enum: ["essential", "recommended", "optional"] },
                        warnings: { type: "string", description: "Avisos ou contraindicações" },
                        costPerMonth: { type: "number", description: "Custo estimado R$/mês" },
                      },
                      required: ["name", "dose", "timing", "timingIcon", "reason", "evidence", "priority"],
                      additionalProperties: false,
                    },
                  },
                  blood_based_additions: {
                    type: "array",
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
                  interaction_warnings: {
                    type: "array",
                    items: { type: "string" },
                    description: "Alertas de interação detectados",
                  },
                  total_monthly_cost: { type: "number", description: "Custo total estimado R$/mês" },
                  budget_message: { type: "string", description: "Mensagem de otimização de orçamento" },
                  summary: { type: "string" },
                },
                required: ["supplements", "blood_based_additions", "interaction_warnings", "total_monthly_cost", "budget_message", "summary"],
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
      const content = aiData.choices?.[0]?.message?.content || "";
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      result = jsonMatch ? JSON.parse(jsonMatch[0]) : { supplements: [], blood_based_additions: [], interaction_warnings: [], total_monthly_cost: 0, budget_message: "", summary: "" };
    }

    return new Response(JSON.stringify({
      success: true,
      supplements: result.supplements || [],
      blood_based_additions: result.blood_based_additions || [],
      interaction_warnings: result.interaction_warnings || [],
      total_monthly_cost: result.total_monthly_cost || 0,
      budget_message: result.budget_message || "",
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
