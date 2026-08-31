/**
 * FIBER ENGINE — inteligência de fibras musculares (Tipo I / IIA / IIX)
 *
 * Roda automaticamente dentro do fluxo de prescrição do TrainingON.
 * Não pede nada ao profissional: usa objetivo, nível, frequência,
 * equipamentos e pontos fracos já preenchidos na tab PRESCREVER.
 *
 * Base: Johnson et al. 1973 (distribuição de fibras post-mortem);
 * Staron 1994; Schoenfeld 2017 (zonas de repetição); Grgic 2018 (descanso).
 */

export type FiberType = "I" | "IIA" | "IIX";

export type FiberProfile = {
  muscle: string;
  type: FiberType;
  /** % aproximado de fibras tipo I no grupo */
  slowPct: number;
  reps: string;
  rest: string;
  tempo: string;
  sets: string;
  rationale: string;
};

const FIBER_COLORS: Record<FiberType, string> = {
  I: "#38bdf8",
  IIA: "#4ade80",
  IIX: "#f97316",
};

export function fiberColor(type: FiberType) {
  return FIBER_COLORS[type];
}

/** Distribuição aproximada de fibras tipo I por grupo muscular. */
const SLOW_PCT: Record<string, number> = {
  peitoral: 42,
  costas: 50,
  dorsal: 50,
  trapezio: 54,
  ombros: 55,
  "deltoide posterior": 62,
  biceps: 45,
  triceps: 33,
  antebraco: 65,
  quadriceps: 48,
  posterior: 45,
  gluteos: 52,
  panturrilha: 72,
  soleo: 85,
  abdomen: 60,
  lombar: 65,
  core: 60,
};

const ALIASES: Record<string, string> = {
  peito: "peitoral", peitorais: "peitoral", chest: "peitoral", supino: "peitoral", crucifixo: "peitoral", crossover: "peitoral",
  back: "costas", dorsais: "costas", dorsal: "costas", remada: "costas", pulldown: "costas", barra: "costas", pullover: "costas",
  trapezio: "trapezio", encolhimento: "trapezio",
  ombro: "ombros", deltoide: "ombros", shoulders: "ombros", desenvolvimento: "ombros", "elevacao lateral": "ombros",
  "crucifixo inverso": "deltoide posterior", "face pull": "deltoide posterior", posterior_ombro: "deltoide posterior",
  bicep: "biceps", rosca: "biceps", arms: "biceps", bracos: "biceps",
  tricep: "triceps", frances: "triceps", "triceps testa": "triceps", mergulho: "triceps",
  antebracos: "antebraco", forearm: "antebraco", "rosca punho": "antebraco",
  quadriceps: "quadriceps", quadriceps_femoral: "quadriceps", agachamento: "quadriceps", "leg press": "quadriceps", extensora: "quadriceps", hack: "quadriceps", bulgaro: "quadriceps", afundo: "quadriceps",
  isquiotibiais: "posterior", "posterior de coxa": "posterior", hamstring: "posterior", stiff: "posterior", flexora: "posterior", rdl: "posterior",
  gluteo: "gluteos", "hip thrust": "gluteos", "elevacao pelvica": "gluteos", coice: "gluteos",
  panturrilhas: "panturrilha", gemeos: "panturrilha", calf: "panturrilha", "panturrilha em pe": "panturrilha",
  "panturrilha sentado": "soleo", soleus: "soleo",
  abdominal: "abdomen", abs: "abdomen", prancha: "core", core: "core",
  lombares: "lombar", "hiperextensao": "lombar", "good morning": "lombar",
  pernas: "quadriceps", legs: "quadriceps",
};

