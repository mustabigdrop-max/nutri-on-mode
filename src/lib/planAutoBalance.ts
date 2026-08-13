// ─────────────────────────────────────────────────────────────
// NutriPlan — Motor de precisão calórica (validação + auto-correção)
// Regra inegociável: kcal do plano = meta ±2%.
// Fórmula única: kcal = (PTN×4) + (CHO×4) + (LIP×9)
// Estratégia de correção: ajustar gramagens de CHO (nunca proteína).
// Gordura só é ajustada se o CHO sozinho não fechar a meta.
// ─────────────────────────────────────────────────────────────
import { lookupDensity, parseGrams, type FoodDensity } from "@/lib/foodKcalDatabase";

export const KCAL_TOLERANCE_PCT = 2;

export interface BalanceReport {
  adjusted: boolean;
  isBalanced: boolean;
  targetKcal: number;
  originalKcal: number;
  finalKcal: number;
  delta: number;
  deltaPct: number;
  macros: { protein: number; carbs: number; fat: number };
  adjustments: string[];
  unmatched: string[];
}

interface FoodRef {
  food: any;
  meal: any;
  density: FoodDensity | null;
  grams: number | null;
  originalGrams: number | null;
  changed: boolean;
}

const round1 = (v: number) => Math.round(v * 10) / 10;
export const atwater = (p: number, c: number, g: number) => p * 4 + c * 4 + g * 9;

const readGrams = (food: any): number | null =>
  parseGrams(food?.quantidade_g) ?? parseGrams(food?.quantidade);

/** Macros de um alimento: usa o banco TACO quando reconhecido; senão, o que a IA informou. */
const macrosOf = (ref: FoodRef) => {
  if (ref.density && ref.grams) {
    const f = ref.grams / 100;
    return {
      protein: ref.density.p * f,
      carbs: ref.density.c * f,
      fat: ref.density.g * f,
    };
  }
  return {
    protein: Number(ref.food?.protein_g) || Number(ref.food?.macros?.protein) || 0,
    carbs: Number(ref.food?.carbs_g) || Number(ref.food?.macros?.carbs) || 0,
    fat: Number(ref.food?.fat_g) || Number(ref.food?.macros?.fat) || 0,
  };
};

const collect = (plano: any): FoodRef[] => {
  const refs: FoodRef[] = [];
  for (const meal of plano?.refeicoes || []) {
    for (const food of meal?.alimentos || []) {
      const grams = readGrams(food);
      refs.push({
        food,
        meal,
        density: lookupDensity(String(food?.alimento || "")),
        grams,
        originalGrams: grams,
        changed: false,
      });
    }
  }
  return refs;
};

const totalsOf = (refs: FoodRef[]) => {
  let protein = 0, carbs = 0, fat = 0;
  for (const ref of refs) {
    const m = macrosOf(ref);
    protein += m.protein;
    carbs += m.carbs;
    fat += m.fat;
  }
  return { protein, carbs, fat, kcal: atwater(protein, carbs, fat) };
};

/** Distribui um delta calórico (kcal) entre alimentos candidatos, ajustando gramagens. */
const distribute = (candidates: FoodRef[], deltaKcal: number): number => {
  const pool = candidates.filter((r) => r.density && r.grams && r.grams > 0);
  if (!pool.length) return deltaKcal;

  // Peso = contribuição calórica de CHO do alimento, penalizando fontes ricas em
  // proteína (para preservar a proteína total ao corrigir para baixo).
  const weights = pool.map((r) => {
    const d = r.density!;
    const choKcal = (d.c / 100) * r.grams! * 4;
    const base = choKcal > 0 ? choKcal : (d.kcal / 100) * r.grams!;
    return base / (1 + d.p / 6);
  });
  const totalWeight = weights.reduce((s, w) => s + w, 0);
  if (totalWeight <= 0) return deltaKcal;

  let remaining = deltaKcal;
  pool.forEach((ref, i) => {
    const d = ref.density!;
    const kcalPerGram = d.kcal / 100;
    if (kcalPerGram <= 0) return;
    const share = deltaKcal * (weights[i] / totalWeight);
    const gramsShift = share / kcalPerGram; // >0 = reduzir
    const minGrams = Math.max(5, (ref.originalGrams || ref.grams!) * 0.35);
    const maxGrams = (ref.originalGrams || ref.grams!) * 2.5;
    const next = Math.min(maxGrams, Math.max(minGrams, ref.grams! - gramsShift));
    const appliedKcal = (ref.grams! - next) * kcalPerGram;
    if (Math.abs(next - ref.grams!) >= 1) {
      ref.grams = Math.round(next);
      ref.changed = true;
    }
    remaining -= appliedKcal;
  });
  return remaining;
};

