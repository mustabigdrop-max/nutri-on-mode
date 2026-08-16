/**
 * NutrySync — motor de ajuste dinâmico do dia do atleta.
 * Base do plano (definida pelo coach) + ajustes de rotina real = meta do dia.
 */

export type Intensity = "leve" | "moderada" | "intensa";

export type ActivityType =
  | "caminhada"
  | "corrida"
  | "bike"
  | "natacao"
  | "yoga"
  | "esporte"
  | "trabalho_braco"
  | "limpeza"
  | "outro";

/** kcal por minuto para 70 kg de referência. */
export const ACTIVITY_CALORIES: Record<ActivityType, Record<Intensity, number>> = {
  caminhada: { leve: 3.5, moderada: 5.0, intensa: 6.5 },
  corrida: { leve: 8.0, moderada: 11.0, intensa: 14.0 },
  bike: { leve: 5.0, moderada: 8.0, intensa: 12.0 },
  natacao: { leve: 6.0, moderada: 9.0, intensa: 12.0 },
  yoga: { leve: 2.5, moderada: 4.0, intensa: 5.5 },
  esporte: { leve: 5.0, moderada: 8.0, intensa: 11.0 },
  trabalho_braco: { leve: 4.0, moderada: 6.0, intensa: 8.0 },
  limpeza: { leve: 3.0, moderada: 4.5, intensa: 6.0 },
  outro: { leve: 3.5, moderada: 5.5, intensa: 7.5 },
};

export interface ActivityOption {
  type: ActivityType;
  label: string;
  emoji: string;
  presets: number[];
}

export const ACTIVITY_OPTIONS: ActivityOption[] = [
  { type: "caminhada", label: "Caminhada", emoji: "🚶", presets: [15, 30, 45, 60] },
  { type: "corrida", label: "Corrida", emoji: "🏃", presets: [15, 30, 45, 60] },
  { type: "bike", label: "Bike", emoji: "🚴", presets: [15, 30, 45, 60] },
  { type: "natacao", label: "Natação", emoji: "🏊", presets: [30, 45, 60] },
  { type: "yoga", label: "Yoga / Alongamento", emoji: "🧘", presets: [15, 30, 45, 60] },
  { type: "esporte", label: "Esporte coletivo", emoji: "⚽", presets: [30, 60, 90] },
  { type: "trabalho_braco", label: "Trabalho braçal", emoji: "🛠️", presets: [60, 120, 240, 480] },
  { type: "limpeza", label: "Limpeza pesada", emoji: "🧹", presets: [30, 60, 90] },
  { type: "outro", label: "Outro", emoji: "✏️", presets: [15, 30, 45, 60] },
];

export const activityMeta = (type: string): ActivityOption =>
  ACTIVITY_OPTIONS.find((a) => a.type === type) || ACTIVITY_OPTIONS[ACTIVITY_OPTIONS.length - 1];

export interface CalorieAdjustment {
  totalKcal: number;
  carbAdd: number;
  proteinAdd: number;
  fatAdd: number;
  hydrationAdd: number;
}

export function calculateActivityAdjustment(
  activity: ActivityType,
  durationMin: number,
  intensity: Intensity,
  weightKg: number,
): CalorieAdjustment {
  const baseRate = (ACTIVITY_CALORIES[activity] || ACTIVITY_CALORIES.outro)[intensity] ?? 5;
  const weightFactor = (weightKg > 0 ? weightKg : 70) / 70;
  const totalKcal = Math.round(baseRate * Math.max(0, durationMin) * weightFactor);

  return {
    totalKcal,
    carbAdd: Math.round((totalKcal * 0.55) / 4),
    proteinAdd: Math.round((totalKcal * 0.25) / 4),
    fatAdd: Math.round((totalKcal * 0.2) / 9),
    hydrationAdd: Math.round(durationMin * 10 * (intensity === "intensa" ? 1.5 : 1)),
  };
}

/* ---------------------------------------------------------------- fases */

export type PhaseKey = "bulking" | "cutting" | "recomp" | "manutencao";

