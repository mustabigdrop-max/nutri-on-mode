export type MuscleGroup =
  | "peito" | "costas" | "ombros" | "bracos"
  | "quadriceps" | "posterior" | "inferiores_full"
  | "panturrilha" | "geral";

export type WarmupType =
  | "QUADRICEPS" | "POSTERIOR_GLUTEOS" | "INFERIORES_COMPLETO" | "INFERIORES_GERAL"
  | "PEITO" | "COSTAS" | "OMBROS" | "BRACOS"
  | "PUSH" | "PULL" | "PEITO_COSTAS" | "SUPERIOR_GERAL"
  | "FULL_BODY" | "PANTURRILHA" | "CORE" | "GERAL";

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

const LIB_BY_TYPE: Record<WarmupType, { label: string; exercises: WarmupExercise[] }> = {
  QUADRICEPS: {
    label: "QUADRÍCEPS",
    exercises: [
      { name: "Rotação de Quadril (Círculos)", sets: 2, reps: "10 cada", focus: "mobilidade de quadril" },
      { name: "Agachamento com Peso Corporal", sets: 2, reps: "15", focus: "ativação neural do padrão de squat" },
      { name: "Leg Extension Leve (30% da carga)", sets: 2, reps: "15", focus: "ativação isolada do quadríceps" },
      { name: "Alongamento de Psoas (Fenda)", sets: 1, reps: "30s cada", focus: "liberação do flexor do quadril" },
      { name: "Mini-band Walk Lateral", sets: 2, reps: "15 cada", focus: "ativação do glúteo médio" },
    ],
  },
  POSTERIOR_GLUTEOS: {
    label: "POSTERIOR & GLÚTEOS",
    exercises: [
      { name: "Hip Hinge com Bastão", sets: 2, reps: "10", focus: "padrão de dobradiça de quadril" },
      { name: "Glute Bridge Corporal", sets: 2, reps: "15", focus: "ativação neural do glúteo" },
      { name: "Leg Curl Leve (30% da carga)", sets: 2, reps: "15", focus: "ativação dos isquiotibiais" },
      { name: "Alongamento de Piriforme", sets: 1, reps: "30s cada", focus: "liberação glúteo profundo" },
      { name: "Abdução de Quadril com Elástico", sets: 2, reps: "15", focus: "glúteo médio e mínimo" },
    ],
  },
  INFERIORES_COMPLETO: {
    label: "INFERIORES COMPLETO",
    exercises: [
      { name: "Rotação de Quadril", sets: 2, reps: "10 cada", focus: "mobilidade de quadril" },
      { name: "Agachamento Corporal", sets: 2, reps: "15", focus: "ativação neural de inferiores" },
      { name: "Hip Hinge com Bastão", sets: 2, reps: "10", focus: "padrão de dobradiça" },
      { name: "Glute Bridge Corporal", sets: 2, reps: "15", focus: "ativação do glúteo" },
      { name: "Leg Extension Leve", sets: 2, reps: "12", focus: "ativação do quadríceps" },
      { name: "Vacuum Abdominal", sets: 3, reps: "20-30s", focus: "estabilização lombar" },
    ],
  },
  INFERIORES_GERAL: {
    label: "INFERIORES",
    exercises: [
      { name: "Rotação de Quadril", sets: 2, reps: "10 cada", focus: "mobilidade de quadril" },
      { name: "Agachamento Corporal", sets: 2, reps: "15", focus: "ativação neural de inferiores" },
      { name: "Glute Bridge Corporal", sets: 2, reps: "15", focus: "ativação do glúteo" },
      { name: "Vacuum Abdominal", sets: 2, reps: "20-30s", focus: "estabilização lombar" },
    ],
  },
  PEITO: {
    label: "PEITORAL",
    exercises: [
      { name: "Band Pull-Apart", sets: 3, reps: "15-20", focus: "ativação do manguito rotador" },
      { name: "Rotação Interna de Ombro", sets: 2, reps: "15", focus: "preparação do deltóide anterior" },
      { name: "Push-up Parcial", sets: 2, reps: "10", focus: "ativação neural do peitoral" },
      { name: "Mobilidade Torácica (Cat-Cow)", sets: 1, reps: "10", focus: "extensão torácica para press" },
    ],
  },
  PUSH: {
    label: "PUSH — PEITO + OMBROS + TRÍCEPS",
    exercises: [
      { name: "Band Pull-Apart", sets: 3, reps: "15", focus: "manguito rotador e escapular" },
      { name: "Rotação Externa de Ombro", sets: 2, reps: "15", focus: "estabilização glenoumeral" },
      { name: "Push-up Parcial", sets: 2, reps: "10", focus: "ativação neural do peitoral" },
      { name: "Press Militar Leve (barra vazia)", sets: 2, reps: "10", focus: "padrão de movimento overhead" },
      { name: "Extensão de Tríceps com Elástico", sets: 2, reps: "12", focus: "ativação neural do tríceps" },
    ],
  },
  PULL: {
    label: "PULL — COSTAS + BÍCEPS",
    exercises: [
      { name: "Dislocação com Bastão", sets: 2, reps: "10", focus: "mobilidade de ombro e escápula" },
      { name: "Face Pull com Elástico", sets: 3, reps: "15", focus: "manguito e retratores escapulares" },
      { name: "Dead Hang", sets: 2, reps: "20-30s", focus: "descompressão e ativação do lat" },
      { name: "Rosca com Elástico Leve", sets: 2, reps: "15", focus: "ativação neural do bíceps" },
    ],
  },
  COSTAS: {
    label: "COSTAS",
    exercises: [
      { name: "Dislocação com Bastão", sets: 2, reps: "10", focus: "mobilidade de ombro e escápula" },
      { name: "Face Pull com Elástico", sets: 3, reps: "15", focus: "ativação do manguito e retratores" },
      { name: "Dead Hang", sets: 2, reps: "20-30s", focus: "descompressão e ativação do lat" },
      { name: "Remada com Elástico Leve", sets: 2, reps: "15", focus: "ativação neural pré-treino de costas" },
    ],
  },
  OMBROS: {
    label: "OMBROS",
    exercises: [
      { name: "Rotação Externa de Ombro", sets: 3, reps: "15", focus: "manguito rotador" },
      { name: "Y-T-W com Elástico", sets: 2, reps: "10 cada", focus: "estabilizadores escapulares" },
      { name: "Elevação Lateral Leve (20%)", sets: 2, reps: "15", focus: "ativação do deltóide médio" },
      { name: "Press Militar Leve", sets: 2, reps: "10", focus: "padrão de movimento" },
    ],
  },
  BRACOS: {
    label: "BRAÇOS",
    exercises: [
      { name: "Rotação de Punho", sets: 2, reps: "20", focus: "aquecimento articular" },
      { name: "Extensão de Tríceps com Elástico", sets: 2, reps: "15", focus: "ativação neural do tríceps" },
      { name: "Rosca com Elástico Leve", sets: 2, reps: "15", focus: "ativação neural do bíceps" },
      { name: "Mobilidade de Cotovelo", sets: 1, reps: "10", focus: "articulação úmero-rádio-ulnar" },
    ],
  },
  PEITO_COSTAS: {
    label: "PEITO + COSTAS",
    exercises: [
      { name: "Band Pull-Apart", sets: 3, reps: "15", focus: "manguito e escapular" },
      { name: "Dislocação com Bastão", sets: 2, reps: "10", focus: "mobilidade de ombro" },
      { name: "Push-up Parcial", sets: 2, reps: "10", focus: "ativação do peitoral" },
      { name: "Dead Hang", sets: 2, reps: "20s", focus: "ativação do lat" },
      { name: "Face Pull com Elástico", sets: 2, reps: "15", focus: "retratores e manguito" },
    ],
  },
  SUPERIOR_GERAL: {
    label: "SUPERIOR",
    exercises: [
      { name: "Band Pull-Apart", sets: 3, reps: "15", focus: "manguito rotador e escapular" },
      { name: "Dislocação com Bastão", sets: 2, reps: "10", focus: "mobilidade de ombro" },
      { name: "Rotação Externa de Ombro", sets: 2, reps: "15", focus: "estabilização glenoumeral" },
      { name: "Mobilidade Torácica (Cat-Cow)", sets: 1, reps: "10", focus: "extensão torácica" },
    ],
  },
  FULL_BODY: {
    label: "FULL BODY",
    exercises: [
      { name: "Band Pull-Apart", sets: 2, reps: "15", focus: "manguito e escapular" },
      { name: "Agachamento Corporal", sets: 2, reps: "15", focus: "ativação neural de inferiores" },
      { name: "Hip Hinge com Bastão", sets: 2, reps: "10", focus: "padrão de dobradiça" },
      { name: "Mobilidade Torácica", sets: 1, reps: "10", focus: "extensão torácica" },
      { name: "Rotação de Quadril", sets: 2, reps: "10", focus: "mobilidade de quadril" },
    ],
  },
  PANTURRILHA: {
    label: "PANTURRILHA",
    exercises: [
      { name: "Mobilização de Tornozelo", sets: 2, reps: "15 cada", focus: "amplitude articular" },
      { name: "Calf Raise Corporal", sets: 2, reps: "20", focus: "ativação neural" },
      { name: "Alongamento de Gastrocnêmio", sets: 1, reps: "30s", focus: "extensibilidade muscular" },
      { name: "Alongamento de Sóleo", sets: 1, reps: "30s", focus: "porção profunda" },
    ],
  },
  CORE: {
    label: "CORE",
    exercises: [
      { name: "Vacuum Abdominal", sets: 3, reps: "20-30s", focus: "estabilização profunda" },
      { name: "Dead Bug", sets: 2, reps: "10 cada", focus: "controle lombo-pélvico" },
      { name: "Bird Dog", sets: 2, reps: "10 cada", focus: "estabilização cruzada" },
      { name: "Prancha Curta", sets: 2, reps: "20-30s", focus: "ativação global do core" },
    ],
  },
  GERAL: {
    label: "AQUECIMENTO GERAL",
    exercises: [
      { name: "Mobilidade Articular Geral", sets: 2, reps: "10", focus: "preparação articular" },
      { name: "Agachamento Corporal", sets: 2, reps: "15", focus: "ativação de inferiores" },
      { name: "Band Pull-Apart", sets: 2, reps: "15", focus: "ativação escapular" },
      { name: "Rotação de Quadril", sets: 2, reps: "10", focus: "mobilidade de quadril" },
    ],
  },
};

