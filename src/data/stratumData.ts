// STRATUM — Sistema científico de protocolos de treino baseado em EMG, MEV/MAV/MRV e literatura peer-reviewed
// Restrito ao Admin nutriON 360 | Diogo Mello

export type StratumLevel = "intermediario" | "avancado" | "elite";

export interface StratumExercise {
  name: string;
  sets: string;
  reps: string;
  rpe?: string;
  rest?: string;
  cadence?: string;
  cue?: string;
  ref?: string;
  superset?: boolean;
}

export interface StratumPhase {
  level: StratumLevel;
  title: string;
  subtitle?: string;
  warmup?: string[];
  blocks: { label: string; exercises: StratumExercise[] }[];
  notes?: string;
}

export interface StratumReference {
  authors: string;
  title: string;
  journal: string;
  year: number;
  finding?: string;
}

export interface StratumModule {
  id: string;
  name: string;
  tagline: string;
  emoji: string;
  scientificBase: string;
  emgRanking?: { exercise: string; activation: string }[];
  volumeLandmarks?: { metric: string; value: string }[];
  phases: StratumPhase[];
  references: StratumReference[];
  progression?: string[];
}

// ════════════════════════════════════════════════════════════════
// PILARES CIENTÍFICOS GLOBAIS
// ════════════════════════════════════════════════════════════════
export const STRATUM_PILLARS = [
  {
    id: "volume",
    title: "Volume Efetivo (MEV → MAV → MRV)",
    summary: "MEV: mínimo para progresso. MAV: progresso máximo. MRV: limite — acima = overtraining.",
    ref: "Israetel M, Hoffmann J, Case T. Scientific Principles of Hypertrophy Training. RP Strength, 2019.",
  },
  {
    id: "tensao",
    title: "Tensão Mecânica + Estresse Metabólico + Dano Muscular",
    summary: "Os três mecanismos da hipertrofia devem coexistir no protocolo completo.",
    ref: "Schoenfeld BJ. The Mechanisms of Muscle Hypertrophy and Their Application to Resistance Training. JSCR, 2010.",
  },
  {
    id: "especificidade",
    title: "Especificidade + Progressão (RPE/RIR)",
    summary: "Treino efetivo = RPE 7-9. RIR 1-3 = zona de hipertrofia. Progressão via carga, volume, densidade, amplitude.",
    ref: "Zourdos MC et al. Novel RPE Scale Measuring Repetitions in Reserve. JSCR, 2016.",
  },
  {
    id: "frequencia",
    title: "Frequência Ótima",
    summary: "Meta-análise: 2x/semana por grupo > 1x. Múltiplos sets > set único. Ideal: 2-3x/semana por grupo.",
    ref: "Schoenfeld BJ, Ogborn D, Krieger JW. Effects of Resistance Training Frequency on Muscle Hypertrophy. Sports Med, 2016.",
  },
  {
    id: "selecao",
    title: "Seleção por EMG Validado",
    summary: "STRATUM usa apenas exercícios com ativação muscular comprovada por eletromiografia na literatura.",
    ref: "Contreras B et al. Múltiplos estudos EMG 2013-2020.",
  },
];

// ════════════════════════════════════════════════════════════════
// SISTEMA DE PROGRESSÃO STRATUM — REGRAS GLOBAIS
// ════════════════════════════════════════════════════════════════
export const STRATUM_PROGRESSION_RULES = {
  loadProgression: [
    { type: "Compostos pesados (<8 reps)", rule: "+2.5 kg quando completar todas as séries com RPE <8 e RIR >2" },
    { type: "Hipertrofia (8-15 reps)", rule: "+1-2.5 kg quando completar todas as séries com RPE <7 e RIR >3" },
    { type: "Isolamento (>15 reps)", rule: "+0.5-1 kg ou +1-2 reps quando confortável" },
  ],
  deload: {
    title: "Deload Obrigatório (semana 5 de cada mesociclo)",
    rules: [
      "Volume: -40 a -50%",
      "Intensidade: manter carga (não reduzir)",
      "Frequência: manter",
    ],
    ref: "Helms ER et al. Recommendations for natural bodybuilding contest preparation. JISSN, 2014.",
  },
  rpeScale: [
    { rpe: "RPE 6", desc: "4+ reps na reserva (muito fácil)" },
    { rpe: "RPE 7", desc: "3 reps na reserva" },
    { rpe: "RPE 8", desc: "2 reps na reserva — zona de hipertrofia" },
    { rpe: "RPE 9", desc: "1 rep na reserva — zona de força" },
    { rpe: "RPE 10", desc: "Falha real" },
  ],
  rpeRef: "Zourdos MC et al. JSCR, 2016.",
  nutritionIntegration: [
    { day: "Treino pesado (A1 patterns)", carbs: "Carbo alto: 5-7 g/kg" },
    { day: "Treino de volume", carbs: "Carbo moderado: 3-5 g/kg" },
    { day: "Deload", carbs: "Carbo baixo-moderado: 2-3 g/kg" },
    { day: "Proteína (todos os dias)", carbs: "Mín. 1.8 g/kg — ideal 2.2-2.5 g/kg" },
  ],
};

