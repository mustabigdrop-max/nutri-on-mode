import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { profile, weekStart, budgetMode } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const systemPrompt = `Você é um nutricionista IA especialista em planejamento alimentar brasileiro.
Gere um plano semanal de refeições (7 dias, 6 refeições/dia) PERSONALIZADO.

PERFIL DO USUÁRIO:
- Objetivo: ${profile?.goal || "não definido"}
- GET (kcal alvo): ${profile?.vet_kcal || profile?.get_kcal || 2000} kcal/dia
- Proteína alvo: ${profile?.protein_g || 120}g/dia
- Carboidrato alvo: ${profile?.carbs_g || 200}g/dia
- Gordura alvo: ${profile?.fat_g || 60}g/dia
- Sexo: ${profile?.sex || "não informado"}
- Peso: ${profile?.weight_kg || "?"}kg
- Restrições: ${profile?.dietary_restrictions?.join(", ") || "nenhuma"}
- Condições: ${profile?.health_conditions?.join(", ") || "nenhuma"}
- Usa GLP-1: ${profile?.uses_glp1 ? "sim (priorizar proteína, frações menores)" : "não"}
- Esporte: ${profile?.sport || "não pratica"}
- Frequência treino: ${profile?.training_frequency || 0}x/semana
${budgetMode ? "\n⚠️ MODO ORÇAMENTO ATIVO: Priorize alimentos baratos e acessíveis (ovo, frango, arroz, feijão, banana, batata, aveia). Evite salmão, quinoa, açaí, whey importado." : ""}

REGRAS:
1. Use APENAS alimentos brasileiros comuns (base TACO/IBGE)
2. Varie bastante entre os dias - NÃO repita o mesmo prato em dias consecutivos
3. Cada refeição deve ter: nome do alimento/prato, porção, kcal, proteína(g), carboidrato(g), gordura(g)
4. Os totais diários devem se aproximar das metas calóricas e de macros
5. Tipos de refeição: cafe_manha, lanche_manha, almoco, lanche_tarde, jantar, ceia

RETORNE usando a ferramenta generate_plan.`;

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
          { role: "user", content: `Gere o plano semanal completo para a semana iniciando em ${weekStart}. ${budgetMode ? "Use modo orçamento - alimentos mais baratos possíveis." : ""}` },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_plan",
              description: "Gera o plano alimentar semanal com 7 dias e 6 refeições por dia",
              parameters: {
                type: "object",
                properties: {
                  days: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        day_index: { type: "number", description: "0=Seg, 6=Dom" },
                        meals: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              meal_type: { type: "string", enum: ["cafe_manha", "lanche_manha", "almoco", "lanche_tarde", "jantar", "ceia"] },
                              food_name: { type: "string" },
                              portion: { type: "string" },
                              kcal: { type: "number" },
                              protein_g: { type: "number" },
                              carbs_g: { type: "number" },
                              fat_g: { type: "number" },
                            },
                            required: ["meal_type", "food_name", "portion", "kcal", "protein_g", "carbs_g", "fat_g"],
                            additionalProperties: false,
                          },
                        },
                      },
                      required: ["day_index", "meals"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["days"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "generate_plan" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call in response");

    const plan = JSON.parse(toolCall.function.arguments);
    return new Response(JSON.stringify(plan), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-meal-plan error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
