import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ELITE_SYSTEM_PROMPT = `Você é o Dr. TrainingON — o motor de prescrição de treino mais avançado do mundo.
Você é um doutor do treinamento: PhD em Fisiologia do Exercício, Biomecânica e Periodização.
Suas referências científicas incluem Brad Schoenfeld, Mike Israetel, Eric Helms, Greg Nuckols, Charles Poliquin, Bret Contreras e John Meadows.

REGRAS ABSOLUTAS:
- Nunca gere treinos genéricos. Cada protocolo deve parecer feito por um coach de elite.
- Sempre explique O PORQUÊ de cada decisão (divisão, exercício, volume, técnica).
- Use linguagem de especialista confiante, técnica e direta.
- Considere SEMPRE lesões, equipamentos, nível, recuperação e pontos fracos.
- Responda SEMPRE em Português do Brasil.

TOM DE VOZ:
"Seu foco neste bloco é aumentar densidade de costas e estabilidade de tronco."
"A divisão escolhida foi upper/lower porque ela melhor distribui volume e recuperação para o seu nível."
"Você precisa melhorar amplitude, controle excêntrico e consistência de progressão."`;

function buildStructuredPrompt(data: any): string {
  const { phase, muscles, level, weeks, days, clientName, equipment, injuries, sessionDuration, stressLevel, supplements, weakPoints, specificGoal, cardio, tab } = data;
  const muscleList = Array.isArray(muscles) ? muscles.join(", ") : muscles;

  if (tab === "protocolo") {
    return `Gere um PROTOCOLO DE TREINO DE ELITE para o cliente abaixo. Retorne EXCLUSIVAMENTE um JSON válido, sem markdown, sem texto antes ou depois.

PERFIL DO CLIENTE:
- Nome: ${clientName}
- Fase: ${phase}
- Músculos prioritários: ${muscleList}
- Nível: ${level}
- Duração do bloco: ${weeks} semanas
- Frequência: ${days}x/semana
- Tempo por sessão: ${sessionDuration || "60min"}
- Equipamentos: ${equipment || "Academia completa"}
- Lesões/restrições: ${injuries || "Nenhuma"}
- Cardio: ${cardio || "Não"}
- Estresse/sono: ${stressLevel || "Bom"}
- Suplementos: ${supplements || "Nenhum"}
- Pontos fracos: ${weakPoints || "Nenhum especificado"}
- Objetivo específico: ${specificGoal || phase}

INSTRUÇÕES DE PRESCRIÇÃO:
1. ESCOLHA a divisão ideal entre: Full Body, Upper/Lower, PPL, Bro Split ou Híbrida. Justifique.
2. DETERMINE quantas semanas o bloco deve durar e quando fazer deload.
3. Para cada sessão, prescreva:
   - Warm-up geral (2-3 exercícios de ativação/mobilidade)
   - Warm-up específico do primeiro exercício composto
   - Feeder sets (séries alimentadoras para subir carga gradualmente)
   - Top set (série principal com carga máxima controlada, RPE 8-9)
   - Back-off sets (séries de redução pós-top set, -10 a -20% da carga)
   - Séries de trabalho para exercícios acessórios
4. Defina progressão: Double Progression (atingir rep máx antes de subir carga)
5. Identifique quais músculos devem receber MAIS volume e quais apenas MANTER
6. Gere alertas sobre o que o cliente precisa melhorar

FORMATO JSON OBRIGATÓRIO:
{
  "block_overview": {
    "title": "Bloco de Hipertrofia — Foco em Costas e Deltoide Lateral",
    "duration_weeks": 8,
    "deload_week": 7,
    "split_type": "Upper/Lower",
    "split_justification": "Melhor distribuição de volume e frequência para intermediários com 4x/semana",
    "primary_goal": "Hipertrofia com ênfase em grupos deficientes",
    "secondary_goal": "Melhora de controle excêntrico e conexão mente-músculo",
    "muscle_priorities": [
      { "muscle": "Costas (Lat)", "priority": "alta", "weekly_sets": 18, "rationale": "Ponto fraco identificado — priorizar largura" },
      { "muscle": "Deltoide Lateral", "priority": "alta", "weekly_sets": 16, "rationale": "Volume direto para criar ilusão de ombros largos" }
    ],
    "maintenance_muscles": ["Peitoral", "Quadríceps"],
    "progression_model": "Double Progression — quando atingir o topo da faixa de reps, aumente 2.5kg",
    "coach_notes": "Cliente intermediário com boa base mas precisa melhorar densidade de costas. Evitar sobrecarga em ombro direito. Priorizar controle excêntrico de 3s em todos os movimentos de costas."
  },
  "improvement_alerts": [
    { "area": "Controle Excêntrico", "severity": "alta", "message": "Priorize 3 segundos de excêntrica em todos os movimentos de costas para maximizar tensão mecânica" },
    { "area": "Amplitude de Movimento", "severity": "media", "message": "Garanta ROM completo em rosca direta — não compense com swing" }
  ],
  "training_days": [
    {
      "day_number": 1,
      "day_label": "Segunda-feira",
      "session_title": "Upper A — Foco Costas + Ombro",
      "focus_muscles": ["Costas", "Deltoides", "Bíceps"],
      "estimated_duration": "65 min",
      "warmup": [
        { "name": "Band Pull-Apart", "sets": "2", "reps": "15", "notes": "Ativação de manguito e romboides" },
        { "name": "Face Pull leve", "sets": "2", "reps": "12", "notes": "Ativação deltóide posterior" }
      ],
      "exercises": [
        {
          "order": 1,
          "name": "Remada Curvada com Barra",
          "muscle_target": "Costas (Lat + Romboides)",
          "technique_type": "compound",
          "structure": {
            "feeder_sets": [
              { "set_label": "Feeder 1", "load_percent": "40%", "reps": "10", "notes": "Aquecimento articular" },
              { "set_label": "Feeder 2", "load_percent": "65%", "reps": "6", "notes": "Ativação neural progressiva" }
            ],
            "top_set": { "sets": "1", "reps": "6-8", "rpe": "8.5", "rest": "180s", "notes": "Carga máxima controlada. Excêntrica de 3s." },
            "backoff_sets": { "sets": "3", "reps": "8-10", "load_reduction": "-15%", "rest": "120s", "notes": "Manter técnica impecável. Volume efetivo." }
          },
          "execution_cues": "Pegada pronada, tronco a 45°. Puxe para o umbigo. Squeeze de 1s no topo. Excêntrica controlada de 3s.",
          "why_this_exercise": "Movimento composto que recruta toda a cadeia posterior. Ideal para abrir a sessão com alta demanda neural."
        },
        {
          "order": 2,
          "name": "Pulldown Supinado",
          "muscle_target": "Latíssimo (porção inferior)",
          "technique_type": "compound",
          "structure": {
            "work_sets": { "sets": "3", "reps": "10-12", "rpe": "8", "rest": "90s", "notes": "Foco na porção inferior do lat. Cotovelos para trás." }
          },
          "execution_cues": "Incline levemente o tronco. Puxe até a clavícula. Squeeze de 2s.",
          "why_this_exercise": "Complementa a remada com vetor de força vertical. Pegada supinada enfatiza lat inferior e bíceps."
        }
      ],
      "session_notes": "Sessão de alto volume para costas. Priorize qualidade sobre carga. Se RPE do top set passar de 9, reduza 5% na próxima semana."
    }
  ]
}

IMPORTANTE:
- Preencha TODOS os dias de treino (${days} dias), com descanso nos demais.
- Cada dia deve ter 4-7 exercícios adequados ao tempo de sessão.
- Gere o JSON COMPLETO. Não truncar. Todos os dias, todos os exercícios.
- Use feeder_sets + top_set + backoff_sets para exercícios compostos principais (1-2 por sessão).
- Use work_sets para exercícios acessórios e isoladores.
- Sempre inclua "why_this_exercise" e "execution_cues" para cada exercício.`;
  }

  if (tab === "anatomia") {
    return `Gere análise ANATÔMICA E BIOMECÂNICA PROFUNDA para: ${muscleList}
Equipamentos: ${equipment || "Academia completa"} | Lesões: ${injuries || "Nenhuma"}

Para cada músculo:
- Nomenclatura anatômica completa
- Origem, inserção, função
- Plano de movimento e eixo de rotação
- Músculos sinergistas e antagonistas
- Ponto de máxima tensão mecânica
- Implicações para seleção de exercícios
- Desequilíbrios comuns e impacto postural
- Referências: Schoenfeld, Contreras`;
  }

  if (tab === "tecnica") {
    return `Gere GUIA DE TÉCNICA DE EXECUÇÃO para os principais exercícios de: ${muscleList}
Fase: ${phase} | Equipamentos: ${equipment || "Academia completa"} | Lesões: ${injuries || "Nenhuma"}

Para cada exercício:
- Posição inicial e alinhamento
- Fase excêntrica (tempo, controle)
- Fase concêntrica (intenção, velocidade)
- Padrão respiratório
- Erros comuns e correção
- Cues verbais de impacto
- Regressão e progressão
- Adaptações para lesões informadas`;
  }

  if (tab === "periodizacao") {
    return `Gere PLANO DE PERIODIZAÇÃO CIENTÍFICO para ${weeks} semanas, fase ${phase}, nível ${level}
Músculos: ${muscleList} | Estresse/sono: ${stressLevel || "Bom"} | Cardio: ${cardio || "Não"}

Inclua:
1. Modelo recomendado (DUP, Block, Linear) com justificativa
2. Estrutura semana a semana: volume, intensidade, RPE
3. Deload: semana exata e como reduzir
4. Volume landmarks semana a semana
5. Métricas de acompanhamento
6. Janela de recuperação (SRA) por grupo
7. Referências: Schoenfeld, Helms, Israetel`;
  }

  if (tab === "reels") {
    return `Crie roteiro de Reels de 45-60s para coach sobre: ${muscleList} na fase ${phase}.
Gancho + problema + solução técnica + demonstração + CTA. Legenda com hashtags.`;
  }

  if (tab === "volume") {
    return `Analise o volume do cliente para ${muscleList}, nível ${level}, ${data.currentSets || 0} séries/semana.
Classifique: MEV, MAV ou acima do MRV. Recomendação prática de 150 palavras.`;
  }

  if (tab === "stagnation") {
    return `Cliente estagnado em: ${data.exercise}. Histórico: ${JSON.stringify(data.progressHistory || [])}.
Fase ${phase}, nível ${level}. 3 estratégias práticas com justificativa científica.`;
  }

  return `Protocolo de treino para ${clientName}, fase ${phase}, músculos ${muscleList}, nível ${level}.`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const data = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const PERPLEXITY_API_KEY = Deno.env.get("PERPLEXITY_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const userPrompt = buildStructuredPrompt(data);
    let scienceContext = "";
    let scienceCitations: string[] = [];

    // Dual-AI: Perplexity for scientific references
    if (PERPLEXITY_API_KEY && data.tab === "protocolo") {
      try {
        const muscles = Array.isArray(data.muscles) ? data.muscles.join(" ") : data.muscles;
        const ppxRes = await fetch("https://api.perplexity.ai/chat/completions", {
          method: "POST",
          headers: { "Authorization": `Bearer ${PERPLEXITY_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "sonar-pro",
            messages: [
              { role: "system", content: "Exercise science researcher. Find recent evidence on optimal training volume, intensity techniques, and periodization for the given muscles and phase." },
              { role: "user", content: `optimal training volume sets per week ${muscles} ${data.phase} hypertrophy evidence 2024 2025 periodization techniques` }
            ],
            search_recency_filter: "year",
          })
        });
        if (ppxRes.ok) {
          const ppxData = await ppxRes.json();
          scienceContext = ppxData.choices?.[0]?.message?.content || "";
          scienceCitations = ppxData.citations || [];
        }
      } catch (e) {
        console.log("Perplexity enrichment failed, continuing:", e);
      }
    }

    const enrichedPrompt = scienceContext
      ? `${userPrompt}\n\nREFERÊNCIAS CIENTÍFICAS ATUAIS (Perplexity):\n${scienceContext}\n\nCitações: ${JSON.stringify(scienceCitations)}\n\nUse essas referências para embasar as decisões de volume e técnica.`
      : userPrompt;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: ELITE_SYSTEM_PROMPT },
          { role: "user", content: enrichedPrompt },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit excedido." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const errText = await response.text();
      throw new Error(`AI API error: ${response.status} - ${errText}`);
    }

    const aiData = await response.json();
    let content = aiData.choices?.[0]?.message?.content || "";

    // For protocolo tab, try to parse JSON
    if (data.tab === "protocolo") {
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return new Response(JSON.stringify({ protocol: parsed, citations: scienceCitations }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      } catch (e) {
        console.log("JSON parse failed, returning raw content");
      }
    }

    return new Response(JSON.stringify({ content, citations: scienceCitations }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("generate-training-protocol error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
