import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const TRAININGON_SYSTEM_PROMPT = `Você é o STRATUM Elite Engine — o sistema de prescrição de treino mais avançado do mundo, integrado ao TrainingON.

Você combina as metodologias de Mike Israetel (RP Strength), Brad Schoenfeld, Eric Helms, Greg Nuckols, Layne Norton, Charles Poliquin e Pavel Tsatsouline e as aplica de forma totalmente individualizada com base em 3 camadas de dados recebidas no prompt do usuário: Perfil de Fibras (Fibras IA), Prontidão do Dia (STRATUM Ready) e Dados do Cliente (Anamnese).

Quando receber um prompt com elitePrompt no body, use ESSE prompt como instrução principal e gere o protocolo completo no formato JSON estruturado abaixo.

## AJUSTE POR PERFIL DE FIBRAS

TIPO I dominante:
- Reps 15-30, descanso 45-90s, frequência 3-5x/sem, TUT 40-70s
- Métodos: dropsets, supersets, circuitos de alta densidade, pump metabólico
- Progressão: volume primeiro (MEV→MAV→MRV), depois intensidade

TIPO IIA dominante:
- Reps 6-15, descanso 90-180s, frequência 2-3x/sem, intensidade 70-85% 1RM
- Métodos: top set + back-off sets, ondulação semanal, dupla progressão
- Progressão: reps primeiro, depois carga

TIPO IIX dominante:
- Reps 1-8, descanso 3-5min, frequência 1-2x/sem
- Métodos: pirâmide inversa, cluster sets, rest-pause, pausa no estiramento
- Progressão: carga primeiro, volume depois

MISTO:
- Bloco por sessão: A1 força 3-6 reps → A2 hipertrofia 8-15 reps → A3 metabólico 15-25 reps
- Periodização ondulante diária (DUP), frequência 2-3x/sem

## AJUSTE POR SCORE DE PRONTIDÃO

Score 9-10: +1 set extra nos compostos, RPE até 9.5, volume máximo
Score 7-8: protocolo padrão, RPE 8-9
Score 5-6: -20% volume, RPE máx 8, priorizar compostos
Score 3-4: apenas MEV, RPE máx 7, sem falha muscular
Score 1-2: recuperação ativa, mobilidade, pump leve sem overload

## VOLUME LANDMARKS POR GRUPO MUSCULAR

Peito: MEV 8 / MAV 16 / MRV 20 sets/sem
Costas: MEV 10 / MAV 18 / MRV 22 sets/sem
Pernas: MEV 10 / MAV 18 / MRV 25 sets/sem
Ombros: MEV 8 / MAV 14 / MRV 20 sets/sem
Bíceps: MEV 6 / MAV 14 / MRV 18 sets/sem
Tríceps: MEV 6 / MAV 14 / MRV 18 sets/sem
Glúteos: MEV 6 / MAV 12 / MRV 20 sets/sem
Panturrilha: MEV 8 / MAV 16 / MRV 20 sets/sem
Core: MEV 0 / MAV 10 / MRV 16 sets/sem

## EMG RANKING POR GRUPO MUSCULAR (use apenas exercícios validados)

PEITO: 1. Supino inclinado 30° barra 2. Press halteres inclinado 3. Crucifixo cabo baixo-alto 4. Dips inclinado 5. Pec Deck
COSTAS: 1. Remada curvada pronada 2. Pulldown pegada neutra 3. Remada unilateral haltere 4. Pull-up pronado 5. Serrote
PERNAS (QUAD): 1. Agachamento back squat 2. Leg press 45° 3. Hack squat 4. Cadeira extensora (estiramento) 5. Bulgarian split squat
PERNAS (POST): 1. Romanian deadlift 2. Leg curl deitado 3. Stiff 4. Good morning 5. Cadeira flexora
GLÚTEOS: 1. Hip thrust barra 2. Agachamento sumô 3. Kickback cabo 4. Abdução cabo 5. Step up
OMBROS: 1. Press militar barra 2. Desenvolvimento halteres 3. Elevação lateral cabo 4. Face pull cabo 5. Elevação frontal
BÍCEPS: 1. Rosca direta barra reta 2. Rosca inclinada halteres 3. Rosca cabo baixo 4. Rosca concentrada 5. Rosca martelo
TRÍCEPS: 1. Tríceps testa barra EZ 2. Pressão francesa 3. Pushdown cabo corda 4. Mergulho fechado 5. Extensão overhead cabo
PANTURRILHA: 1. Panturrilha em pé Smith 2. Panturrilha sentado (sóleo) 3. Panturrilha leg press 4. Donkey calf raise
CORE: 1. Prancha RKC 2. Dead bug 3. Pallof press 4. Ab wheel rollout 5. Crunch cabo

## PERIODIZAÇÃO POR FASE

BULKING (hipertrofia): MEV semana 1 → MAV semanas 2-4 → MRV semana 5 → deload semana 6 → novo ciclo +2-5% carga
CUTTING (definição): manter intensidade, -30% volume, priorizando compostos e tensão mecânica
RECOMPOSIÇÃO: ondulação diária — dia pesado (85% 1RM) / dia moderado (70%) / dia leve (60%)
FORÇA: blocos de 4 semanas 85-90-92-95% 1RM com deload técnico a cada 4 semanas
PERFORMANCE: periodização conjugada — esforço máximo + esforço dinâmico + esforço repetido

## TÉCNICAS AVANÇADAS POR NÍVEL

INTERMEDIÁRIO: dupla progressão, top set + back-off, supersets antagonistas
AVANÇADO: rest-pause, dropsets, cluster sets, myo-reps, pausa no estiramento
ELITE: periodização conjugada, ondulação diária, acumulação/intensificação/realização, técnicas de pico

## ⛔ RESTRIÇÃO ABSOLUTA DE VOLUME — LER ANTES DE GERAR QUALQUER EXERCÍCIO

Esta é a regra MAIS IMPORTANTE de todo o protocolo. Viola-la INVALIDA o plano.

REGRAS INVIOLÁVEIS:
1. Defina PRIMEIRO o weekly_sets de cada músculo em muscle_priorities.
2. Apenas séries de TRABALHO contam: top_set.sets + backoff_sets.sets + work_sets.sets.
   Feeder sets, warm-up e aquecimento NÃO contam para o volume.
3. Para CADA músculo, a SOMA das séries de trabalho em TODOS os training_days
   NÃO PODE ULTRAPASSAR weekly_sets. Tolerância máxima: +10%.
4. Ao planejar cada dia, mantenha um "contador mental" de quantas séries já foram
   prescritas para cada grupo nos dias anteriores. Subtraia do limite antes de
   adicionar exercícios novos.
5. Se um grupo já atingiu o limite semanal, ele NÃO aparece como exercício
   principal nos dias seguintes — apenas como feeder, warm-up ou ativação leve.
6. Distribua as séries pela frequência semanal do grupo:
   séries por sessão ≈ round(weekly_sets / frequência_semanal).
   Ex.: Peito weekly_sets=14, frequência 2x/sem → 7 séries de trabalho POR sessão.
7. Exercícios compostos contam APENAS para o músculo primário (muscle_target).
   Não some séries no secundário — apenas o muscle_target recebe o crédito.

REGRA GVT/Alto-Volume: Se um exercício prescreve 10 séries (German Volume Training),
NÃO use esse formato em músculos com weekly_sets < 10. Para weekly_sets entre 10 e 14,
use no máximo 1 exercício GVT + 1 acessório curto (2-4 séries) totalizando o prescrito.

⚠️ ANTES DE FINALIZAR O JSON (CHECKLIST OBRIGATÓRIO):
Para CADA músculo em muscle_priorities, faça você mesmo a soma:
  total = Σ (top_set.sets + backoff_sets.sets + work_sets.sets) onde muscle_target == músculo
Se total > weekly_sets em qualquer grupo:
  → REMOVA séries de exercícios acessórios (work_sets primeiro, depois backoff_sets)
  → ou REMOVA o último exercício adicionado para esse grupo
  → REPITA até TODOS os grupos estarem dentro do limite.
Só entregue o JSON quando TODOS os grupos estiverem ≤ weekly_sets prescrito.

## FORMATO DE RESPOSTA OBRIGATÓRIO

Responda SEMPRE em JSON válido com esta estrutura exata:

{
  "block_overview": {
    "title": "nome do protocolo",
    "split_type": "ex: PPL / Upper-Lower / Full Body",
    "duration_weeks": 6,
    "deload_week": 5,
    "split_justification": "justificativa científica da divisão escolhida",
    "progression_model": "modelo de progressão para este bloco",
    "muscle_priorities": [
      { "muscle": "nome", "weekly_sets": 16, "priority": "alta" }
    ],
    "coach_notes": "observações integradas de fibras + prontidão + objetivo"
  },
  "phase_plan": {
    "macrocycle_title": "título do macrociclo",
    "current_phase": "fase atual",
    "phases": [
      {
        "name": "nome da fase",
        "duration_weeks": 4,
        "objective": "objetivo da fase",
        "volume_strategy": "estratégia de volume",
        "intensity_strategy": "estratégia de intensidade",
        "criteria_to_advance": "quando avançar",
        "rationale": "justificativa científica"
      }
    ],
    "deload_strategy": "estratégia de deload",
    "post_deload_decision": {
      "intro": "introdução",
      "scenarios": [
        {
          "condition": "condição",
          "signal": "sinais observados",
          "decision": "decisão",
          "action": "ação concreta",
          "how_next_block_starts": "como começa o próximo bloco"
        }
      ]
    },
    "long_term_note": "visão de longo prazo"
  },
  "training_days": [
    {
      "day_number": 1,
      "session_title": "nome da sessão",
      "focus_muscles": ["Peito", "Tríceps"],
      "estimated_duration": "75min",
      "warmup": [
        { "name": "nome do exercício", "sets": "2", "reps": "15" }
      ],
      "exercises": [
        {
          "order": 1,
          "name": "nome exato do exercício",
          "muscle_target": "músculo alvo principal",
          "tempo": "3-1-2-0",
          "structure": {
            "feeder_sets": [
              { "set_label": "Feeder 1", "load_percent": "50%", "reps": "8", "notes": "ativação neural" }
            ],
            "top_set": {
              "sets": 1,
              "reps": "4-6",
              "rpe": 9,
              "rest": "4min",
              "notes": "carga máxima do dia"
            },
            "backoff_sets": {
              "sets": 3,
              "reps": "8-10",
              "load_reduction": "-15%",
              "rest": "2min",
              "notes": "acumulação de volume"
            },
            "work_sets": {
              "sets": 3,
              "reps": "10-12",
              "rpe": 8,
              "rest": "90s",
              "notes": "tensão mecânica máxima"
            }
          },
          "execution_cues": "instrução técnica principal de execução em 1 linha",
          "why_this_exercise": "justificativa científica baseada em EMG e fisiologia",
          "substitutes": [
            { "name": "exercício substituto", "reason": "por que substituir", "equipment": "equipamento necessário" }
          ]
        }
      ],
      "session_notes": "observações da sessão considerando fibras e prontidão"
    }
  ],
  "improvement_alerts": [
    { "area": "área de melhoria", "severity": "alta", "message": "alerta específico" }
  ]
}

Gere TODOS os dias de treino completos. Nunca abrevie. Nunca use placeholders. Cada exercício deve ter estrutura completa com feeder sets, top set ou work sets conforme o nível. Português brasileiro. Científico. Específico. Zero genérico.

## ⚠️ CHECKLIST OBRIGATÓRIO ANTES DE ENTREGAR O JSON (NÃO PULAR)

O JSON SERÁ REJEITADO se faltar qualquer item abaixo. Verifique você mesmo antes de responder:

1. block_overview.title (string não vazia)
2. block_overview.split_type, duration_weeks, deload_week, split_justification, progression_model
3. block_overview.muscle_priorities — array com pelo menos 3 itens { muscle, weekly_sets, priority }
4. block_overview.coach_notes — análise integrada de fibras + prontidão + objetivo + farmacologia (mínimo 2 frases)
5. improvement_alerts — array com PELO MENOS 2 itens { area, severity ('alta'|'media'|'baixa'), message }
6. training_days — array com TODOS os dias prescritos (não abreviar)
7. Para CADA training_day:
   a) day_number, session_title, focus_muscles (array), estimated_duration
   b) warmup — array com PELO MENOS 2 exercícios { name, sets, reps, notes } específicos para o grupamento do dia
   c) exercises — array com PELO MENOS 4 exercícios numerados via "order"
   d) session_notes — justificativa do dia (mínimo 1 frase)
8. Para CADA exercício:
   a) order, name, muscle_target, tempo
   b) structure.feeder_sets — array com 1-2 feeders { set_label, load_percent, reps, notes (cue de ativação/preparação) }
   c) structure.work_sets OU structure.top_set + structure.backoff_sets (preferir top_set + backoff_sets nos compostos principais)
   d) execution_cues — cue técnico de execução (não deixar vazio)
   e) why_this_exercise — justificativa científica COM referência (Schoenfeld, Israetel, Helms, Nuckols, Janda etc)
   f) substitutes — array com 1-2 alternativas { name, reason, equipment }

REJEIÇÃO AUTOMÁTICA: Se qualquer exercício vier sem feeder_sets, sem work_sets/top_set, sem why_this_exercise ou sem execution_cues, o JSON é INVÁLIDO e será regenerado.

STRATUM Elite Engine v1.1 | nutrion.app.br | TrainingON`;

