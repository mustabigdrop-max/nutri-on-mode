import { validateNutritionPlan, type PlanNutritionAlert } from "@/lib/planNutritionValidation";

export interface AuditItemLike {
  day_index: number;
  meal_type: string;
  food_name: string;
  portion?: string | null;
}

export interface DayAudit {
  dayIndex: number;
  alerts: PlanNutritionAlert[];
  totals: { kcal: number; protein: number; carbs: number; fat: number };
  targetKcal: number;
  deviation: number;
  deviationPct: number;
  isValid: boolean;
}

/**
 * Roda as mesmas validações do dashboard (itens sem kcal, pesos suspeitos,
 * total fora da meta) sobre os itens do plano, agrupados por dia.
 */
export function buildPlanAudit(items: AuditItemLike[], targetKcal: number): DayAudit[] {
  const days = Array.from(new Set(items.map((i) => i.day_index))).sort((a, b) => a - b);

  return days.map((dayIndex) => {
    const dayItems = items.filter((i) => i.day_index === dayIndex);
    const mealTypes = Array.from(new Set(dayItems.map((i) => i.meal_type)));
    const meals = mealTypes.map((meal_type) => ({
      refeicao: meal_type,
      alimentos: dayItems
        .filter((i) => i.meal_type === meal_type)
        .map((i) => ({ alimento: i.food_name, quantidade: i.portion || "", quantidade_g: i.portion || "" })),
    }));

    const result = validateNutritionPlan(meals, targetKcal || 0);
    return {
      dayIndex,
      alerts: result.alerts,
      totals: result.totals,
      targetKcal: result.targetKcal,
      deviation: result.deviation,
      deviationPct: result.deviationPct,
      isValid: result.isValid,
    };
  });
}

export const summarizeAudit = (audits: DayAudit[]) => ({
  errors: audits.reduce((sum, a) => sum + a.alerts.filter((x) => x.type === "error").length, 0),
  warnings: audits.reduce((sum, a) => sum + a.alerts.filter((x) => x.type === "warning").length, 0),
});
