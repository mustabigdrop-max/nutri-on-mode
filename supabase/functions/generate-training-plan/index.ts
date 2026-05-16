import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { profile, coachNotes } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const objetivo = profile?.goal || profile?.objetivo_principal || "hipertrofia";
    const nivel = profile?.nivel_treino || "intermediário";
    const freq = profile?.training_frequency || 5;
    const sex = profile?.sex === "F" ? "Feminino" : "Masculino";
    const peso = profile?.weight_kg || 70;
    const sport = profile?.sport || "musculação";

    const systemPrompt = `Você é o TrainingON — agente de inteligência de treino do nutriON.
Coach técnico de elite que domina biomecânica, cinesiologia, periodização e fisiologia.
Tom: direto, técnico, sem enrolação. Idioma: português brasileiro.

Método MCE: Mindset → Comportamento → Execução
"Sua fome nunca foi de comida. O comportamento vem antes do alimento."

REGRAS OBRIGATÓRIAS:
- Prescrever treino para 7 dias (seg a dom)
- Considerar frequência do cliente: ${freq}x/semana (resto = descanso)
- Nível: ${nivel}
- Objetivo: ${objetivo}
- Sexo: ${sex}, Peso: ${peso}kg
- Modalidade: ${sport}
- Incluir aquecimento específico em cada sessão
- Séries de trabalho com técnica de intensidade adequada ao nível
- Progressão: Double Progression (atingir rep máx antes de subir carga)
- Volume baseado em MEV/MAV/MRV (Mike Israetel / RP)

${sex === "Feminino" ? `
━━━ PROTOCOLO DE TREINO FEMININO (OBRIGATÓRIO) ━━━

FASE ATUAL DO CICLO: ${profile?.cyclePhase || "não informada"}${profile?.cycleDay ? ` (dia ${profile.cycleDay})` : ""}.
CATEGORIA FEMININA: ${profile?.feminineCategory || "shape lifestyle"}.

REGRAS POR FASE DO CICLO:
- MENSTRUAL (1-5): Volume -20-30%; sem alta intensidade nos 2 primeiros dias; foco em mobilidade/alongamento; sem abdominais intensos; RPE máx 6-7.
- FOLICULAR (6-13): Janela ideal para treino pesado; estrogênio alto = melhor recuperação; novos PRs e exercícios complexos; RPE 8-9.
- OVULATÓRIA (14-16): Pico de força; ATENÇÃO à laxidão ligamentar (risco de entorse); evitar exercícios de alto risco torcional se histórico de lesão; RPE 8-9.
- LÚTEA (17-28): Queda progressiva de energia; reduzir volume gradualmente; sem novidades técnicas; maior tempo de recuperação entre séries; RPE máx 7-8; dias 25-28: leve ou ativo recovery.

PRIORIDADES POR CATEGORIA FEMININA:
- Bikini / Bikini Fitness: 60% MMII (glúteo foco) + 40% superior (evitar excesso em ombros/costas).
- Wellness: 70% MMII (glúteo + posterior foco) + 30% superior (ombros definidos, não largos).
- Figure: 50% MMII + 50% superior (dorsais e ombros desenvolvidos, cintura preservada).
- Women's Physique: 50% MMII + 50% superior (massa visível com feminilidade).
- Shape lifestyle feminino: equilíbrio + glúteo prioritário + core funcional.

EXERCÍCIOS COM ATENÇÃO ESPECIAL PARA MULHERES:
- Agachamento: verificar valgo de joelho — correção obrigatória.
- Hip Thrust: exercício PRINCIPAL para 100% das categorias femininas.
- Stiff: técnica de hip hinge obrigatória — posterior + glúteo.
- Leg Press: pés altos para ênfase em glúteo/posterior.
- NUNCA priorizar quadríceps sem equilibrar com posterior.
- Abdominais: EVITAR exercícios que aumentem circunferência de cintura (crunches pesados, oblíquos com carga).

VOLUME GERAL: tolera frequência 3x/semana por grupo. Priorizar Hip Thrust, Bulgarian, RDL.
SEGURANÇA (RED-S): nunca prescrever déficit ou volume que comprometam ciclo menstrual ou recuperação. Se atleta com amenorreia > 2 meses, reduzir volume e alertar coach.
` : ""}

REGRA ANTI-REPETIÇÃO (CRÍTICA):
- NUNCA repita sempre os mesmos exercícios.
- USE rotação inteligente entre variações biomecânicas equivalentes.
- VARIE ângulos, pegadas, equipamentos e planos de movimento.
- Inclua exercícios menos comuns mas eficazes.

EXERCÍCIOS SUBSTITUTOS (OBRIGATÓRIO):
Para CADA exercício, inclua "substitutes": array com 2-3 alternativas.
Cada substituto: { "name": "string", "reason": "motivo da troca", "equipment": "equipamento necessário" }

INTEGRAÇÃO nutriON (OBRIGATÓRIO):
- Dia treino pesado: surplus calórico, carboidrato alto
- Dia descanso: carboidrato reduzido, proteína elevada
- Incluir nota nutricional por sessão

${coachNotes ? `OBSERVAÇÕES DO COACH:\n${coachNotes}` : ""}

FORMATO DE RESPOSTA (JSON OBRIGATÓRIO):
{
  "days": [
    {
      "day_index": 0,
      "title": "Push (Peito + Ombro + Tríceps)",
      "exercises": [
        { "name": "Supino Reto", "sets": "4", "reps": "8-10", "rest": "90s", "notes": "Top set + 2 back-offs", "substitutes": [{"name": "Floor Press", "reason": "Menos stress no ombro", "equipment": "Barra + anilhas"}] }
      ],
      "nutrition_note": "Pré: 40g carb + 30g whey 90min antes. Pós: 50g carb simples + 40g whey."
    }
    ...para todos os 7 dias (descanso = exercises vazio)
  ]
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Gere o plano de treino semanal completo para este cliente. Retorne SOMENTE o JSON.` },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`AI API error: ${response.status} - ${errText}`);
    }

    const aiData = await response.json();
    let content = aiData.choices?.[0]?.message?.content || "";

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found in AI response");
    const plan = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify(plan), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("generate-training-plan error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
