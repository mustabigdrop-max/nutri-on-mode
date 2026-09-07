import { describe, expect, it } from "vitest";
import { isGenericFoodName, normalizeFoodItem } from "./foodSpecificity";

describe("isGenericFoodName", () => {
  it("rejeita categorias genéricas", () => {
    for (const nome of ["Fruta", "1 fruta", "Vegetais", "Legumes variados", "Castanhas", "Proteína magra", "Salada", "Suco natural", "Chá"]) {
      expect(isGenericFoodName(nome)).toBe(true);
    }
  });
  it("aceita alimentos específicos", () => {
    for (const nome of ["Castanha do Pará", "Banana prata", "Frango grelhado", "Tempero funcional: cúrcuma + pimenta-preta", "Iogurte grego natural integral"]) {
      expect(isGenericFoodName(nome)).toBe(false);
    }
  });
});

describe("normalizeFoodItem", () => {
  it("troca item genérico por alimento específico", () => {
    const [item] = normalizeFoodItem({ alimento: "Fruta", quantidade: "40g" });
    expect(isGenericFoodName(item.alimento)).toBe(false);
    expect(item.substituicoes.every((s) => !isGenericFoodName(s.alimento))).toBe(true);
  });
});
