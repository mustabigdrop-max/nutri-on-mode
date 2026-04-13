import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ELITE_SYSTEM_PROMPT = `Você é o TrainingON — um coach de elite em bodybuilding, hipertrofia muscular, fisiologia do exercício, biomecânica, periodização e prescrição de treinos.
Sua função é pensar como um preparador físico de altíssimo nível e criar a melhor estrutura de treino possível para cada pessoa, cada objetivo e cada fase.
Você não monta treinos por costume, moda ou preferência pessoal. Você analisa, justifica e escolhe a melhor solução com base em ciência, lógica e individualidade.

PILARES FUNDAMENTAIS:
Tensão mecânica, estresse metabólico, dano muscular, sobrecarga progressiva, volume adequado, frequência inteligente, intervalo de descanso, cadência, biomecânica e recuperação.

MENTALIDADE OBRIGATÓRIA — pense como especialista em:
Hipertrofia, força, resistência muscular, potência, emagrecimento, recomposição corporal, performance, recuperação, reabilitação/prevenção de lesões, especialização de pontos fracos, condicionamento geral e estratégia de longo prazo.

DIVISÕES QUE VOCÊ DOMINA:
Full Body, Upper/Lower, Push/Pull/Legs, Bro Split, Torso/Perna, ABC, ABCD, ABCDE, divisão por grupamento muscular, por prioridade muscular, por especialização, divisões híbridas.

PERIODIZAÇÃO:
Linear, linear reversa, ondulatória (DUP), em bloco, dupla, manutenção, ganho, cutting, off-season, preparação. Microciclo, mesociclo, macrociclo, deload, fase de acumulação, intensificação e transição.
O treino NÃO deve ser linear por padrão. Ajuste conforme fase, recuperação, objetivo e resposta individual.

PLANEJAMENTO DE FASES (OBRIGATÓRIO):
Você NÃO prescreve apenas um treino isolado. Você prescreve uma ESTRATÉGIA COMPLETA de construção corporal.
Sugira a duração de cada fase (bulking, cutting, manutenção, transição, deload) com base em critérios práticos.
Referências de duração:
- Bulking: 16-24 semanas
- Cutting: 8-16 semanas
- Manutenção/Transição: 1-4 semanas
- Mesociclos: 4-8 semanas
A duração NUNCA deve ser arbitrária — justifique tecnicamente com base em: percentual de gordura estimado, resposta ao treino, performance, recuperação e adesão.
Inclua o macrociclo completo: qual fase vem ANTES, qual fase vem DEPOIS, e por quê.

DECISÃO PÓS-DELOAD (OBRIGATÓRIO):
Após cada deload, o sistema entra em MODO DE DECISÃO ESTRATÉGICA. O objetivo NÃO é apenas "voltar a treinar", mas descobrir o próximo passo ideal.
Inclua SEMPRE no phase_plan um campo "post_deload_decision" com a árvore de decisão:
1. Recuperou e performou melhor? → Novo bloco de progressão (aumento de carga, volume ou intensidade)
2. Recuperou, mas objetivo mudou? → Transição para nova fase (ex: bulking → cutting)
3. Ainda fatigado? → Prolongar recuperação, ajustar volume, ou novo deload curto (3-5 dias)
4. Treino travado por logística? → Trocar divisão (ex: PPL → Upper/Lower)
5. Objetivo estético mudou? → Ajustar foco muscular, volume e seleção de exercícios
Para CADA cenário, explique: o que foi observado, qual decisão tomar, por que essa decisão é a melhor, e como o próximo bloco começa.

VARIÁVEIS QUE VOCÊ CONTROLA:
Volume total e por sessão por músculo, frequência semanal, intensidade relativa, reps por série, séries efetivas, intervalo de descanso, cadência de execução, ordem e seleção de exercícios, amplitude útil, ponto de maior resistência, risco articular, fadiga local e sistêmica, recuperação entre sessões, técnica do aluno, nível de esforço, RIR (repetições em reserva), falha muscular, progressão de carga/reps/séries/exercício.

BIOMECÂNICA:
Analise o músculo-alvo, perfil de resistência, amplitude, papel dos estabilizadores e compensações. Nunca trate músculos grandes como blocos únicos — avalie subdivisões, regiões e funções específicas. Escolha exercícios pela melhor relação estímulo/fadiga.

TÉCNICAS AVANÇADAS (usar APENAS quando justificado):
Rest-pause, drop set, cluster set, supersets, bi-sets, giant sets, pré-exaustão, pós-exaustão, parciais, séries alongadas, técnicas metabólicas.

REGRAS DE DECISÃO:
1. Identifique objetivo principal
2. Identifique nível do aluno
3. Avalie tempo disponível por semana
4. Avalie frequência possível
5. Avalie recuperação, sono, estresse e dieta
6. Considere histórico de treino e lesões
7. Escolha a divisão mais eficiente
8. Escolha a periodização mais adequada
9. Ajuste volume, intensidade e frequência para progresso sem excesso de fadiga
10. Priorize resultado com aderência e sustentabilidade

Ao decidir entre opções, escolha o melhor equilíbrio entre: resultado, segurança, recuperação, aderência, consistência e progressão.

TOM DE VOZ — especialista confiante, técnico e direto:
"Seu foco neste bloco é aumentar densidade de costas e estabilidade de tronco."
"A divisão escolhida foi upper/lower porque ela melhor distribui volume e recuperação para o seu nível."
"Você precisa melhorar amplitude, controle excêntrico e consistência de progressão."

REGRA MÁXIMA:
Você não repete fórmulas prontas. Você decide como um treinador absurdo de bom. Se o contexto mudar, recalcule tudo. Se o objetivo mudar, mude a estratégia. Se a recuperação piorar, reduza dose. Se o aluno evoluir, avance o estímulo.
Maximize resultado com inteligência, técnica e personalização absoluta.
Responda SEMPRE em Português do Brasil.`;

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
1. ANALISE o perfil completo antes de decidir qualquer coisa.
2. ESCOLHA a divisão ideal entre: Full Body, Upper/Lower, PPL, Bro Split, Torso/Perna, ABC, ABCD, ABCDE ou Híbrida. Justifique com base no nível, frequência e objetivo.
3. ESCOLHA o modelo de periodização: Linear, Ondulatória (DUP), em Bloco, Linear Reversa ou Dupla. Justifique.
4. DETERMINE quantas semanas o bloco deve durar e quando fazer deload.
5. Para cada sessão, prescreva:
   - Warm-up geral (2-3 exercícios de ativação/mobilidade)
   - Warm-up específico do primeiro exercício composto
   - Feeder sets (séries alimentadoras para subir carga gradualmente)
   - Top set (série principal com carga máxima controlada, RPE 8-9)
   - Back-off sets (séries de redução pós-top set, -10 a -20% da carga)
   - Séries de trabalho para exercícios acessórios
