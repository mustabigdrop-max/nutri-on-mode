import { lookupDensity, parseGrams } from "@/lib/foodKcalDatabase";

export interface NutritionMacros {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface NutritionPlanItem {
  alimento: string;
  quantidade?: string;
  quantidade_g?: string | number;
  kcal?: number;
  protein_g?: number;
  carbs_g?: number;
  fat_g?: number;
  macros?: NutritionMacros;
  nutrition_status?: "calculated" | "unavailable";
}

export interface NutritionMeal {
  refeicao: string;
  alimentos?: NutritionPlanItem[];
  macros?: { proteina?: number; carboidrato?: number; gordura?: number };
}

export interface PlanNutritionAlert {
  type: "error" | "warning" | "info";
  message: string;
}

export const PORTION_WEIGHTS: Record<string, Record<string, number>> = {
  banana: { "unidade pequena": 70, "unidade media": 120, "unidade grande": 160, unidade: 120 },
  ovo: { unidade: 50, "unidade pequena": 40, "unidade grande": 60 },
  arroz: { "colher de sopa": 25, xicara: 155, escumadeira: 80 },
  feijao: { "concha media": 85, "concha grande": 120, concha: 85, "colher de sopa": 25 },
  tapioca: { "colher de sopa": 15, unidade: 80, porcao: 80 },
  "batata doce": { "unidade pequena": 100, "unidade media": 200, porcao: 200 },
  aveia: { "colher de sopa": 13, xicara: 80 },
  "iogurte natural": { pote: 170, copo: 180 },
  "iogurte grego": { pote: 200, copo: 180 },
  azeite: { "colher de sopa": 13, "colher de cha": 4, fio: 5 },
};

const normalize = (value: string) => value.toLowerCase().normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();

const round1 = (value: number) => Math.round(value * 10) / 10;

const findPortionReference = (foodName: string, label: string) => {
  const food = normalize(foodName);
  const portion = normalize(label);
  const foodKey = Object.keys(PORTION_WEIGHTS).find((key) => food.includes(key));
  if (!foodKey) return null;
  const unitKey = Object.keys(PORTION_WEIGHTS[foodKey]).find((key) => portion.includes(key));
  if (!unitKey) return null;
  const countMatch = portion.match(/(\d+(?:[.,]\d+)?)\s*(?:unidades?|ovos?|conchas?|xicaras?|colheres?|potes?|copos?|porcoes?)/);
  const count = countMatch ? Number(countMatch[1].replace(",", ".")) : 1;
  return { expectedGrams: PORTION_WEIGHTS[foodKey][unitKey] * count, count };
};

export const calculateNutritionItem = (item: NutritionPlanItem) => {
  const grams = parseGrams(item.quantidade_g) ?? parseGrams(item.quantidade);
  const density = lookupDensity(item.alimento);
  if (!grams || !density) return { ...item, macros: undefined, nutrition_status: "unavailable" as const, grams };
  const factor = grams / 100;
  const macros: NutritionMacros = {
    kcal: Math.round(density.kcal * factor),
    protein: round1(density.p * factor),
    carbs: round1(density.c * factor),
    fat: round1(density.g * factor),
  };
  return {
    ...item,
    kcal: macros.kcal,
    protein_g: macros.protein,
    carbs_g: macros.carbs,
    fat_g: macros.fat,
    macros,
    nutrition_status: "calculated" as const,
    grams,
  };
};

export const validateNutritionPlan = (meals: NutritionMeal[], targetKcal: number) => {
  const alerts: PlanNutritionAlert[] = [];
  let protein = 0;
  let carbs = 0;
  let fat = 0;

  const calculatedMeals = meals.map((meal) => {
    const items = (meal.alimentos ?? []).map((raw) => {
      const item = calculateNutritionItem(raw);
      if (!item.macros) {
        alerts.push({ type: "warning", message: `⚠️ ${raw.alimento} (${raw.quantidade_g || raw.quantidade || "sem gramatura"}) sem dados nutricionais — verificar banco de alimentos` });
        return item;
      }
      protein += item.macros.protein;
      carbs += item.macros.carbs;
      fat += item.macros.fat;

      const density = lookupDensity(raw.alimento);
      if (density?.grupo === "proteina" && item.grams && item.macros.carbs / (item.grams / 100) > 10) {
        alerts.push({ type: "error", message: `🚨 ${raw.alimento} com ${item.macros.carbs}g carb — possível erro de atribuição de macros` });
      }
      const reference = findPortionReference(raw.alimento, raw.quantidade || "");
      if (reference && item.grams && (item.grams > reference.expectedGrams * 3 || item.grams < reference.expectedGrams / 3)) {
        alerts.push({ type: "warning", message: `⚠️ ${raw.alimento}: ${item.grams}g para '${raw.quantidade}' parece incorreto (esperado: ~${reference.expectedGrams}g)` });
      }
      return item;
    });
    return { ...meal, alimentos: items };
  });

  const atwaterKcal = Math.round(protein * 4 + carbs * 4 + fat * 9);
  const deviation = atwaterKcal - targetKcal;
  const deviationPct = targetKcal > 0 ? Math.abs(deviation) / targetKcal * 100 : 0;
  if (targetKcal > 0 && deviationPct > 5) {
    alerts.push({ type: "error", message: `🚨 Total real (${atwaterKcal} kcal) desvia ${deviationPct.toFixed(1)}% da meta (${targetKcal} kcal)` });
  } else if (targetKcal > 0 && deviationPct > 2) {
    alerts.push({ type: "warning", message: `⚠️ Total real (${atwaterKcal} kcal) desvia ${deviationPct.toFixed(1)}% da meta (${targetKcal} kcal)` });
  }

  const signatures = new Map<string, string>();
  calculatedMeals.forEach((meal) => {
    const p = round1((meal.alimentos ?? []).reduce((sum, item) => sum + (item.macros?.protein || 0), 0));
    const c = round1((meal.alimentos ?? []).reduce((sum, item) => sum + (item.macros?.carbs || 0), 0));
    const g = round1((meal.alimentos ?? []).reduce((sum, item) => sum + (item.macros?.fat || 0), 0));
    const signature = `${p}|${c}|${g}`;
    const previous = signatures.get(signature);
    if (previous && (p > 0 || c > 0 || g > 0)) alerts.push({ type: "warning", message: `⚠️ Refeições ${previous} e ${meal.refeicao} com macros idênticos (P${p} C${c} G${g}) — possível duplicação` });
    else signatures.set(signature, meal.refeicao);
  });

  return {
    meals: calculatedMeals,
    totals: { kcal: atwaterKcal, protein: round1(protein), carbs: round1(carbs), fat: round1(fat) },
    targetKcal,
    deviation,
    deviationPct,
    isValid: deviationPct <= 5 && !alerts.some((alert) => alert.type === "error"),
    alerts,
  };
};