const writeBack = (refs: FoodRef[], plano: any) => {
  for (const ref of refs) {
    const m = macrosOf(ref);
    const kcal = Math.round(atwater(m.protein, m.carbs, m.fat));
    if (ref.grams) {
      ref.food.quantidade_g = Math.round(ref.grams);
      if (ref.changed) ref.food.quantidade = `${Math.round(ref.grams)}g`;
    }
    if (ref.density) {
      ref.food.protein_g = round1(m.protein);
      ref.food.carbs_g = round1(m.carbs);
      ref.food.fat_g = round1(m.fat);
      ref.food.kcal = kcal;
      ref.food.macros = { kcal, protein: round1(m.protein), carbs: round1(m.carbs), fat: round1(m.fat) };
      ref.food.nutrition_status = "calculated";
    }
  }

  for (const meal of plano?.refeicoes || []) {
    const items: FoodRef[] = refs.filter((r) => r.meal === meal);
    let p = 0, c = 0, g = 0;
    for (const it of items) {
      const m = macrosOf(it);
      p += m.protein; c += m.carbs; g += m.fat;
    }
    const kcal = Math.round(atwater(p, c, g));
    meal.macros = { proteina: Math.round(p), carboidrato: Math.round(c), gordura: Math.round(g) };
    meal.calorias = kcal;
    meal.kcal_calculada = kcal;
    // Remove o valor "declarado" pela IA — evita deltas vermelhos falsos na UI
    if ("kcal_declarada" in meal) delete meal.kcal_declarada;
  }

  const t = totalsOf(refs);
  if (plano?.resumo) {
    plano.resumo.proteina_total = Math.round(t.protein);
    plano.resumo.carboidrato_total = Math.round(t.carbs);
    plano.resumo.gordura_total = Math.round(t.fat);
    plano.resumo.calorias_totais = Math.round(t.kcal);
  }
};

/**
 * Recalcula todos os macros com o banco nutricional real e auto-corrige as
 * gramagens de carboidrato (e, se necessário, gordura) até fechar a meta ±2%.
 */
export const autoBalancePlan = <T extends any>(plano: T, targetKcal: number): { plano: T; report: BalanceReport } => {
  const next: any = typeof structuredClone === "function" ? structuredClone(plano) : JSON.parse(JSON.stringify(plano));
  const refs = collect(next);
  const original = totalsOf(refs);
  const target = Number(targetKcal) || 0;

  const report: BalanceReport = {
    adjusted: false,
    isBalanced: true,
    targetKcal: target,
    originalKcal: Math.round(original.kcal),
    finalKcal: Math.round(original.kcal),
    delta: 0,
    deltaPct: 0,
    macros: { protein: Math.round(original.protein), carbs: Math.round(original.carbs), fat: Math.round(original.fat) },
    adjustments: [],
    unmatched: refs.filter((r) => !r.density || !r.grams).map((r) => String(r.food?.alimento || "?")),
  };

  if (!target || !refs.length) {
    writeBack(refs, next);
    const t = totalsOf(refs);
    report.finalKcal = Math.round(t.kcal);
    report.macros = { protein: Math.round(t.protein), carbs: Math.round(t.carbs), fat: Math.round(t.fat) };
    return { plano: next as T, report };
  }

  const tolerance = (target * KCAL_TOLERANCE_PCT) / 100;
  const carbRefs = refs.filter((r) => r.density && (r.density.grupo === "carbo" || r.density.c >= 15) && r.density.grupo !== "proteina");
  const fatRefs = refs.filter((r) => r.density && r.density.grupo === "gordura");

  let delta = totalsOf(refs).kcal - target;
  let carbShift = 0;
  let fatShift = 0;

  for (let i = 0; i < 8 && Math.abs(delta) > tolerance; i++) {
    const before = delta;
    distribute(carbRefs, delta);
    delta = totalsOf(refs).kcal - target;
    carbShift += before - delta;
    if (Math.abs(before - delta) < 1) break;
  }

  if (Math.abs(delta) > tolerance) {
    for (let i = 0; i < 5 && Math.abs(delta) > tolerance; i++) {
      const before = delta;
      distribute(fatRefs, delta);
      delta = totalsOf(refs).kcal - target;
      fatShift += before - delta;
      if (Math.abs(before - delta) < 1) break;
    }
  }

  writeBack(refs, next);
  const finalTotals = totalsOf(refs);
  const finalDelta = Math.round(finalTotals.kcal - target);

  report.finalKcal = Math.round(finalTotals.kcal);
  report.delta = finalDelta;
  report.deltaPct = Math.round((Math.abs(finalDelta) / target) * 1000) / 10;
  report.isBalanced = Math.abs(finalDelta) <= tolerance;
  report.adjusted = refs.some((r) => r.changed);
  report.macros = { protein: Math.round(finalTotals.protein), carbs: Math.round(finalTotals.carbs), fat: Math.round(finalTotals.fat) };
  if (Math.abs(carbShift) >= 1) report.adjustments.push(`${carbShift > 0 ? "-" : "+"}${Math.abs(Math.round(carbShift))} kcal em carboidratos`);
  if (Math.abs(fatShift) >= 1) report.adjustments.push(`${fatShift > 0 ? "-" : "+"}${Math.abs(Math.round(fatShift))} kcal em gorduras`);

  return { plano: next as T, report };
};
