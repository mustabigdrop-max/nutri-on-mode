import { describe, it, expect } from "vitest";
import { normalizeFoodItem, macroGroupOf } from "@/lib/foodSpecificity";
import { describePortion } from "@/lib/householdMeasures";

describe("categorias de macro", () => {
  it("classifica vegetais, lácteos e frutas separadamente", () => {
    expect(macroGroupOf("Brócolis + cenoura")).toBe("vegetable");
    expect(macroGroupOf("Iogurte grego")).toBe("dairy");
    expect(macroGroupOf("Banana média")).toBe("fruit");
    expect(macroGroupOf("Frango grelhado")).toBe("protein");
    expect(macroGroupOf("Arroz branco")).toBe("carb");
    expect(macroGroupOf("Castanha do pará")).toBe("fat");
  });
});

describe("substituições respeitam a categoria", () => {
  it("vegetal nunca sugere carboidrato", () => {
    const [food] = normalizeFoodItem({
      alimento: "Brócolis + cenoura",
      quantidade: "3 colheres de sopa cheias",
      quantidade_g: "150g",
      substituicoes: [{ alimento: "Arroz / batata / mandioca", quantidade: "432g" }],
    });
    expect(food.grupo).toBe("vegetable");
    expect(food.substituicoes.length).toBeGreaterThan(0);
    for (const s of food.substituicoes) {
      expect(macroGroupOf(s.alimento)).toBe("vegetable");
    }
  });

  it("proteína sugere apenas proteínas com gramatura equivalente", () => {
    const [food] = normalizeFoodItem({
      alimento: "Frango grelhado",
      quantidade: "286g",
      substituicoes: [],
    });
    expect(food.substituicoes.every((s) => macroGroupOf(s.alimento) === "protein")).toBe(true);
    const ovos = food.substituicoes.find((s) => /ovo/i.test(s.alimento));
    // 286 g de frango ≈ 88 g de proteína ≈ 6-7 ovos
    if (ovos?.gramas) expect(ovos.gramas).toBeGreaterThan(200);
  });
});

describe("gramaturas arredondadas para medidas caseiras", () => {
  it("6 g de castanha vira unidades inteiras", () => {
    const desc = describePortion("Castanha do pará", 6);
    expect(desc?.grams).toBe(8);
    expect(desc?.measure).toMatch(/unidade/);
  });

  it("linhaça de 5 g vira 1 colher (10 g)", () => {
    expect(describePortion("Linhaça moída", 5)?.grams).toBe(10);
  });
});
