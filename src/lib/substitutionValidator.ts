// Validador de substituições com tolerância calórica e ajuste de gramagem.
import { lookupDensity, parseGrams, type FoodDensity } from "./foodKcalDatabase";

export interface FoodSnapshot {
  nome: string;
  gramas: number | null;
  densidade: FoodDensity | null;
  kcal: number | null;
  proteina: number | null;
  carbo: number | null;
  gordura: number | null;
}

export interface SubstitutionValidation {
  original: FoodSnapshot;
  proposto: FoodSnapshot;          // valores baseados na gramagem sugerida pela IA
  ajustado: FoodSnapshot;          // valores recalculados para BATER em kcal com original
  deltaKcal: number | null;        // ajustado.kcal - original.kcal
  deltaP: number | null;
  deltaC: number | null;
  deltaG: number | null;
  status: "ideal" | "ok" | "fora";  // ideal: ±5%, ok: ±5-10%, fora: >10%
  compatibilidade: number;          // 0-100
  motivo: string;
}

const PCT_KCAL_IDEAL = 0.05;
const PCT_KCAL_OK = 0.10;
const PCT_P = 0.20;
const PCT_C = 0.25;
const PCT_G = 0.30;

const round = (n: number, d = 1) => {
  const m = Math.pow(10, d);
  return Math.round(n * m) / m;
};

export const buildSnapshot = (nome: string, gramasRaw?: string | number | null): FoodSnapshot => {
  const gramas = parseGrams(gramasRaw);
  const densidade = lookupDensity(nome);
  if (!gramas || !densidade) {
    return { nome, gramas, densidade, kcal: null, proteina: null, carbo: null, gordura: null };
  }
  const f = gramas / 100;
  return {
    nome,
    gramas,
    densidade,
    kcal: Math.round(densidade.kcal * f),
    proteina: round(densidade.p * f, 1),
    carbo: round(densidade.c * f, 1),
    gordura: round(densidade.g * f, 1),
  };
};

/** Recalcula a gramagem do substituto para igualar kcal do original. */
export const ajustarGramasParaIsocaloria = (
  kcalAlvo: number,
  densidadeSub: FoodDensity,
): number => {
  if (!densidadeSub.kcal) return 0;
  return Math.round((kcalAlvo / densidadeSub.kcal) * 100);
};

export const validateSubstitution = (
  originalNome: string,
  originalQtd: string | number | null | undefined,
  subNome: string,
  subQtd: string | number | null | undefined,
): SubstitutionValidation => {
  const original = buildSnapshot(originalNome, originalQtd);
  const proposto = buildSnapshot(subNome, subQtd);

  // calcular ajustado (mesmas kcal do original)
  let ajustado: FoodSnapshot = proposto;
  if (original.kcal && proposto.densidade) {
    const g = ajustarGramasParaIsocaloria(original.kcal, proposto.densidade);
    ajustado = buildSnapshot(subNome, g);
  }

  // deltas
  const deltaKcal = original.kcal != null && ajustado.kcal != null ? ajustado.kcal - original.kcal : null;
  const deltaP = original.proteina != null && ajustado.proteina != null ? round(ajustado.proteina - original.proteina, 1) : null;
  const deltaC = original.carbo != null && ajustado.carbo != null ? round(ajustado.carbo - original.carbo, 1) : null;
  const deltaG = original.gordura != null && ajustado.gordura != null ? round(ajustado.gordura - original.gordura, 1) : null;

  // status
  let status: SubstitutionValidation["status"] = "ok";
  if (deltaKcal == null || original.kcal == null) {
    status = "ok";
  } else {
    const pct = Math.abs(deltaKcal) / Math.max(1, original.kcal);
    status = pct <= PCT_KCAL_IDEAL ? "ideal" : pct <= PCT_KCAL_OK ? "ok" : "fora";
  }

  // compatibilidade: começa em 100 e penaliza por desvio em cada macro
  let compat = 100;
  const penalize = (delta: number | null, base: number | null, tolPct: number, weight: number) => {
    if (delta == null || base == null || !base) return;
    const pct = Math.abs(delta) / base;
    if (pct <= tolPct) compat -= (pct / tolPct) * weight * 0.3;
    else compat -= weight;
  };
  if (deltaKcal != null && original.kcal) {
    const pct = Math.abs(deltaKcal) / original.kcal;
    if (pct <= PCT_KCAL_IDEAL) compat -= 0;
    else if (pct <= PCT_KCAL_OK) compat -= 5;
    else compat -= 25;
  }
  penalize(deltaP, original.proteina, PCT_P, 20);
  penalize(deltaC, original.carbo, PCT_C, 15);
  penalize(deltaG, original.gordura, PCT_G, 10);
  if (!proposto.densidade) compat = Math.min(compat, 50);
  if (original.densidade && proposto.densidade && original.densidade.grupo === proposto.densidade.grupo) compat += 5;
  compat = Math.max(0, Math.min(100, Math.round(compat)));

  // motivo
  let motivo = "";
  if (!original.densidade || !proposto.densidade) {
    motivo = "Sem dados nutricionais — validação aproximada";
  } else if (status === "ideal" && deltaKcal === 0) {
    motivo = "Kcal idêntico ao original";
  } else if (original.densidade.grupo === proposto.densidade.grupo) {
    motivo = `Mesmo perfil ${original.densidade.grupo} — boa equivalência`;
  } else {
    motivo = `Troca entre grupos (${original.densidade.grupo} → ${proposto.densidade.grupo})`;
  }

  return { original, proposto, ajustado, deltaKcal, deltaP, deltaC, deltaG, status, compatibilidade: compat, motivo };
};
