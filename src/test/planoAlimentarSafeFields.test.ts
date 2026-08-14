import { describe, expect, it } from "vitest";
import { safeString, safeLower } from "@/lib/utils";
import { lookupDensity, parseGrams } from "@/lib/foodKcalDatabase";
import { calculateNutritionItem, validateNutritionPlan } from "@/lib/planNutritionValidation";
import { resolveGoalObjetivo, computeAdjustedMacros } from "@/lib/goalMacros";

// Valores "sujos" que o Supabase pode devolver em colunas jsonb/text
const DIRTY: unknown[] = [null, undefined, 0, 123, 45.6, true, false, {}, [], NaN];

describe("safeString / safeLower", () => {
  it("nunca lança para valores nulos, numéricos ou objetos", () => {
    for (const v of DIRTY) {
      expect(() => safeString(v)).not.toThrow();
      expect(typeof safeString(v)).toBe("string");
      expect(typeof safeLower(v)).toBe("string");
    }
  });

  it("converte null/undefined em string vazia", () => {
    expect(safeString(null)).toBe("");
    expect(safeString(undefined)).toBe("");
    expect(safeLower(null)).toBe("");
  });

  it("converte números e mantém strings", () => {
    expect(safeString(120)).toBe("120");
    expect(safeLower("Frango GRELHADO")).toBe("frango grelhado");
  });
});

describe("foodKcalDatabase", () => {
  it("lookupDensity não quebra com tipos inesperados", () => {
    for (const v of DIRTY) {
      expect(() => lookupDensity(v as never)).not.toThrow();
    }
    expect(lookupDensity(null as never)).toBeNull();
  });

  it("parseGrams aceita número, string e nulo", () => {
    expect(parseGrams(150)).toBe(150);
    expect(parseGrams("150g")).toBe(150);
    expect(parseGrams(null)).toBeNull();
    expect(parseGrams(undefined)).toBeNull();
    for (const v of DIRTY) {
      expect(() => parseGrams(v as never)).not.toThrow();
    }
  });
});

describe("planNutritionValidation", () => {
  it("calculateNutritionItem tolera campos ausentes/numéricos", () => {
    const items: unknown[] = [
      {},
      { alimento: null, quantidade: null },
      { alimento: 123, quantidade: 200 },
      { alimento: "Arroz branco cozido", quantidade: "150g" },
      { alimento: ["x"], quantidade: {} },
    ];
    for (const item of items) {
      expect(() => calculateNutritionItem(item as never)).not.toThrow();
    }
  });

  it("validateNutritionPlan tolera refeições malformadas", () => {
    const meals: unknown[] = [
      { nome: null, itens: null },
      { nome: 5, alimentos: [{ alimento: null, quantidade: 100 }] },
      { nome: "Almoço", itens: [{ alimento: "Frango grelhado", quantidade: "180g" }] },
    ];
    expect(() => validateNutritionPlan(meals as never, 2400)).not.toThrow();
    expect(() => validateNutritionPlan([] as never, 0)).not.toThrow();
  });
});

describe("goalMacros", () => {
  it("resolveGoalObjetivo aceita valores sujos", () => {
    for (const v of DIRTY) {
      expect(() => resolveGoalObjetivo(v as never)).not.toThrow();
    }
    expect(typeof resolveGoalObjetivo(null)).toBe("string");
  });

  it("computeAdjustedMacros não quebra com sexo/goal inválidos", () => {
    expect(() =>
      computeAdjustedMacros({
        tdee: 2600,
        goal: null as never,
        weightKg: 82,
        sex: 42 as never,
      } as never),
    ).not.toThrow();
  });
});
