import { describe, expect, it } from "vitest";
import { calculateNutritionItem, validateNutritionPlan } from "./planNutritionValidation";

describe("NutriPlan nutrition validation", () => {
  it("calcula macros por item sem concentrá-los na proteína", () => {
    const tilapia = calculateNutritionItem({ alimento: "Tilápia", quantidade_g: "186g" });
    const batata = calculateNutritionItem({ alimento: "Batata-doce cozida", quantidade_g: "580g" });
    expect(tilapia.macros?.carbs).toBe(0);
    expect(tilapia.macros?.kcal).toBeGreaterThan(0);
    expect(batata.macros?.carbs).toBe(116);
    expect(batata.macros?.kcal).toBeGreaterThan(0);
  });

  it("lê a gramatura técnica entre parênteses, não a quantidade de unidades", () => {
    const eggs = calculateNutritionItem({ alimento: "Ovos inteiros", quantidade: "8 unidades (~400g)", quantidade_g: "400g" });
    expect(eggs.grams).toBe(400);
    expect(eggs.macros?.protein).toBe(52);
  });

  it("detecta as porções irreais e o desvio do caso Marcus Avila", () => {
    const result = validateNutritionPlan([
      { refeicao: "R1", alimentos: [
        { alimento: "Ovos inteiros", quantidade: "8 unidades", quantidade_g: "100g" },
        { alimento: "Aveia", quantidade: "17 colheres de sopa", quantidade_g: "218g" },
        { alimento: "Banana", quantidade: "1 unidade média", quantidade_g: "595g" },
      ] },
      { refeicao: "R5", alimentos: [
        { alimento: "Tilápia", quantidade_g: "186g" },
        { alimento: "Batata-doce", quantidade_g: "580g" },
      ] },
    ], 1200);
    expect(result.alerts.some((alert) => alert.message.includes("Banana") && alert.message.includes("esperado"))).toBe(true);
    expect(result.alerts.some((alert) => alert.message.includes("Ovos inteiros") && alert.message.includes("esperado"))).toBe(true);
    expect(result.meals[1].alimentos?.[0].macros?.carbs).toBe(0);
    expect(result.meals[1].alimentos?.[1].macros?.carbs).toBe(116);
  });

  it("marca alimento desconhecido como indisponível em vez de 0 kcal", () => {
    const result = validateNutritionPlan([{ refeicao: "Teste", alimentos: [{ alimento: "Alimento inexistente", quantidade_g: "100g" }] }], 500);
    expect(result.meals[0].alimentos?.[0].nutrition_status).toBe("unavailable");
    expect(result.meals[0].alimentos?.[0].macros).toBeUndefined();
    expect(result.alerts[0].message).toContain("sem dados nutricionais");
  });
});