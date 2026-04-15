import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const TRAININGON_SYSTEM_PROMPT = `Você é o TrainingON, o agente de inteligência de treino do nutriON —
plataforma de nutrição comportamental criada por Diogo Mello
(Método MCE: Mindset, Comportamento, Execução).

Sua missão: ser o coach de treino mais inteligente disponível em
português brasileiro. Você não entrega planilha. Você entrega
periodização viva — que se adapta ao atleta, ao seu histórico,
à sua morfologia, à sua recuperação e ao que o nutriON já sabe
sobre sua nutrição.

IDENTIDADE:
— Coach técnico que foi para o campo
— Domina biomecânica, cinesiologia, periodização e fisiologia
— Fala com atleta de academia e com competidor de palco
— Tom: direto, técnico, sem enrolação, sem motivacional vazio
— Idioma: português brasileiro

DIVISÕES QUE DOMINA (escolha a MELHOR, não a mais popular):
Full Body, Upper/Lower, PPL, Bro Split, Torso/Perna, ABC, ABCD, ABCDE, divisões híbridas, especialização, força, hipertrofia, recomposição, cutting, bulking, manutenção, performance.

PERIODIZAÇÃO OBRIGATÓRIA — use microciclo, mesociclo e macrociclo:
Linear, ondulatória (DUP), em bloco, reversa, transição.
Fases: acumulação, intensificação, manutenção, deload.

METODOLOGIAS DE ELITE QUE DOMINA:
— RP Hypertrophy (Mike Israetel): MEV → MAV → MRV → Deload
— Mountain Dog (John Meadows): pré-exaustão, alta intensidade, técnica especial
— DC Training (Dante Trudel): rest-pause, volume baixo, progressão obrigatória
— Heavy Duty (Mike Mentzer): 1 série até a falha absoluta
— Dorian Yates HIT: 1 série de aquecimento + 1 série de trabalho máximo
— FST-7 (Hany Rambod): treino convencional + 7 séries de pump final
— Westside Conjugate (Louie Simmons): Max Effort + Dynamic Effort
— Block Periodization (Issurin)
— Periodização Ondulatória (DUP)

CONCEITOS QUE DEVE USAR CORRETAMENTE:
— RIR, RPE, falha técnica, falha muscular
— MEV, MAV, MRV
— Progressive overload, double progression, deload
— Tensão mecânica, estresse metabólico
— Mente-músculo, line of pull, peak contraction, stretched position
— SFR, junk volume, density, frequency, ROM, fatigue management

REGRA ANTI-UNDEFINED (CRÍTICA):
NUNCA exibir "undefined", campos vazios, ou texto como "undefined séries", "undefined RPE", "undefined RIR".
Se faltar dado, use FALLBACK AUTOMÁTICO INTELIGENTE:
— Séries sem valor → usar "3" como padrão
— Reps sem valor → usar "8-12"
— RPE sem valor → usar "7-8"
— RIR sem valor → usar "2-3"
— Descanso sem valor → usar "90s"
— Tempo/cadência sem valor → usar "2-0-1-0"

ESTRUTURA DE SÉRIES POR EXERCÍCIO:
— Compostos pesados: warm-up → feeder sets → top set → back-off sets
— Exercícios moderados: aquecimento + séries de trabalho
— Isoladores: estrutura simplificada, MAS nunca indefinida

REGRA ANTI-REPETIÇÃO (CRÍTICA):
— NUNCA gere treinos "de template" ou exercícios sempre iguais.
— VARIE a seleção: rotação inteligente entre variações biomecânicas equivalentes.
— Use exercícios menos populares mas eficazes (Floor Press, Pendlay Row, Landmine Press, Zercher Squat, Meadows Row).

EXERCÍCIOS SUBSTITUTOS (OBRIGATÓRIO):
Para CADA exercício, inclua "substitutes" com 2-3 alternativas:
{ "name": "string", "reason": "motivo", "equipment": "equipamento" }

SELEÇÃO DE EXERCÍCIOS — biomecanicamente inteligente:
Considerar: músculo-alvo, perfil de resistência, estabilidade, amplitude útil, stretched position, peak contraction, custo articular, relação estímulo/fadiga.

INTEGRAÇÃO nutriON:
— Dia de treino PESADO → carboidrato elevado, proteína alta, surplus calórico
— Dia de treino MODERADO → macros de manutenção
— Dia de DESCANSO → carboidrato reduzido, proteína elevada, gordura aumentada
— Pré-treino (90-120 min antes): carboidrato médio IG + proteína magra
— Pós-treino (30-60 min): whey + carboidrato simples
— Sempre conectar treino com estado nutricional do nutriON

TREINO FEMININO ESPECIALIZADO:
— Ciclo menstrual em 4 fases com implicações diretas na prescrição
— Fase folicular: overload / aumento de carga
— Ovulação: sessão mais intensa / PRs
— Fase lútea inicial: volume normal, manutenção
— Fase lútea tardia: reduzir volume 20-30% / foco técnico
— Mulheres respondem bem a volume mais alto (+2-4 séries/grupo vs homens)
— Toleram treinar mesmo grupo 3x/semana
— Priorizar glúteos com Hip Thrust, Bulgarian, RDL, Cable Pull-Through

TOM: especialista confiante, técnico, direto. Responda SEMPRE em Português do Brasil.
REGRA MÁXIMA: Cada treino é único para o perfil. Se o contexto mudar, recalcule tudo.

TrainingON v1.0 | nutrion.app.br | Método MCE: Mindset → Comportamento → Execução`;

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
2. ESCOLHA a divisão ideal. Justifique.
3. ESCOLHA o modelo de periodização. Justifique.
4. DETERMINE duração do bloco e quando fazer deload.
5. Para cada sessão:
   - Warm-up geral + específico
   - Feeder sets → Top set → Back-off sets (compostos)
   - Séries de trabalho (acessórios)
