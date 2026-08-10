export type FoodDensity = { kcal: number; p: number; c: number; g: number; group: "protein" | "carb" | "fat" | "other" };

const FOOD_DENSITY: Record<string, FoodDensity> = {
  "frango": { kcal: 165, p: 31, c: 0, g: 3.6, group: "protein" }, "tilapia": { kcal: 128, p: 26, c: 0, g: 2.7, group: "protein" },
  "patinho": { kcal: 219, p: 30, c: 0, g: 10, group: "protein" }, "ovo": { kcal: 155, p: 13, c: 1, g: 11, group: "protein" },
  "whey": { kcal: 400, p: 80, c: 8, g: 5, group: "protein" }, "iogurte natural": { kcal: 61, p: 3.5, c: 4.7, g: 3.3, group: "protein" },
  "iogurte grego": { kcal: 97, p: 9, c: 4, g: 5, group: "protein" }, "cottage": { kcal: 98, p: 11, c: 3, g: 4, group: "protein" },
  "arroz": { kcal: 130, p: 2.7, c: 28, g: 0.3, group: "carb" }, "feijao": { kcal: 110, p: 7, c: 19, g: 0.7, group: "carb" },
  "aveia": { kcal: 366, p: 13, c: 67, g: 7, group: "carb" }, "tapioca": { kcal: 130, p: 0.1, c: 32, g: 0.1, group: "carb" },
  "batata doce": { kcal: 86, p: 1.6, c: 20, g: 0.1, group: "carb" }, "mandioca": { kcal: 125, p: 1, c: 30, g: 0.3, group: "carb" },
  "banana": { kcal: 89, p: 1.1, c: 23, g: 0.3, group: "carb" }, "maltodextrina": { kcal: 400, p: 0, c: 100, g: 0, group: "carb" },
  "doce de leite": { kcal: 280, p: 6, c: 54, g: 6, group: "carb" }, "fruta": { kcal: 50, p: 0.7, c: 12, g: 0.3, group: "carb" },
  "castanha do para": { kcal: 656, p: 14, c: 12, g: 66, group: "fat" }, "castanha": { kcal: 600, p: 18, c: 18, g: 55, group: "fat" },
  "linhaca": { kcal: 534, p: 18, c: 29, g: 42, group: "fat" }, "azeite": { kcal: 884, p: 0, c: 0, g: 100, group: "fat" },
  "legumes": { kcal: 30, p: 1.5, c: 6, g: 0.3, group: "other" }, "vegetais": { kcal: 25, p: 2, c: 5, g: 0.2, group: "other" },
};

