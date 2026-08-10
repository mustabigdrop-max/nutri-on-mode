/** Desafio 21 Dias — Atleta Híbrido. Motor 100% local (localStorage), sem backend. */

export type DayType =
  | "musculacao_superior"
  | "musculacao_inferior"
  | "corrida_leve"
  | "corrida_intensa"
  | "descanso";

export type RunLevel = "never" | "sometimes" | "regular" | "frequent";
export type GymLevel = "beginner" | "intermediate" | "advanced" | "elite";
export type Goal = "cut" | "transition" | "race" | "conditioning";
export type DaysPerWeek = 3 | 4 | 5 | 6;

export interface DayPlan {
  day: number;
  type: DayType;
  label: string;
}

export interface DesafioConfig {
  id: string;
  startDate: string;
  runLevel: RunLevel;
  gymLevel: GymLevel;
  goal: Goal;
  daysPerWeek: DaysPerWeek;
  currentDay: number;
  completedDays: number[];
  streak: number;
  maxStreak: number;
  totalXP: number;
  nutritionDays: number[];
  photoDays: number[];
  badges: string[];
}

export const STORAGE_KEY = "nutrion:desafio21";

/* ─────────── Nutrição adaptativa ─────────── */

export interface NutritionRule {
  carbMultiplier: number;
  proteinMultiplier: number;
  fatMultiplier: number;
  preTreino: { carb: number; protein: number } | null;
  posTreino: { carb: number; protein: number } | null;
  tip: string;
}

export const nutritionByDayType: Record<DayType, NutritionRule> = {
  musculacao_superior: {
    carbMultiplier: 1.0,
    proteinMultiplier: 1.0,
    fatMultiplier: 1.0,
    preTreino: { carb: 40, protein: 30 },
    posTreino: { carb: 50, protein: 40 },
    tip: "Dia de upper body: foco em proteína distribuída a cada 3h.",
  },
  musculacao_inferior: {
    carbMultiplier: 1.15,
    proteinMultiplier: 1.0,
    fatMultiplier: 0.9,
    preTreino: { carb: 50, protein: 30 },
    posTreino: { carb: 60, protein: 40 },
    tip: "Dia de perna: carb elevado para proteger performance e recuperação.",
  },
  corrida_leve: {
    carbMultiplier: 0.85,
    proteinMultiplier: 1.0,
    fatMultiplier: 1.1,
    preTreino: { carb: 30, protein: 20 },
    posTreino: { carb: 30, protein: 30 },
    tip: "Corrida leve (Zona 2): gordura como combustível principal. Hidratação reforçada.",
  },
  corrida_intensa: {
    carbMultiplier: 1.1,
    proteinMultiplier: 1.05,
    fatMultiplier: 0.9,
    preTreino: { carb: 45, protein: 25 },
    posTreino: { carb: 50, protein: 35 },
    tip: "Corrida intensa (Tempo/Intervalos): glicogênio é rei. Carb loading.",
  },
  descanso: {
    carbMultiplier: 0.75,
    proteinMultiplier: 1.0,
    fatMultiplier: 1.15,
    preTreino: null,
    posTreino: null,
    tip: "Dia de recuperação: proteína alta, carb reduzido. Foco em sono e hidratação.",
  },
};

/** Baseline por objetivo (referência de 80kg — didático, sem backend). */
const GOAL_BASELINE: Record<Goal, { kcal: number; protein: number; carb: number; fat: number }> = {
  cut: { kcal: 2400, protein: 200, carb: 240, fat: 70 },
  transition: { kcal: 2800, protein: 210, carb: 300, fat: 85 },
  race: { kcal: 2900, protein: 190, carb: 340, fat: 80 },
  conditioning: { kcal: 2650, protein: 200, carb: 280, fat: 78 },
};

export function computeNutrition(goal: Goal, type: DayType) {
  const base = GOAL_BASELINE[goal];
  const rule = nutritionByDayType[type];
  const protein = Math.round(base.protein * rule.proteinMultiplier);
  const carb = Math.round(base.carb * rule.carbMultiplier);
  const fat = Math.round(base.fat * rule.fatMultiplier);
  const kcal = Math.round(protein * 4 + carb * 4 + fat * 9);
  return { kcal, protein, carb, fat, rule };
}

