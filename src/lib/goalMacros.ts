import { safeString } from "@/lib/utils";
/**
 * Fonte de verdade única para o ajuste de calorias/macros por objetivo (fase).
 * Usado pelo NutriSync (/nutrisync) e pelo Dashboard (/dashboard) — DRY.
 */

export type GoalObjetivo = "bulking" | "cutting" | "manutencao";

export interface GoalAdjustment {
  /** Multiplicador aplicado sobre kcal e carboidratos. */
  kcalMultiplier: number;
  /** Proteína mínima por kg de peso corporal. */
  proteinPerKg: number;
  /** Multiplicador extra aplicado sobre a gordura. */
  fatMultiplier: number;
}

/** Normaliza os diversos rótulos de objetivo do perfil para as 3 fases base. */
export function resolveGoalObjetivo(rawGoal?: string | null): GoalObjetivo {
  const g = safeString(rawGoal).toLowerCase();
  if (["gain_muscle", "hipertrofia", "bulking", "performance"].includes(g)) return "bulking";
  if (
    ["lose_weight", "emagrecimento", "cutting", "definition", "definicao", "glp1"].includes(g)
  )
    return "cutting";
  return "manutencao";
}

export function getGoalAdjustment(objetivo: GoalObjetivo): GoalAdjustment {
  if (objetivo === "cutting") {
    // Déficit de -18%
    return { kcalMultiplier: 0.82, proteinPerKg: 2.4, fatMultiplier: 0.85 };
  }
  if (objetivo === "bulking") {
    // Superávit de +12%
    return { kcalMultiplier: 1.12, proteinPerKg: 2.0, fatMultiplier: 1.05 };
  }
  return { kcalMultiplier: 1.0, proteinPerKg: 1.8, fatMultiplier: 1.0 };
}

export interface AdjustedMacrosInput {
  baseKcal: number;
  baseCarbs: number;
  baseFat: number;
  weightKg: number;
  objetivo: GoalObjetivo;
  /** Ajustes do treino do dia (NutriSync). Defaults neutros. */
  workout?: {
    kcalMultiplier?: number;
    carbsMultiplier?: number;
    fatMultiplier?: number;
    proteinPerKg?: number;
  };
}

export interface AdjustedMacros {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}

/** Calcula kcal e macros já com o ajuste da fase (e do treino, se houver). */
export function computeAdjustedMacros({
  baseKcal,
  baseCarbs,
  baseFat,
  weightKg,
  objetivo,
  workout,
}: AdjustedMacrosInput): AdjustedMacros {
  const goal = getGoalAdjustment(objetivo);
  const wKcal = workout?.kcalMultiplier ?? 1;
  const wCarbs = workout?.carbsMultiplier ?? 1;
  const wFat = workout?.fatMultiplier ?? 1;
  const wProtein = workout?.proteinPerKg ?? 0;

  return {
    kcal: Math.round(baseKcal * wKcal * goal.kcalMultiplier),
    protein: Math.round(weightKg * Math.max(wProtein, goal.proteinPerKg)),
    carbs: Math.round(baseCarbs * wCarbs * goal.kcalMultiplier),
    fat: Math.round(baseFat * wFat * goal.fatMultiplier),
  };
}