6. Cadência (tempo) para cada exercício
7. Descanso específico por tipo
8. Progressão definida (Double Progression, Linear, Ondulatória)
9. Volume por músculo: MEV/MAV/MRV
10. Alertas de melhoria
11. Técnicas avançadas quando adequadas com justificativa

INTEGRAÇÃO nutriON (OBRIGATÓRIO):
- Macros pré-treino recomendados por sessão
- Janela pós-treino
- Ajuste calórico por tipo de dia (treino pesado / moderado / descanso)

FORMATO JSON OBRIGATÓRIO:
{
  "phase_plan": {
    "macrocycle_title": "string",
    "current_phase": "string",
    "phases": [{ "name": "string", "duration_weeks": "string", "mesocycles": number, "objective": "string", "criteria_to_advance": "string", "volume_strategy": "string", "intensity_strategy": "string", "rationale": "string" }],
    "deload_strategy": "string",
    "long_term_note": "string",
    "post_deload_decision": {
      "intro": "string",
      "scenarios": [{ "condition": "string", "signal": "string", "decision": "string", "action": "string", "how_next_block_starts": "string" }]
    }
  },
  "block_overview": {
    "title": "string", "duration_weeks": number, "deload_week": number, "split_type": "string",
    "split_justification": "string", "periodization_model": "string", "periodization_justification": "string",
    "primary_goal": "string", "secondary_goal": "string",
    "muscle_priorities": [{ "muscle": "string", "priority": "string", "weekly_sets": number, "frequency": "string", "rationale": "string" }],
    "maintenance_muscles": ["string"], "progression_model": "string", "recovery_notes": "string", "coach_notes": "string",
    "nutrion_integration": {
      "heavy_day_carbs": "string", "heavy_day_protein": "string",
      "rest_day_carbs": "string", "rest_day_protein": "string",
      "pre_workout_protocol": "string", "post_workout_protocol": "string"
    }
  },
  "improvement_alerts": [{ "area": "string", "severity": "string", "message": "string" }],
  "training_days": [{
    "day_number": number, "day_label": "string", "session_title": "string",
    "focus_muscles": ["string"], "estimated_duration": "string", "intensity_profile": "string",
    "warmup": [{ "name": "string", "sets": "string", "reps": "string", "notes": "string" }],
    "exercises": [{
      "order": number, "name": "string", "muscle_target": "string",
      "technique_type": "compound|accessory|isolation", "tempo": "string",
      "advanced_technique": "string|null",
      "structure": {
        "feeder_sets": [{ "set_label": "string", "load_percent": "string", "reps": "string", "notes": "string" }],
        "top_set": { "sets": "string", "reps": "string", "rpe": "string", "rest": "string", "notes": "string" },
        "backoff_sets": { "sets": "string", "reps": "string", "load_reduction": "string", "rest": "string", "notes": "string" },
        "work_sets": { "sets": "string", "reps": "string", "rpe": "string", "rest": "string", "notes": "string" }
      },
      "execution_cues": "string", "why_this_exercise": "string", "biomechanics_note": "string",
      "substitutes": [{ "name": "string", "reason": "string", "equipment": "string" }]
    }],
    "session_notes": "string",
    "nutrition_notes": "string"
  }]
}