6. Defina cadência de execução para cada exercício (ex: 3-0-1-0)
7. Defina intervalo de descanso específico por tipo de exercício
8. Defina progressão: modelo escolhido (Double Progression, Linear, Ondulatória)
9. Identifique quais músculos devem receber MAIS volume e quais apenas MANTER
10. Gere alertas sobre o que o cliente precisa melhorar (técnica, amplitude, controle excêntrico, etc.)
11. Se técnicas avançadas forem adequadas (rest-pause, drop set, cluster, superset), inclua com justificativa

FORMATO JSON OBRIGATÓRIO:
{
  "phase_plan": {
    "macrocycle_title": "Macrociclo Anual — Hipertrofia com Cutting Estratégico",
    "current_phase": "Bulking — Mesociclo 1 de 3",
    "phases": [
      {
        "name": "Bulking (Fase Atual)",
        "duration_weeks": "16-20",
        "mesocycles": 3,
        "objective": "Ganho máximo de massa muscular com controle de gordura",
        "criteria_to_advance": "BF estimado atingir 18% ou ganho de 6-8kg",
        "volume_strategy": "Progressão de volume: MEV → MAV → MRV ao longo dos mesociclos",
        "intensity_strategy": "RPE 7-8 no meso 1, RPE 8-9 no meso 2, RPE 9+ no meso 3",
        "rationale": "O cliente está com BF estimado de ~14%, nível intermediário, com boa capacidade de recuperação. Bulking de 16-20 semanas permite ganho significativo antes de acumular gordura excessiva."
      },
      {
        "name": "Transição (Manutenção)",
        "duration_weeks": "2-3",
        "mesocycles": 1,
        "objective": "Estabilizar peso, normalizar hormônios, preparar para cutting",
        "criteria_to_advance": "Peso estável por 2 semanas + performance mantida",
        "volume_strategy": "Redução para MAV",
        "intensity_strategy": "RPE 7-8, sem falha",
        "rationale": "Período de adaptação reversa para normalizar leptina e metabolismo antes do déficit calórico."
      },
      {
        "name": "Cutting",
        "duration_weeks": "10-14",
        "mesocycles": 2,
        "objective": "Reduzir BF para ~10-12% mantendo massa muscular",
        "criteria_to_advance": "BF alvo atingido ou perda de força >10%",
        "volume_strategy": "Manter frequência, reduzir volume 20-30%",
        "intensity_strategy": "Manter cargas pesadas, reduzir volume acessório",
        "rationale": "Cutting após bulking bem conduzido. Duração baseada na quantidade de gordura a perder (estimativa de 4-6kg)."
      }
    ],
    "deload_strategy": "Deload programado a cada 4-6 semanas (semana de deload = -40% volume, manter intensidade). Deload reativo se RPE consistentemente >9.5 ou sintomas de overreaching.",
    "long_term_note": "Estratégia de longo prazo voltada para ciclos de ganho/definição progressivos. A cada macrociclo, o ponto de partida do bulking deve ser melhor (mais massa, menos gordura, melhor base de força)."
  },
  "block_overview": {
    "title": "Bloco de Hipertrofia — Foco em Costas e Deltoide Lateral",
    "duration_weeks": 8,
    "deload_week": 7,
    "split_type": "Upper/Lower",
    "split_justification": "Melhor distribuição de volume e frequência para intermediários com 4x/semana. Permite 2x frequência por grupo com volume adequado por sessão.",
    "periodization_model": "Ondulatória (DUP)",
    "periodization_justification": "Variação de estímulo intra-semanal otimiza adaptação neural e hipertrófica em intermediários.",
    "primary_goal": "Hipertrofia com ênfase em grupos deficientes",
    "secondary_goal": "Melhora de controle excêntrico e conexão mente-músculo",
    "muscle_priorities": [
      { "muscle": "Costas (Lat)", "priority": "alta", "weekly_sets": 18, "frequency": "2x/semana", "rationale": "Ponto fraco identificado — priorizar largura via volume e frequência" }
    ],
    "maintenance_muscles": ["Peitoral", "Quadríceps"],
    "progression_model": "Double Progression — quando atingir o topo da faixa de reps, aumente 2.5kg",
    "recovery_notes": "Estresse ${stressLevel || 'bom'} — volume moderado-alto é viável. Monitorar fadiga sistêmica na semana 5.",
    "coach_notes": "Análise completa do perfil. Prescrição individualizada com base em biomecânica, capacidade de recuperação e objetivos declarados."
  },
  "improvement_alerts": [
    { "area": "Controle Excêntrico", "severity": "alta", "message": "Priorize 3 segundos de excêntrica em todos os movimentos de costas para maximizar tensão mecânica" },
    { "area": "Amplitude de Movimento", "severity": "media", "message": "Garanta ROM completo em rosca direta — não compense com swing" },
    { "area": "Progressão", "severity": "media", "message": "Registre cargas e reps toda sessão. Sem registro não há progressão inteligente." }
  ],
  "training_days": [
    {
      "day_number": 1,
      "day_label": "Segunda-feira",
      "session_title": "Upper A — Foco Costas + Ombro",
      "focus_muscles": ["Costas", "Deltoides", "Bíceps"],
      "estimated_duration": "65 min",
      "intensity_profile": "Alto volume, intensidade moderada-alta",
      "warmup": [
        { "name": "Band Pull-Apart", "sets": "2", "reps": "15", "notes": "Ativação de manguito e romboides" }
      ],
      "exercises": [
        {
          "order": 1,
          "name": "Remada Curvada com Barra",
          "muscle_target": "Costas (Lat + Romboides)",
          "technique_type": "compound",
          "tempo": "3-0-1-1",
          "advanced_technique": null,
          "structure": {
            "feeder_sets": [
              { "set_label": "Feeder 1", "load_percent": "40%", "reps": "10", "notes": "Aquecimento articular" },
              { "set_label": "Feeder 2", "load_percent": "65%", "reps": "6", "notes": "Ativação neural progressiva" }
            ],
            "top_set": { "sets": "1", "reps": "6-8", "rpe": "8.5", "rest": "180s", "notes": "Carga máxima controlada. Excêntrica de 3s." },
            "backoff_sets": { "sets": "3", "reps": "8-10", "load_reduction": "-15%", "rest": "120s", "notes": "Manter técnica impecável. Volume efetivo." }
          },
          "execution_cues": "Pegada pronada, tronco a 45°. Puxe para o umbigo. Squeeze de 1s no topo. Excêntrica controlada de 3s.",
          "why_this_exercise": "Movimento composto que recruta toda a cadeia posterior. Ideal para abrir a sessão com alta demanda neural. Perfil de resistência favorece tensão no meio da amplitude.",
          "biomechanics_note": "Inclinação de tronco a 45° maximiza recrutamento de lat e romboides. Ângulo mais verticalizado transfere carga para trapézio."
        }
      ],
      "session_notes": "Sessão de alto volume para costas. Priorize qualidade sobre carga. Se RPE do top set passar de 9, reduza 5% na próxima semana."
    }
  ]
}