function detectUpperType(g: string[]): WarmupType {
  if (g.some(x => x.includes("peitoral") || x.includes("peito"))) {
    if (g.some(x => x.includes("costas") || x.includes("dorsal"))) return "PEITO_COSTAS";
    if (g.some(x => x.includes("ombro") || x.includes("tríceps") || x.includes("triceps"))) return "PUSH";
    return "PEITO";
  }
  if (g.some(x => x.includes("costas") || x.includes("dorsal"))) {
    if (g.some(x => x.includes("bíceps") || x.includes("biceps"))) return "PULL";
    return "COSTAS";
  }
  if (g.some(x => x.includes("ombro") || x.includes("deltóide") || x.includes("deltoide"))) return "OMBROS";
  if (g.some(x => x.includes("bíceps") || x.includes("biceps") || x.includes("tríceps") || x.includes("triceps"))) return "BRACOS";
  return "SUPERIOR_GERAL";
}

function detectLowerType(g: string[]): WarmupType {
  const temQuad = g.some(x => x.includes("quadríceps") || x.includes("quadriceps"));
  const temPost = g.some(x => x.includes("posterior") || x.includes("isquiotibial") || x.includes("glúteo") || x.includes("gluteo"));
  const temPant = g.some(x => x.includes("panturrilha") || x.includes("sóleo") || x.includes("soleo"));
  if (temQuad && temPost) return "INFERIORES_COMPLETO";
  if (temQuad) return "QUADRICEPS";
  if (temPost) return "POSTERIOR_GLUTEOS";
  if (temPant) return "PANTURRILHA";
  return "INFERIORES_GERAL";
}