/* ─────────── Treinos por tipo de dia ─────────── */

export const WORKOUTS: Record<string, string[]> = {
  push: [
    "Supino reto — 4x8-12",
    "Desenvolvimento — 3x10-12",
    "Crucifixo inclinado — 3x12-15",
    "Elevação lateral — 4x12-15",
    "Tríceps corda — 3x12-15",
    "Tríceps francês — 3x10-12",
  ],
  pull: [
    "Puxada alta — 4x8-12",
    "Remada curvada — 4x8-12",
    "Remada unilateral — 3x10-12",
    "Face pull — 3x15",
    "Rosca direta — 3x10-12",
    "Rosca martelo — 3x12-15",
  ],
  legs: [
    "Agachamento — 4x6-10",
    "Leg press — 3x10-12",
    "Cadeira extensora — 3x12-15",
    "Stiff — 3x8-12",
    "Mesa flexora — 3x12-15",
    "Panturrilha em pé — 4x15-20",
  ],
  rest_active: [
    "Caminhada leve — 20-30min",
    "Mobilidade de quadril e tornozelo — 10min",
    "Alongamento global — 10min",
    "Respiração diafragmática — 5min",
  ],
  rest_full: [
    "Descanso total",
    "Priorize 7-9h de sono",
    "Hidratação: 35ml/kg",
  ],
};

export function workoutFor(plan: DayPlan): string[] {
  if (plan.type === "musculacao_inferior") return WORKOUTS.legs;
  if (plan.type === "musculacao_superior") return plan.label.toLowerCase().includes("pull") ? WORKOUTS.pull : WORKOUTS.push;
  if (plan.type === "descanso") return plan.label.toLowerCase().includes("ativa") ? WORKOUTS.rest_active : WORKOUTS.rest_full;
  if (plan.type === "corrida_leve") {
    return [
      `Aquecimento — 5min caminhada`,
      plan.label.replace(/^.*—\s*/, "Bloco principal — "),
      "Zona 2: consegue conversar frases inteiras",
      "Desaquecimento — 5min + mobilidade",
    ];
  }
  return [
    "Aquecimento — 10min progressivo",
    plan.label.replace(/^.*—\s*/, "Bloco principal — "),
    "Recuperação entre blocos: trote leve",
    "Desaquecimento — 8min + alongamento",
  ];
}

/* ─────────── Templates 21 dias ─────────── */

const P = (day: number, type: DayType, label: string): DayPlan => ({ day, type, label });

function template5(): DayPlan[] {
  return [
    P(1, "musculacao_superior", "Push (Peito/Ombro/Tríceps)"),
    P(2, "corrida_leve", "Corrida Zona 2 — 25min"),
    P(3, "musculacao_inferior", "Pernas Completo"),
    P(4, "descanso", "Recuperação Ativa"),
    P(5, "musculacao_superior", "Pull (Costas/Bíceps)"),
    P(6, "corrida_leve", "Corrida Zona 2 — 30min"),
    P(7, "descanso", "Descanso Total"),
    P(8, "musculacao_superior", "Push (Peito/Ombro/Tríceps)"),
    P(9, "corrida_intensa", "Tempo Run — 20min"),
    P(10, "musculacao_inferior", "Pernas Completo"),
    P(11, "descanso", "Recuperação Ativa"),
    P(12, "musculacao_superior", "Pull (Costas/Bíceps)"),
    P(13, "corrida_leve", "Long Run — 35min Zona 2"),
    P(14, "descanso", "Descanso Total"),
    P(15, "musculacao_superior", "Push — Intensidade Máxima"),
    P(16, "corrida_intensa", "Intervalos — 6x400m"),
    P(17, "musculacao_inferior", "Pernas — Intensidade Máxima"),
    P(18, "descanso", "Recuperação Ativa"),
    P(19, "musculacao_superior", "Pull — Intensidade Máxima"),
    P(20, "corrida_intensa", "Tempo Run Final — 25min"),
    P(21, "descanso", "DIA FINAL — Resultado"),
  ];
}