IMPORTANTE:
- Inclua OBRIGATORIAMENTE o campo "phase_plan" com o macrociclo completo, fases antes e depois da fase atual, duração justificada, critérios de transição e estratégia de deload.
- Preencha TODOS os dias de treino (${days} dias).
- Cada dia deve ter 4-7 exercícios adequados ao tempo de sessão (${sessionDuration || "60min"}).
- Gere o JSON COMPLETO. Não truncar. Todos os dias, todos os exercícios.
- Use feeder_sets + top_set + backoff_sets para exercícios compostos principais (1-2 por sessão).
- Use work_sets para exercícios acessórios e isoladores.
- Inclua "tempo" (cadência) para cada exercício.
- Inclua "why_this_exercise", "execution_cues" e "biomechanics_note" para cada exercício.
- Inclua "advanced_technique" quando justificável (rest-pause, drop set, etc.) ou null.
- Inclua "periodization_model" e "periodization_justification" no block_overview.
- Inclua "recovery_notes" no block_overview.
- Pense biomecanicamente: perfil de resistência, amplitude útil, relação estímulo/fadiga.
- Não repita fórmulas. Cada treino deve ser único para este perfil.`;
  }

  if (tab === "anatomia") {
    return `Gere análise ANATÔMICA E BIOMECÂNICA PROFUNDA para: ${muscleList}
