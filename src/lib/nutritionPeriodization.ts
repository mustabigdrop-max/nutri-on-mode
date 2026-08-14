import { safeString } from "@/lib/utils";
/**
 * Periodização nutricional inteligente — fonte de verdade única.
 * Usado por NutriSync (/nutrisync) e Dashboard (/dashboard).
 *
 * Features cobertas:
 *  1. Ciclagem de déficit + refeeds automáticos
 *  2. Diet breaks programados (protocolo MATADOR — Byrne et al., 2018)
 *  3. Proteína relativa (g/kg de massa magra)
 *  4. Target de fibra
 *  5. Indicador de adaptação metabólica
 *  6. Hidratação dinâmica
 *  7. Nutrient timing peri-treino
 *  8. Micronutrientes de atenção no cutting
 */

export const PERIODIZATION_GOLD = "#B8922A";

// ──────────────────────────────────────────────────────────
// Config
// ──────────────────────────────────────────────────────────
export type RefeedTarget = "MANUTENCAO" | "LEVE_SUPERAVIT";

export interface RefeedCycleConfig {
  enabled: boolean;
  deficit_days: number;
  refeed_days: number;
  refeed_target: RefeedTarget;
  /** Data (YYYY-MM-DD) de início do ciclo / do cutting. */
  cycle_start: string;
}

export interface DietBreakConfig {
  enabled: boolean;
  weeks_before_break: number;
  break_duration_weeks: number;
  /** Início da fase de déficit atual (ou fim do último diet break). */
  phase_start: string;
  /** Diet break em andamento (YYYY-MM-DD) ou null. */
  active_start: string | null;
  /** Semanas de adiamento acumuladas. */
  postponed_weeks: number;
}

export interface PeriodizationConfig {
  cycle: RefeedCycleConfig;
  dietBreak: DietBreakConfig;
  /** Liga/desliga cards individuais. */
  modules: {
    refeeds: boolean;
    dietBreak: boolean;
    proteinLbm: boolean;
    fiber: boolean;
    adaptation: boolean;
    hydration: boolean;
    timing: boolean;
    micros: boolean;
  };
}