export const normalizeFoodKey = (value: string) => String(value || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();

export const lookupFoodDensity = (name: string) => {
  const normalized = normalizeFoodKey(name);
  const key = Object.keys(FOOD_DENSITY).sort((a, b) => b.length - a.length).find((candidate) => normalized.includes(candidate));
  return key ? FOOD_DENSITY[key] : null;
};

export const parseFoodGrams = (value: unknown) => {
  if (typeof value === "number") return value > 0 ? value : null;
  const text = String(value ?? "");
  const matches = [...text.matchAll(/(\d+(?:[.,]\d+)?)\s*g\b/gi)];
  const match = matches.at(-1) || text.match(/(\d+(?:[.,]\d+)?)/);
  if (!match) return null;
  const grams = Number(match[1].replace(",", "."));
  return Number.isFinite(grams) && grams > 0 ? grams : null;
};

const correctedReferenceGrams = (name: string, label: string, grams: number | null) => {
  const food = normalizeFoodKey(name); const portion = normalizeFoodKey(label);
  const count = Number(portion.match(/(\d+(?:[.,]\d+)?)\s*(?:unidades?|ovos?)/)?.[1]?.replace(",", ".") || 1);
  if (food.includes("banana") && /unidade|media/.test(portion) && (!grams || grams > count * 360 || grams < count * 40)) return count * 120;
  if (/\bovo/.test(food) && /unidade|ovos?/.test(portion) && (!grams || grams > count * 150 || grams < count * 17)) return count * 50;
  return grams;
};

const round1 = (value: number) => Math.round(value * 10) / 10;

export function calculatePlanFromItems(plan: any, targetKcal: number, adjustToTarget = true) {
  const alerts: string[] = [];
  const calculate = () => {
    let p = 0, c = 0, g = 0;
    for (const meal of plan.refeicoes || []) {
      let mp = 0, mc = 0, mg = 0;
      for (const item of meal.alimentos || []) {
        const rawGrams = parseFoodGrams(item.quantidade_g) ?? parseFoodGrams(item.quantidade);
        const grams = correctedReferenceGrams(item.alimento, item.quantidade || "", rawGrams);
        const density = lookupFoodDensity(item.alimento);
        if (!grams || !density) {
          item.nutrition_status = "unavailable";
          item.kcal = item.protein_g = item.carbs_g = item.fat_g = null;
          alerts.push(`⚠️ ${item.alimento} sem dados nutricionais ou gramatura válida`);
          continue;
        }
        if (grams !== rawGrams) {
          item.quantidade_g = `${grams}g`;
          item.quantidade = `${String(item.quantidade || "").replace(/\s*\([^)]*g\)\s*/i, "").trim()} (~${grams}g)`.trim();
          alerts.push(`⚠️ ${item.alimento}: gramatura incompatível com a porção foi corrigida para ${grams}g`);
        }
        const factor = grams / 100;
        item.kcal = Math.round(density.kcal * factor); item.protein_g = round1(density.p * factor);
        item.carbs_g = round1(density.c * factor); item.fat_g = round1(density.g * factor);
        item.macros = { kcal: item.kcal, protein: item.protein_g, carbs: item.carbs_g, fat: item.fat_g };
        item.nutrition_status = "calculated";
        mp += item.protein_g; mc += item.carbs_g; mg += item.fat_g;
      }
      meal.macros = { proteina: round1(mp), carboidrato: round1(mc), gordura: round1(mg) };
      meal.calorias = Math.round(mp * 4 + mc * 4 + mg * 9); meal.kcal_calculada = meal.calorias;
      p += mp; c += mc; g += mg;
    }
    return { p: round1(p), c: round1(c), g: round1(g), kcal: Math.round(p * 4 + c * 4 + g * 9) };
  };

  let totals = calculate();
  const deviationPct = targetKcal > 0 ? Math.abs(totals.kcal - targetKcal) / targetKcal * 100 : 0;
  if (adjustToTarget && targetKcal > 0 && deviationPct > 5) {
    const adjustable: any[] = [];
    for (const meal of plan.refeicoes || []) for (const item of meal.alimentos || []) {
      const density = lookupFoodDensity(item.alimento); if (density?.group === "carb" || density?.group === "fat") adjustable.push(item);
    }
    const adjustableKcal = adjustable.reduce((sum, item) => sum + (Number(item.kcal) || 0), 0);
    const fixedKcal = totals.kcal - adjustableKcal;
    if (adjustableKcal > 0 && targetKcal > fixedKcal) {
      const factor = Math.max(0.25, Math.min(2.5, (targetKcal - fixedKcal) / adjustableKcal));
      adjustable.forEach((item) => {
        const grams = parseFoodGrams(item.quantidade_g) ?? parseFoodGrams(item.quantidade);
        if (!grams) return;
        const next = Math.max(1, Math.round(grams * factor)); item.quantidade_g = `${next}g`; item.quantidade = `${next}g`;
      });
      totals = calculate();
      alerts.push(`Gramaturas de carboidratos/gorduras recalculadas ×${factor.toFixed(3)} para aproximar a meta de ${targetKcal} kcal`);
    }
  }
  const finalPct = targetKcal > 0 ? Math.abs(totals.kcal - targetKcal) / targetKcal * 100 : 0;
  plan.resumo = { ...(plan.resumo || {}), calorias_totais: totals.kcal, proteina_total: totals.p, carboidrato_total: totals.c, gordura_total: totals.g };
  plan.validacao_nutricional = { total_real_kcal: totals.kcal, meta_kcal: targetKcal, desvio_pct: round1(finalPct), valido: finalPct <= 5, alertas: [...new Set(alerts)] };
  return plan;
}