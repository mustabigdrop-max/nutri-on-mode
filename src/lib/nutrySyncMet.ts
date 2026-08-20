/**
 * NutrySync — motor MET de gasto calórico real.
 * kcal = MET × peso_kg × duração_horas, com EPOC e desconto do que o TDEE base já contabiliza.
 */

export type MetCategory = "musculacao" | "cardio" | "combate" | "outros";

export interface MetActivity {
  type: string;
  label: string;
  emoji: string;
  met: number;
  category: MetCategory;
}

export const MET_CATEGORY_LABELS: Record<MetCategory, { label: string; emoji: string }> = {
  musculacao: { label: "Musculação", emoji: "💪" },
  cardio: { label: "Cardio", emoji: "🏃" },
  combate: { label: "Combate", emoji: "🥊" },
  outros: { label: "Outros", emoji: "🏊" },
};

export const MET_ACTIVITIES: MetActivity[] = [
  // Musculação
  { type: "push", label: "Push", emoji: "🏋️", met: 5.0, category: "musculacao" },
  { type: "pull", label: "Pull", emoji: "🏋️", met: 5.0, category: "musculacao" },
  { type: "legs", label: "Legs", emoji: "🦵", met: 6.0, category: "musculacao" },
  { type: "upper", label: "Upper", emoji: "💪", met: 4.5, category: "musculacao" },
  { type: "lower", label: "Lower", emoji: "🦵", met: 6.0, category: "musculacao" },
  { type: "full_body", label: "Full Body", emoji: "🔄", met: 5.5, category: "musculacao" },
  { type: "peito_tri", label: "Peito/Trí", emoji: "🏋️", met: 4.5, category: "musculacao" },
  { type: "costas_bi", label: "Costas/Bí", emoji: "🏋️", met: 5.0, category: "musculacao" },
  { type: "ombros", label: "Ombros", emoji: "💪", met: 4.0, category: "musculacao" },
  { type: "bracos", label: "Braços", emoji: "⚡", met: 3.5, category: "musculacao" },

  // Cardio
  { type: "corrida", label: "Corrida", emoji: "🏃", met: 8.0, category: "cardio" },
  { type: "hiit", label: "HIIT", emoji: "🔥", met: 10.0, category: "cardio" },
  { type: "liss", label: "LISS", emoji: "🚶", met: 4.5, category: "cardio" },
  { type: "aej", label: "AEJ (jejum)", emoji: "☀️", met: 5.0, category: "cardio" },
  { type: "neat", label: "NEAT", emoji: "🚶", met: 2.5, category: "cardio" },
  { type: "bike", label: "Bicicleta", emoji: "🚴", met: 6.5, category: "cardio" },
  { type: "caminhada", label: "Caminhada", emoji: "🚶", met: 3.5, category: "cardio" },

  // Combate
  { type: "mma", label: "MMA", emoji: "🥊", met: 10.3, category: "combate" },
  { type: "jiujitsu", label: "Jiu-jitsu", emoji: "🥋", met: 9.0, category: "combate" },
  { type: "boxe", label: "Boxe", emoji: "🥊", met: 9.5, category: "combate" },
  { type: "muay_thai", label: "Muay Thai", emoji: "🦵", met: 10.0, category: "combate" },

  // Outros
  { type: "natacao", label: "Natação", emoji: "🏊", met: 7.0, category: "outros" },
  { type: "futebol", label: "Futebol", emoji: "⚽", met: 7.0, category: "outros" },
  { type: "beach_tennis", label: "Beach tennis", emoji: "🎾", met: 6.0, category: "outros" },
  { type: "yoga", label: "Yoga", emoji: "🧘", met: 3.0, category: "outros" },
  { type: "pilates", label: "Pilates", emoji: "🤸", met: 3.5, category: "outros" },
  { type: "crossfit", label: "CrossFit", emoji: "🏋️", met: 8.0, category: "outros" },
  { type: "escalada", label: "Escalada", emoji: "🏔️", met: 8.0, category: "outros" },
  { type: "danca", label: "Dança", emoji: "💃", met: 5.5, category: "outros" },
  { type: "funcional", label: "Funcional", emoji: "🔧", met: 6.0, category: "outros" },
  { type: "alongamento", label: "Alongamento", emoji: "🧘", met: 2.5, category: "outros" },
  { type: "trabalho_fisico", label: "Trabalho físico", emoji: "🛠️", met: 4.0, category: "outros" },
  { type: "sexo", label: "Sexo", emoji: "❤️", met: 5.8, category: "outros" },
];