export function detectWarmupType(grupamentosDoDia: string[]): WarmupType {
  if (!grupamentosDoDia?.length) return "GERAL";
  const g = grupamentosDoDia.map(x => (x || "").toLowerCase());

  const temSuperior = g.some(x =>
    x.includes("peitoral") || x.includes("peito") ||
    x.includes("costas") || x.includes("dorsal") ||
    x.includes("ombro") || x.includes("deltóide") || x.includes("deltoide") ||
    x.includes("bíceps") || x.includes("biceps") ||
    x.includes("tríceps") || x.includes("triceps") ||
    x.includes("trapézio") || x.includes("trapezio") ||
    x.includes("antebraço") || x.includes("antebraco")
  );
  const temInferior = g.some(x =>
    x.includes("quadríceps") || x.includes("quadriceps") ||
    x.includes("glúteo") || x.includes("gluteo") ||
    x.includes("posterior") || x.includes("isquiotibial") ||
    x.includes("panturrilha") || x.includes("sóleo") || x.includes("soleo") ||
    x.includes("perna") || x.includes("legs")
  );
  const temCore = g.some(x =>
    x.includes("core") || x.includes("abdômen") || x.includes("abdomen") || x.includes("lombar")
  );

  if (temSuperior && temInferior) return "FULL_BODY";
  if (temSuperior) return detectUpperType(g);
  if (temInferior) return detectLowerType(g);
  if (temCore) return "CORE";
  return "GERAL";
}