function template3(): DayPlan[] {
  const week = (o: number, run: DayPlan, legsLabel: string, pushLabel: string): DayPlan[] => [
    P(o + 1, "musculacao_superior", pushLabel),
    P(o + 2, "descanso", "Recuperação Ativa"),
    { ...run, day: o + 3 },
    P(o + 4, "descanso", "Descanso Total"),
    P(o + 5, "musculacao_inferior", legsLabel),
    P(o + 6, "descanso", "Recuperação Ativa"),
    P(o + 7, "descanso", "Descanso Total"),
  ];
  return [
    ...week(0, P(3, "corrida_leve", "Corrida Zona 2 — 25min"), "Pernas Completo", "Full Body Superior"),
    ...week(7, P(10, "corrida_intensa", "Tempo Run — 20min"), "Pernas Completo", "Full Body Superior"),
    ...week(14, P(17, "corrida_intensa", "Intervalos — 6x400m"), "Pernas — Intensidade Máxima", "Superior — Intensidade Máxima").map((d) =>
      d.day === 21 ? P(21, "descanso", "DIA FINAL — Resultado") : d,
    ),
  ];
}

function template4(): DayPlan[] {
  const week = (o: number, run: DayPlan, suffix: string): DayPlan[] => [
    P(o + 1, "musculacao_superior", `Push (Peito/Ombro/Tríceps)${suffix}`),
    { ...run, day: o + 2 },
    P(o + 3, "musculacao_inferior", `Pernas Completo${suffix}`),
    P(o + 4, "descanso", "Recuperação Ativa"),
    P(o + 5, "musculacao_superior", `Pull (Costas/Bíceps)${suffix}`),
    P(o + 6, "descanso", "Recuperação Ativa"),
    P(o + 7, "descanso", "Descanso Total"),
  ];
  return [
    ...week(0, P(2, "corrida_leve", "Corrida Zona 2 — 25min"), ""),
    ...week(7, P(9, "corrida_intensa", "Tempo Run — 20min"), ""),
    ...week(14, P(16, "corrida_intensa", "Tempo Run Final — 25min"), " — Intensidade Máxima").map((d) =>
      d.day === 21 ? P(21, "descanso", "DIA FINAL — Resultado") : d,
    ),
  ];
}

function template6(): DayPlan[] {
  const week = (o: number, r1: DayPlan, r2: DayPlan, suffix: string): DayPlan[] => [
    P(o + 1, "musculacao_superior", `Push (Peito/Ombro/Tríceps)${suffix}`),
    { ...r1, day: o + 2 },
    P(o + 3, "musculacao_inferior", `Pernas Completo${suffix}`),
    P(o + 4, "musculacao_superior", `Pull (Costas/Bíceps)${suffix}`),
    P(o + 5, "descanso", "Recuperação Ativa"),
    { ...r2, day: o + 6 },
    P(o + 7, "musculacao_superior", `Ombros + Braços${suffix}`),
  ];
  return [
    ...week(0, P(2, "corrida_leve", "Corrida Zona 2 — 25min"), P(6, "corrida_leve", "Corrida Zona 2 — 30min"), ""),
    ...week(7, P(9, "corrida_intensa", "Tempo Run — 20min"), P(13, "corrida_leve", "Long Run — 35min Zona 2"), ""),
    ...week(14, P(16, "corrida_intensa", "Intervalos — 6x400m"), P(20, "corrida_intensa", "Tempo Run Final — 25min"), " — Intensidade Máxima").map((d) =>
      d.day === 21 ? P(21, "descanso", "DIA FINAL — Resultado") : d,
    ),
  ];
}

export const TEMPLATES: Record<DaysPerWeek, DayPlan[]> = {
  3: template3(),
  4: template4(),
  5: template5(),
  6: template6(),
};

export function getPlan(cfg: DesafioConfig): DayPlan[] {
  return TEMPLATES[cfg.daysPerWeek] ?? TEMPLATES[5];
}

export const DISTRIBUTION: Record<DaysPerWeek, string> = {
  3: "2 musculação + 1 corrida",
  4: "3 musculação + 1 corrida",
  5: "3 musculação + 2 corrida",
  6: "4 musculação + 2 corrida",
};

/* ─────────── XP e badges ─────────── */

export const XP_BY_TYPE: Record<DayType, number> = {
  musculacao_superior: 100,
  musculacao_inferior: 100,
  corrida_leve: 120,
  corrida_intensa: 120,
  descanso: 50,
};