const norm = (s: string) =>
  (s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

/** Resolve um nome livre (grupo ou exercício) para a chave de grupo muscular. */
export function resolveMuscleKey(input: string): string | null {
  const n = norm(input);
  if (!n) return null;
  if (SLOW_PCT[n] !== undefined) return n;
  for (const [alias, key] of Object.entries(ALIASES)) {
    if (n.includes(alias)) return key;
  }
  for (const key of Object.keys(SLOW_PCT)) {
    if (n.includes(key)) return key;
  }
  return null;
}

function typeFromPct(slowPct: number): FiberType {
  if (slowPct >= 60) return "I";
  if (slowPct >= 45) return "IIA";
  return "IIX";
}

export type FiberContext = {
  goal?: string;
  level?: string;
  weakPoints?: string;
  equipment?: string[];
  frequency?: number | string;
};

const LABEL: Record<string, string> = {
  peitoral: "Peitoral", costas: "Costas", trapezio: "Trapézio", ombros: "Ombros",
  "deltoide posterior": "Deltoide posterior", biceps: "Bíceps", triceps: "Tríceps",
  antebraco: "Antebraço", quadriceps: "Quadríceps", posterior: "Posterior de coxa",
  gluteos: "Glúteos", panturrilha: "Panturrilha", soleo: "Sóleo", abdomen: "Abdômen",
  lombar: "Lombar", core: "Core",
};

/** Perfil de fibras + prescrição de séries/reps/descanso para um grupo muscular. */
export function fiberProfileForMuscle(muscle: string, ctx: FiberContext = {}): FiberProfile | null {
  const key = resolveMuscleKey(muscle);
  if (!key) return null;

  const slowPct = SLOW_PCT[key];
  let type = typeFromPct(slowPct);

  const goal = norm(ctx.goal || "");
  const level = norm(ctx.level || "");
  const isStrength = /forca|força|power|potenc|competi/.test(goal);
  const isEndurance = /resist|condicion|emagrec|definic|cutting/.test(goal);

  // Objetivo desloca a ênfase de recrutamento
  if (isStrength && type === "IIA") type = "IIX";
  if (isEndurance && type === "IIX") type = "IIA";

  let reps: string, rest: string, tempo: string;
  if (type === "IIX") {
    reps = isStrength ? "3-6" : "6-8";
    rest = "3min";
    tempo = "2-0-X-0";
  } else if (type === "IIA") {
    reps = isEndurance ? "10-15" : "8-12";
    rest = "90-120s";
    tempo = "3-1-1-0";
  } else {
    reps = "15-25";
    rest = "45-60s";
    tempo = "2-1-1-1";
  }

  // Nível define amplitude de séries
  const sets = /inici|begin/.test(level) ? "2-3" : /avanc|advanc|elite/.test(level) ? "4-5" : "3-4";

  // Ponto fraco recebe volume/frequência extra
  const weak = norm(ctx.weakPoints || "");
  const isWeak = !!weak && (weak.includes(key) || (resolveMuscleKey(weak) === key));

  const label = LABEL[key] || key;
  const rationale =
    `${label}: ~${slowPct}% de fibras tipo I → perfil ${type}. ` +
    (type === "IIX"
      ? "Predomínio de fibras rápidas: cargas altas, poucas repetições e descanso longo para recuperação do sistema fosfagênico."
      : type === "IIA"
        ? "Perfil misto: zona de hipertrofia clássica com tensão mecânica e estresse metabólico equilibrados."
        : "Predomínio de fibras lentas: alta resistência à fadiga, responde melhor a séries longas e descansos curtos.") +
    (isWeak ? " Marcado como ponto fraco: +2 séries semanais e frequência 3x." : "");

  return { muscle: label, type, slowPct, reps, rest, tempo, sets: isWeak ? `${sets} (+2 sem.)` : sets, rationale };
}

/** Perfil de fibras a partir do nome do exercício. */
export function fiberProfileForExercise(exerciseName: string, muscleTarget?: string, ctx: FiberContext = {}) {
  return (
    (muscleTarget ? fiberProfileForMuscle(muscleTarget, ctx) : null) ||
    fiberProfileForMuscle(exerciseName, ctx)
  );
}

/** Perfis para a lista de grupos selecionados na prescrição. */
export function fiberMap(muscles: string[], ctx: FiberContext = {}): FiberProfile[] {
  const seen = new Set<string>();
  const out: FiberProfile[] = [];
  for (const m of muscles) {
    const p = fiberProfileForMuscle(m, ctx);
    if (p && !seen.has(p.muscle)) { seen.add(p.muscle); out.push(p); }
  }
  return out;
}

/** Bloco de instrução injetado no prompt de geração — 100% derivado do que já foi preenchido. */
export function buildFiberInstruction(muscles: string[], ctx: FiberContext = {}): string {
  const profiles = fiberMap(muscles.length ? muscles : Object.keys(SLOW_PCT), ctx);
  if (!profiles.length) return "";
  const lines = profiles
    .map((p) => `- ${p.muscle} (tipo ${p.type}, ~${p.slowPct}% ST): ${p.sets} séries · ${p.reps} reps · descanso ${p.rest} · tempo ${p.tempo}`)
    .join("\n");

  const equip = (ctx.equipment || []).length
    ? `\nEquipamentos disponíveis (obrigatório respeitar): ${(ctx.equipment || []).join(", ")}.`
    : "";
  const weak = ctx.weakPoints?.trim()
    ? `\nPontos fracos declarados: ${ctx.weakPoints.trim()} — priorizar com exercício no alongado + 2 séries semanais extras.`
    : "";

  return `━━━ PERFIL DE FIBRAS MUSCULARES (APLICADO AUTOMATICAMENTE) ━━━
Prescreva séries, repetições e descanso de cada exercício respeitando o perfil de fibras do grupo alvo:
${lines}${equip}${weak}

Para CADA exercício inclua os campos:
"fiber_type": "I" | "IIA" | "IIX" e "fiber_note": justificativa curta (1 linha) da escolha de reps/descanso.
Referência: Johnson 1973 · Staron 1994 · Schoenfeld 2017 · Grgic 2018.`;
}
