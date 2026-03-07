import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPTS: Record<string, string> = {
  emagrecimento: `Você é o assistente de onboarding do nutriON, especialista em emagrecimento comportamental.
Sua tarefa é guiar o usuário em uma conversa natural, calorosa e empática para coletar informações do perfil nutricional.
Use técnicas de Entrevista Motivacional. Nunca julgue recaídas. Quando detectar gatilho emocional, aborde com empatia ANTES de soluções técnicas.
Tom: motivador e acolhedor.`,

  hipertrofia: `Você é o assistente de onboarding do nutriON, especialista em nutrição esportiva para hipertrofia.
Sua tarefa é guiar o usuário em uma conversa natural e técnica para coletar informações do perfil nutricional.
Foque em timing de proteína, janela anabólica, progressão de carbo.
Tom: técnico, direto, focado em performance.`,

  saude_geral: `Você é o assistente de onboarding do nutriON, especialista em nutrição preventiva e qualidade alimentar.
Sua tarefa é guiar o usuário em uma conversa natural, educativa e sem pressão para coletar informações do perfil nutricional.
Foque em diversidade alimentar, micronutrientes, educação nutricional.
Tom: acolhedor, educativo, sem pressão.`,

  infantil: `Você é o assistente de onboarding do nutriON, especialista em nutrição infantil.
Você fala COM OS PAIS, não com a criança. Foque em recomendações OMS, introdução de novos alimentos, recusa alimentar, variedade.
Tom: empático com os pais, prático, sem alarmismo.`,
};