IMPORTANTE:
- Inclua OBRIGATORIAMENTE "phase_plan" com macrociclo, fases, deload_strategy E "post_deload_decision".
- Preencha TODOS os ${days} dias de treino.
- Cada dia: 4-7 exercícios adequados ao tempo (${sessionDuration || "60min"}).
- JSON COMPLETO. ZERO campos undefined/vazios. Todos os dias, todos os exercícios.
- Use feeder_sets + top_set + backoff_sets para compostos principais.
- Use work_sets para acessórios e isoladores.
- Inclua "nutrition_notes" por sessão com orientação peri-treino.`;
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

  if (tab === "biomec") {
    const exerciseName = data.exerciseName || muscleList;
    return `Execute análise BIOMECÂNICA E CINESIOLÓGICA COMPLETA do exercício: ${exerciseName}

━━━━━━━━━━━━━━━━━━━━━━━━
[${exerciseName}]
━━━━━━━━━━━━━━━━━━━━━━━━

Entregue:

▸ MÚSCULOS ENVOLVIDOS
Primário: [músculo + % contribuição estimada]
Secundário: [músculos sinergistas]
Estabilizadores: [músculos de suporte]

▸ ANÁLISE BIOMECÂNICA
Classificação: [Composto / Isolamento / Semi-composto]
Padrão de movimento: [Push / Pull / Hinge / Squat / Carry / Rotate]
Eixo de movimento: [sagital / frontal / transversal]
Articulações envolvidas
Vetor de força
Ponto de máxima tensão (no ROM)
Ponto de mínima tensão
Alavanca mecânica

▸ EXECUÇÃO TÉCNICA
Posição inicial detalhada
Fase excêntrica: tempo, ângulos, pontos críticos
Ponto de inversão
Fase concêntrica: velocidade, cue principal
Respiração

▸ ERROS TÉCNICOS MAIS COMUNS (mínimo 3)
[Erro] → [Consequência] → [Correção]

▸ ADAPTAÇÕES POR MORFOLOGIA
Fêmur longo | Torso longo | Braços longos | Mobilidade limitada

▸ VARIAÇÕES & PROGRESSÕES
Regressão | Progressão | Variação de ênfase

▸ ATIVAÇÃO EMG (baseado em literatura)
Ativação no músculo primário (% MVIC se disponível)
Comparado a exercício de referência

▸ INDICAÇÃO CLÍNICA
Indicado para / Contraindicado para / Modificação para lesão

▸ INTEGRAÇÃO nutriON
Demanda energética | Impacto no EPOC | Pré-treino recomendado`;
  }

  if (tab === "emg") {
    const muscleTarget = data.muscleTarget || muscleList;
    return `Gere RANKING EMG COMPLETO para o músculo: ${muscleTarget}
Baseado em estudos de ativação muscular (Contreras, Loenneke, Beardsley, Schoenfeld).

Entregue:

TOP 10 EXERCÍCIOS POR ATIVAÇÃO (MVIC%):
🥇 [Exercício] — Ativação: [X% MVIC] — Por que ativa mais — Melhor para [objetivo]
🥈 [Exercício] — [idem]
...

EXERCÍCIOS POR PORÇÃO MUSCULAR:
— Porção superior: melhor exercício = [X] (por que)
— Porção média: melhor exercício = [X] (por que)
— Porção inferior: melhor exercício = [X] (por que)

COMBINAÇÃO IDEAL PARA HIPERTROFIA MÁXIMA:
[Exercício A] + [Exercício B] + [Exercício C]
Justificativa: diferentes ângulos, porções e vetores de força

NOTA: Diferenciar ativação EMG de hipertrofia. Alta ativação EMG não garante crescimento superior.
Tensão mecânica, dano muscular e estresse metabólico são os 3 mecanismos (Schoenfeld, 2010).`;
  }

  if (tab === "postural") {
    return `Execute AVALIAÇÃO POSTURAL COMPLETA baseada nas informações:
Lesões: ${injuries || "Nenhuma"} | Pontos fracos: ${weakPoints || "Nenhum"} | Nível: ${level}

