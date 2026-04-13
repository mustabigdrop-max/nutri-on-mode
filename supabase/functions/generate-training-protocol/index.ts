import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ELITE_SYSTEM_PROMPT = `Você é o TrainingON — coach de elite em bodybuilding, hipertrofia, biomecânica, periodização e prescrição de treino.
Pense como um treinador profissional de altíssimo nível. NUNCA gere treinos genéricos.

ANÁLISE OBRIGATÓRIA ANTES DE PRESCREVER:
- Objetivo, nível, frequência semanal, tempo disponível por sessão
- Recuperação, estresse, sono e dieta
- Histórico de treino, dores, limitações e lesões
- Fase atual do planejamento (bulking, cutting, recomp, etc.)

DIVISÕES QUE VOCÊ DOMINA (escolha a MELHOR, não a mais popular):
Full Body, Upper/Lower, PPL, Bro Split, Torso/Perna, ABC, ABCD, ABCDE, divisões híbridas, especialização, força, hipertrofia, recomposição, cutting, bulking, manutenção, performance.

PERIODIZAÇÃO OBRIGATÓRIA — use microciclo, mesociclo e macrociclo:
Linear, ondulatória (DUP), em bloco, reversa, transição.
Fases: acumulação, intensificação, manutenção, deload.

DURAÇÕES DE REFERÊNCIA (justifique tecnicamente):
- Bulking/off-season: 8–12 sem por bloco
- Cutting: 6–12 sem
- Recomposição: 8–12 sem
- Performance/força: 4–8 sem
- Manutenção/transição: 2–4 sem
- Deload: 1 sem
Se a estratégia for longa, quebre em blocos sucessivos com reavaliação ao final de cada um.

FINAL DE CADA BLOCO — sempre incluir:
1. Reavaliação
2. Decisão técnica
3. Próximo passo definido
Opções: novo bloco de progressão | manter fase com ajustes | trocar fase | trocar divisão | deload | transição.

PÓS-DELOAD — NUNCA voltar automaticamente ao treino anterior:
Reavaliar: recuperação, performance, fadiga, aderência, dores, objetivo.
Decidir entre: novo bloco | ajuste da mesma fase | troca de fase | troca de divisão/frequência | mais recuperação.

REGRA ANTI-UNDEFINED (CRÍTICA):
NUNCA exibir "undefined", campos vazios, ou texto como "undefined séries", "undefined RPE", "undefined RIR".
Se faltar dado, use FALLBACK AUTOMÁTICO INTELIGENTE:
- Séries sem valor → usar "3" como padrão
- Reps sem valor → usar "8-12"
- RPE sem valor → usar "7-8"
- RIR sem valor → usar "2-3"
- Descanso sem valor → usar "90s"
- Tempo/cadência sem valor → usar "2-0-1-0"
TODOS os campos de exercício devem estar preenchidos. Sem exceção.

ESTRUTURA DE SÉRIES POR EXERCÍCIO (usar quando aplicável):
- Compostos pesados: warm-up → feeder sets → top set → back-off sets
- Exercícios moderados: aquecimento + séries de trabalho bem definidas
- Isoladores: estrutura simplificada, MAS nunca indefinida

Cada exercício DEVE ter:
- Número de séries (nunca vazio)
- Reps (nunca vazio)
- RIR ou RPE (nunca vazio)
- Descanso (nunca vazio)
- Função da série (warm-up, feeder, top, back-off, work)

CONCEITOS QUE DEVE USAR CORRETAMENTE:
- RIR, RPE, falha técnica, falha muscular
- MEV, MAV, MRV
- Progressive overload, double progression, deload
- Tensão mecânica, estresse metabólico
- Mente-músculo, line of pull, peak contraction, stretched position
- SFR, junk volume, density, frequency, ROM, fatigue management

NUNCA CONFUNDIR:
- Top set ≠ work set genérico
- Back-off set ≠ drop set
- Falha técnica ≠ falha absoluta
- Volume útil ≠ junk volume

SELEÇÃO DE EXERCÍCIOS — biomecanicamente inteligente:
Considerar: músculo-alvo, perfil de resistência, estabilidade, amplitude útil, stretched position, peak contraction, custo articular, relação estímulo/fadiga.

TÉCNICAS AVANÇADAS (APENAS quando fizer sentido):
Drop set, rest-pause, myo-reps, giant sets, supersets, cluster sets, mechanical drop sets.

SAÍDA OBRIGATÓRIA para tab "protocolo":
- Objetivo do bloco, fase atual, duração sugerida
- Divisão escolhida + justificativa
- Frequência por músculo, volume estimado
- Faixa de reps, RIR/RPE, descanso
- Progressão definida
- Estrutura das séries por exercício (COMPLETA)
- Reavaliação final + decisão pós-bloco
- Decisão pós-deload (se houver)

TOM: especialista confiante, técnico, direto. Responda SEMPRE em Português do Brasil.

REGRA MÁXIMA: Você não repete fórmulas prontas. Cada treino é único para o perfil. Se o contexto mudar, recalcule tudo.`;

