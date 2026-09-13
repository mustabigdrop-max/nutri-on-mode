/**
 * Fase 5 — Integração NutriPlan ↔ TrainingON.
 * Cross-talk de fase, ajuste de volume em déficit e antropometria compartilhada.
 * Tudo derivado de dados reais do perfil (profiles) e da estrutura do protocolo.
 * Quando um dado não existe, o campo volta null — nada é estimado ou inventado.
 */

export interface NutriProfileData {
  weight_kg?: number | null;
  lean_mass_kg?: number | null;
  bf_percent?: number | null;
  waist_cm?: number | null;
  height_cm?: number | null;
  get_kcal?: number | null;
  vet_kcal?: number | null;
  protein_g?: number | null;
  carbs_g?: number | null;
  fat_g?: number | null;
  goal?: string | null;
  objetivo_principal?: string | null;
}

export type EnergyState = "DEFICIT" | "MANUTENCAO" | "SUPERAVIT" | "SEM_DADO";

export interface EnergyBalance {
  state: EnergyState;
  /** Diferença kcal (vet - get). null quando falta dado. */
  deltaKcal: number | null;
  /** Percentual em relação ao GET. null quando falta dado. */
  deltaPercent: number | null;
  get_kcal: number | null;
  vet_kcal: number | null;
}

/** Estado energético real a partir de GET (gasto) e VET (alvo do plano). */
export function computeEnergyBalance(p?: NutriProfileData | null): EnergyBalance {
  const get = numOrNull(p?.get_kcal);
  const vet = numOrNull(p?.vet_kcal);
  if (get === null || vet === null || get <= 0) {
    return { state: "SEM_DADO", deltaKcal: null, deltaPercent: null, get_kcal: get, vet_kcal: vet };
  }
  const delta = vet - get;
  const pct = (delta / get) * 100;
  const state: EnergyState = pct <= -5 ? "DEFICIT" : pct >= 5 ? "SUPERAVIT" : "MANUTENCAO";
  return { state, deltaKcal: Math.round(delta), deltaPercent: Math.round(pct * 10) / 10, get_kcal: get, vet_kcal: vet };
}

/* ─────────── Cross-talk de fase ─────────── */

export type TrainingBlock = "ACUMULACAO" | "INTENSIFICACAO" | "PICO" | "DESCARGA" | "TRANSICAO";

/** Traduz a fase da semana do mesociclo em bloco de treino. */
export function blockFromWeekPhase(phaseId?: string | null, isDeload?: boolean): TrainingBlock {
  const id = String(phaseId || "").toUpperCase();
  if (isDeload || id === "DELOAD") return "DESCARGA";
  if (id === "TRANSICAO") return "TRANSICAO";
  if (id.startsWith("MEV")) return "ACUMULACAO";
  if (id.startsWith("MAV")) return "INTENSIFICACAO";
  if (id.startsWith("MRV")) return "PICO";
  return "ACUMULACAO";
}

export interface PhaseNutritionSignal {
  block: TrainingBlock;
  blockLabel: string;
  /** Faixa de proteína recomendada em g/kg de peso corporal. */
  proteinRange: [number, number];
  proteinBasis: "peso corporal" | "massa magra";
  /** Direção calórica sugerida pelo bloco de treino. */
  energyDirection: "DEFICIT" | "MANUTENCAO" | "SUPERAVIT";
  carbPriority: string;
  note: string;
}

const BLOCK_LABEL: Record<TrainingBlock, string> = {
  ACUMULACAO: "Acumulação",
  INTENSIFICACAO: "Intensificação",
  PICO: "Pico de volume",
  DESCARGA: "Descarga",
  TRANSICAO: "Transição",
};

/**
 * Sinal que o TrainingON manda pro NutriPlan.
 * Em déficit calórico real, a proteína sobe (2,2–2,6 g/kg) para preservar massa.
 */