export interface PhaseConfig {
  phase: PhaseKey;
  label: string;
  color: string;
  tdeeMultiplier: number;
  trainingDayCarbBoost: number;
  restDayCarbReduction: number;
  legDayCarbBoost: number;
}

export const PHASE_CONFIGS: Record<PhaseKey, PhaseConfig> = {
  bulking: {
    phase: "bulking",
    label: "BULKING",
    color: "#00FF88",
    tdeeMultiplier: 1.15,
    trainingDayCarbBoost: 0.2,
    restDayCarbReduction: 0.1,
    legDayCarbBoost: 0.35,
  },
  cutting: {
    phase: "cutting",
    label: "CUTTING",
    color: "#FFB800",
    tdeeMultiplier: 0.8,
    trainingDayCarbBoost: 0.25,
    restDayCarbReduction: 0.25,
    legDayCarbBoost: 0.4,
  },
  recomp: {
    phase: "recomp",
    label: "RECOMP",
    color: "#00D4FF",
    tdeeMultiplier: 1.0,
    trainingDayCarbBoost: 0.2,
    restDayCarbReduction: 0.15,
    legDayCarbBoost: 0.3,
  },
  manutencao: {
    phase: "manutencao",
    label: "MANUTENÇÃO",
    color: "#8A8A8A",
    tdeeMultiplier: 1.0,
    trainingDayCarbBoost: 0.15,
    restDayCarbReduction: 0.1,
    legDayCarbBoost: 0.25,
  },
};

/** Detecta a fase a partir do texto de objetivo enviado pelo coach. */
export function detectPhase(objetivo?: string | null): PhaseConfig {
  const s = String(objetivo || "").toLowerCase();
  if (/(bulk|ganho|hipertrofia|massa|superav)/.test(s)) return PHASE_CONFIGS.bulking;
  if (/(cut|emagre|defini|perda|deficit|déficit|seca)/.test(s)) return PHASE_CONFIGS.cutting;
  if (/(recomp)/.test(s)) return PHASE_CONFIGS.recomp;
  return PHASE_CONFIGS.manutencao;
}

/* --------------------------------------------------------- hidratação */

export type ClimateBand = "ameno" | "quente" | "muito_quente";

export const CLIMATE_OPTIONS: { band: ClimateBand; label: string; emoji: string; ml: number }[] = [
  { band: "ameno", label: "Ameno (< 25°C)", emoji: "🌤️", ml: 0 },
  { band: "quente", label: "Quente (25–29°C)", emoji: "☀️", ml: 300 },
  { band: "muito_quente", label: "Muito quente (30°C+)", emoji: "🔥", ml: 600 },
];

export interface HydrationTarget {
  targetMl: number;
  breakdown: { label: string; ml: number }[];
}

export function calculateDailyHydration(input: {
  weightKg: number;
  climate: ClimateBand;
  trainingMinutes?: number;
  isLegDay?: boolean;
  activityMl?: number;
  phase?: PhaseKey;
  protocolBoostMl?: number;
  protocolLabel?: string;
}): HydrationTarget {
  const weight = input.weightKg > 0 ? input.weightKg : 70;
  const base = Math.round(weight * 35);
  const climate = CLIMATE_OPTIONS.find((c) => c.band === input.climate)?.ml ?? 0;
  const training =
    Math.round((input.trainingMinutes || 0) * 10) + (input.isLegDay ? 200 : 0);
  const activities = Math.round(input.activityMl || 0);
  const phase = input.phase === "cutting" ? 400 : 0;
  const protocol = Math.round(input.protocolBoostMl || 0);

  const raw = base + climate + training + activities + phase + protocol;

  const breakdown = [
    { label: "Base (35 ml/kg)", ml: base },
    { label: "Clima", ml: climate },
    { label: "Treino", ml: training },
    { label: "Atividades extras", ml: activities },
    { label: "Fase do plano", ml: phase },
    { label: input.protocolLabel || "Protocolo ativo", ml: protocol },
  ].filter((b) => b.ml > 0);

  return { targetMl: Math.round(raw / 100) * 100, breakdown };
}

/* --------------------------------------------------------------- misc */

export const fmtKcal = (n: number) => Math.round(n).toLocaleString("pt-BR");