export function buildWarmupFromGroupings(grupamentosDoDia: string[]): {
  label: string;
  exercises: WarmupExercise[];
  isFallback: boolean;
  type: WarmupType;
  badge: string;
} {
  const type = detectWarmupType(grupamentosDoDia || []);
  const lib = LIB_BY_TYPE[type];
  const badge = (grupamentosDoDia || []).filter(Boolean).join(" + ").toUpperCase() || lib.label;
  return {
    label: lib.label,
    exercises: lib.exercises,
    isFallback: type === "GERAL",
    type,
    badge,
  };
}

/* ---------- legacy exercise-name-based detection (fallback) ---------- */

export function detectMuscleGroups(exercises: Array<{ name?: string; muscle_target?: string }>): MuscleGroup[] {
  if (!exercises?.length) return ["geral"];
  const haystack = exercises
    .map(e => `${e?.name ?? ""} ${e?.muscle_target ?? ""}`.toLowerCase())
    .join(" | ");

  const hits = new Set<MuscleGroup>();
  (Object.keys(KEYWORDS) as Array<keyof typeof KEYWORDS>).forEach(g => {
    if (KEYWORDS[g].some(k => haystack.includes(k))) hits.add(g);
  });

  if (hits.has("quadriceps") && hits.has("posterior")) {
    hits.delete("quadriceps");
    hits.delete("posterior");
    hits.add("inferiores_full");
  }

  if (hits.size === 0) return ["geral"];
  return Array.from(hits);
}

const MUSCLE_TO_TYPE: Record<MuscleGroup, WarmupType> = {
  peito: "PEITO", costas: "COSTAS", ombros: "OMBROS", bracos: "BRACOS",
  quadriceps: "QUADRICEPS", posterior: "POSTERIOR_GLUTEOS",
  inferiores_full: "INFERIORES_COMPLETO", panturrilha: "PANTURRILHA", geral: "GERAL",
};

export function buildWarmup(groups: MuscleGroup[]): { label: string; exercises: WarmupExercise[]; isFallback: boolean } {
  if (!groups.length || (groups.length === 1 && groups[0] === "geral")) {
    const g = LIB_BY_TYPE.GERAL;
    return { label: g.label, exercises: g.exercises, isFallback: true };
  }
  if (groups.length === 1) {
    const g = LIB_BY_TYPE[MUSCLE_TO_TYPE[groups[0]]];
    return { label: g.label, exercises: g.exercises, isFallback: false };
  }
  const perGroup = groups.length === 2 ? 3 : 2;
  const list: WarmupExercise[] = [];
  groups.forEach(g => list.push(...LIB_BY_TYPE[MUSCLE_TO_TYPE[g]].exercises.slice(0, perGroup)));
  return {
    label: groups.map(g => LIB_BY_TYPE[MUSCLE_TO_TYPE[g]].label).join(" + "),
    exercises: list.slice(0, 6),
    isFallback: false,
  };
}

export function groupKey(groups: MuscleGroup[]): string {
  return groups.slice().sort().join("+");
}