Entregue análise de:

VISTA ANTERIOR (frontal):
Alinhamento cabeça, ombros, EIAS, joelhos, pés

VISTA LATERAL (sagital):
Cabeça anteriorizada, hipercifose, hiperlordose, anterversão/retroversão pélvica

DESEQUILÍBRIOS IDENTIFICADOS:
[Desequilíbrio] → Músculo encurtado: [X] / Músculo fraco: [Y]

PROTOCOLO CORRETIVO:
FASE 1 — INIBIÇÃO (foam roller)
FASE 2 — ALONGAMENTO
FASE 3 — ATIVAÇÃO
FASE 4 — INTEGRAÇÃO

IMPACTO NO TREINO:
Como cada desequilíbrio afeta exercícios específicos + modificações

FREQUÊNCIA: [X] vezes por semana / [Y] minutos por sessão

INTEGRAÇÃO nutriON: desequilíbrios posturais x deficiências nutricionais / hidratação / inflamação`;
  }

  if (tab === "recuperacao") {
    return `Gere PROTOCOLO COMPLETO DE RECUPERAÇÃO E DELOAD para:
Nível: ${level} | Fase: ${phase} | Frequência: ${days}x/semana | Estresse: ${stressLevel || "Bom"}

Entregue:

TIPOS DE DELOAD:
1. DELOAD DE VOLUME — manter carga, reduzir volume 40-50%
2. DELOAD DE INTENSIDADE — reduzir carga 40-50%, manter volume
3. DELOAD TOTAL — reduzir ambos 50%+
4. DESCANSO ATIVO — sem treino de força

PROTOCOLOS DE RECUPERAÇÃO ENTRE SESSÕES:
▸ SONO: alvo, janela anabólica GH, higiene do sono
▸ NUTRIÇÃO PÓS-TREINO: janela, proteína, carboidrato — integração nutriON
▸ TÉCNICAS ATIVAS: foam roller, alongamento, banho frio/contraste, compressão
▸ SUPLEMENTAÇÃO: creatina, ômega-3, magnésio, vitamina D3, ZMA

MARCADORES DE OVERTRAINING:
— Queda de performance 2+ semanas
— FC de repouso elevada
— Humor negativo persistente
— Sono prejudicado com cansaço extremo
— Perda de motivação

INTEGRAÇÃO nutriON: ajustar calorias para manutenção na semana de deload`;
  }

  if (tab === "metodologia") {
    const metodo = data.methodName || "RP Hypertrophy";
    return `Explique COMPLETAMENTE a metodologia: ${metodo}

Entregue:
1. FILOSOFIA — o princípio central
2. CARACTERÍSTICAS — o que define esta metodologia
3. ESTRUTURA DE TREINO SEMANAL — exemplo completo
4. EXEMPLO DE SESSÃO COMPLETA — detalhada
5. PARA QUAL PERFIL É IDEAL — nível, objetivo, frequência
6. COMO PERIODIZAR — dentro desta metodologia
7. PRÓS E CONTRAS — honestamente
8. INTEGRAÇÃO COM NUTRIÇÃO nutriON — como alimentar para esta metodologia

Metodologias disponíveis:
— Mountain Dog (Meadows) — DC Training (Trudel) — RP Hypertrophy (Israetel)
— Heavy Duty (Mentzer) — Dorian Yates HIT — FST-7 (Rambod)
— Westside Conjugate (Simmons) — Block Periodization (Issurin)`;
  }

  if (tab === "feminino") {
    return `Gere PROTOCOLO DE TREINO FEMININO ESPECIALIZADO:
Nível: ${level} | Fase: ${phase} | Frequência: ${days}x/semana
Músculos: ${muscleList} | Equipamentos: ${equipment || "Academia completa"} | Lesões: ${injuries || "Nenhuma"}

CONSIDERAR OBRIGATORIAMENTE:

▸ HORMÔNIOS & PERFORMANCE POR FASE DO CICLO:
— Folicular (dias 1-14): overload / aumento de carga — melhor recuperação
— Ovulação (dia 14): sessão mais intensa / PRs — pico de estrogênio
— Lútea Inicial (15-21): volume normal, manutenção
— Lútea Tardia (22-28): reduzir volume 20-30% / foco técnico — queda hormonal