export const metActivity = (type: string): MetActivity | undefined =>
  MET_ACTIVITIES.find((a) => a.type === type);

/** Zonas de corrida — MET varia com a intensidade. */
export type RunZone = "Z1" | "Z2" | "Z3" | "Z4" | "LISS" | "HIIT" | "AEJ";

export const RUN_ZONES: { zone: RunZone; label: string; met: number }[] = [
  { zone: "Z1", label: "Z1 · recuperação", met: 4.0 },
  { zone: "Z2", label: "Z2 · aeróbico", met: 6.5 },
  { zone: "Z3", label: "Z3 · tempo", met: 8.5 },
  { zone: "Z4", label: "Z4 · VO2máx", met: 11.0 },
  { zone: "LISS", label: "LISS", met: 4.5 },
  { zone: "HIIT", label: "HIIT", met: 10.0 },
  { zone: "AEJ", label: "AEJ · jejum", met: 5.0 },
];

export function getRunningMET(zone?: string | null): number {
  return RUN_ZONES.find((z) => z.zone === zone)?.met ?? 8.0;
}

const STRENGTH_TYPES = [
  "push", "pull", "legs", "upper", "lower", "full_body",
  "peito_tri", "costas_bi", "ombros", "bracos",
];
const HIGH_INTENSITY_TYPES = ["hiit", "crossfit", "mma", "boxe", "muay_thai", "jiujitsu"];

/** EPOC — gasto extra pós-exercício. */
export function epocFactor(type: string): number {
  if (STRENGTH_TYPES.includes(type)) return 1.15;
  if (HIGH_INTENSITY_TYPES.includes(type)) return 1.2;
  return 1.05;
}

export interface MetAdjustment {
  met: number;
  durationMin: number;
  weightKg: number;
  grossKcal: number;
  epocFactor: number;
  epocKcal: number;
  totalWithEpoc: number;
  alreadyCounted: number;
  netAdjustment: number;
  carbAdd: number;
  proteinAdd: number;
  fatAdd: number;
  hydrationMl: number;
}

/**
 * Ajuste líquido de kcal de uma atividade.
 * Bruto (MET × kg × h) + EPOC − o que o TDEE base já assume (~30 min MET 3.5/dia).
 */
export function calculateMetAdjustment(input: {
  type: string;
  met: number;
  durationMin: number;
  weightKg: number;
}): MetAdjustment {
  const weight = input.weightKg > 0 ? input.weightKg : 70;
  const duration = Math.max(0, input.durationMin);
  const hours = duration / 60;
  const met = input.met > 0 ? input.met : 5;

  const grossKcal = met * weight * hours;
  const factor = epocFactor(input.type);
  const totalWithEpoc = grossKcal * factor;
  const epocKcal = totalWithEpoc - grossKcal;

  // O fator de atividade do TDEE já embute ~30 min de atividade moderada por dia.
  const alreadyCounted = weight * 3.5 * 0.5;
  const netAdjustment = Math.max(0, Math.round(totalWithEpoc - alreadyCounted));

  return {
    met,
    durationMin: duration,
    weightKg: weight,
    grossKcal: Math.round(grossKcal),
    epocFactor: factor,
    epocKcal: Math.round(epocKcal),
    totalWithEpoc: Math.round(totalWithEpoc),
    alreadyCounted: Math.round(alreadyCounted),
    netAdjustment,
    // Reposição: 55% carbo, 25% proteína, 20% gordura do ajuste líquido.
    carbAdd: Math.round((netAdjustment * 0.55) / 4),
    proteinAdd: Math.round((netAdjustment * 0.25) / 4),
    fatAdd: Math.round((netAdjustment * 0.2) / 9),
    hydrationMl: Math.round(duration * 10 * (factor >= 1.2 ? 1.5 : 1)),
  };
}

export const DURATION_PRESETS = [30, 45, 60, 75, 90];