export function phaseNutritionSignal(block: TrainingBlock, energy: EnergyBalance): PhaseNutritionSignal {
  const cutting = energy.state === "DEFICIT";
  let proteinRange: [number, number] = cutting ? [2.2, 2.6] : [1.8, 2.2];
  let energyDirection: PhaseNutritionSignal["energyDirection"] = cutting ? "DEFICIT" : "MANUTENCAO";
  let carbPriority = "Concentrar carboidrato no peri-treino";
  let note = "";

  switch (block) {
    case "ACUMULACAO":
      if (!cutting) {
        energyDirection = "SUPERAVIT";
        note = "Bloco de acumulação sem déficit: superávit leve sustenta o aumento de volume.";
      } else {
        note = "Acumulação em déficit: manter proteína alta e priorizar carboidrato nos dias de maior volume.";
      }
      break;
    case "INTENSIFICACAO":
      carbPriority = "Carboidrato maior nos dias de treino pesado";
      note = "Intensificação: carga sobe e o RIR cai — energia peri-treino é prioridade.";
      break;
    case "PICO":
      carbPriority = "Carboidrato mais alto nos dias de maior volume";
      note = "Pico de volume: a demanda de recuperação é máxima; reduzir déficit agressivo nesta semana.";
      if (cutting) proteinRange = [2.4, 2.6];
      break;
    case "DESCARGA":
      energyDirection = cutting ? "DEFICIT" : "MANUTENCAO";
      carbPriority = "Carboidrato mais estável ao longo do dia";
      note = "Semana de descarga: volume cai, então o carboidrato peri-treino também pode cair.";
      break;
    case "TRANSICAO":
      energyDirection = "MANUTENCAO";
      note = "Transição entre blocos: manutenção calórica facilita a recuperação antes do próximo bloco.";
      break;
  }

  return {
    block,
    blockLabel: BLOCK_LABEL[block],
    proteinRange,
    proteinBasis: "peso corporal",
    energyDirection,
    carbPriority,
    note,
  };
}

/** Proteína atual do plano em g/kg (real). null quando falta peso ou proteína. */
export function currentProteinPerKg(p?: NutriProfileData | null): number | null {
  const w = numOrNull(p?.weight_kg);
  const prot = numOrNull(p?.protein_g);
  if (!w || !prot || w <= 0) return null;
  return Math.round((prot / w) * 100) / 100;
}

/* ─────────── Ajuste de volume em déficit ─────────── */

export interface VolumeAdjustment {
  apply: boolean;
  reductionPercent: number;
  currentSets: number;
  targetSets: number;
  setsToRemove: number;
  keepIntensity: string;
  priority: string;
}

const COMPOUND_HINTS = [
  "agachamento",
  "supino",
  "terra",
  "remada",
  "barra fixa",
  "puxada",
  "desenvolvimento",
  "leg press",
  "avanço",
  "afundo",
  "paralela",
];

export function isCompound(name?: string | null): boolean {
  const n = String(name || "").toLowerCase();
  return COMPOUND_HINTS.some((h) => n.includes(h));
}

/** Séries semanais reais somadas do protocolo. */
export function weeklySets(days: Array<{ exercises?: any[] }>): number {
  let total = 0;
  for (const d of days || []) {
    for (const ex of d?.exercises || []) {
      const s = parseInt(String(ex?.sets ?? ex?.series ?? "").replace(/[^\d]/g, ""));
      if (Number.isFinite(s) && s > 0) total += s;
    }
  }
  return total;
}

/**
 * Em déficit relevante (≥ 15% abaixo do GET), o volume cai 20–30% e a intensidade se mantém.
 * A redução escala com a profundidade do déficit; nunca reduz em semana de descarga.
 */
export function volumeAdjustmentForDeficit(
  energy: EnergyBalance,
  days: Array<{ exercises?: any[] }>,
  isDeloadWeek = false
): VolumeAdjustment | null {
  if (energy.state !== "DEFICIT" || energy.deltaPercent === null) return null;
  const depth = Math.abs(energy.deltaPercent);
  if (depth < 15 || isDeloadWeek) return null;

  const reductionPercent = depth >= 25 ? 30 : depth >= 20 ? 25 : 20;
  const currentSets = weeklySets(days);
  const targetSets = currentSets > 0 ? Math.round(currentSets * (1 - reductionPercent / 100)) : 0;

  return {
    apply: true,
    reductionPercent,
    currentSets,
    targetSets,
    setsToRemove: Math.max(0, currentSets - targetSets),
    keepIntensity: "Manter carga e RIR — o corte é só de volume",
    priority: "Preservar os compostos pesados e cortar primeiro os isoladores repetidos",
  };
}

/* ─────────── Antropometria compartilhada ─────────── */

export interface SharedAnthropometry {
  weight_kg: number | null;
  bf_percent: number | null;
  lean_mass_kg: number | null;
  waist_cm: number | null;
  height_cm: number | null;
}

export function sharedAnthropometry(p?: NutriProfileData | null): SharedAnthropometry {
  return {
    weight_kg: numOrNull(p?.weight_kg),
    bf_percent: numOrNull(p?.bf_percent),
    lean_mass_kg: numOrNull(p?.lean_mass_kg),
    waist_cm: numOrNull(p?.waist_cm),
    height_cm: numOrNull(p?.height_cm),
  };
}

function numOrNull(v: unknown): number | null {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
}