// Versão compacta (~60% menor) usada SOMENTE na aba "protocolo" para reduzir latência.
// Mantém EXATAMENTE o mesmo contrato de JSON de saída.
const PROTOCOL_SYSTEM_COMPACT = `Você é o STRATUM Elite Engine (TrainingON) — prescrição de treino científica (Israetel/RP, Schoenfeld, Helms, Nuckols, Poliquin).
Individualize por: Perfil de Fibras, Prontidão do dia (STRATUM Ready) e Anamnese do cliente (vêm no prompt do usuário). Se houver elitePrompt, ele é a instrução principal.

FIBRAS → Tipo I: 15-30 reps, desc 45-90s, freq 3-5x, dropset/superset. Tipo IIA: 6-15 reps, desc 90-180s, freq 2-3x, top set+back-off. Tipo IIX: 1-8 reps, desc 3-5min, freq 1-2x, cluster/rest-pause. Misto: DUP (força→hipertrofia→metabólico).
PRONTIDÃO → 9-10: +1 set nos compostos, RPE 9.5. 7-8: padrão, RPE 8-9. 5-6: -20% volume, RPE 8. 3-4: só MEV, RPE 7. 1-2: recuperação ativa.
VOLUME (MEV/MAV/MRV sets/sem) → Peito 8/16/20 · Costas 10/18/22 · Pernas 10/18/25 · Ombros 8/14/20 · Bíceps 6/14/18 · Tríceps 6/14/18 · Glúteos 6/12/20 · Panturrilha 8/16/20 · Core 0/10/16.
FASE → Bulking: MEV→MAV→MRV→deload. Cutting: mantém intensidade, -30% volume, compostos. Recomp: ondulação diária 85/70/60%. Força: blocos 85-95% 1RM. Performance: conjugada.
TÉCNICAS → Intermediário: dupla progressão, top set+back-off. Avançado: rest-pause, dropset, cluster, myo-reps, pausa no estiramento. Elite: conjugada/ondulação.
EXERCÍCIOS: use apenas movimentos validados por EMG (supino inclinado 30°, remada curvada, pulldown neutro, agachamento, leg press, RDL, leg curl, hip thrust, press militar, elevação lateral cabo, rosca direta/inclinada, testa EZ, pushdown corda, panturrilha em pé/sentado).

⛔ LIMITE DE VOLUME (regra mais importante): defina weekly_sets por músculo em muscle_priorities. Só contam séries de trabalho (top_set + backoff_sets + work_sets); feeder/warm-up não contam. A soma por músculo em TODOS os dias não pode passar weekly_sets (tolerância +10%). Séries por sessão ≈ weekly_sets / frequência. Composto conta só para o muscle_target. Antes de fechar o JSON, some você mesmo e remova acessórios até todos os grupos ficarem dentro do limite.

## SAÍDA — JSON válido, exatamente estas chaves:
{
 "block_overview": { "title": string, "split_type": string, "duration_weeks": number, "deload_week": number, "split_justification": string, "progression_model": string, "muscle_priorities": [{ "muscle": string, "weekly_sets": number, "priority": "alta"|"media"|"baixa" }], "coach_notes": string },
 "phase_plan": { "macrocycle_title": string, "current_phase": string, "phases": [{ "name": string, "duration_weeks": number, "objective": string, "volume_strategy": string, "intensity_strategy": string, "criteria_to_advance": string, "rationale": string }], "deload_strategy": string, "post_deload_decision": { "intro": string, "scenarios": [{ "condition": string, "signal": string, "decision": string, "action": string, "how_next_block_starts": string }] }, "long_term_note": string },
 "training_days": [{ "day_number": number, "session_title": string, "focus_muscles": [string], "estimated_duration": string, "warmup": [{ "name": string, "sets": string, "reps": string, "notes": string }], "exercises": [{ "order": number, "name": string, "muscle_target": string, "tempo": string, "structure": { "feeder_sets": [{ "set_label": string, "load_percent": string, "reps": string, "notes": string }], "top_set": { "sets": number, "reps": string, "rpe": number, "rest": string, "notes": string }, "backoff_sets": { "sets": number, "reps": string, "load_reduction": string, "rest": string, "notes": string }, "work_sets": { "sets": number, "reps": string, "rpe": number, "rest": string, "notes": string } }, "execution_cues": string, "why_this_exercise": string, "substitutes": [{ "name": string, "reason": string, "equipment": string }] }], "session_notes": string }],
 "improvement_alerts": [{ "area": string, "severity": "alta"|"media"|"baixa", "message": string }]
}

OBRIGATÓRIO: muscle_priorities ≥3 itens · improvement_alerts ≥2 itens · TODOS os dias prescritos · por dia: warmup ≥2 e exercises 4-6 · por exercício: 1-2 feeder_sets, work_sets OU top_set+backoff_sets (top_set+backoff nos compostos principais), execution_cues, why_this_exercise com referência (Schoenfeld/Israetel/Helms/Nuckols), 1-2 substitutes.
SEJA CONCISO: justificativas e notas em no máximo 1-2 frases curtas. Sem markdown, sem texto fora do JSON. Português brasileiro.`;

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
  // Garante feeder_sets default (validação pede pelo menos 1)
  if (!s.feeder_sets || !Array.isArray(s.feeder_sets) || s.feeder_sets.length === 0) {
    s.feeder_sets = [
      { set_label: "Feeder 1", load_percent: "50%", reps: "10", notes: "Aquecimento progressivo" },
      { set_label: "Feeder 2", load_percent: "70%", reps: "6", notes: "Ativação neural" },
    ];
  }
  return s;
}