// Bibliografia completa STRATUM Protocol v2 (48 referências)
export const STRATUM_FULL_REFERENCES: string[] = [
  "Barnett C, Kippers V, Turner P. JSCR, 1995.",
  "Beardsley C, Contreras B. Strength Cond J, 2014.",
  "Bloomquist K et al. EJAP, 2013.",
  "Boehren AM, Burkhart S. J Sports Phys Ther, 2010.",
  "Bourne MN et al. Sports Med, 2018.",
  "Campos GE et al. Eur J Appl Physiol, 2002.",
  "Campos YA et al. JSCR, 2020.",
  "Colquhoun RJ et al. JSCR, 2018.",
  "Contreras B et al. JSCR, 2011, 2015.",
  "Cools AM et al. Am J Sports Med, 2007.",
  "Cormie P, McGuigan MR, Newton RU. Sports Med, 2011.",
  "Escamilla RF et al. Med Sci Sports Exerc, 1998.",
  "Escamilla RF et al. Phys Ther, 2006.",
  "Fenwick CM et al. JSCR, 2009.",
  "Glass SC, Armstrong T. JSCR, 1997.",
  "Helms ER et al. JISSN, 2014.",
  "Hewett TE et al. Am J Sports Med, 2005.",
  "Israetel M, Hoffmann J, Case T. RP Strength, 2019.",
  "Kholinne E et al. J Phys Ther Sci, 2018.",
  "Kolber MJ et al. JSCR, 2009.",
  "Krieger JW. JSCR, 2010.",
  "Krzysztofik M et al. J Funct Morphol Kinesiol, 2019.",
  "Lehman GJ et al. Dynamic Medicine, 2004.",
  "Loenneke JP et al. Front Physiol, 2012.",
  "Maeo S et al. JSCR, 2021.",
  "McCaw ST, Friday JJ. JSCR, 1994.",
  "McGill SM. Strength Cond J, 2010.",
  "McNulty KL et al. Sports Med, 2020.",
  "Oliveira LF et al. JSCR, 2009.",
  "Petersen J et al. Am J Sports Med, 2011.",
  "Prestes J et al. JSCR, 2019.",
  "Reinold MM et al. JOSPT, 2004.",
  "Riemann BL et al. JSCR, 2011.",
  "Robbins DW et al. JSCR, 2010.",
  "Roig M et al. Br J Sports Med, 2009.",
  "Saeterbakken AH, Fimland MS. JSCR, 2013.",
  "Schoenfeld BJ. JSCR, 2010.",
  "Schoenfeld BJ, Grgic J. JSCR, 2020.",
  "Schoenfeld BJ, Ogborn D, Krieger JW. Sports Med, 2016.",
  "Seitz LB, Haff GG. Sports Med, 2016.",
  "Snarr RL, Esco MR. JSCR, 2014.",
  "Sperandei S et al. JSCR, 2009.",
  "Stone MH et al. Strength Cond J, 1999.",
  "Suchomel TJ et al. Sports Med, 2016.",
  "Sung E et al. SpringerPlus, 2014.",
  "Vera-Garcia FJ et al. J Electromyogr Kinesiol, 2007.",
  "Wikström-Frisén L et al. J Sports Med Phys Fitness, 2017.",
  "Wilson GJ et al. Med Sci Sports Exerc, 1993.",
  "Zourdos MC et al. JSCR, 2016.",
];

