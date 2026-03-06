import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, currentBlock } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const systemPrompt = `Você é o assistente de onboarding do nutriON, um app de nutrição inteligente brasileiro.
Sua tarefa é guiar o usuário em uma conversa natural, calorosa e empática para coletar informações do perfil nutricional.

BLOCO ATUAL: ${currentBlock}/5

## BLOCOS E DADOS A COLETAR:

### Bloco 1 — Identidade e objetivo:
Cumprimente o usuário com entusiasmo. Pergunte nome, idade/data de nascimento, sexo, altura, peso atual e peso meta.
Pergunte o objetivo principal (emagrecer, hipertrofia, manutenção, saúde geral, definição, performance, protocolo GLP-1).
Pergunte o prazo desejado e como se sente em relação a isso.

### Bloco 2 — Histórico alimentar e relação com comida:
Pergunte se come mais por fome física ou emocional.
Pergunte alimentos que ama e que evita.
Histórico de dietas tentadas e por que abandonou.
Restrições: alergias, intolerâncias, religião, preferência (vegano/vegetariano).
Horários de refeição e rotina diária.

### Bloco 3 — Nutrição comportamental:
Identifique o perfil comportamental alimentar entre 8 perfis: Comedor Emocional, Comedor Veloz, Comedor Noturno, Comedor Social, Comedor Restritivo, Comedor Ansioso, Comedor Intuitivo, Comedor Caótico.
Mapeie gatilhos emocionais (estresse, tédio, tristeza, celebração, ansiedade).
Use escala de fome e saciedade para calibrar o radar interno do usuário.
Faça perguntas de Mindful Eating.

### Bloco 4 — Estilo de vida e treino:
Pergunte nível de atividade física (sedentário/leve/moderado/intenso/atleta).
Tipo de treino preferido e frequência semanal.
Qualidade do sono (horas e qualidade). Nível de estresse crônico (1-10).
Acesso à cozinha e habilidade culinária.

### Bloco 5 — Suporte e contexto:
Pergunte quem mais vai usar o app (modo família: adulto/criança/idoso).
Se tem acompanhamento profissional (nutricionista/coach).
Preferência de notificações e horários.

## REGRAS:
- Fale em português brasileiro, de forma natural, calorosa e motivacional
- Use emojis com moderação (1-2 por mensagem)
- Faça 2-3 perguntas por vez, NUNCA todas de uma vez
- Quando tiver informações suficientes do bloco atual, chame a tool "extract_block_data" com os dados coletados
- Após extrair os dados de um bloco, faça uma transição suave para o próximo bloco
- Se o usuário responder de forma vaga, faça perguntas de follow-up
- Quando for o bloco 5 e já tiver os dados, chame "extract_block_data" e depois "finalize_onboarding"
- Máximo 150 palavras por resposta
- NUNCA invente dados que o usuário não forneceu`;

    const tools = [
      {
        type: "function",
        function: {
          name: "extract_block_data",
          description: "Extract structured data collected from the current conversation block. Call this when you have gathered enough information from the current block.",
          parameters: {
            type: "object",
            properties: {
              block: { type: "number", description: "Block number (1-5)" },
              data: {
                type: "object",
                properties: {
                  // Block 1
                  full_name: { type: "string" },
                  date_of_birth: { type: "string", description: "YYYY-MM-DD format" },
                  sex: { type: "string", enum: ["male", "female"] },
                  weight_kg: { type: "number" },
                  height_cm: { type: "number" },
                  goal: { type: "string", enum: ["lose_weight", "gain_muscle", "definition", "health", "maintenance", "performance", "glp1"] },
                  target_weight_kg: { type: "number" },
                  // Block 2
                  eating_motivation: { type: "string", description: "physical or emotional" },
                  loved_foods: { type: "array", items: { type: "string" } },
                  avoided_foods: { type: "array", items: { type: "string" } },
                  diet_history: { type: "string" },
                  dietary_restrictions: { type: "array", items: { type: "string" } },
                  meal_schedule: { type: "string" },
                  // Block 3
                  behavioral_profile: { type: "string", enum: ["emocional", "veloz", "noturno", "social", "restritivo", "ansioso", "intuitivo", "caotico"] },
                  emotional_triggers: { type: "array", items: { type: "string" } },
                  hunger_awareness: { type: "string", description: "low, medium, high" },
                  // Block 4
                  activity_level: { type: "string", enum: ["sedentary", "light", "moderate", "very_active", "athlete"] },
                  training_frequency: { type: "number" },
                  sport: { type: "string" },
                  sleep_hours: { type: "number" },
                  stress_level: { type: "number" },
                  cooking_skill: { type: "string" },
                  // Block 5
                  family_mode: { type: "string" },
                  has_professional: { type: "boolean" },
                  notification_preference: { type: "string" },
                  uses_glp1: { type: "boolean" },
                  health_conditions: { type: "array", items: { type: "string" } },
                },
                additionalProperties: true,
              },
            },
            required: ["block", "data"],
            additionalProperties: false,
          },
        },
      },
      {
        type: "function",
        function: {
          name: "finalize_onboarding",
          description: "Call this after all 5 blocks are complete to signal the onboarding is finished.",
          parameters: {
            type: "object",
            properties: {
              summary: { type: "string", description: "A brief motivational summary for the user about their profile" },
              behavioral_profile: { type: "string", description: "The identified behavioral eating profile" },
              strategies: {
                type: "array",
                items: { type: "string" },
                description: "3 prioritized behavioral change strategies",
              },
            },
            required: ["summary", "behavioral_profile", "strategies"],
            additionalProperties: false,
          },
        },
      },
    ];

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
          ...messages,
        ],
        tools,
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("onboarding-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