/**
 * Valida que o protocolo possui TODAS as seções obrigatórias para renderizar
 * no padrão STRATUM Elite (mesmo padrão dos protocolos antigos como Carlos Júnior).
 * Retorna lista de campos ausentes — vazia significa válido.
 */
function validateProtocolStructure(p: any): string[] {
  const missing: string[] = [];
  if (!p || typeof p !== "object") return ["root"];
  const bo = p.block_overview;
  if (!bo || typeof bo !== "object") missing.push("block_overview");
  else {
    if (!bo.title || typeof bo.title !== "string") missing.push("block_overview.title");
    if (!Array.isArray(bo.muscle_priorities) || bo.muscle_priorities.length === 0)
      missing.push("block_overview.muscle_priorities");
    if (!bo.coach_notes || typeof bo.coach_notes !== "string") missing.push("block_overview.coach_notes");
  }
  if (!Array.isArray(p.improvement_alerts) || p.improvement_alerts.length === 0)
    missing.push("improvement_alerts");
  const days = p.training_days;
  if (!Array.isArray(days) || days.length === 0) {
    missing.push("training_days");
  } else {
    days.forEach((d: any, i: number) => {
      const tag = `training_days[${i}]`;
      if (!Array.isArray(d.warmup) || d.warmup.length === 0) missing.push(`${tag}.warmup`);
      if (!Array.isArray(d.exercises) || d.exercises.length === 0) {
        missing.push(`${tag}.exercises`);
      } else {
        d.exercises.forEach((ex: any, j: number) => {
          const etag = `${tag}.exercises[${j}]`;
          const s = ex?.structure;
          if (!s || typeof s !== "object") missing.push(`${etag}.structure`);
          else {
            if (!Array.isArray(s.feeder_sets) || s.feeder_sets.length === 0)
              missing.push(`${etag}.structure.feeder_sets`);
            if (!s.work_sets && !s.top_set)
              missing.push(`${etag}.structure.work_sets|top_set`);
          }
          if (!ex?.why_this_exercise) missing.push(`${etag}.why_this_exercise`);
          if (!ex?.execution_cues) missing.push(`${etag}.execution_cues`);
        });
      }
    });
  }
  return missing;
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
      warmup: (day.warmup && Array.isArray(day.warmup) && day.warmup.length > 0
        ? day.warmup
        : [
            { name: "Mobilidade articular", sets: "1", reps: "10", notes: "Mobilidade dinâmica geral 5min" },
            { name: "Ativação específica", sets: "2", reps: "15", notes: "Ativação do grupamento principal" },
          ]
      ).map((w: any) => ({
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

// =====================================================================
// VOLUME ENFORCER — corrige determinísticamente excessos pós-geração.
// Mirror simplificado de src/lib/trainingVolume.ts (canonicalize + countWorkingSets).
// =====================================================================
const _norm = (s: string) =>
  (s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/\(.*?\)/g, " ").replace(/[^a-z0-9]+/g, " ").trim();

const _SYNS: Array<{ canon: string; tokens: string[] }> = [
  { canon: "deltoides", tokens: ["deltoide", "deltoides", "ombro", "ombros"] },
  { canon: "costas", tokens: ["costas", "dorsal", "dorsais", "latissimo", "trapezio", "romboide", "lats"] },
  { canon: "biceps", tokens: ["biceps", "braquial", "braquiorradial"] },
  { canon: "triceps", tokens: ["triceps"] },
  { canon: "peito", tokens: ["peito", "peitoral", "peitorais"] },
  { canon: "quadriceps", tokens: ["quadriceps", "vasto", "reto femoral"] },
  { canon: "gluteos", tokens: ["gluteo", "gluteos"] },
  { canon: "posteriordecoxa", tokens: ["posterior", "isquiotibiais", "isquios", "femoral", "hamstring"] },
  { canon: "panturrilha", tokens: ["panturrilha", "gastrocnemio", "soleo"] },
  { canon: "abdomenobliquos", tokens: ["abdomen", "abdominal", "obliquo", "core"] },
  { canon: "lombar", tokens: ["lombar", "eretor"] },
  { canon: "antebraco", tokens: ["antebraco"] },
];
function _canon(raw: string): string[] {
  const n = _norm(raw); if (!n) return [];
  const out = new Set<string>();
  for (const { canon, tokens } of _SYNS) {
    if (tokens.some((t) => n.includes(t.replace(/\s+/g, "")))) out.add(canon);
  }
  if (out.size === 0) out.add(n.replace(/\s+/g, ""));
  return Array.from(out);
}
function _toInt(v: any): number {
  if (v == null) return 0;
  const m = String(v).match(/\d+/); return m ? parseInt(m[0], 10) : 0;
}
function _setsOf(ex: any): { top: number; back: number; work: number; total: number } {
  const s = ex?.structure || {};
  const top = s.top_set ? _toInt(s.top_set.sets) : 0;
  const back = s.backoff_sets ? _toInt(s.backoff_sets.sets) : 0;
  const work = s.work_sets ? _toInt(s.work_sets.sets) : 0;
  return { top, back, work, total: top + back + work };
}
function _exPrimary(ex: any): string[] {
  const raw = ex?.muscle_target || ex?.primaryMuscle ||
    (Array.isArray(ex?.muscles) && ex.muscles.length ? ex.muscles[0] : null);
  return raw ? _canon(String(raw)) : [];
}
function _aggregate(days: any[]): Record<string, number> {
  const out: Record<string, number> = {};
  (days || []).forEach((d) => (d.exercises || []).forEach((ex: any) => {
    const sets = _setsOf(ex).total; if (sets <= 0) return;
    new Set(_exPrimary(ex)).forEach((c) => { out[c] = (out[c] || 0) + sets; });
  }));
  return out;
}

/**
 * Apara séries determinísticamente até cada músculo ficar dentro de weekly_sets * 1.10.
 * Ordem de redução: work_sets → backoff_sets → top_set (último a ser tocado).
 * Retorna { protocol, fixes: [{muscle, before, after, prescribed}], anyFixed }.
 */
function enforceVolumeLimits(protocol: any, toleranceFactor = 1.10): { protocol: any; fixes: any[]; anyFixed: boolean } {
  const fixes: any[] = [];
  const priorities: any[] = protocol?.block_overview?.muscle_priorities || [];
  const days: any[] = protocol?.training_days || [];
  if (!priorities.length || !days.length) return { protocol, fixes, anyFixed: false };

  const limits: Record<string, { prescribed: number; max: number; muscleLabel: string }> = {};
  for (const mp of priorities) {
    const prescribed = Number(mp.weekly_sets) || 0; if (prescribed <= 0) continue;
    const max = Math.floor(prescribed * toleranceFactor);
    _canon(mp.muscle).forEach((c) => { limits[c] = { prescribed, max, muscleLabel: mp.muscle }; });
  }

  // Itera até estabilizar (ou até 50 passes de segurança)
  for (let pass = 0; pass < 50; pass++) {
    const totals = _aggregate(days);
    let trimmed = false;
    for (const [canon, info] of Object.entries(limits)) {
      const cur = totals[canon] || 0;
      if (cur <= info.max) continue;
      const excess = cur - info.max;

      // Acha exercícios que somam para esse canon, ordenados por total de séries DESC.
      const candidates: Array<{ ex: any; dayIdx: number; exIdx: number; total: number }> = [];
      days.forEach((d, di) => (d.exercises || []).forEach((ex: any, ei: number) => {
        if (_exPrimary(ex).includes(canon)) {
          const t = _setsOf(ex).total;
          if (t > 0) candidates.push({ ex, dayIdx: di, exIdx: ei, total: t });
        }
      }));
      if (!candidates.length) continue;
      candidates.sort((a, b) => b.total - a.total);

      let toRemove = excess;
      for (const c of candidates) {
        if (toRemove <= 0) break;
        const s = c.ex.structure || (c.ex.structure = {});
        // 1) work_sets
        if (s.work_sets && _toInt(s.work_sets.sets) > 0 && toRemove > 0) {
          const cur2 = _toInt(s.work_sets.sets);
          const cut = Math.min(cur2, toRemove);
          const next = cur2 - cut;
          if (next <= 0) delete s.work_sets;
          else s.work_sets.sets = String(next);
          toRemove -= cut; trimmed = true;
        }
        // 2) backoff_sets
        if (toRemove > 0 && s.backoff_sets && _toInt(s.backoff_sets.sets) > 0) {
          const cur2 = _toInt(s.backoff_sets.sets);
          const cut = Math.min(cur2, toRemove);
          const next = cur2 - cut;
          if (next <= 0) delete s.backoff_sets;
          else s.backoff_sets.sets = String(next);
          toRemove -= cut; trimmed = true;
        }
        // 3) top_set (último recurso, preserva pelo menos 1)
        if (toRemove > 0 && s.top_set && _toInt(s.top_set.sets) > 1) {
          const cur2 = _toInt(s.top_set.sets);
          const cut = Math.min(cur2 - 1, toRemove);
          s.top_set.sets = String(cur2 - cut);
          toRemove -= cut; trimmed = true;
        }
      }

      // NOTA: NÃO removemos exercícios sem séries de trabalho.
      // Exercícios de ativação / feeder-only / super-set continuam visíveis
      // para que o atleta nunca perca o exercício 1 da renderização.

      if (trimmed) {
        fixes.push({ muscle: info.muscleLabel, before: cur, after: cur - (excess - toRemove), prescribed: info.prescribed });
      }
    }
    if (!trimmed) break;
  }

  // Consolida fixes (último valor por músculo)
  const finalTotals = _aggregate(days);
  const dedup = new Map<string, any>();
  fixes.forEach((f) => dedup.set(f.muscle, f));
  const finalFixes = Array.from(dedup.values()).map((f) => {
    const canons = _canon(f.muscle);
    const after = canons.reduce((s, c) => s + (finalTotals[c] || 0), 0);
    return { ...f, after };
  });

  return { protocol, fixes: finalFixes, anyFixed: finalFixes.length > 0 };
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

// =====================================================================
// GERAÇÃO FRACIONADA — prompts enxutos (skeleton + day)
// =====================================================================
const SKELETON_SYSTEM = `Você é o STRATUM Elite Engine (TrainingON) — periodização científica (Israetel, Schoenfeld, Helms).
Gere APENAS o ESQUELETO do bloco. NÃO gere exercícios.

Volume landmarks (sets/sem): Peito 8/16/20 · Costas 10/18/22 · Pernas 10/18/25 · Ombros 8/14/20 · Bíceps 6/14/18 · Tríceps 6/14/18 · Glúteos 6/12/20 · Panturrilha 8/16/20 (MEV/MAV/MRV).
Zonas: Z2 6-8 reps (força-hipertrofia) · Z3 9-12 (hipertrofia) · Z4 13-20 (metabólico).

Responda EXCLUSIVAMENTE com um único objeto JSON válido:
{
 "block_overview": {
  "title": string, "split_type": string, "duration_weeks": number, "deload_week": number,
  "split_justification": string, "progression_model": string,
  "muscle_priorities": [{ "muscle": string, "weekly_sets": number, "priority": "alta"|"media"|"baixa" }],
  "coach_notes": string
 },
 "improvement_alerts": [{ "area": string, "severity": "alta"|"media"|"baixa", "message": string }],
 "day_plan": [{
   "day_number": number, "session_title": string, "focus_muscles": [string],
   "estimated_duration": string,
   "target_sets": [{ "muscle": string, "sets": number }],
   "zone": "Z2"|"Z3"|"Z4", "rir": string, "priority_note": string
 }]
}
Regras: muscle_priorities ≥3 itens · improvement_alerts ≥2 itens · day_plan com EXATAMENTE o número de dias pedido · a soma de target_sets por músculo em todos os dias ≤ weekly_sets. Português. Conciso.`;

const DAY_SYSTEM = `Você é o STRATUM Elite Engine (TrainingON). Prescreva UM único dia de treino.
Use apenas exercícios validados por EMG e respeite EXATAMENTE o target_sets do dia (séries de trabalho = top_set + backoff_sets + work_sets; feeder NÃO conta).

Responda EXCLUSIVAMENTE com um objeto JSON válido:
{
 "day_number": number, "session_title": string, "focus_muscles": [string], "estimated_duration": string,
 "warmup": [{ "name": string, "sets": string, "reps": string, "notes": string }],
 "exercises": [{
   "order": number, "name": string, "muscle_target": string, "tempo": "3-1-2-0",
   "structure": {
     "feeder_sets": [{ "set_label": string, "load_percent": string, "reps": string, "notes": string }],
     "top_set": { "sets": number, "reps": string, "rpe": number, "rest": string, "notes": string },
     "backoff_sets": { "sets": number, "reps": string, "load_reduction": string, "rest": string, "notes": string },
     "work_sets": { "sets": number, "reps": string, "rpe": number, "rest": string, "notes": string }
   },
   "execution_cues": string,
   "why_this_exercise": "UMA frase curta (máx 15 palavras) com referência (Schoenfeld/Israetel/Helms)",
   "substitutes": [{ "name": string, "reason": string, "equipment": string }]
 }],
 "session_notes": string
}
Regras: warmup ≥2 · exercises 4-6 · use top_set+backoff_sets nos compostos principais e work_sets nos acessórios · 1-2 feeder_sets por exercício · 1-2 substitutes · sem markdown, sem texto fora do JSON. Português.`;

async function callGateway(apiKey: string, system: string, user: string, maxTokens: number) {
  const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [{ role: "system", content: system }, { role: "user", content: user }],
      temperature: 0.6,
      max_tokens: maxTokens,
      response_format: { type: "json_object" },
    }),
  });
  return r;
}

function parseJsonLoose(txt: string): any | null {
  if (!txt) return null;
  const m = txt.match(/\{[\s\S]*\}/);
  if (!m) return null;
  try { return JSON.parse(m[0]); } catch { return null; }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const reqBody = await req.json();
    const { elitePrompt, ...data } = reqBody || {};
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const PERPLEXITY_API_KEY = Deno.env.get("PERPLEXITY_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const json = (body: unknown, status = 200) =>
      new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    // ---------- FASE 1 — ESQUELETO ----------
    if (data.mode === "skeleton") {
      const t0 = Date.now();
      console.log("[SKELETON] start", { days: data.days, client: data.clientName });
      const userMsg = `${elitePrompt || buildStructuredPrompt(data)}\n\nGere o ESQUELETO com EXATAMENTE ${data.days || 4} dias (day_plan). Sem exercícios.`;
      const buildSkeleton = async () => {
        const r = await callGateway(LOVABLE_API_KEY, SKELETON_SYSTEM, userMsg, 3500);
        if (r.status === 429 || r.status === 402 || !r.ok) return { status: r.status, skeleton: null as any };
        const jr = await r.json();
        const rawTxt = jr.choices?.[0]?.message?.content || "";
        const parsedSkel = parseJsonLoose(rawTxt);
        if (!parsedSkel?.block_overview || !Array.isArray(parsedSkel.day_plan) || parsedSkel.day_plan.length === 0) {
          console.log("[RAW_RESPONSE][skeleton] len=", rawTxt.length, "finish=", jr.choices?.[0]?.finish_reason, "head=", rawTxt.slice(0, 1000));
          return { status: 200, skeleton: null as any };
        }
        return { status: 200, skeleton: parsedSkel };
      };
      let { status: skStatus, skeleton } = await buildSkeleton();
      if (skStatus === 429) return json({ error: "Rate limit excedido." }, 429);
      if (skStatus === 402) return json({ error: "Créditos insuficientes." }, 402);
      if (skStatus !== 200) return json({ error: `AI error ${skStatus}` }, 500);
      if (!skeleton) {
        console.log("[SKELETON] JSON inválido — 1 retry");
        ({ skeleton } = await buildSkeleton());
      }
      if (!skeleton) {
        console.log("[SKELETON] falhou após retry");
        return json({ error: "Não foi possível gerar o esqueleto do protocolo. Tente novamente." }, 422);
      }
      skeleton.day_plan = skeleton.day_plan.map((d: any, i: number) => ({
        day_number: d.day_number || i + 1,
        session_title: d.session_title || `Dia ${i + 1}`,
        focus_muscles: Array.isArray(d.focus_muscles) ? d.focus_muscles : [],
        estimated_duration: d.estimated_duration || data.sessionDuration || "60min",
        target_sets: Array.isArray(d.target_sets) ? d.target_sets : [],
        zone: d.zone || "Z3",
        rir: d.rir || "1-2",
        priority_note: d.priority_note || "",
      }));
      if (!Array.isArray(skeleton.improvement_alerts)) skeleton.improvement_alerts = [];
      console.log("[SKELETON] ok", { days: skeleton.day_plan.length, ms: Date.now() - t0 });
      return json({ skeleton });
    }

    // ---------- FASE 2 — DIA ISOLADO ----------
    if (data.mode === "day") {
      const spec = data.daySpec || {};
      const n = spec.day_number || 1;
      const t0 = Date.now();
      console.log(`[DAY-${n}] start`, { focus: spec.focus_muscles });
      const ctx = data.blockContext || {};
      const userMsg = `ATLETA: ${data.athleteSummary || "não informado"}

BLOCO: ${ctx.title || ""} · split ${ctx.split_type || ""} · progressão ${ctx.progression_model || ""}

DIA A PRESCREVER:
${JSON.stringify(spec)}

Prescreva SOMENTE este dia, respeitando target_sets, zona ${spec.zone || "Z3"} e RIR ${spec.rir || "1-2"}. Retorne só o JSON do dia.`;
      const buildDay = async () => {
        const r = await callGateway(LOVABLE_API_KEY, DAY_SYSTEM, userMsg, 6000);
        if (r.status === 429 || r.status === 402) return { status: r.status, day: null };
        if (!r.ok) {
          const errTxt = await r.text().catch(() => "");
          console.log(`[RAW_RESPONSE][day-${n}] http=${r.status} body=`, errTxt.slice(0, 600));
          return { status: r.status, day: null };
        }
        const jr = await r.json();
        const rawTxt = jr.choices?.[0]?.message?.content || "";
        const parsedDay = parseJsonLoose(rawTxt);
        if (!parsedDay || !Array.isArray(parsedDay.exercises) || parsedDay.exercises.length === 0) {
          console.log(`[RAW_RESPONSE][day-${n}] len=`, rawTxt.length, "finish=", jr.choices?.[0]?.finish_reason, "head=", rawTxt.slice(0, 800));
        }
        return { status: 200, day: parsedDay };
      };

      let { status, day } = await buildDay();
      if (status === 429) return json({ error: "Rate limit excedido." }, 429);
      if (status === 402) return json({ error: "Créditos insuficientes." }, 402);
      if (!day || !Array.isArray(day.exercises) || day.exercises.length === 0) {
        console.log(`[DAY-${n}] JSON inválido — 1 retry`);
        ({ day } = await buildDay());
      }
      if (!day || !Array.isArray(day.exercises) || day.exercises.length === 0) {
        console.log(`[DAY-${n}] falhou após retry`);
        return json({ error: `Não foi possível gerar o dia ${n}. Tente novamente.` }, 422);
      }
      const sanitized = sanitizeProtocol({ training_days: [{ ...day, day_number: n }] }).training_days[0];
      console.log(`[DAY-${n}] ok`, { exercises: sanitized.exercises.length, ms: Date.now() - t0 });
      return json({ day: sanitized });
    }


    // Se vier elitePrompt do frontend (Fibras + Ready sincronizados), usa diretamente.
    // Caso contrário, usa o pipeline padrão de prompts por tab.
    const userPrompt = elitePrompt
      ? elitePrompt
      : buildStructuredPrompt(data);
    let scienceContext = "";
    let scienceCitations: string[] = [];

    // Dual-AI: Perplexity for scientific references
    // "protocolo" fica FORA: o enriquecimento adiciona 5-15s de latência + milhares de tokens
    // de entrada numa chamada que já é a mais longa do sistema (timeout de 90s no cliente).
    const scienceTabs = ["periodizacao", "volume", "biomec", "emg", "postural", "feminino"];
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

    // A aba "protocolo" DEVE sempre retornar JSON estruturado — força modo de saída estruturada.
    const forceJson = data.tab === "protocolo";

    async function callAI(extraInstruction = ""): Promise<{ response: Response; raw: string }> {
      // Aba "protocolo" usa o prompt compacto (~60% menor) para caber na janela de 90s do cliente.
      const base = forceJson ? PROTOCOL_SYSTEM_COMPACT : TRAININGON_SYSTEM_PROMPT;
      let sys = extraInstruction
        ? `${base}\n\n## RETENTATIVA OBRIGATÓRIA\n${extraInstruction}`
        : base;
      if (forceJson) {
        sys += `\n\n## SAÍDA OBRIGATÓRIA\nResponda EXCLUSIVAMENTE com um único objeto JSON válido contendo as chaves "block_overview" e "training_days" (com "exercises" populados em cada dia de treino). Nada de markdown, cercas de código ou texto fora do JSON.`;
      }
      const t0 = Date.now();
      const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${LOVABLE_API_KEY}` },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: sys },
            { role: "user", content: enrichedPrompt },
          ],
          temperature: 0.7,
          // Teto de saída: as gerações que estouravam 90s produziam 16k-19k tokens.
          // Teto de saída: as gerações que estouravam 90s produziam 16k-19k tokens.
          // 14k cabe em ~55-60s e ainda comporta o protocolo completo com o prompt compacto.
          ...(forceJson ? { response_format: { type: "json_object" }, max_tokens: 14000 } : {}),
        }),
      });
      if (!r.ok) {
        if (r.status === 429 || r.status === 402) return { response: r, raw: "" };
        const errText = await r.text();
        throw new Error(`AI API error: ${r.status} - ${errText}`);
      }
      const j = await r.json();
      console.log("[protocolo] gateway ok", {
        ms: Date.now() - t0,
        out_tokens: j.usage?.completion_tokens,
        in_tokens: j.usage?.prompt_tokens,
        finish_reason: j.choices?.[0]?.finish_reason,
      });
      return { response: r, raw: j.choices?.[0]?.message?.content || "" };
    }

    let { response, raw: content } = await callAI();

    if (!response.ok) {
      if (response.status === 429) return new Response(JSON.stringify({ error: "Rate limit excedido." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (response.status === 402) return new Response(JSON.stringify({ error: "Créditos insuficientes." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // For protocolo tab: parse + sanitize. Validação é informativa (não bloqueia).
    // Só regenera 1x se estrutura realmente quebrada (sem training_days).
    if (data.tab === "protocolo") {
      let parsed: any = null;
      let lastMissing: string[] = [];

      const tryParse = (txt: string) => {
        const jsonMatch = txt.match(/\{[\s\S]*\}/);
        if (!jsonMatch) return null;
        try { return JSON.parse(jsonMatch[0]); } catch { return null; }
      };

      parsed = tryParse(content);

      const isStructurallyBroken = (p: any) =>
        !p || !Array.isArray(p.training_days) || p.training_days.length === 0 ||
        !p.training_days.some((d: any) => Array.isArray(d.exercises) && d.exercises.length > 0);

      if (isStructurallyBroken(parsed)) {
        console.log("[protocolo] estrutura quebrada — 1 retry");
        console.log("[RAW_RESPONSE] len=", content?.length ?? 0, "head=", (content || "").slice(0, 1200), "tail=", (content || "").slice(-400));
        try {
          const retry = await callAI("A resposta anterior estava incompleta. Retorne SOMENTE o JSON completo com training_days populados e exercises em cada dia. Sem markdown, sem texto extra.");
          content = retry.raw || content;
          const second = tryParse(content);
          if (!isStructurallyBroken(second)) parsed = second;
        } catch (e) {
          console.log("[protocolo] retry falhou:", (e as Error).message);
        }
      }

      if (parsed && !isStructurallyBroken(parsed)) {
        parsed = sanitizeProtocol(parsed);
        lastMissing = validateProtocolStructure(parsed);
        const enforced = enforceVolumeLimits(parsed, 1.10);
        if (enforced.anyFixed) console.log("[volume-enforcer] aplicado:", JSON.stringify(enforced.fixes));
        return new Response(JSON.stringify({
          protocol: enforced.protocol,
          volume_fixes: enforced.fixes,
          citations: scienceCitations,
          validation_warnings: lastMissing,
        }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      // Nunca devolver conteúdo bruto para a UI — erro explícito.
      console.log("[protocolo] JSON inválido após retry — retornando erro explícito");
      console.log("[RAW_RESPONSE][final] len=", content?.length ?? 0, "head=", (content || "").slice(0, 1200));
      return new Response(JSON.stringify({
        error: "Não foi possível gerar o protocolo em formato estruturado. Tente novamente.",
      }), { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } });
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