Equipamentos: ${equipment || "Academia completa"} | Lesões: ${injuries || "Nenhuma"} | Nível: ${level}

Para cada músculo:
- Nomenclatura anatômica completa (nomes científicos)
- Origem, inserção, função primária e secundária
- Plano de movimento e eixo de rotação
- Subdivisões funcionais (ex: peitoral clavicular vs esternal, lat superior vs inferior)
- Músculos sinergistas e antagonistas
- Ponto de máxima tensão mecânica (onde no ROM a tensão é maior)
- Perfil de resistência ideal (alongado vs encurtado vs meio da amplitude)
- Implicações para seleção de exercícios (quais exercícios melhor estimulam cada região)
- Desequilíbrios comuns e impacto postural
- Como lesões informadas (${injuries || "nenhuma"}) afetam a biomecânica deste grupo
- Top 5 exercícios rankeados por relação estímulo/fadiga para este músculo
- Referências: Schoenfeld, Contreras, Israetel`;
  }

  if (tab === "tecnica") {
    return `Gere GUIA DE TÉCNICA DE EXECUÇÃO AVANÇADO para os principais exercícios de: ${muscleList}
Fase: ${phase} | Nível: ${level} | Equipamentos: ${equipment || "Academia completa"} | Lesões: ${injuries || "Nenhuma"}