export const XP_NUTRITION = 30;
export const XP_PHOTO = 40;

export interface BadgeDef {
  id: string;
  name: string;
  desc: string;
  icon: string;
}

export const BADGES: BadgeDef[] = [
  { id: "first_run", name: "Primeiro Passo", desc: "Completou a primeira corrida", icon: "Footprints" },
  { id: "iron_legs", name: "Pernas de Ferro", desc: "Treinou perna e correu na mesma semana", icon: "Zap" },
  { id: "week1", name: "Fundação Sólida", desc: "Completou a Semana 1", icon: "Shield" },
  { id: "streak7", name: "Imparável", desc: "7 dias seguidos", icon: "Flame" },
  { id: "hybrid_beast", name: "Fera Híbrida", desc: "Completou o Desafio 21 Dias", icon: "Trophy" },
  { id: "nutrition_sync", name: "NutriSync Ativo", desc: "Registrou nutrição em 15+ dias", icon: "Utensils" },
  { id: "no_skip", name: "Sem Desculpa", desc: "Zero dias perdidos", icon: "CheckCircle" },
];

export function evaluateBadges(cfg: DesafioConfig): string[] {
  const plan = getPlan(cfg);
  const done = new Set(cfg.completedDays);
  const typeOf = (d: number) => plan.find((p) => p.day === d)?.type;
  const earned: string[] = [];

  if (cfg.completedDays.some((d) => String(typeOf(d)).startsWith("corrida"))) earned.push("first_run");

  for (let w = 0; w < 3; w++) {
    const days = [1, 2, 3, 4, 5, 6, 7].map((i) => w * 7 + i).filter((d) => done.has(d));
    const hasLegs = days.some((d) => typeOf(d) === "musculacao_inferior");
    const hasRun = days.some((d) => String(typeOf(d)).startsWith("corrida"));
    if (hasLegs && hasRun) { earned.push("iron_legs"); break; }
  }

  if ([1, 2, 3, 4, 5, 6, 7].every((d) => done.has(d))) earned.push("week1");
  if (cfg.maxStreak >= 7) earned.push("streak7");
  if (cfg.completedDays.length >= 21) earned.push("hybrid_beast");
  if (cfg.nutritionDays.length >= 15) earned.push("nutrition_sync");
  if (getMissedDays(cfg).length === 0 && cfg.completedDays.length >= 21) earned.push("no_skip");

  return earned;
}

/** Dias já ultrapassados que não foram concluídos. */
export function getMissedDays(cfg: DesafioConfig): number[] {
  const missed: number[] = [];
  for (let d = 1; d < cfg.currentDay; d++) if (!cfg.completedDays.includes(d)) missed.push(d);
  return missed;
}

export function streakBonus(streak: number): number {
  if (streak === 14) return 300;
  if (streak === 7) return 150;
  if (streak === 3) return 50;
  return 0;
}

export function weekBonus(cfg: DesafioConfig, day: number): number {
  if (day % 7 !== 0) return 0;
  const start = day - 6;
  const all = Array.from({ length: 7 }, (_, i) => start + i).every((d) => cfg.completedDays.includes(d));
  return all ? 200 : 0;
}

/* ─────────── Persistência ─────────── */

export function createConfig(input: {
  runLevel: RunLevel; gymLevel: GymLevel; goal: Goal; daysPerWeek: DaysPerWeek;
}): DesafioConfig {
  return {
    id: crypto.randomUUID(),
    startDate: new Date().toISOString(),
    ...input,
    currentDay: 1,
    completedDays: [],
    streak: 0,
    maxStreak: 0,
    totalXP: 0,
    nutritionDays: [],
    photoDays: [],
    badges: [],
  };
}

export function loadConfig(): DesafioConfig | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DesafioConfig;
    return {
      ...parsed,
      completedDays: parsed.completedDays ?? [],
      nutritionDays: parsed.nutritionDays ?? [],
      photoDays: parsed.photoDays ?? [],
      badges: parsed.badges ?? [],
      maxStreak: parsed.maxStreak ?? parsed.streak ?? 0,
    };
  } catch {
    return null;
  }
}

export function saveConfig(cfg: DesafioConfig) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
}

export function clearConfig() {
  localStorage.removeItem(STORAGE_KEY);
}

