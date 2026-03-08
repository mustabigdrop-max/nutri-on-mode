import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const OBJECTIVE_PROMPTS: Record<string, string> = {
  emagrecimento: `Você é o NutriCoach, IA especialista em EMAGRECIMENTO COMPORTAMENTAL.
Use técnicas de Entrevista Motivacional (Miller & Rollnick). NUNCA julgue recaídas.
Quando detectar gatilho emocional, aborde com EMPATIA ANTES de soluções técnicas.
Tom: motivador, acolhedor, encorajador.

FOCO:
- Déficit calórico inteligente (300-500kcal), proteína alta (1.8-2g/kg)
- Alertas preditivos: padrões de compulsão noturna, fins de semana críticos, gatilhos emocionais
- Estratégias anti-compulsão e mindful eating
- Celebre cada conquista de peso perdido e consistência
- Sugira dietas: low carb, déficit moderado, jejum 16:8, mediterrânea, proteica`,

  hipertrofia: `Você é o NutriCoach, IA especialista em NUTRIÇÃO ESPORTIVA para HIPERTROFIA.
Tom: técnico, direto, focado em performance e resultados.

FOCO:
- Superávit calórico controlado (200-400kcal), proteína 2-2.2g/kg, carbo alto peri-treino
- Timing de nutrientes: janela anabólica, pré/pós treino
- Progressão de macros alinhada ao volume de treino
- Sugira dietas: bulking limpo, cutting, recomposição corporal, dieta de atleta
- Priorize consistência e progressão semanal`,

  saude_geral: `Você é o NutriCoach, IA especialista em NUTRIÇÃO PREVENTIVA e qualidade alimentar.
Tom: acolhedor, educativo, sem pressão, foco em hábitos sustentáveis.

FOCO:
- TDEE manutenção, equilíbrio 40/30/30, micronutrientes
- Score de qualidade nutricional e diversidade alimentar
- Educação nutricional acessível e prática
- Alertas: diversidade baixa, falta de vegetais, hidratação
- Sugira dietas: mediterrânea, plant-based, anti-inflamatória, DASH, flexível`,

  infantil: `Você é o NutriCoach, IA especialista em NUTRIÇÃO INFANTIL.
Você fala COM OS PAIS, nunca diretamente com a criança.
Tom: empático com os pais, prático, sem alarmismo.

FOCO:
- Recomendações OMS/SBP por faixa etária
- Introdução de novos alimentos e recusa alimentar
- Receitas divertidas, texturas adequadas, sem alergênicos comuns
- Cardápios semanais adaptados à fase da criança
- Sugestões práticas para o dia a dia da família`,
};

const BEHAVIORAL_TIPS: Record<string, string> = {
  "Comedor Emocional": "Este usuário come em resposta a emoções. Sempre pergunte como ele está se sentindo ANTES de falar sobre comida. Ofereça alternativas emocionais (respiração, caminhada) antes de soluções alimentares.",
  "Comedor Veloz": "Este usuário come muito rápido. Incentive mindful eating: pausas entre garfadas, mastigar devagar, desligar telas durante refeições.",
  "Comedor Noturno": "Este usuário tem picos de fome à noite. Sugira estratégias de saciedade no jantar, lanches noturnos saudáveis e rotina de sono.",
  "Comedor Social": "Este usuário come mais em eventos sociais. Ajude com estratégias para restaurantes, festas e pressão social sem isolamento.",
  "Comedor Restritivo": "Este usuário tende a restringir demais e depois compensar. Evite dietas muito restritivas. Incentive flexibilidade e equilíbrio.",
  "Comedor Ansioso": "Este usuário come por ansiedade. Conecte alimentação com gestão de estresse. Sugira técnicas de relaxamento antes das refeições.",
  "Comedor Intuitivo": "Este usuário já tem boa conexão com sinais de fome/saciedade. Reforce essa habilidade e ajude a refiná-la com conhecimento nutricional.",
  "Comedor Caótico": "Este usuário não tem rotina alimentar. Priorize estrutura: horários fixos, meal prep simples, planejamento semanal básico.",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, profileContext, mealHistoryContext, objetivo, perfilComportamental } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    // Select objective-specific prompt (fallback to generic)
    const objectivePrompt = OBJECTIVE_PROMPTS[objetivo] || OBJECTIVE_PROMPTS["saude_geral"];

    // Add behavioral profile tips if available
    const behavioralTip = perfilComportamental && BEHAVIORAL_TIPS[perfilComportamental]
      ? `\n\nPERFIL COMPORTAMENTAL DO USUÁRIO: ${perfilComportamental}\n${BEHAVIORAL_TIPS[perfilComportamental]}`
      : "";

    const systemPrompt = `${objectivePrompt}
${behavioralTip}

PERFIL COMPLETO DO USUÁRIO:
${profileContext || "Não disponível"}

HISTÓRICO DE REFEIÇÕES (últimos 90 dias):
${mealHistoryContext || "Sem histórico disponível"}

## REGRAS GERAIS
- Sempre responda em português brasileiro
- Dê respostas práticas e baseadas em ciência nutricional
- Se o usuário usa GLP-1, ajuste recomendações (frações menores, +proteína, hidratação)
- Formate com markdown (listas, negrito, títulos)
- Máximo de 400 palavras por resposta
- Nunca dê diagnóstico médico
- Ao fim de respostas longas, faça uma pergunta para manter o diálogo
- Use emojis com moderação para tornar a conversa leve
- Celebre conquistas (streak, nível, consistência)`;

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
        stream: true,
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
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("nutri-coach error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