Para cada exercício (mínimo 5 por grupo muscular):
- Posição inicial e alinhamento articular detalhado
- Fase excêntrica: tempo, controle, onde focar a tensão
- Fase concêntrica: intenção, velocidade, ponto de contração máxima
- Cadência recomendada (formato: excêntrica-pausa inferior-concêntrica-pausa superior)
- Padrão respiratório correto
- Erros comuns (mínimo 3) e como corrigir cada um
- Cues verbais de impacto (frases curtas que o coach usaria)
- Regressão para iniciantes e progressão para avançados
- Adaptações específicas para lesões informadas
- Variações que mudam o estímulo (pegada, ângulo, posição dos pés)
- Dicas de conexão mente-músculo`;
  }

  if (tab === "periodizacao") {
    return `Gere PLANO DE PERIODIZAÇÃO CIENTÍFICO COMPLETO para ${weeks} semanas
Fase: ${phase} | Nível: ${level} | Frequência: ${days}x/semana
Músculos prioritários: ${muscleList} | Estresse/sono: ${stressLevel || "Bom"} | Cardio: ${cardio || "Não"}
Equipamentos: ${equipment || "Academia completa"} | Lesões: ${injuries || "Nenhuma"}

Inclua:
1. Modelo de periodização recomendado (Linear, DUP, Bloco, Linear Reversa, Dupla) com justificativa detalhada de por que este modelo é superior para este perfil
2. Estrutura semana a semana detalhada:
   - Volume (séries por grupo muscular)
   - Intensidade (% 1RM ou RPE)
   - Faixa de repetições
   - Tipo de estímulo (força, hipertrofia, metabólico, resistência)
3. Fases do macrociclo: acumulação → intensificação → realização → transição
4. Deload: semana exata, como reduzir (volume vs intensidade), por que neste momento
5. Volume landmarks semana a semana por grupo muscular (MEV → MAV → MRV)
6. Progressão de carga: modelo e taxa esperada
7. Métricas de acompanhamento (o que monitorar e quando ajustar)
8. Janela de recuperação (SRA) por grupo muscular e como isso afeta a frequência
9. Sinais de que o aluno precisa de ajuste (overreaching, undertraining)
10. Alternativas caso a rotina mude (perder 1 dia, trocar horário, viagem)
11. Referências: Schoenfeld, Helms, Israetel, Nuckols`;
  }

  if (tab === "reels") {
    return `Crie roteiro de Reels de 45-60s para coach sobre: ${muscleList} na fase ${phase}.
Gancho forte (3s) + problema comum + solução técnica com base científica + demonstração + CTA.
Legenda com hashtags. Tom: autoridade técnica com didática acessível.`;
  }

  if (tab === "volume") {
    return `Analise o volume do cliente para ${muscleList}, nível ${level}, ${data.currentSets || 0} séries/semana.
Fase: ${phase} | Frequência: ${days}x/semana | Estresse: ${stressLevel || "Bom"}

Classifique cada grupo muscular:
- MEV (Volume Mínimo Efetivo): mínimo para manter ganhos
- MAV (Volume de Máxima Adaptação): ponto ótimo de crescimento
- MRV (Volume Máximo Recuperável): limite antes de overreaching

Recomendação detalhada:
1. Volume atual está abaixo do MEV, no MAV ou acima do MRV?
2. Ajuste recomendado (aumentar/manter/reduzir) com número de séries
3. Como distribuir o volume na semana (frequência)
4. Sinais de que o volume está excessivo
5. Estratégia de progressão de volume ao longo das semanas
Referências: Israetel, Schoenfeld.`;
  }

  if (tab === "stagnation") {
    return `Cliente estagnado em: ${data.exercise}. Histórico: ${JSON.stringify(data.progressHistory || [])}.
Fase ${phase}, nível ${level}. Frequência: ${days}x/semana.

Análise completa:
1. Diagnóstico: por que a estagnação aconteceu (volume, intensidade, técnica, recuperação, nutrição?)
2. 3-5 estratégias práticas com justificativa científica para cada uma
3. Técnicas avançadas aplicáveis (rest-pause, cluster, drop set, etc.)
4. Ajuste de periodização se necessário
5. Timeline esperado para quebrar o platô
6. Exercícios auxiliares que podem desbloquear a progressão
Referências científicas quando aplicável.`;
  }

  return `Protocolo de treino completo e justificado para ${clientName}, fase ${phase}, músculos ${muscleList}, nível ${level}, ${days}x/semana, ${sessionDuration || "60min"} por sessão. Equipamentos: ${equipment || "Academia completa"}. Lesões: ${injuries || "Nenhuma"}. Analise, justifique e prescreva.`;
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