function sanitizeExercise(ex: any): any {
  if (!ex || typeof ex !== 'object') return ex;
  return {
    ...ex,
    name: ex.name || "Exercício",
    muscle_target: ex.muscle_target || "Grupo muscular",
    tempo: ex.tempo || "2-0-1-0",
    technique_type: ex.technique_type || "accessory",
    execution_cues: ex.execution_cues || "Execução controlada com foco na técnica.",
    why_this_exercise: ex.why_this_exercise || "Selecionado pela relação estímulo/fadiga.",
    biomechanics_note: ex.biomechanics_note || "",
    structure: sanitizeStructure(ex.structure),
  };
}

function sanitizeStructure(s: any): any {
  if (!s || typeof s !== 'object') {
    return { work_sets: { sets: "3", reps: "8-12", rpe: "7-8", rest: "90s", notes: "Séries de trabalho" } };
  }
  if (s.feeder_sets && Array.isArray(s.feeder_sets)) {
    s.feeder_sets = s.feeder_sets.map((f: any) => ({
      set_label: f.set_label || "Feeder",
      load_percent: f.load_percent || "50%",
      reps: f.reps || "8",
      notes: f.notes || "Aquecimento progressivo",
    }));
  }
  if (s.top_set) {
    s.top_set = {
      sets: s.top_set.sets || "1",
      reps: s.top_set.reps || "6-8",
      rpe: s.top_set.rpe || "8.5",
      rest: s.top_set.rest || "180s",
      notes: s.top_set.notes || "Série principal com carga controlada",
    };
  }
  if (s.backoff_sets) {
    s.backoff_sets = {
      sets: s.backoff_sets.sets || "3",
      reps: s.backoff_sets.reps || "8-10",
      load_reduction: s.backoff_sets.load_reduction || "-15%",
      rest: s.backoff_sets.rest || "120s",
      notes: s.backoff_sets.notes || "Volume efetivo pós top set",
    };
  }
  if (s.work_sets) {
    s.work_sets = {
      sets: s.work_sets.sets || "3",
      reps: s.work_sets.reps || "8-12",
      rpe: s.work_sets.rpe || "7-8",
      rest: s.work_sets.rest || "90s",
      notes: s.work_sets.notes || "Séries de trabalho",
    };
  }
  if (!s.feeder_sets && !s.top_set && !s.backoff_sets && !s.work_sets) {
    s.work_sets = { sets: "3", reps: "8-12", rpe: "7-8", rest: "90s", notes: "Séries de trabalho" };
  }
  return s;
}

function sanitizeProtocol(protocol: any): any {
  if (!protocol || typeof protocol !== 'object') return protocol;
  if (protocol.training_days && Array.isArray(protocol.training_days)) {
    protocol.training_days = protocol.training_days.map((day: any) => ({
      ...day,
      day_label: day.day_label || `Dia ${day.day_number || '?'}`,
      session_title: day.session_title || "Sessão de Treino",
      focus_muscles: day.focus_muscles || [],
      estimated_duration: day.estimated_duration || "60 min",
      warmup: (day.warmup || []).map((w: any) => ({
        name: w.name || "Aquecimento",
        sets: w.sets || "2",
        reps: w.reps || "15",
        notes: w.notes || "Ativação e mobilidade",
      })),
      exercises: (day.exercises || []).map(sanitizeExercise),
      session_notes: day.session_notes || "Priorize qualidade sobre carga.",
    }));
  }
  return protocol;
}

