export type MuscleGroup =
  | "peito" | "costas" | "ombros" | "bracos"
  | "quadriceps" | "posterior" | "inferiores_full"
  | "panturrilha" | "geral";

export interface WarmupExercise {
  name: string;
  sets: number;
  reps: string;
  focus: string;
}

const KEYWORDS: Record<Exclude<MuscleGroup, "inferiores_full" | "geral">, string[]> = {
  peito: ["peitoral", "peito", "supino", "crossover", "chest", "press inclinado", "press reto", "bench"],
  costas: ["dorsal", "costas", "remada", "pull", "lat", "serrátil", "serratil", "trapézio", "trapezio", "row", "pulldown", "puxada"],
  ombros: ["deltóide", "deltoide", "ombro", "shoulder", "elevação lateral", "elevacao lateral", "press militar", "face pull", "desenvolvimento"],
  bracos: ["bíceps", "biceps", "tríceps", "triceps", "rosca", "extensão", "extensao", "curl", "braço", "braco"],
  quadriceps: ["quadríceps", "quadriceps", "hack squat", "leg press", "leg extension", "agachamento", "squat", "avanço", "avanco", "afundo"],
  posterior: ["isquiotibial", "glúteo", "gluteo", "stiff", "leg curl", "posterior", "hip thrust", "rdl", "romanian"],
  panturrilha: ["panturrilha", "gastrocnêmio", "gastrocnemio", "sóleo", "soleo", "calf"],
};

const LIB: Record<MuscleGroup, { label: string; exercises: WarmupExercise[] }> = {
  peito: {
    label: "PEITO",
    exercises: [
      { name: "Band Pull-Apart (Elástico)", sets: 3, reps: "15-20", focus: "ativação do manguito rotador e estabilização escapular" },
      { name: "Rotação Interna de Ombro (Elástico)", sets: 2, reps: "15", focus: "preparação do deltoide anterior" },
      { name: "Push-up Parcial (amplitude reduzida)", sets: 2, reps: "10", focus: "ativação neural do peitoral" },
      { name: "Mobilidade Torácica (Cat-Cow Modificado)", sets: 1, reps: "10", focus: "extensão torácica para press" },
    ],
  },
  costas: {
    label: "COSTAS",
    exercises: [
      { name: "Dislocação com Bastão", sets: 2, reps: "10", focus: "mobilidade de ombro e escápula" },
      { name: "Face Pull com Elástico", sets: 3, reps: "15", focus: "ativação do manguito e retratores" },
      { name: "Dead Hang (barra fixa)", sets: 2, reps: "20-30s", focus: "descompressão e ativação do lat" },
      { name: "Remada com Elástico Leve", sets: 2, reps: "15", focus: "ativação neural pré-treino de costas" },
    ],
  },
  ombros: {
    label: "OMBROS",
    exercises: [
      { name: "Rotação Externa de Ombro (Elástico)", sets: 3, reps: "15", focus: "manguito rotador" },
      { name: "Y-T-W com Elástico", sets: 2, reps: "10 cada", focus: "estabilizadores escapulares" },
      { name: "Elevação Lateral Leve (20% da carga)", sets: 2, reps: "15", focus: "ativação do deltoide médio" },
      { name: "Press Militar Leve (barra vazia)", sets: 2, reps: "10", focus: "padrão de movimento" },
    ],
  },
  bracos: {
    label: "BRAÇOS",
    exercises: [
      { name: "Rotação de Punho", sets: 2, reps: "20", focus: "aquecimento articular" },
      { name: "Extensão de Tríceps com Elástico Leve", sets: 2, reps: "15", focus: "ativação neural do tríceps" },
      { name: "Rosca com Elástico Leve", sets: 2, reps: "15", focus: "ativação neural do bíceps" },
      { name: "Mobilidade de Cotovelo", sets: 1, reps: "10", focus: "articulação úmero-rádio-ulnar" },
    ],
  },
  quadriceps: {
    label: "QUADRÍCEPS",
    exercises: [
      { name: "Rotação de Quadril (Círculos)", sets: 2, reps: "10 cada lado", focus: "mobilidade de quadril" },
      { name: "Agachamento com Peso Corporal", sets: 2, reps: "15", focus: "ativação neural do padrão de squat" },
      { name: "Leg Extension Leve (30% da carga)", sets: 2, reps: "15", focus: "ativação isolada do quadríceps" },
      { name: "Alongamento de Psoas (Fenda Estática)", sets: 1, reps: "30s cada", focus: "liberação do flexor do quadril" },
    ],
  },
  posterior: {
    label: "POSTERIOR / GLÚTEOS",
    exercises: [
      { name: "Hip Hinge com Bastão", sets: 2, reps: "10", focus: "padrão de dobradiça de quadril" },
      { name: "Glute Bridge Corporal", sets: 2, reps: "15", focus: "ativação neural do glúteo" },
      { name: "Leg Curl Leve (30% da carga)", sets: 2, reps: "15", focus: "ativação dos isquiotibiais" },
      { name: "Alongamento de Piriforme", sets: 1, reps: "30s cada lado", focus: "liberação glúteo profundo" },
    ],
  },
  inferiores_full: {
    label: "INFERIORES COMPLETO",
    exercises: [
      { name: "Rotação de Quadril", sets: 2, reps: "10", focus: "mobilidade de quadril" },
      { name: "Agachamento Corporal", sets: 2, reps: "15", focus: "ativação neural do squat" },
      { name: "Hip Hinge com Bastão", sets: 2, reps: "10", focus: "padrão de dobradiça de quadril" },
      { name: "Glute Bridge Corporal", sets: 2, reps: "15", focus: "ativação neural do glúteo" },
      { name: "Vacuum Abdominal", sets: 3, reps: "20-30s", focus: "estabilização do core" },
      { name: "Aquecimento Articular Geral (Quadril, Joelhos, Tornozelos)", sets: 1, reps: "10-15", focus: "mobilidade global de MMII" },
    ],
  },
  panturrilha: {
    label: "PANTURRILHA",
    exercises: [
      { name: "Mobilização de Tornozelo (Círculos)", sets: 2, reps: "15 cada", focus: "amplitude articular" },
      { name: "Calf Raise Corporal", sets: 2, reps: "20", focus: "ativação neural" },
      { name: "Alongamento de Gastrocnêmio (parede)", sets: 1, reps: "30s cada", focus: "extensibilidade muscular" },
      { name: "Alongamento de Sóleo (joelho dobrado)", sets: 1, reps: "30s cada", focus: "porção profunda da panturrilha" },
    ],
  },
  geral: {
    label: "GERAL",
    exercises: [
      { name: "Mobilidade Articular Global", sets: 1, reps: "10 cada", focus: "preparação geral" },
      { name: "Cardio Leve", sets: 1, reps: "3-5min", focus: "elevar temperatura corporal" },
      { name: "Ativação de Core", sets: 2, reps: "15", focus: "estabilização" },
    ],
  },
};

