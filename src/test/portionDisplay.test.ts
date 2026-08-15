import { describe, it, expect } from "vitest";
import { portionParts, portionOf, isGramsOnly } from "@/lib/portionDisplay";

describe("portionDisplay — medida caseira como texto principal", () => {
  it("usa a medida caseira como principal e a gramatura como referência secundária", () => {
    const r = portionParts({ quantidade: "2 fatias médias", quantidade_g: "60 g" });
    expect(r.primary).toBe("2 fatias médias");
    expect(r.secondary).toBe("60 g");
  });

  it("nunca coloca a gramatura como texto principal quando há medida caseira", () => {
    const casos = [
      { quantidade: "1 colher de sopa", quantidade_g: "15 g" },
      { quantidade: "1 concha cheia", quantidade_g: "120g" },
      { quantidade: "1 copo americano", quantidade_g: "200 ml" },
    ];
    for (const c of casos) {
      const r = portionParts(c);
      expect(r.primary).toBe(c.quantidade);
      expect(isGramsOnly(r.primary)).toBe(false);
    }
  });

  it("quando só existe gramatura, ela vira principal e não duplica como secundária", () => {
    const r = portionParts({ quantidade: "", quantidade_g: "150 g" });
    expect(r.primary).toBe("150 g");
    expect(r.secondary).toBeNull();
  });

  it("quando a 'medida caseira' é apenas gramatura, não duplica o texto", () => {
    const r = portionParts({ quantidade: "150 g", quantidade_g: "150 g" });
    expect(r.primary).toBe("150 g");
    expect(r.secondary).toBeNull();
  });

  it("omite a secundária quando ela é idêntica à principal", () => {
    const r = portionParts({ quantidade: "1 unidade", quantidade_g: "1 UNIDADE" });
    expect(r.secondary).toBeNull();
  });

  it("é resiliente a valores nulos, numéricos ou ausentes", () => {
    expect(portionParts({}).primary).toBe("");
    expect(portionParts({ quantidade: null, quantidade_g: 120 as unknown }).primary).toBe("120");
    expect(portionOf({ quantidade: undefined, quantidade_g: "80 g" })).toBe("80 g");
  });

  it("isGramsOnly reconhece variações de unidade", () => {
    expect(isGramsOnly("100g")).toBe(true);
    expect(isGramsOnly("1,5 kg")).toBe(true);
    expect(isGramsOnly("250 ml")).toBe(true);
    expect(isGramsOnly("2 fatias")).toBe(false);
    expect(isGramsOnly("1 xícara (200 ml)")).toBe(false);
  });
});