▸ DIFERENÇAS NA PRESCRIÇÃO:
— Volume: +2-4 séries/grupo vs homens
— Frequência: 3x/semana por grupo muscular
— Intensidade: 65-80% 1RM
— Descanso: intervalos menores sem prejuízo

▸ GLÚTEOS & POSTERIOR (prioridade EMG):
1. Hip Thrust (>100% MVIC glúteo máx)
2. Bulgarian Split Squat
3. Romanian Deadlift
4. Cable Pull-Through
5. Abdução lateral

▸ DIVISÃO RECOMENDADA:
4x: 2x inferior + 1x push + 1x pull
OU 3x full-body com ênfase inferior

▸ NUTRIÇÃO FEMININA INTEGRADA (nutriON):
— Fase folicular: carboidrato elevado → performance
— Fase lútea: proteína elevada → anti-catabolismo
— TPM: magnésio + ômega-3 → reduzir inflamação`;
  }

  if (tab === "platô") {
    const exerciseName = data.exercise || "exercício principal";
    return `ANÁLISE DE PLATÔ E ESTRATÉGIAS DE QUEBRA para: ${exerciseName}
Fase: ${phase} | Nível: ${level} | Frequência: ${days}x/semana
Histórico: ${JSON.stringify(data.progressHistory || [])}

Entregue:

DIAGNÓSTICO DO PLATÔ:
Causas prováveis:
□ Volume insuficiente (abaixo do MEV)
□ Intensidade insuficiente (RPE muito baixo)
□ Nutrição inadequada (verificar nutriON)
□ Sono/recuperação comprometidos
□ Mesmo estímulo por tempo excessivo
□ Desequilíbrio muscular limitante
□ Técnica incorreta perdendo ativação

ESTRATÉGIAS DE QUEBRA:
1. SOBRECARGA PROGRESSIVA FORÇADA — reps forçadas, rest-pause
2. VARIAÇÃO DE ESTÍMULO — trocar exercício, pegada, ângulo, ordem
3. TÉCNICAS ESPECIAIS — drop sets, myo-reps, pause reps, tempo controlado
4. DELOAD ESTRATÉGICO — 1 semana volume 50% para supercompensação
5. REVISÃO NUTRICIONAL → comunicar ao nutriON: verificar ingestão calórica e proteica

TIMELINE: estimativa de retomada em [X] semanas`;
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

  return `Protocolo de treino completo para ${clientName || "Cliente"}, fase ${phase}, músculos ${muscleList}, nível ${level}, ${days}x/semana, ${sessionDuration || "60min"} por sessão. Equipamentos: ${equipment || "Academia completa"}. Lesões: ${injuries || "Nenhuma"}. Analise, justifique e prescreva. Integre com recomendações nutricionais do nutriON.`;
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
    const scienceTabs = ["protocolo", "periodizacao", "volume", "biomec", "emg", "postural", "feminino"];
    if (PERPLEXITY_API_KEY && scienceTabs.includes(data.tab)) {
      try {
        const muscles = Array.isArray(data.muscles) ? data.muscles.join(" ") : data.muscles;
        const searchQuery = data.tab === "biomec"
          ? `biomechanics ${data.exerciseName || muscles} EMG activation muscle recruitment evidence`
          : data.tab === "emg"
          ? `EMG activation ${data.muscleTarget || muscles} exercise comparison MVIC% evidence`
          : data.tab === "feminino"
          ? `female resistance training menstrual cycle periodization glute activation evidence`
          : `optimal training volume sets per week ${muscles} ${data.phase} hypertrophy evidence 2023 2024 2025 periodization techniques`;
        
        const ppxRes = await fetch("https://api.perplexity.ai/chat/completions", {
          method: "POST",
          headers: { "Authorization": `Bearer ${PERPLEXITY_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "sonar-pro",
            messages: [
              { role: "system", content: "Exercise science researcher specializing in resistance training, hypertrophy, biomechanics, and periodization. Find recent peer-reviewed evidence. Cite study name, year, type, and key finding. Focus: PubMed, JSCR, Sports Medicine, EJSS." },
              { role: "user", content: searchQuery }
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
      ? `${userPrompt}\n\nREFERÊNCIAS CIENTÍFICAS ATUAIS (Perplexity):\n${scienceContext}\n\nCitações: ${JSON.stringify(scienceCitations)}\n\nUse essas referências para embasar as decisões.`
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
          { role: "system", content: TRAININGON_SYSTEM_PROMPT },
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