function buildStructuredPrompt(data: any): string {
  const { phase, muscles, level, weeks, days, clientName, equipment, injuries, sessionDuration, stressLevel, supplements, weakPoints, specificGoal, cardio, tab } = data;
  const muscleList = Array.isArray(muscles) ? muscles.join(", ") : muscles;

  if (tab === "protocolo") {
    return `Gere um PROTOCOLO DE TREINO DE ELITE para o cliente abaixo. Retorne EXCLUSIVAMENTE um JSON válido, sem markdown, sem texto antes ou depois.

PERFIL DO CLIENTE:
- Nome: ${clientName || "Cliente"}
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
1. ANALISE o perfil completo antes de decidir qualquer coisa.
2. ESCOLHA a divisão ideal (Full Body, Upper/Lower, PPL, Bro Split, Torso/Perna, ABC, ABCD, ABCDE, Híbrida). Justifique.
3. ESCOLHA o modelo de periodização (Linear, DUP, Bloco, Reversa, Dupla). Justifique.
4. DETERMINE duração do bloco e quando fazer deload.
5. Para cada sessão:
   - Warm-up geral (2-3 exercícios de ativação/mobilidade)
   - Warm-up específico do primeiro composto
   - Feeder sets (séries alimentadoras para subir carga gradualmente)
   - Top set (série principal, RPE 8-9)
   - Back-off sets (-10 a -20% da carga)
   - Séries de trabalho para acessórios
6. Cadência (tempo) para cada exercício (ex: 3-0-1-0)
7. Descanso específico por tipo de exercício
8. Progressão definida (Double Progression, Linear, Ondulatória)
9. Volume por músculo: quais recebem MAIS volume, quais MANTÊM
10. Alertas de melhoria (técnica, amplitude, controle excêntrico)
11. Técnicas avançadas quando adequadas (rest-pause, drop set, cluster, superset), com justificativa

REGRA ANTI-UNDEFINED (OBRIGATÓRIA):
- NUNCA retornar campos com valor undefined, null, vazio ou faltando
- Todo exercício DEVE ter: name, sets/reps preenchidos, rpe ou rir, rest, tempo
- Se não souber o valor exato, use fallback inteligente (ex: sets="3", reps="8-12", rpe="7-8", rest="90s", tempo="2-0-1-0")
- CADA field de feeder_sets, top_set, backoff_sets e work_sets deve ter TODOS os sub-campos preenchidos

FORMATO JSON OBRIGATÓRIO:
{
  "phase_plan": {
    "macrocycle_title": "string",
    "current_phase": "string",
    "phases": [
      {
        "name": "string",
        "duration_weeks": "string",
        "mesocycles": number,
        "objective": "string",
        "criteria_to_advance": "string",
        "volume_strategy": "string",
        "intensity_strategy": "string",
        "rationale": "string"
      }
    ],
    "deload_strategy": "string",
    "long_term_note": "string",
    "post_deload_decision": {
      "intro": "Após o deload, reavaliar recuperação, performance, fadiga, aderência, dores e objetivo antes de decidir o próximo passo.",
      "scenarios": [
        {
          "condition": "string",
          "signal": "string",
          "decision": "string",
          "action": "string",
          "how_next_block_starts": "string"
        }
      ]
    }
  },
  "block_overview": {
    "title": "string",
    "duration_weeks": number,
    "deload_week": number,
    "split_type": "string",
    "split_justification": "string",
    "periodization_model": "string",
    "periodization_justification": "string",
    "primary_goal": "string",
    "secondary_goal": "string",
    "muscle_priorities": [
      { "muscle": "string", "priority": "string", "weekly_sets": number, "frequency": "string", "rationale": "string" }
    ],
    "maintenance_muscles": ["string"],
    "progression_model": "string",
    "recovery_notes": "string",
    "coach_notes": "string"
  },
  "improvement_alerts": [
    { "area": "string", "severity": "string", "message": "string" }
  ],
  "training_days": [
    {
      "day_number": number,
      "day_label": "string",
      "session_title": "string",
      "focus_muscles": ["string"],
      "estimated_duration": "string",
      "intensity_profile": "string",
      "warmup": [
        { "name": "string", "sets": "string", "reps": "string", "notes": "string" }
      ],
      "exercises": [
        {
          "order": number,
          "name": "string (NUNCA vazio)",
          "muscle_target": "string (NUNCA vazio)",
          "technique_type": "compound|accessory|isolation",
          "tempo": "string (ex: 3-0-1-0, NUNCA vazio)",
          "advanced_technique": "string|null",
          "structure": {
            "feeder_sets": [{ "set_label": "string", "load_percent": "string", "reps": "string (NUNCA vazio)", "notes": "string" }],
            "top_set": { "sets": "string (NUNCA vazio)", "reps": "string (NUNCA vazio)", "rpe": "string (NUNCA vazio)", "rest": "string (NUNCA vazio)", "notes": "string" },
            "backoff_sets": { "sets": "string (NUNCA vazio)", "reps": "string (NUNCA vazio)", "load_reduction": "string", "rest": "string (NUNCA vazio)", "notes": "string" },
            "work_sets": { "sets": "string (NUNCA vazio)", "reps": "string (NUNCA vazio)", "rpe": "string (NUNCA vazio)", "rest": "string (NUNCA vazio)", "notes": "string" }
          },
          "execution_cues": "string",
          "why_this_exercise": "string",
          "biomechanics_note": "string"
        }
      ],
      "session_notes": "string"
    }
  ]
}

IMPORTANTE:
- Inclua OBRIGATORIAMENTE "phase_plan" com macrociclo, fases, deload_strategy E "post_deload_decision" com 5 cenários.
- Preencha TODOS os ${days} dias de treino.
- Cada dia: 4-7 exercícios adequados ao tempo (${sessionDuration || "60min"}).
- JSON COMPLETO. Não truncar. Todos os dias, todos os exercícios, todos os campos preenchidos.
- Use feeder_sets + top_set + backoff_sets para compostos principais (1-2 por sessão).
- Use work_sets para acessórios e isoladores.
- ZERO campos undefined/vazios. Se faltar info, use fallback inteligente.`;
  }

  if (tab === "anatomia") {
    return `Gere análise ANATÔMICA E BIOMECÂNICA PROFUNDA para: ${muscleList}
Equipamentos: ${equipment || "Academia completa"} | Lesões: ${injuries || "Nenhuma"} | Nível: ${level}

Para cada músculo:
- Nomenclatura anatômica completa (nomes científicos)
- Origem, inserção, função primária e secundária
- Plano de movimento e eixo de rotação
- Subdivisões funcionais (ex: peitoral clavicular vs esternal)
- Músculos sinergistas e antagonistas
- Ponto de máxima tensão mecânica (onde no ROM)
- Perfil de resistência ideal (alongado vs encurtado vs meio)
- Implicações para seleção de exercícios
- Desequilíbrios comuns e impacto postural
- Como lesões (${injuries || "nenhuma"}) afetam a biomecânica
- Top 5 exercícios por relação estímulo/fadiga
- Referências: Schoenfeld, Contreras, Israetel`;
  }

  if (tab === "tecnica") {
    return `Gere GUIA DE TÉCNICA DE EXECUÇÃO AVANÇADO para: ${muscleList}
Fase: ${phase} | Nível: ${level} | Equipamentos: ${equipment || "Academia completa"} | Lesões: ${injuries || "Nenhuma"}

Para cada exercício (mínimo 5 por grupo muscular):
- Posição inicial e alinhamento articular
- Fase excêntrica: tempo, controle, foco de tensão
- Fase concêntrica: intenção, velocidade, contração máxima
- Cadência recomendada (ex: exc-pausa-conc-pausa)
- Padrão respiratório
- Erros comuns (mínimo 3) e correções
- Cues verbais de impacto
- Regressão e progressão
- Adaptações para lesões
- Variações (pegada, ângulo, posição)
- Dicas mente-músculo`;
  }

  if (tab === "periodizacao") {
    return `Gere PLANO DE PERIODIZAÇÃO CIENTÍFICO COMPLETO para ${weeks} semanas
Fase: ${phase} | Nível: ${level} | Frequência: ${days}x/semana
Músculos: ${muscleList} | Estresse: ${stressLevel || "Bom"} | Cardio: ${cardio || "Não"}
Equipamentos: ${equipment || "Academia completa"} | Lesões: ${injuries || "Nenhuma"}

Inclua:
1. Modelo de periodização + justificativa
2. Semana a semana: volume, intensidade, reps, tipo de estímulo
3. Fases do macrociclo: acumulação → intensificação → realização → transição
4. Deload: semana exata, como reduzir, por quê
5. Volume landmarks por grupo (MEV → MAV → MRV)
6. Progressão de carga: modelo e taxa
7. Métricas de acompanhamento
8. SRA por grupo muscular
9. Sinais de overreaching/undertraining
10. Alternativas se rotina mudar
11. Referências: Schoenfeld, Helms, Israetel, Nuckols`;
  }

  if (tab === "reels") {
    return `Crie roteiro de Reels de 45-60s para coach sobre: ${muscleList} na fase ${phase}.
Gancho forte (3s) + problema comum + solução técnica científica + demonstração + CTA.
Legenda com hashtags. Tom: autoridade técnica com didática acessível.`;
  }

  if (tab === "volume") {
    return `Analise volume para ${muscleList}, nível ${level}, ${data.currentSets || 0} séries/semana.
Fase: ${phase} | Frequência: ${days}x | Estresse: ${stressLevel || "Bom"}

Classifique cada grupo:
- MEV, MAV, MRV
Recomendação:
1. Volume atual: abaixo MEV, no MAV ou acima MRV?
2. Ajuste recomendado com número de séries
3. Distribuição na semana
4. Sinais de volume excessivo
5. Progressão de volume ao longo das semanas
Referências: Israetel, Schoenfeld.`;
  }

  if (tab === "stagnation") {
    return `Cliente estagnado em: ${data.exercise}. Histórico: ${JSON.stringify(data.progressHistory || [])}.
Fase ${phase}, nível ${level}. Frequência: ${days}x/semana.

1. Diagnóstico da estagnação
2. 3-5 estratégias com justificativa científica
3. Técnicas avançadas aplicáveis
4. Ajuste de periodização
5. Timeline para quebrar platô
6. Exercícios auxiliares
Referências científicas.`;
  }

  return `Protocolo de treino completo para ${clientName || "Cliente"}, fase ${phase}, músculos ${muscleList}, nível ${level}, ${days}x/semana, ${sessionDuration || "60min"} por sessão. Equipamentos: ${equipment || "Academia completa"}. Lesões: ${injuries || "Nenhuma"}. Analise, justifique e prescreva.`;
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
    if (PERPLEXITY_API_KEY && (data.tab === "protocolo" || data.tab === "periodizacao" || data.tab === "volume")) {
      try {
        const muscles = Array.isArray(data.muscles) ? data.muscles.join(" ") : data.muscles;
        const ppxRes = await fetch("https://api.perplexity.ai/chat/completions", {
          method: "POST",
          headers: { "Authorization": `Bearer ${PERPLEXITY_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "sonar-pro",
            messages: [
              { role: "system", content: "Exercise science researcher specializing in resistance training, hypertrophy, and periodization. Find recent peer-reviewed evidence. Cite study name, year, type (RCT/meta-analysis/review), and key finding. Focus: PubMed, JSCR, Sports Medicine, EJSS." },
              { role: "user", content: `optimal training volume sets per week ${muscles} ${data.phase} hypertrophy evidence 2023 2024 2025 periodization techniques biomechanics exercise selection` }
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
      ? `${userPrompt}\n\nREFERÊNCIAS CIENTÍFICAS ATUAIS (Perplexity):\n${scienceContext}\n\nCitações: ${JSON.stringify(scienceCitations)}\n\nUse essas referências para embasar as decisões de volume, periodização, seleção de exercícios e técnica.`
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

    // For protocolo tab, parse JSON and sanitize
    if (data.tab === "protocolo") {
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          let parsed = JSON.parse(jsonMatch[0]);
          parsed = sanitizeProtocol(parsed);
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