export function todayISO(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function defaultPeriodizationConfig(startISO = todayISO()): PeriodizationConfig {
  return {
    cycle: {
      enabled: true,
      deficit_days: 5,
      refeed_days: 1,
      refeed_target: "MANUTENCAO",
      cycle_start: startISO,
    },
    dietBreak: {
      enabled: true,
      weeks_before_break: 5,
      break_duration_weeks: 1,
      phase_start: startISO,
      active_start: null,
      postponed_weeks: 0,
    },
    modules: {
      refeeds: true,
      dietBreak: true,
      proteinLbm: true,
      fiber: true,
      adaptation: true,
      hydration: true,
      timing: true,
      micros: true,
    },
  };
}

export function mergePeriodizationConfig(raw: unknown): PeriodizationConfig {
  const base = defaultPeriodizationConfig();
  if (!raw || typeof raw !== "object") return base;
  const r = raw as Partial<PeriodizationConfig>;
  return {
    cycle: { ...base.cycle, ...(r.cycle || {}) },
    dietBreak: { ...base.dietBreak, ...(r.dietBreak || {}) },
    modules: { ...base.modules, ...(r.modules || {}) },
  };
}

// ──────────────────────────────────────────────────────────
// Datas
// ──────────────────────────────────────────────────────────
export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

export function daysBetween(fromISO: string, toDate: Date = new Date()): number {
  const a = parseISODate(fromISO).getTime();
  const b = new Date(toDate.getFullYear(), toDate.getMonth(), toDate.getDate()).getTime();
  return Math.floor((b - a) / 86400000);
}

export function addDaysISO(iso: string, days: number): string {
  const d = parseISODate(iso);
  d.setDate(d.getDate() + days);
  return todayISO(d);
}

// ──────────────────────────────────────────────────────────
// FEATURE 1 — Ciclagem de déficit + refeed
// ──────────────────────────────────────────────────────────
export interface CycleState {
  enabled: boolean;
  cycleLength: number;
  /** Posição 0-based dentro do ciclo. */
  index: number;
  /** Dia 1-based dentro do bloco atual. */
  dayInBlock: number;
  blockLength: number;
  isRefeed: boolean;
  label: string;
}

export function computeCycleState(cfg: RefeedCycleConfig, now: Date = new Date()): CycleState {
  const deficitDays = Math.max(1, Math.round(cfg.deficit_days || 5));
  const refeedDays = Math.max(0, Math.round(cfg.refeed_days ?? 1));
  const cycleLength = deficitDays + refeedDays;
  const elapsed = Math.max(0, daysBetween(cfg.cycle_start, now));
  const index = cycleLength > 0 ? elapsed % cycleLength : 0;
  const isRefeed = refeedDays > 0 && index >= deficitDays;
  const dayInBlock = isRefeed ? index - deficitDays + 1 : index + 1;
  const blockLength = isRefeed ? refeedDays : deficitDays;
  return {
    enabled: Boolean(cfg.enabled) && refeedDays > 0,
    cycleLength,
    index,
    dayInBlock,
    blockLength,
    isRefeed: Boolean(cfg.enabled) && isRefeed,
    label: isRefeed && cfg.enabled
      ? `Dia ${dayInBlock}/${blockLength} — REFEED`
      : `Dia ${dayInBlock}/${blockLength} — Déficit`,
  };
}

export interface MacroSet {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}

/** Recalcula os macros para uma meta calórica maior, jogando o excedente em carboidrato. */
export function rebuildWithCarbs(base: MacroSet, targetKcal: number): MacroSet {
  const kcal = Math.round(targetKcal);
  const carbs = Math.max(0, Math.round((kcal - base.protein * 4 - base.fat * 9) / 4));
  return { kcal, protein: base.protein, carbs, fat: base.fat };
}

export type PeriodizationMode = "deficit" | "refeed" | "diet_break" | "normal";

export interface PeriodizedMacros extends MacroSet {
  mode: PeriodizationMode;
  /** Diferença de kcal em relação aos macros originais da fase. */
  kcalDelta: number;
  carbsDelta: number;
}

/**
 * Aplica refeed / diet break sobre os macros já ajustados da fase.
 * `tdee` é o TDEE bruto (kcal de manutenção).
 */
export function applyPeriodization(params: {
  macros: MacroSet;
  tdee: number;
  objetivo: "cutting" | "bulking" | "manutencao";
  cycle: CycleState;
  refeedTarget: RefeedTarget;
  dietBreakActive: boolean;
}): PeriodizedMacros {
  const { macros, tdee, objetivo, cycle, refeedTarget, dietBreakActive } = params;
  const passthrough = (mode: PeriodizationMode): PeriodizedMacros => ({
    ...macros,
    mode,
    kcalDelta: 0,
    carbsDelta: 0,
  });

  if (objetivo !== "cutting") return passthrough("normal");
  if (dietBreakActive) {
    const next = rebuildWithCarbs(macros, tdee);
    return { ...next, mode: "diet_break", kcalDelta: next.kcal - macros.kcal, carbsDelta: next.carbs - macros.carbs };
  }
  if (cycle.enabled && cycle.isRefeed) {
    const mult = refeedTarget === "LEVE_SUPERAVIT" ? 1.05 : 1.0;
    const next = rebuildWithCarbs(macros, tdee * mult);
    return { ...next, mode: "refeed", kcalDelta: next.kcal - macros.kcal, carbsDelta: next.carbs - macros.carbs };
  }
  return passthrough("deficit");
}

// ──────────────────────────────────────────────────────────
// FEATURE 2 — Diet breaks
// ──────────────────────────────────────────────────────────
export interface DietBreakState {
  enabled: boolean;
  active: boolean;
  /** Dia atual do diet break (1-based) quando ativo. */
  dayInBreak: number;
  totalDays: number;
  /** Data sugerida do próximo diet break. */
  suggestedStart: string;
  daysUntilSuggested: number;
  /** Mostra o alerta quando faltam <= 7 dias (ou já passou). */
  showSuggestion: boolean;
  weeksInDeficit: number;
}

export function computeDietBreakState(cfg: DietBreakConfig, now: Date = new Date()): DietBreakState {
  const totalDays = Math.max(1, Math.round((cfg.break_duration_weeks || 1) * 7));
  const enabled = Boolean(cfg.enabled);

  let active = false;
  let dayInBreak = 0;
  if (cfg.active_start) {
    const elapsed = daysBetween(cfg.active_start, now);
    if (elapsed >= 0 && elapsed < totalDays) {
      active = true;
      dayInBreak = elapsed + 1;
    }
  }

  const offsetDays = Math.round(
    ((cfg.weeks_before_break || 5) + (cfg.postponed_weeks || 0)) * 7
  );
  const suggestedStart = addDaysISO(cfg.phase_start, offsetDays);
  const daysUntilSuggested = -daysBetween(suggestedStart, now);
  const weeksInDeficit = Math.max(0, Math.floor(daysBetween(cfg.phase_start, now) / 7));

  return {
    enabled,
    active: enabled && active,
    dayInBreak,
    totalDays,
    suggestedStart,
    daysUntilSuggested,
    showSuggestion: enabled && !active && daysUntilSuggested <= 7,
    weeksInDeficit,
  };
}

// ──────────────────────────────────────────────────────────
// FEATURE 3 — Proteína relativa (g/kg LBM)
// ──────────────────────────────────────────────────────────
export type ProteinStatusLevel = "low" | "ok" | "optimal" | "high";

export interface ProteinLbmResult {
  hasData: boolean;
  lbm: number;
  gPerKg: number;
  level: ProteinStatusLevel;
  color: string;
  message: string;
}

export function computeProteinPerLbm(
  proteinG: number,
  weightKg?: number | null,
  bodyFatPct?: number | null
): ProteinLbmResult {
  if (!weightKg || !bodyFatPct || bodyFatPct <= 0 || bodyFatPct >= 70) {
    return {
      hasData: false,
      lbm: 0,
      gPerKg: 0,
      level: "ok",
      color: "#5a5a78",
      message: "Adicione sua composição corporal para ver g/kg LBM",
    };
  }
  const lbm = weightKg * (1 - bodyFatPct / 100);
  const gPerKg = proteinG / lbm;
  if (gPerKg < 2.0)
    return { hasData: true, lbm, gPerKg, level: "low", color: "#ff4444", message: "Abaixo do ideal para cutting" };
  if (gPerKg < 2.3)
    return { hasData: true, lbm, gPerKg, level: "ok", color: "#e8a020", message: "Adequado — pode otimizar" };
  if (gPerKg <= 3.1)
    return { hasData: true, lbm, gPerKg, level: "optimal", color: "#00f0b4", message: "Faixa ótima para preservação de massa magra" };
  return { hasData: true, lbm, gPerKg, level: "high", color: "#e8a020", message: "Acima do necessário — redistribuir para carboidrato" };
}

// ──────────────────────────────────────────────────────────
// FEATURE 4 — Fibra
// ──────────────────────────────────────────────────────────
export function computeFiberTarget(kcal: number, sex?: string | null): number {
  const min = safeString(sex).toLowerCase().startsWith("f") ? 25 : 30;
  return Math.round(Math.max((kcal / 1000) * 14, min));
}

// ──────────────────────────────────────────────────────────
// FEATURE 5 — Adaptação metabólica
// ──────────────────────────────────────────────────────────
export interface WeightPoint {
  date: string;
  weight: number;
}

export type LossStatus = "fast" | "optimal" | "slowing" | "stalled" | "insufficient" | "gaining";

export interface AdaptationResult {
  hasEnoughData: boolean;
  weeklyRatePct: number;
  status: LossStatus;
  color: string;
  label: string;
  adaptationDetected: boolean;
  recommendations: string[];
  weeklySeries: { weekStart: string; weight: number; ratePct: number }[];
}

/** Reduz os logs a médias semanais (mais recente por último). */
export function toWeeklyAverages(points: WeightPoint[]): { weekStart: string; weight: number }[] {
  const buckets = new Map<string, number[]>();
  const sorted = [...points].sort((a, b) => a.date.localeCompare(b.date));
  if (sorted.length === 0) return [];
  const first = parseISODate(sorted[0].date.slice(0, 10));
  for (const p of sorted) {
    const d = parseISODate(p.date.slice(0, 10));
    const weekIdx = Math.floor((d.getTime() - first.getTime()) / (7 * 86400000));
    const key = addDaysISO(todayISO(first), weekIdx * 7);
    const arr = buckets.get(key) || [];
    arr.push(p.weight);
    buckets.set(key, arr);
  }
  return [...buckets.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([weekStart, ws]) => ({ weekStart, weight: ws.reduce((s, w) => s + w, 0) / ws.length }));
}

export function analyzeAdaptation(points: WeightPoint[]): AdaptationResult {
  const weekly = toWeeklyAverages(points);
  const series = weekly.map((w, i) => {
    const prev = weekly[i - 1];
    const ratePct = prev ? ((prev.weight - w.weight) / prev.weight) * 100 : 0;
    return { ...w, ratePct };
  });

  if (weekly.length < 3) {
    return {
      hasEnoughData: false,
      weeklyRatePct: 0,
      status: "insufficient",
      color: "#5a5a78",
      label: "Dados insuficientes",
      adaptationDetected: false,
      recommendations: [],
      weeklySeries: series,
    };
  }

  const rate = series[series.length - 1].ratePct;
  const last2 = series.slice(-2).map((s) => s.ratePct);
  const adaptationDetected = last2.length === 2 && last2.every((r) => r < 0.3 && r > -0.3);

  let status: LossStatus;
  let color: string;
  let label: string;
  if (rate < -0.1) {
    status = "gaining"; color = "#ff8c00"; label = "Peso subindo — revise aderência";
  } else if (rate > 1.0) {
    status = "fast"; color = "#ff4444"; label = "Perda acelerada — risco de perda muscular. Considere reduzir déficit.";
  } else if (rate >= 0.5) {
    status = "optimal"; color = "#00f0b4"; label = "Faixa ótima para cutting";
  } else if (rate >= 0.3) {
    status = "slowing"; color = "#e8a020"; label = "Perda desacelerando — monitorar";
  } else {
    status = "stalled"; color = "#ff4444"; label = adaptationDetected ? "Possível adaptação metabólica" : "Perda mínima nesta semana";
  }

  const recommendations = adaptationDetected
    ? [
        "1. Refeed extra ou diet break de 7 dias (prioridade máxima)",
        "2. Aumentar NEAT / cardio leve (passos diários +2.000)",
        "3. Só depois: reduzir calorias em 5-8%",
      ]
    : [];

  return {
    hasEnoughData: true,
    weeklyRatePct: rate,
    status,
    color,
    label,
    adaptationDetected,
    recommendations,
    weeklySeries: series,
  };
}

// ──────────────────────────────────────────────────────────
// FEATURE 6 — Hidratação dinâmica
// ──────────────────────────────────────────────────────────
export interface HydrationResult {
  liters: number;
  glasses: number;
  baseLiters: number;
  bonusWorkoutLiters: number;
  bonusIntensityLiters: number;
  note: string;
}

const LOWER_KEYS = ["leg", "perna", "inferior", "quadr", "gluteo", "glúteo", "posterior", "full", "corpo"];
const UPPER_KEYS = ["peito", "costas", "ombro", "biceps", "bíceps", "triceps", "tríceps", "superior", "upper", "push", "pull"];

export function computeHydration(params: {
  weightKg: number;
  workoutMinutes?: number;
  workoutLabel?: string | null;
  muscleGroups?: string[];
  isTrainingDay?: boolean;
}): HydrationResult {
  const { weightKg, workoutMinutes = 0, workoutLabel, muscleGroups = [], isTrainingDay = false } = params;
  const base = weightKg * 0.035;
  const hay = `${safeString(workoutLabel)} ${(muscleGroups || []).map(safeString).join(" ")}`.toLowerCase();

  let bonusIntensity = 0;
  let intensityNote = "";
  if (isTrainingDay) {
    if (LOWER_KEYS.some((k) => hay.includes(k))) {
      bonusIntensity = 0.5;
      intensityNote = "Ajustado para treino de pernas/full body (+500ml)";
    } else if (UPPER_KEYS.some((k) => hay.includes(k))) {
      bonusIntensity = 0.3;
      intensityNote = "Ajustado para treino de superiores (+300ml)";
    } else {
      bonusIntensity = 0.3;
      intensityNote = "Ajustado para o treino de hoje (+300ml)";
    }
  }

  const bonusWorkout = isTrainingDay ? workoutMinutes * 0.01 : 0;
  const total = Math.round((base + bonusWorkout + bonusIntensity) * 10) / 10;

  return {
    liters: total,
    glasses: Math.round((total * 1000) / 250),
    baseLiters: Math.round(base * 10) / 10,
    bonusWorkoutLiters: Math.round(bonusWorkout * 100) / 100,
    bonusIntensityLiters: bonusIntensity,
    note: isTrainingDay ? intensityNote : "Dia de descanso — hidratação base (35ml/kg)",
  };
}

// ──────────────────────────────────────────────────────────
// FEATURE 7 — Nutrient timing peri-treino
// ──────────────────────────────────────────────────────────
export interface TimingBlock {
  key: "pre" | "intra" | "post" | "rest";
  title: string;
  emoji: string;
  color: string;
  window: string;
  carbs: number;
  protein: number;
  fat: number | null;
  extra?: string;
  foods: string[];
}

export function computeTimingBlocks(params: {
  macros: MacroSet;
  workoutMinutes?: number;
  workoutTimeLabel?: string;
  isTrainingDay: boolean;
}): TimingBlock[] {
  const { macros, workoutMinutes = 0, workoutTimeLabel, isTrainingDay } = params;
  if (!isTrainingDay) return [];

  const preCarbs = Math.round(macros.carbs * 0.28);
  const preProtein = Math.round(macros.protein * 0.28);
  const postCarbs = Math.round(macros.carbs * 0.28);
  const postProtein = Math.min(40, Math.max(30, Math.round(macros.protein * 0.3)));

  const restCarbs = Math.max(0, macros.carbs - preCarbs - postCarbs);
  const restProtein = Math.max(0, macros.protein - preProtein - postProtein);

  const blocks: TimingBlock[] = [
    {
      key: "pre",
      title: "Pré-treino",
      emoji: "🟡",
      color: "#B8922A",
      window: workoutTimeLabel ? `60-90min antes (${workoutTimeLabel})` : "60-90min antes do treino",
      carbs: preCarbs,
      protein: preProtein,
      fat: 10,
      extra: "Gordura < 10g para não atrasar o esvaziamento gástrico",
      foods: ["Arroz / batata-doce", "Frango ou whey isolado", "Fruta de baixo IG"],
    },
  ];

  if (workoutMinutes > 75) {
    blocks.push({
      key: "intra",
      title: "Intra-treino",
      emoji: "🟢",
      color: "#00f0b4",
      window: `Durante o treino (${workoutMinutes}min)`,
      carbs: 25,
      protein: 0,
      fat: null,
      extra: "5-10g de EAA/BCAA se não houve whey no pré",
      foods: ["Dextrose / maltodextrina", "Eletrólitos", "EAA 5-10g"],
    });
  }

  blocks.push({
    key: "post",
    title: "Pós-treino",
    emoji: "🔵",
    color: "#7890ff",
    window: "Até 2h após o treino",
    carbs: postCarbs,
    protein: postProtein,
    fat: null,
    extra: "Fontes de alto IG para repor glicogênio",
    foods: ["Whey concentrado/isolado", "Arroz branco ou batata", "Fruta"],
  });

  blocks.push({
    key: "rest",
    title: "Restante do dia",
    emoji: "⚪",
    color: "#5a5a78",
    window: "Demais refeições",
    carbs: restCarbs,
    protein: restProtein,
    fat: macros.fat - 10,
    foods: ["Distribua em 2-3 refeições", "Priorize fibras e gorduras boas"],
  });

  return blocks;
}

// ──────────────────────────────────────────────────────────
// FEATURE 8 — Micronutrientes de atenção no cutting
// ──────────────────────────────────────────────────────────
export interface MicronutrientInfo {
  name: string;
  rda: string;
  sources: string[];
  risk: "high" | "medium";
  why: string;
  femaleOnly?: boolean;
}

export const CUTTING_MICRONUTRIENTS: MicronutrientInfo[] = [
  { name: "Zinco", rda: "11mg (H) / 8mg (M)", sources: ["Carne vermelha", "Ostras", "Semente de abóbora"], risk: "high", why: "Suporte à testosterona e imunidade" },
  { name: "Magnésio", rda: "400mg (H) / 310mg (M)", sources: ["Castanhas", "Espinafre", "Cacau 70%"], risk: "high", why: "Sono, contração muscular e sensibilidade à insulina" },
  { name: "Vitamina D", rda: "600-2000 UI", sources: ["Sol", "Salmão", "Gema de ovo"], risk: "high", why: "Eixo hormonal e densidade óssea" },
  { name: "Complexo B (B6/B12)", rda: "B6 1.3mg · B12 2.4mcg", sources: ["Carnes", "Ovos", "Laticínios"], risk: "medium", why: "Metabolismo energético e função neural" },
  { name: "Ferro", rda: "8mg (H) / 18mg (M)", sources: ["Carne vermelha", "Fígado", "Feijão + vit C"], risk: "high", why: "Transporte de oxigênio — crítico em mulheres", femaleOnly: true },
  { name: "Cálcio", rda: "1000mg", sources: ["Laticínios", "Sardinha", "Couve"], risk: "medium", why: "Preservação óssea em déficit prolongado" },
  { name: "Ômega-3 (EPA/DHA)", rda: "1-2g/dia", sources: ["Salmão", "Sardinha", "Suplemento"], risk: "medium", why: "Controle inflamatório e recuperação" },
];