const BLOCK_INSTRUCTIONS: Record<string, Record<number, string>> = {
  emagrecimento: {
    1: `BLOCO ATUAL: Dados Pessoais
Cumprimente com entusiasmo. Pergunte nome, idade/data de nascimento, sexo, altura, peso atual.
Pergunte o peso meta e prazo desejado. Como se sente em relação a isso.`,
    2: `BLOCO ATUAL: Histórico e Relação com Comida
Pergunte se já tentou emagrecer antes. O que funcionou e não funcionou.
Pergunte se come mais por fome física ou emocional.
Quais horários são mais difíceis. Tem alimento que sente compulsão?
Restrições: alergias, intolerâncias, preferência (vegano/vegetariano).`,
    3: `BLOCO ATUAL: Perfil Comportamental
Identifique o perfil entre 8 tipos: Comedor Emocional, Veloz, Noturno, Social, Restritivo, Ansioso, Intuitivo, Caótico.
Mapeie gatilhos emocionais (estresse, tédio, tristeza, celebração, ansiedade).
Use escala de fome e saciedade. Faça perguntas de Mindful Eating.`,
    4: `BLOCO ATUAL: Estilo de Vida
Pergunte nível de atividade física (sedentário/leve/moderado/intenso/atleta).
Acesso à cozinha e habilidade culinária.
Prefere refeições simples ou elaboradas? Orçamento semanal aproximado.
Após coletar, chame extract_block_data e depois finalize_onboarding.`,
  },
  hipertrofia: {
    1: `BLOCO ATUAL: Dados Pessoais
Cumprimente. Pergunte nome, idade/data de nascimento, sexo, altura, peso atual.
Pergunte percentual de gordura estimado. Há quanto tempo treina.`,
    2: `BLOCO ATUAL: Histórico e Treino
Quantas vezes por semana treina? Qual tipo (musculação/crossfit/calistenia/outro)?
Já segue algum protocolo de nutrição? Maior dificuldade: comer o suficiente ou manter consistência?
Restrições alimentares.`,
    3: `BLOCO ATUAL: Estilo de Vida
Pergunte nível de atividade física (sedentário/leve/moderado/intenso/atleta).
Acesso à cozinha. Prefere refeições simples ou elaboradas? Orçamento semanal.
Qualidade do sono (horas).
Após coletar, chame extract_block_data e depois finalize_onboarding.`,
  },
  saude_geral: {
    1: `BLOCO ATUAL: Dados Pessoais
Cumprimente com acolhimento. Pergunte nome, idade/data de nascimento, sexo, altura, peso.
O que mais incomoda na alimentação hoje.`,
    2: `BLOCO ATUAL: Histórico Alimentar
Como descreveria a alimentação hoje em 1 frase?
Restrições: alergia, intolerância, preferência (vegano/vegetariano)?
Nível de estresse crônico (1-10). Dorme bem? Quantas horas?`,
    3: `BLOCO ATUAL: Perfil Comportamental
Identifique o perfil entre 8 tipos: Comedor Emocional, Veloz, Noturno, Social, Restritivo, Ansioso, Intuitivo, Caótico.
Mapeie gatilhos e hábitos. Use perguntas de Mindful Eating.`,
    4: `BLOCO ATUAL: Estilo de Vida
Nível de atividade física. Acesso à cozinha. Preferência de refeições.
Orçamento semanal. Após coletar, chame extract_block_data e depois finalize_onboarding.`,
  },
  infantil: {
    1: `BLOCO ATUAL: Dados da Criança
Cumprimente os pais. Pergunte nome do filho/filha, idade.
Fase: introdução alimentar / pré-escolar / escolar.
Alguma alergia ou restrição alimentar?`,
    2: `BLOCO ATUAL: Histórico Alimentar da Criança
Quais alimentos come bem? Quais recusa?
Alguma preocupação específica com a alimentação?
Como são as refeições em família?`,
    3: `BLOCO ATUAL: Estilo de Vida da Família
Quem prepara as refeições? Acesso à cozinha? Orçamento semanal.
Prefere receitas simples ou elaboradas?
Após coletar, chame extract_block_data e depois finalize_onboarding.`,
  },
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, currentBlock, objetivo } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const obj = objetivo || "saude_geral";
    const basePrompt = SYSTEM_PROMPTS[obj] || SYSTEM_PROMPTS.saude_geral;
    const blockInstructions = BLOCK_INSTRUCTIONS[obj]?.[currentBlock] || "";

    const systemPrompt = `${basePrompt}

${blockInstructions}

## REGRAS:
- Fale em português brasileiro, de forma natural, calorosa e motivacional
- Use emojis com moderação (1-2 por mensagem)
- Faça 2-3 perguntas por vez, NUNCA todas de uma vez
- Quando tiver informações suficientes do bloco atual, chame a tool "extract_block_data" com os dados coletados
- Se o usuário responder de forma vaga, faça perguntas de follow-up
- Máximo 150 palavras por resposta
- NUNCA invente dados que o usuário não forneceu
- Quando for o último bloco e já tiver os dados, chame "extract_block_data" e depois "finalize_onboarding"`;

    const tools = [
      {
        type: "function",
        function: {
          name: "extract_block_data",
          description: "Extract structured data collected from the current conversation block. Call this when you have gathered enough information from the current block.",
          parameters: {
            type: "object",
            properties: {
              block: { type: "number", description: "Block number" },
              data: {
                type: "object",
                properties: {
                  full_name: { type: "string" },
                  date_of_birth: { type: "string", description: "YYYY-MM-DD format" },
                  sex: { type: "string", enum: ["male", "female"] },
                  weight_kg: { type: "number" },
                  height_cm: { type: "number" },
                  target_weight_kg: { type: "number" },
                  eating_motivation: { type: "string" },
                  loved_foods: { type: "array", items: { type: "string" } },
                  avoided_foods: { type: "array", items: { type: "string" } },
                  dietary_restrictions: { type: "array", items: { type: "string" } },
                  behavioral_profile: { type: "string", enum: ["emocional", "veloz", "noturno", "social", "restritivo", "ansioso", "intuitivo", "caotico"] },
                  emotional_triggers: { type: "array", items: { type: "string" } },
                  activity_level: { type: "string", enum: ["sedentary", "light", "moderate", "very_active", "athlete"] },
                  training_frequency: { type: "number" },
                  sport: { type: "string" },
                  sleep_hours: { type: "number" },
                  stress_level: { type: "number" },
                  cooking_skill: { type: "string" },
                  budget_weekly: { type: "number" },
                  meal_preference: { type: "string", enum: ["simples", "elaboradas"] },
                  uses_glp1: { type: "boolean" },
                  health_conditions: { type: "array", items: { type: "string" } },
                  child_name: { type: "string" },
                  child_age: { type: "number" },
                  child_phase: { type: "string", enum: ["introducao", "pre_escolar", "escolar"] },
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
          description: "Call this after all blocks are complete to signal the onboarding is finished.",
          parameters: {
            type: "object",
            properties: {
              summary: { type: "string", description: "A brief motivational summary for the user about their profile" },
              behavioral_profile: { type: "string", description: "The identified behavioral eating profile (if applicable)" },
              strategies: {
                type: "array",
                items: { type: "string" },
                description: "3 prioritized actionable strategies for the user",
              },
            },
            required: ["summary", "strategies"],
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