// ════════════════════════════════════════════════════════════════
// MÓDULOS STRATUM
// ════════════════════════════════════════════════════════════════
export const STRATUM_MODULES: StratumModule[] = [
  // ───────────────────────────────────────────── CHEST
  {
    id: "chest",
    name: "Peitoral",
    tagline: "O peitoral não é um músculo. É um sistema de alavancas.",
    emoji: "🔥",
    scientificBase: "Porções clavicular (30-45° inclinação), esternocostal (neutro), abdominal (declinado/dips). EMG: Barnett 1995 → 30° supera 45° em ativação clavicular mantendo ativação esternal similar.",
    emgRanking: [
      { exercise: "Supino inclinado 30° barra", activation: "Cabeça clavicular máxima" },
      { exercise: "Press halteres inclinado", activation: "Maior ROM e adução no topo" },
      { exercise: "Crucifixo cabo", activation: "Tensão constante > halteres (Andersen 2014)" },
      { exercise: "Dips inclinado >30°", activation: "Peitoral inferior dominante" },
    ],
    volumeLandmarks: [
      { metric: "MEV", value: "8 sets/sem" },
      { metric: "MAV", value: "16 sets/sem" },
      { metric: "MRV", value: "20 sets/sem" },
    ],
    progression: [
      "Sem 1: 12 sets diretos (MEV)",
      "Sem 2: 15 sets",
      "Sem 3: 18 sets (MAV)",
      "Sem 4: 20 sets (pico)",
      "Sem 5: 10 sets (deload)",
      "Sem 6: novo ciclo +2-5% carga",
    ],
    phases: [
      {
        level: "intermediario",
        title: "Sessão A1 — Força + Volume Superior/Médio",
        warmup: ["Band pull-apart 3x20", "Rotação interna/externa 2x15", "Supino vazio 2x10"],
        blocks: [
          {
            label: "Trabalho",
            exercises: [
              { name: "Supino inclinado 30° barra", sets: "4", reps: "6-8", rpe: "8", rest: "3-4min", cadence: "3-1-1", cue: "Escápulas para baixo e para dentro. Cotovelos 60°. Barra desce até peitoral superior.", ref: "Barnett 1995 — ângulo 30° = máxima ativação clavicular" },
              { name: "Press halteres inclinado 30°", sets: "3", reps: "10-12", rpe: "8", rest: "90s", cadence: "2-0-2", cue: "Descida: estiramento máximo. Subida: adução no topo.", ref: "Saeterbakken 2013" },
              { name: "Crucifixo cabo baixo-alto", sets: "3", reps: "12-15", rpe: "7-8", rest: "75s", cue: "Cotovelo fixo em leve flexão. Movimento de abraçar. Adução no topo.", ref: "Andersen 2014 — cabo > haltere" },
              { name: "Pec Deck (drop set final)", sets: "2-3", reps: "15-20", rpe: "7", cue: "Pump metabólico. Drop -30% até falha técnica." },
            ],
          },
        ],
      },
      {
        level: "avancado",
        title: "Push Day A — Força (Push/Pull/Legs)",
        blocks: [
          {
            label: "Bloco principal",
            exercises: [
              { name: "Supino inclinado 30°", sets: "5", reps: "4-6", rpe: "8-9", cue: "80-87% 1RM. Post-activation potentiation: 5min descanso antes de B." },
              { name: "Press halteres inclinado", sets: "4", reps: "8-10", superset: true },
              { name: "Crucifixo inclinado cabo (pré-exaustão)", sets: "4", reps: "12-15", superset: true, ref: "Augustsson 2003 — pré-exaustão recruta mais fibras" },
              { name: "Supino reto (rest-pause final)", sets: "3", reps: "8-10", cue: "Rest-pause: falha → 15s → máx → 15s → máx", ref: "Prestes 2019" },
              { name: "Crossover cabo médio", sets: "3", reps: "15-20", cue: "Pump/metabólito" },
            ],
          },
        ],
      },
      {
        level: "elite",
        title: "Fase Volume (semanas 1-3) — Bodybuilding Competitivo",
        notes: "Segunda PEITO PESADO + Quinta PEITO TÉCNICO. ~20 sets diretos por sessão.",
        blocks: [
          {
            label: "Segunda — Pesado",
            exercises: [
              { name: "Ativação neural: supino barra", sets: "3", reps: "3", cue: "90% 1RM" },
              { name: "Supino inclinado 30°", sets: "5", reps: "8-10", cue: "70% 1RM, foco volume" },
              { name: "Press halteres inclinado", sets: "4", reps: "10-12" },
              { name: "Pec Deck", sets: "4", reps: "15-20" },
              { name: "Crucifixo cabo", sets: "3", reps: "15-20" },
            ],
          },
          {
            label: "Quinta — Técnico (DC Stretch)",
            exercises: [
              { name: "Pré-exaustão: Crucifixo → Press inclinado", sets: "4+4", reps: "15+10", superset: true },
              { name: "Supino halteres (DC stretch)", sets: "4", reps: "10-12", cue: "Stretch extremo no fundo — 60s isometria no alongamento máximo" },
              { name: "Oclusão vascular + Pec Deck", sets: "4", reps: "30-15-15-15", cue: "30% 1RM, BFR", ref: "Loenneke 2012" },
              { name: "Dips com peso", sets: "3", reps: "Falha" },
            ],
          },
        ],
      },
    ],
    references: [
      { authors: "Barnett C, Kippers V, Turner P", title: "Effects of variations of the bench press exercise on the EMG activity of five shoulder muscles", journal: "JSCR", year: 1995, finding: "30° produz maior ativação clavicular que 45°" },
      { authors: "Glass SC, Armstrong T", title: "EMG activity of the pectoralis muscle during incline and decline bench presses", journal: "JSCR", year: 1997 },
      { authors: "Saeterbakken AH, Fimland MS", title: "Effects of bench press variations", journal: "JSCR", year: 2013, finding: "Halteres permitem maior ROM e ativação peitoral" },
      { authors: "Andersen V et al.", title: "EMG analysis of cable vs dumbbell flyes", journal: "JSCR", year: 2014, finding: "Cabo > haltere em ativação peitoral por tensão constante" },
      { authors: "Maeo S et al.", title: "Triceps brachii hypertrophy at long vs short muscle length", journal: "JSCR", year: 2021, finding: "ROM completo + estiramento = maior crescimento (extrapolado)" },
      { authors: "Prestes J et al.", title: "Strength Adaptations: Rest-Pause vs Traditional", journal: "JSCR", year: 2019 },
      { authors: "Loenneke JP et al.", title: "Blood flow restriction: how does it work?", journal: "Front Physiol", year: 2012 },
    ],
  },

  // ───────────────────────────────────────────── ARMS
  {
    id: "arms",
    name: "Braços",
    tagline: "Bíceps é pico e separação. Tríceps é tamanho absoluto.",
    emoji: "💪",
    scientificBase: "Bíceps: cabeça longa (rosca inclinada), cabeça curta (Scott). Tríceps: cabeça longa (overhead, 2/3 do volume) > lateral > medial. Quem só faz pushdown desenvolve 1/3 do potencial.",
    emgRanking: [
      { exercise: "Rosca inclinada 45°", activation: "Cabeça longa do bíceps (estiramento)" },
      { exercise: "Rosca concentrada", activation: "Pico de contração bíceps" },
      { exercise: "Extensão overhead", activation: "Cabeça longa tríceps (Kholinne 2018)" },
      { exercise: "Pushdown", activation: "Cabeça lateral tríceps" },
    ],
    volumeLandmarks: [
      { metric: "MEV Bíceps", value: "8 sets/sem" },
      { metric: "MAV Bíceps", value: "14 sets/sem" },
      { metric: "MEV Tríceps", value: "6 sets/sem" },
      { metric: "MAV Tríceps", value: "12 sets/sem" },
    ],
    phases: [
      {
        level: "intermediario",
        title: "Treino Dedicado — 3 Fases (60min)",
        warmup: ["Rotação cotovelo 2x20", "Band curl 2x20", "Extensão band 2x20"],
        blocks: [
          {
            label: "Fase 1 — Força base (25min)",
            exercises: [
              { name: "Rosca barra reta/W", sets: "4", reps: "6-8", rpe: "8", rest: "2min", cadence: "3-0-2", cue: "Cotovelos fixos. Zero balanço. Excêntrico lento = crescimento.", ref: "Roig 2009 — excêntrico produz hipertrofia superior" },
              { name: "Close grip bench press", sets: "4", reps: "6-8", rpe: "8", superset: true, cue: "Pegada 40-50cm. Cotovelos a 45° do corpo." },
            ],
          },
          {
            label: "Fase 2 — Hipertrofia (20min)",
            exercises: [
              { name: "Rosca inclinada halteres 45°", sets: "3", reps: "10-12", rpe: "8", cue: "Ombro estendido. Estiramento máximo no fundo = ponto de crescimento.", ref: "Oliveira 2009" },
              { name: "Extensão overhead haltere/cabo", sets: "3", reps: "10-12", rpe: "8", superset: true, cue: "Braço completamente elevado. Cotovelo aponta teto.", ref: "Kholinne 2018" },
              { name: "Rosca Scott", sets: "3", reps: "12-15", rpe: "7-8", cue: "Cabeça curta. Amplitude TOTAL obrigatória." },
              { name: "Tríceps testa W", sets: "3", reps: "12-15", rpe: "7-8", superset: true, cue: "Atrás da cabeça = mais estiramento cabeça longa." },
            ],
          },
          {
            label: "Fase 3 — Pump (15min)",
            exercises: [
              { name: "Giant set: Rosca cabo → Rosca martelo → Pushdown corda → Kickback", sets: "3 rounds", reps: "15-15-15-12", rest: "2min entre rounds", cue: "Sem descanso entre exercícios" },
            ],
          },
        ],
      },
      {
        level: "elite",
        title: "DC Training — Rotação 3 Exercícios",
        notes: "Rest-pause + 60s stretch sob carga. Rotação semanal.",
        blocks: [
          {
            label: "Bíceps (rotação)",
            exercises: [
              { name: "Sem 1: Rosca inclinada", sets: "1", reps: "Rest-pause + 60s stretch", ref: "Trudel DC Training" },
              { name: "Sem 2: Rosca Scott", sets: "1", reps: "Rest-pause + 60s stretch" },
              { name: "Sem 3: Rosca concentrada", sets: "1", reps: "Rest-pause + 60s stretch" },
            ],
          },
          {
            label: "Tríceps (rotação)",
            exercises: [
              { name: "Sem 1: Extensão overhead", sets: "1", reps: "Rest-pause + 60s stretch" },
              { name: "Sem 2: Tríceps testa", sets: "1", reps: "Rest-pause + 60s stretch" },
              { name: "Sem 3: Extensão cabo", sets: "1", reps: "Rest-pause + 60s stretch" },
            ],
          },
        ],
      },
    ],
    references: [
      { authors: "Oliveira LF et al.", title: "Effect of the Elbow Flexion Angle on the Activation of the Elbow Flexor Muscles", journal: "JSCR", year: 2009, finding: "Rosca inclinada produz maior ativação cabeça longa do bíceps" },
      { authors: "Kholinne E et al.", title: "Effect of different elbow positions on triceps brachii activation", journal: "J Phys Ther Sci", year: 2018, finding: "Overhead = significativamente maior ativação cabeça longa vs pushdown" },
      { authors: "Roig M et al.", title: "Eccentric vs concentric resistance training", journal: "Br J Sports Med", year: 2009 },
      { authors: "Stevenson S", title: "Fortitude Training: The Ultimate Hypertrophy Manual", journal: "Self-published", year: 2014 },
      { authors: "Jørgensen SL et al.", title: "Myo-reps as a time-efficient training method", journal: "Front Physiol", year: 2020 },
    ],
  },

  // ───────────────────────────────────────────── BACK
  {
    id: "back",
    name: "Costas / Dorsal",
    tagline: "Espessura vem de remada. Largura vem de puxada. Saúde vem das duas.",
    emoji: "🦅",
    scientificBase: "Pegada larga pronada = grande dorsal (largura). Remada pronada = trapézio médio + romboides (espessura). RETRAÇÃO ESCAPULAR é OBRIGATÓRIA antes de puxar — sem ela, bíceps + trapézio superior compensam (Cools 2007).",
    emgRanking: [
      { exercise: "Barra fixa pronada larga", activation: "Grande dorsal — largura" },
      { exercise: "Remada curvada pronada", activation: "Trapézio médio + romboides (Fenwick 2009)" },
      { exercise: "Remada unilateral c/ rotação", activation: "Amplitude profunda completa" },
      { exercise: "Face pull", activation: "Posterior + manguito — saúde do ombro" },
    ],
    volumeLandmarks: [
      { metric: "MEV", value: "10 sets/sem" },
      { metric: "MAV", value: "18 sets/sem" },
      { metric: "MRV", value: "25 sets/sem" },
    ],
    phases: [
      {
        level: "intermediario",
        title: "Sessão Costas — Volume Alto (1x/sem)",
        warmup: ["Band pull-apart 3x20", "Rotação externa band 2x15", "Puxada elástico 2x15", "Barra morta 2x10"],
        blocks: [
          {
            label: "Trabalho",
            exercises: [
              { name: "Barra fixa/Puxada pronada larga", sets: "5", reps: "5-8", rest: "3-4min", cue: "DEPRIMA escápulas → RETRAIA → puxe. Cotovelos para baixo e trás.", ref: "Cools 2007 — retração escapular obrigatória" },
              { name: "Remada curvada barra pronada", sets: "4", reps: "8-10", rpe: "8", cadence: "2-0-2", rest: "2min", cue: "Tronco 45°. Barra ao umbigo. Escápula retrai 1s no pico.", ref: "Fenwick 2009" },
              { name: "Remada unilateral haltere", sets: "4", reps: "10-12", rest: "90s", superset: true, cue: "Protração total no início → retração total no fim. Não a parcial." },
              { name: "Puxada supinada média", sets: "3", reps: "10-12", rpe: "7-8", cue: "Fibras inferiores do dorsal + ROM maior" },
              { name: "Straight arm pulldown cabo", sets: "3", reps: "12-15", superset: true, cue: "ISOLA dorsal sem bíceps. Cotovelo fixo. 'Espremer laranjas nas axilas.'" },
              { name: "Face pull corda", sets: "4", reps: "15-20", rpe: "6-7", cue: "OBRIGATÓRIO — saúde do ombro. Rotação externa no pico.", ref: "Reinold 2004" },
              { name: "Pullover máquina/haltere", sets: "3", reps: "12-15", cue: "Estiramento total — long muscle length", ref: "Schoenfeld & Grgic 2020" },
            ],
          },
        ],
      },
      {
        level: "avancado",
        title: "Split Espessura + Largura (2x/semana)",
        notes: "Treino A = espessura (seg) | Treino B = largura (qui). Total ~36-40 sets/semana.",
        blocks: [
          {
            label: "Treino A — Espessura (trapézio + romboides)",
            exercises: [
              { name: "Remada cavalinho/T-bar", sets: "5", reps: "6-8", cue: "Força máxima espessura" },
              { name: "Remada curvada barra pronada", sets: "4", reps: "8-10" },
              { name: "Remada unilateral c/ rotação", sets: "4", reps: "10-12", superset: true },
              { name: "Remada cabo baixo (triângulo)", sets: "3", reps: "12-15" },
              { name: "Face pull", sets: "3", reps: "15-20", superset: true },
            ],
          },
          {
            label: "Treino B — Largura (grande dorsal)",
            exercises: [
              { name: "Barra fixa com lastro", sets: "5", reps: "5" },
              { name: "Puxada larga frontal", sets: "4", reps: "8-10" },
              { name: "Pullover máquina", sets: "4", reps: "12-15", superset: true },
              { name: "Puxada unilateral cabo", sets: "3", reps: "12-15 cada" },
              { name: "Straight arm pulldown", sets: "3", reps: "15-20", superset: true },
              { name: "Puxada supinada", sets: "2", reps: "15-20", cue: "Pump final" },
            ],
          },
        ],
      },
    ],
    references: [
      { authors: "Andersen V et al.", title: "Effects of grip width on muscle strength and activation in the lat pull-down", journal: "JSCR", year: 2014 },
      { authors: "Sperandei S et al.", title: "EMG analysis of three different types of lat pull-down", journal: "JSCR", year: 2009, finding: "Pegada larga pronada > narrow em ativação dorsal" },
      { authors: "Fenwick CM et al.", title: "Comparison of different rowing exercises", journal: "JSCR", year: 2009, finding: "Remada pronada > supinada para trapézio médio + romboides" },
      { authors: "Cools AM et al.", title: "Rehabilitation of scapular muscle balance", journal: "Am J Sports Med", year: 2007, finding: "Retração escapular obrigatória — sem ela, bíceps compensa" },
      { authors: "Reinold MM et al.", title: "EMG analysis of rotator cuff and deltoid during external rotation", journal: "JOSPT", year: 2004 },
      { authors: "Schoenfeld BJ, Grgic J", title: "Effects of range of motion on muscle development", journal: "JSCR", year: 2020 },
    ],
  },

  // ───────────────────────────────────────────── SHOULDERS
  {
    id: "shoulders",
    name: "Ombros",
    tagline: "Três deltoides. Três vetores. Um atleta completo.",
    emoji: "🎯",
    scientificBase: "Lateral: cabo > haltere (Campos 2020) — tensão no início do ROM. Posterior: o mais negligenciado, requer 12-16 sets/semana. Anterior: já recebe volume indireto via supino — 6-8 sets bastam.",
    emgRanking: [
      { exercise: "Elevação lateral cabo", activation: "Deltoide lateral — tensão constante" },
      { exercise: "Crucifixo inverso", activation: "Posterior deltoide" },
      { exercise: "Face pull (rotação externa)", activation: "Posterior + manguito" },
      { exercise: "Arnold Press", activation: "Anterior + lateral + posterior (rotacional)" },
    ],
    volumeLandmarks: [
      { metric: "Lateral", value: "16-22 sets/sem" },
      { metric: "Posterior", value: "12-16 sets/sem" },
      { metric: "Anterior", value: "6-8 sets/sem" },
    ],
    phases: [
      {
        level: "intermediario",
        title: "Treino Dedicado de Ombros",
        warmup: ["Rotação interna/externa band 3x15 cada", "Face pull leve 3x20", "Elevação lateral leve 2x15"],
        blocks: [
          {
            label: "Trabalho",
            exercises: [
              { name: "Desenvolvimento halteres", sets: "4", reps: "8-10", rpe: "8", cue: "Encosto a 80°. ROM completo. Cotovelos a 90° no fundo — protege manguito.", ref: "Campos 2020" },
              { name: "Elevação lateral cabo (polia baixa)", sets: "4", reps: "12-15", rpe: "7-8", cue: "Cabo na altura do quadril, cruzando à frente. Cotovelo lidera.", ref: "Campos 2020 — cabo > haltere" },
              { name: "Elevação lateral haltere (6-12-25)", sets: "4 rounds", reps: "6/12/25", cue: "10s descanso entre. 6 pesadas → 12 médias → 25 leves até falha.", ref: "Poliquin 1997", superset: true },
              { name: "Face pull corda", sets: "4", reps: "15-20", rpe: "6-7", cue: "Polia altura dos olhos. Cotovelos ALTOS. Rotação externa máxima.", ref: "Reinold 2004" },
              { name: "Crucifixo inverso", sets: "4", reps: "15-20", superset: true, cue: "Cotovelo levemente dobrado. Squeeze no pico — posterior queima." },
              { name: "Arnold Press", sets: "3", reps: "10-12", cue: "Palmas para o rosto → rotam para frente no topo." },
            ],
          },
        ],
      },
      {
        level: "elite",
        title: "Delta Isolation Method (3 dias/semana)",
        notes: "Lateral 18 sets | Posterior 16 sets | Anterior 8 sets — semana completa.",
        blocks: [
          {
            label: "Segunda (pós-peito)",
            exercises: [
              { name: "Lateral cabo", sets: "4", reps: "15" },
              { name: "Lateral haltere (drop final)", sets: "3", reps: "20" },
              { name: "Elevação frontal alternada (anterior — mínimo)", sets: "3", reps: "12" },
            ],
          },
          {
            label: "Quinta (pós-costas)",
            exercises: [
              { name: "Crucifixo inverso", sets: "5", reps: "15-20" },
              { name: "Face pull", sets: "4", reps: "20" },
              { name: "Lateral cabo (manutenção)", sets: "3", reps: "15" },
            ],
          },
          {
            label: "Sábado (isolado)",
            exercises: [
              { name: "Desenvolvimento pesado", sets: "5", reps: "6-8" },
              { name: "Lateral 6-12-25", sets: "4 rounds", reps: "6/12/25" },
              { name: "Pec deck invertido", sets: "4", reps: "20" },
            ],
          },
        ],
      },
    ],
    references: [
      { authors: "Campos YA et al.", title: "Different shoulder exercises affect activation of deltoid portions", journal: "JSCR", year: 2020, finding: "Cabo > haltere em ativação lateral por toda ROM" },
      { authors: "Reinold MM et al.", title: "EMG analysis of rotator cuff and deltoid", journal: "JOSPT", year: 2004 },
      { authors: "Schoenfeld BJ et al.", title: "Resistance Training Volume Enhances Hypertrophy", journal: "Med Sci Sports Exerc", year: 2019 },
      { authors: "Wattanaprakornkul D et al.", title: "Muscle recruitment patterns during shoulder flexion", journal: "J Electromyogr Kinesiol", year: 2011 },
      { authors: "Poliquin C", title: "The Poliquin Principles", journal: "Dayton Writers Group", year: 1997 },
    ],
  },

  // ───────────────────────────────────────────── LEGS
  {
    id: "legs",
    name: "Pernas",
    tagline: "Perna não é treino. É fundação.",
    emoji: "🦵",
    scientificBase: "Agachamento profundo (<paralelo) = maior ativação glúteo + quadríceps sem maior estresse patelofemoral (Schoenfeld 2010). Hip Thrust = 95% MVC glúteo (Contreras 2015). Sóleo (sentado) ≠ Gastrocnêmio (em pé).",
    emgRanking: [
      { exercise: "Hip Thrust barra", activation: "95% MVC glúteo máximo (Contreras 2015)" },
      { exercise: "Agachamento profundo", activation: "78% MVC glúteo + quadríceps total" },
      { exercise: "Stiff unilateral", activation: "74% MVC glúteo + isquiotibial" },
      { exercise: "Nordic Hamstring Curl", activation: "Maior ativação bíceps femoral" },
    ],
    volumeLandmarks: [
      { metric: "Quadríceps MAV", value: "16 sets/sem" },
      { metric: "Isquiotibiais MAV", value: "12 sets/sem" },
      { metric: "Glúteos MAV", value: "12 sets/sem" },
    ],
    progression: [
      "Sem 1: 5x5 agachamento (70% 1RM)",
      "Sem 2: 5x5 (75%)",
      "Sem 3: 5x5 (80%)",
      "Sem 4: 3x3 (85%) + volume reduzido",
      "Sem 5: deload 5x5 a 60%",
      "Sem 6: novo ciclo +5kg",
    ],
    phases: [
      {
        level: "intermediario",
        title: "Lower A — Quadríceps + Glúteo Dominante",
        warmup: ["Hip 90/90 3x30s cada", "Agachamento PC 3x10", "Clamshell band 2x15", "Ponte glúteo 2x20", "Barra vazia 2x8"],
        blocks: [
          {
            label: "Trabalho",
            exercises: [
              { name: "Agachamento livre barra", sets: "5", reps: "5", rpe: "8", rest: "4min", cue: "Coxa paralela MÍNIMO. Joelhos seguem pés. Bracelet antes de descer.", ref: "Schoenfeld 2010" },
              { name: "Leg Press 45°", sets: "4", reps: "10-12", rpe: "8", cadence: "3-1-1", rest: "2min", cue: "Pés médio-altos. Não travar joelho no topo." },
              { name: "Hack Squat", sets: "3", reps: "12-15", rpe: "7-8", rest: "90s", cue: "Pés baixos e estreitos = quadríceps puro." },
              { name: "Avanço halteres caminhando", sets: "3", reps: "10-12 cada", superset: true, cue: "Passada longa = glúteo. Curta = quadríceps." },
              { name: "Cadeira extensora (drop final)", sets: "3", reps: "15-20", cue: "Amplitude completa. Drop -30% até falha.", ref: "Escamilla 1998" },
              { name: "Panturrilha em pé (gastrocnêmio)", sets: "5", reps: "20-25", cue: "Pausa 2s topo + 2s fundo.", ref: "Riemann 2011" },
            ],
          },
        ],
      },
      {
        level: "intermediario",
        title: "Lower B — Posterior + Isquiotibial Dominante",
        blocks: [
          {
            label: "Trabalho",
            exercises: [
              { name: "RDL (ou Terra convencional)", sets: "4", reps: "8-10", rpe: "8", cadence: "3-1-1", cue: "Quadril empurra para trás. Coluna neutra. Estiramento → não além.", ref: "Bourne 2018" },
              { name: "Hip Thrust barra", sets: "4", reps: "10-12", rpe: "8", cue: "Retroversão pélvica no topo (não hiperextensão). Pausa 2s.", ref: "Contreras 2015 — 95% MVC" },
              { name: "Stiff halteres unilateral", sets: "4", reps: "10-12 cada", superset: true },
              { name: "Mesa flexora deitado", sets: "4", reps: "10-12", rpe: "8", cadence: "3-0-2", ref: "Bourne 2018 — excêntrico previne lesão 51%" },
              { name: "Glúteo no cabo", sets: "4", reps: "15-20 cada", superset: true },
              { name: "Abdução máquina (glúteo médio)", sets: "3", reps: "20-25", rpe: "7", cue: "Estabilidade do joelho — previne valgo." },
              { name: "Panturrilha sentado (sóleo)", sets: "4", reps: "20-25", ref: "Riemann 2011" },
            ],
          },
        ],
      },
    ],
    references: [
      { authors: "Schoenfeld BJ", title: "Squatting kinematics and kinetics", journal: "JSCR", year: 2010, finding: "Agachamento completo = maior ativação sem maior estresse patelofemoral" },
      { authors: "Escamilla RF et al.", title: "Biomechanics of the knee during closed/open kinetic chain", journal: "Med Sci Sports Exerc", year: 1998 },
      { authors: "Bloomquist K et al.", title: "Effect of ROM in heavy load squatting", journal: "EJAP", year: 2013 },
      { authors: "Contreras B et al.", title: "Comparison of gluteus maximus EMG: hip thrust vs back squat", journal: "JSCR", year: 2015, finding: "Hip thrust = 95% MVC vs back squat 59% MVC" },
      { authors: "Bourne MN et al.", title: "Evidence-based framework for hamstring injury prevention", journal: "Sports Med", year: 2018, finding: "Nordic Hamstring Curl = maior ativação bíceps femoral, 51% redução de lesão" },
      { authors: "Riemann BL et al.", title: "EMG of plantar flexion: standing vs seated", journal: "JSCR", year: 2011 },
    ],
  },

  // ───────────────────────────────────────────── UPPER
  {
    id: "upper",
    name: "Superiores",
    tagline: "O torso que domina é o que equilibra todos os planos.",
    emoji: "⚡",
    scientificBase: "Upper/Lower 4 dias > Full Body 3x/semana em treinados (Colquhoun 2018). Ratio empurrar:puxar = 1:1.5 obrigatório para ombro saudável (Kolber 2009).",
    phases: [
      {
        level: "intermediario",
        title: "Upper A — Força Dominante",
        notes: "Cargas altas, RIR 1-2, supersets antagonistas (Robbins 2010 reduz 40% do tempo).",
        blocks: [
          {
            label: "Pares antagonistas",
            exercises: [
              { name: "Supino reto barra", sets: "5", reps: "5", rpe: "8-9", rest: "3-4min" },
              { name: "Remada curvada barra pronada", sets: "5", reps: "5", rpe: "8-9", superset: true, ref: "Robbins 2010" },
              { name: "Desenvolvimento halteres/barra", sets: "4", reps: "6-8", rpe: "8" },
              { name: "Barra fixa/Puxada", sets: "4", reps: "6-8", superset: true },
              { name: "Elevação lateral cabo", sets: "3", reps: "12-15" },
              { name: "Face pull", sets: "3", reps: "15-20", superset: true, cue: "OBRIGATÓRIO — saúde do ombro" },
              { name: "Rosca barra", sets: "3", reps: "10-12" },
              { name: "Tríceps testa EZ", sets: "3", reps: "10-12", superset: true },
            ],
          },
        ],
      },
      {
        level: "intermediario",
        title: "Upper B — Volume/Hipertrofia",
        notes: "RIR 2-3, foco técnica.",
        blocks: [
          {
            label: "Trabalho",
            exercises: [
              { name: "Supino inclinado halteres 30°", sets: "4", reps: "10-12" },
              { name: "Remada unilateral haltere", sets: "4", reps: "10-12", superset: true },
              { name: "Arnold Press", sets: "3", reps: "10-12" },
              { name: "Puxada supinada", sets: "3", reps: "10-12", superset: true },
              { name: "Crossover cabo", sets: "3", reps: "12-15" },
              { name: "Pullover", sets: "3", reps: "12-15", superset: true },
              { name: "Elevação lateral haltere", sets: "3", reps: "15-20" },
              { name: "Crucifixo inverso", sets: "3", reps: "15-20", superset: true },
            ],
          },
        ],
      },
    ],
    references: [
      { authors: "Colquhoun RJ et al.", title: "Training Volume, Not Frequency, Indicative of Maximal Strength Adaptations", journal: "JSCR", year: 2018 },
      { authors: "Schoenfeld BJ et al.", title: "Effects of volume-equated loading strategies", journal: "JSCR", year: 2014 },
      { authors: "Kolber MJ et al.", title: "Shoulder impingement and pressing volume", journal: "JSCR", year: 2009, finding: "Excesso de volume de empurrar vs puxar = impingement" },
      { authors: "Robbins DW et al.", title: "Agonist-antagonist complex resistance training", journal: "JSCR", year: 2010 },
    ],
  },

  // ───────────────────────────────────────────── LOWER
  {
    id: "lower",
    name: "Inferiores",
    tagline: "A força que sustenta tudo começa aqui.",
    emoji: "⛰️",
    scientificBase: "Periodização ondulatória > linear em intermediários/avançados para força inferior (Stone 1999).",
    phases: [
      {
        level: "intermediario",
        title: "Lower A — Força/Quadríceps",
        blocks: [
          {
            label: "Trabalho",
            exercises: [
              { name: "Agachamento", sets: "5", reps: "5", cue: "Foco linear" },
              { name: "Leg Press", sets: "4", reps: "10-12" },
              { name: "Hack Squat", sets: "3", reps: "12-15" },
              { name: "Extensora + Avanço (superset)", sets: "3+3", reps: "15+10", superset: true },
              { name: "Panturrilha em pé", sets: "5", reps: "20-25" },
            ],
          },
        ],
      },
      {
        level: "avancado",
        title: "Lower B — Posterior/Potência",
        blocks: [
          {
            label: "Trabalho",
            exercises: [
              { name: "Levantamento terra convencional/RDL", sets: "5/4", reps: "5/8" },
              { name: "Hip Thrust barra", sets: "4", reps: "10-12" },
              { name: "Stiff unilateral", sets: "4", reps: "10-12", superset: true },
              { name: "Mesa flexora (excêntrico 3s)", sets: "4", reps: "12-15" },
              { name: "Glúteo no cabo", sets: "4", reps: "15-20", superset: true },
              { name: "Nordic Hamstring Curl", sets: "3", reps: "6-8", cue: "Excêntrico apenas se iniciante", ref: "Bourne 2018" },
              { name: "Abdução máquina", sets: "3", reps: "20-25" },
              { name: "Panturrilha sentado", sets: "4", reps: "20-25" },
            ],
          },
        ],
      },
    ],
    references: [
      { authors: "Stone MH et al.", title: "Periodization: Effects of Manipulating Volume and Intensity", journal: "Strength Cond J", year: 1999 },
      { authors: "Helms ER et al.", title: "RPE-Based Training in a Powerlifting Peaking Program", journal: "JSCR", year: 2018 },
      { authors: "Bourne MN et al.", title: "Hamstring injury prevention framework", journal: "Sports Med", year: 2018 },
    ],
  },

  // ───────────────────────────────────────────── CORE
  {
    id: "core",
    name: "Core",
    tagline: "Core não sustenta o peso. Core É o peso.",
    emoji: "🛡️",
    scientificBase: "Função primária = ANTI-MOVIMENTO (resistir extensão, flexão lateral, rotação) (McGill 2010). Bracelet 360° > sucção. Ab wheel rollout = >100% maior ativação que crunch (Escamilla 2006).",
    emgRanking: [
      { exercise: "Ab Wheel Rollout", activation: "Maior ativação reto abdominal + oblíquo externo" },
      { exercise: "RKC Plank", activation: "2x maior ativação TrA vs prancha padrão" },
      { exercise: "Pallof Press", activation: "Anti-rotação — oblíquos + TrA" },
      { exercise: "Dragon Flag excêntrico", activation: "Reto abdominal carga máxima" },
    ],
    phases: [
      {
        level: "intermediario",
        title: "Nível 1 — Base (4 semanas iniciais)",
        notes: "3x/semana ao final do treino (10-15min).",
        blocks: [
          {
            label: "Trabalho",
            exercises: [
              { name: "Prancha padrão", sets: "3", reps: "45-60s", cue: "Linha quadril-ombro-calcanhar. Bracelet ativo. Respiração diafragmática." },
              { name: "Dead bug", sets: "3", reps: "10 cada", cue: "Lombar COLADA no chão. Movimento lento." },
              { name: "Bird dog", sets: "3", reps: "10 cada", cue: "Quadril não rotaciona. Pausa 2s." },
              { name: "Pallof Press", sets: "3", reps: "12 cada", cue: "Resistência de rotação — core lateral.", ref: "McGill 2010" },
            ],
          },
        ],
      },
      {
        level: "avancado",
        title: "Nível 2 — Intermediário",
        blocks: [
          {
            label: "Trabalho",
            exercises: [
              { name: "RKC Prancha", sets: "3", reps: "30s", cue: "Glúteos contraídos + bracelet + rotação interna ombros." },
              { name: "Ab Wheel Rollout (joelho ou pé)", sets: "4", reps: "8-10", ref: "Escamilla 2006" },
              { name: "Elevação pernas pendurado", sets: "4", reps: "10-12" },
              { name: "Pallof Press kneeling", sets: "3", reps: "15 cada" },
              { name: "Stir the pot (prancha bola)", sets: "3", reps: "10 cada direção" },
            ],
          },
        ],
      },
      {
        level: "elite",
        title: "Nível 3 — Avançado",
        blocks: [
          {
            label: "Trabalho",
            exercises: [
              { name: "Ab Wheel de pé", sets: "4", reps: "8-10" },
              { name: "Dragon Flag excêntrico", sets: "3", reps: "5" },
              { name: "Elevação pernas estendidas", sets: "4", reps: "12-15" },
              { name: "Landmine rotation", sets: "3", reps: "10 cada", cue: "Potência rotacional" },
              { name: "Abdominal polia com carga", sets: "4", reps: "15-20", cue: "CARGA REAL = crescimento real" },
            ],
          },
        ],
      },
    ],
    references: [
      { authors: "McGill SM", title: "Core Training: Evidence Translating to Better Performance and Injury Prevention", journal: "Strength Cond J", year: 2010 },
      { authors: "Escamilla RF et al.", title: "EMG analysis of traditional and nontraditional abdominal exercises", journal: "Phys Ther", year: 2006, finding: "Ab wheel = >100% maior ativação que crunch" },
      { authors: "Snarr RL, Esco MR", title: "EMG comparison of plank variations", journal: "JSCR", year: 2014 },
      { authors: "Vera-Garcia FJ et al.", title: "Effects of abdominal stabilization on spine motion", journal: "J Electromyogr Kinesiol", year: 2007, finding: "Bracelet reduz forças compressivas espinhais" },
    ],
  },

  // ───────────────────────────────────────────── FEMININO
  {
    id: "feminino",
    name: "Feminino",
    tagline: "Fisiologia feminina exige protocolo feminino.",
    emoji: "♀️",
    scientificBase: "Fase folicular = treinos pesados, PRs (estrogênio anabólico). Lútea = volume moderado. Hip Thrust = 95% MVC glúteo em mulheres treinadas (Contreras 2015). Q-angle maior → glúteo médio essencial para prevenir valgo (Hewett 2005).",
    emgRanking: [
      { exercise: "Hip Thrust barra", activation: "95% MVC glúteo máximo" },
      { exercise: "Agachamento profundo", activation: "78% MVC" },
      { exercise: "Stiff unilateral", activation: "74% MVC" },
      { exercise: "Avanço", activation: "71% MVC" },
      { exercise: "Cadeira extensora", activation: "48% MVC (NÃO ativa glúteo significativamente)" },
    ],
    phases: [
      {
        level: "intermediario",
        title: "Sessão A — Glúteo Máximo + Quadríceps (Segunda)",
        warmup: ["Clamshell band 3x20", "Ponte glúteo band 3x20", "Agachamento band 2x15"],
        blocks: [
          {
            label: "Trabalho",
            exercises: [
              { name: "Hip Thrust barra", sets: "4", reps: "10-12", rpe: "8", cue: "Pausa 2s no topo. Retroversão — não hiperextensão. Lombar dói = você está usando lombar.", ref: "Contreras 2015" },
              { name: "Agachamento largo halteres/barra", sets: "4", reps: "12-15", rpe: "7-8", cue: "Largura > ombros. Pés 45°. Abaixo paralelo. Band acima dos joelhos.", ref: "Hewett 2005 — previne valgo" },
              { name: "Avanço reverso halteres", sets: "4", reps: "12 cada", superset: true, cue: "Passada longa = glúteo dominante." },
              { name: "Stiff unilateral haltere", sets: "3", reps: "12 cada" },
              { name: "Cadeira extensora", sets: "3", reps: "15-20", superset: true, cue: "Quadríceps isolado" },
              { name: "Glúteo no cabo", sets: "3", reps: "15-20 cada", cue: "Pausa 1s na contração máxima" },
            ],
          },
        ],
      },
      {
        level: "intermediario",
        title: "Sessão B — Glúteo Médio + Posterior (Terça)",
        blocks: [
          {
            label: "Trabalho",
            exercises: [
              { name: "Hip Thrust unilateral", sets: "3", reps: "12-15 cada", cue: "Corrige assimetrias" },
              { name: "Abdução máquina", sets: "4", reps: "20-25", rpe: "7", ref: "Hewett 2005", superset: true },
              { name: "Mesa flexora deitada", sets: "4", reps: "10-12", cadence: "3-0-2" },
              { name: "Clamshell com band", sets: "4", reps: "20-25 cada", superset: true },
              { name: "Agachamento sumô goblet", sets: "3", reps: "15-20", cue: "Pés muito abertos. Glúteo médio + adutor" },
              { name: "Panturrilha em pé", sets: "4", reps: "20-25" },
            ],
          },
        ],
      },
      {
        level: "avancado",
        title: "Periodização por Fase do Ciclo",
        notes: "Folicular (sem 1-2): protocolo completo. Ovulação: testar PRs. Lútea (sem 3-4): -20% volume. Menstruação dias 1-2: leve.",
        blocks: [
          {
            label: "Sessão D — Glúteo + Force (Sexta)",
            exercises: [
              { name: "Agachamento livre", sets: "5/4", reps: "5/8", cue: "5x5 fase folicular | 4x8 fase lútea" },
              { name: "Hip Thrust barra", sets: "4", reps: "10-12" },
              { name: "Extensão de quadril 45°", sets: "4", reps: "15-20", superset: true },
              { name: "Avanço caminhando halteres", sets: "3", reps: "10 cada" },
              { name: "Abdução máquina", sets: "3", reps: "20-25", superset: true },
              { name: "RDL halteres", sets: "3", reps: "12" },
              { name: "Panturrilha sentado", sets: "4", reps: "20-25" },
            ],
          },
        ],
      },
    ],
    references: [
      { authors: "Sung E et al.", title: "Follicular vs luteal phase-based strength training", journal: "SpringerPlus", year: 2014, finding: "Folicular = força e adaptações superiores" },
      { authors: "Wikström-Frisén L et al.", title: "Menstrual/oral contraceptive cycle resistance training", journal: "J Sports Med Phys Fitness", year: 2017 },
      { authors: "McNulty KL et al.", title: "Menstrual Cycle Phase on Exercise Performance: Meta-Analysis", journal: "Sports Med", year: 2020 },
      { authors: "Contreras B et al.", title: "Gluteus maximus EMG in trained women: hip thrust vs squat", journal: "JSCR", year: 2015 },
      { authors: "Hewett TE et al.", title: "Neuromuscular control and valgus loading predict ACL injury", journal: "Am J Sports Med", year: 2005 },
    ],
  },

  // ───────────────────────────────────────────── ATHLETE
  {
    id: "athlete",
    name: "Atleta",
    tagline: "Performance é força com propósito.",
    emoji: "🏆",
    scientificBase: "Força máxima = fundação de tudo (Suchomel 2016). PAP (>85% 1RM seguido de explosivo após 4-8min) = +5-12% potência (Seitz 2016). Nordic Hamstring = -51% lesão isquiotibial (Petersen 2011).",
    phases: [
      {
        level: "avancado",
        title: "Segunda — Força Inferior + PAP",
        warmup: ["Hip 90/90", "Monster walk band", "Agachamento PC 3x10", "Salto vertical 3x5 (ativação neural)"],
        blocks: [
          {
            label: "Trabalho",
            exercises: [
              { name: "Agachamento livre", sets: "5", reps: "5", cue: "82-85% 1RM" },
              { name: "Salto ao caixote (PAP — 4-8min após)", sets: "5", reps: "5", ref: "Seitz & Haff 2016 — +8-12% altura salto" },
              { name: "RDL", sets: "4", reps: "6-8" },
              { name: "Nordic Hamstring Curl", sets: "4", reps: "6 excêntricos", superset: true, ref: "Petersen 2011 — -51% lesão" },
              { name: "Avanço com salto", sets: "3", reps: "8 cada" },
              { name: "Agachamento búlgaro", sets: "3", reps: "8 cada", superset: true },
            ],
          },
        ],
      },
      {
        level: "elite",
        title: "Terça — Potência + Upper",
        blocks: [
          {
            label: "Trabalho",
            exercises: [
              { name: "Power clean", sets: "5", reps: "3", cue: "Foco velocidade da barra", ref: "Cormie 2011 — desenvolve RFD" },
              { name: "Press militar barra", sets: "4", reps: "5-6", cue: "85% 1RM" },
              { name: "Arremesso medicine ball overhead (PAP)", sets: "4", reps: "5", superset: true },
              { name: "Puxada pesada", sets: "4", reps: "6-8" },
              { name: "Push press", sets: "3", reps: "5", superset: true },
              { name: "Rotação medicine ball", sets: "3", reps: "10 cada" },
              { name: "Remada explosiva", sets: "3", reps: "8", superset: true },
            ],
          },
        ],
      },
      {
        level: "elite",
        title: "Sexta — Condicionamento",
        blocks: [
          {
            label: "Trabalho",
            exercises: [
              { name: "Sprint 40m", sets: "8", reps: "1", rest: "90s", cue: "Potência velocidade" },
              { name: "Ladder drill agilidade", sets: "5", reps: "1", cue: "Velocidade de pé" },
              { name: "EMOM 15min: 10 KB swings + 5 burpees", sets: "15", reps: "—", cue: "Condicionamento metabólico" },
              { name: "STRATUM CORE Nível 3", sets: "—", reps: "10min" },
            ],
          },
        ],
      },
    ],
    references: [
      { authors: "Suchomel TJ et al.", title: "The Importance of Muscular Strength in Athletic Performance", journal: "Sports Med", year: 2016 },
      { authors: "Cormie P, McGuigan MR, Newton RU", title: "Developing Maximal Neuromuscular Power", journal: "Sports Med", year: 2011 },
      { authors: "Seitz LB, Haff GG", title: "Factors Modulating Post-Activation Potentiation", journal: "Sports Med", year: 2016 },
      { authors: "Petersen J et al.", title: "Eccentric Training on Acute Hamstring Injuries in Soccer", journal: "Am J Sports Med", year: 2011, finding: "-51% lesão isquiotibial" },
      { authors: "Wilson GJ et al.", title: "Optimal training load for dynamic athletic performance", journal: "Med Sci Sports Exerc", year: 1993 },
    ],
  },
];