export function detectMuscleGroups(exercises: Array<{ name?: string; muscle_target?: string }>): MuscleGroup[] {
  if (!exercises?.length) return ["geral"];
  const haystack = exercises
    .map(e => `${e?.name ?? ""} ${e?.muscle_target ?? ""}`.toLowerCase())
    .join(" | ");

  const hits = new Set<MuscleGroup>();
  (Object.keys(KEYWORDS) as Array<keyof typeof KEYWORDS>).forEach(g => {
    if (KEYWORDS[g].some(k => haystack.includes(k))) hits.add(g);
  });

  // combine quad + posterior into inferiores_full
  if (hits.has("quadriceps") && hits.has("posterior")) {
    hits.delete("quadriceps");
    hits.delete("posterior");
    hits.add("inferiores_full");
  }

  if (hits.size === 0) return ["geral"];
  return Array.from(hits);
}

export function buildWarmup(groups: MuscleGroup[]): { label: string; exercises: WarmupExercise[]; isFallback: boolean } {
  if (!groups.length || (groups.length === 1 && groups[0] === "geral")) {
    return { label: "GERAL", exercises: LIB.geral.exercises, isFallback: true };
  }
  if (groups.length === 1) {
    const g = LIB[groups[0]];
    return { label: g.label, exercises: g.exercises, isFallback: false };
  }
  // mixed: 2-3 from each, max 6 total
  const perGroup = groups.length === 2 ? 3 : 2;
  const list: WarmupExercise[] = [];
  groups.forEach(g => list.push(...LIB[g].exercises.slice(0, perGroup)));
  return {
    label: groups.map(g => LIB[g].label).join(" + "),
    exercises: list.slice(0, 6),
    isFallback: false,
  };
}

export function groupKey(groups: MuscleGroup[]): string {
  return groups.slice().sort().join("+");
}