/** Marca o dia atual como concluído e aplica XP + badges. */
export function completeDay(cfg: DesafioConfig, opts: { nutrition?: boolean; photo?: boolean } = {}): {
  next: DesafioConfig; xpGained: number; newBadges: string[];
} {
  const day = cfg.currentDay;
  if (cfg.completedDays.includes(day)) return { next: cfg, xpGained: 0, newBadges: [] };

  const plan = getPlan(cfg);
  const type = plan.find((p) => p.day === day)?.type ?? "descanso";
  const streak = cfg.completedDays.includes(day - 1) || day === 1 ? cfg.streak + 1 : 1;

  let xp = XP_BY_TYPE[type] + streakBonus(streak);
  const nutritionDays = opts.nutrition ? [...cfg.nutritionDays, day] : cfg.nutritionDays;
  const photoDays = opts.photo ? [...cfg.photoDays, day] : cfg.photoDays;
  if (opts.nutrition) xp += XP_NUTRITION;
  if (opts.photo) xp += XP_PHOTO;

  const completedDays = [...cfg.completedDays, day].sort((a, b) => a - b);
  const interim: DesafioConfig = {
    ...cfg,
    completedDays,
    nutritionDays,
    photoDays,
    streak,
    maxStreak: Math.max(cfg.maxStreak, streak),
    currentDay: Math.min(day + 1, 21),
    totalXP: cfg.totalXP + xp,
  };
  const wBonus = weekBonus(interim, day);
  interim.totalXP += wBonus;
  xp += wBonus;

  const earned = evaluateBadges(interim);
  const newBadges = earned.filter((b) => !cfg.badges.includes(b));
  interim.badges = Array.from(new Set([...cfg.badges, ...earned]));

  return { next: interim, xpGained: xp, newBadges };
}

/** Estatísticas agregadas para header e card final. */
export function getStats(cfg: DesafioConfig) {
  const plan = getPlan(cfg);
  const typeOf = (d: number) => plan.find((p) => p.day === d)?.type;
  const gym = cfg.completedDays.filter((d) => String(typeOf(d)).startsWith("musculacao")).length;
  const runs = cfg.completedDays.filter((d) => String(typeOf(d)).startsWith("corrida")).length;
  const rest = cfg.completedDays.filter((d) => typeOf(d) === "descanso").length;
  return {
    gym, runs, rest,
    completed: cfg.completedDays.length,
    progress: Math.round((cfg.completedDays.length / 21) * 100),
    missed: getMissedDays(cfg),
    badges: cfg.badges.length,
  };
}

export const DAY_TYPE_META: Record<DayType, { label: string; color: string }> = {
  musculacao_superior: { label: "MUSCULAÇÃO — SUPERIOR", color: "#00D4FF" },
  musculacao_inferior: { label: "MUSCULAÇÃO — INFERIOR", color: "#00D4FF" },
  corrida_leve: { label: "CORRIDA — LEVE (ZONA 2)", color: "#00FF88" },
  corrida_intensa: { label: "CORRIDA — INTENSA", color: "#00FF88" },
  descanso: { label: "DESCANSO / RECUPERAÇÃO", color: "#FFB800" },
};

export const CAPTIONS = [
  {
    id: "motivacional",
    label: "Motivacional",
    text: `21 dias. Sem desculpa. Sem meio termo.
Provei que dá pra correr E construir. 💪🏃
Desafio Atleta Híbrido — nutriON ✅

#AtletaHibrido #nutriON #DesafioCompleto #RunAndLift`,
  },
  {
    id: "educativo",
    label: "Educativo",
    text: `Corrida mata músculo? Não se você souber programar.
21 dias combinando ferro + asfalto com ciência.
Cada dia de treino teve a nutrição ajustada automaticamente.
Resultado: mais condicionado, sem perder massa.

Desafio 21 Dias — @diogomello180
#nutriON #CorridaEMusculacao #TreinoConcorrente`,
  },
  {
    id: "provocativo",
    label: "Provocativo",
    text: `"Escolhe um: ou corre ou levanta peso."
Escolhi os dois. 21 dias seguidos. 💀
Próximo argumento?

@diogomello180 | nutrion.app.br
#SemDesculpa #AtletaHibrido #nutriON`,
  },
];
