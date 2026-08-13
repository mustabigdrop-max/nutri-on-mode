import { describe, expect, it } from "vitest";
import { autoBalancePlan, atwater } from "./planAutoBalance";

const mkPlan = () => ({
  resumo: { nome: "Teste", calorias_totais: 9999, proteina_total: 0, carboidrato_total: 0, gordura_total: 0 },
  refeicoes: [
    {
      refeicao: "Café",
      kcal_declarada: 1200,
      calorias: 1200,
      alimentos: [
        { alimento: "Ovo inteiro", quantidade_g: 150 },
        { alimento: "Aveia em flocos", quantidade_g: 120 },
        { alimento: "Banana", quantidade_g: 200 },
      ],
    },
    {
      refeicao: "Almoço",
      alimentos: [
        { alimento: "Peito de frango", quantidade_g: 200 },
        { alimento: "Arroz branco", quantidade_g: 400 },
        { alimento: "Azeite de oliva", quantidade_g: 20 },
      ],
    },
  ],
});

const sum = (plan: any) => {
  let p = 0, c = 0, g = 0;
  for (const m of plan.refeicoes) for (const a of m.alimentos) {
    p += a.protein_g || 0; c += a.carbs_g || 0; g += a.fat_g || 0;
  }
  return atwater(p, c, g);
};

describe("autoBalancePlan", () => {
  it("fecha o plano dentro de ±2% da meta reduzindo carboidratos", () => {
    const { plano, report } = autoBalancePlan(mkPlan(), 2000);
    expect(report.isBalanced).toBe(true);
    expect(Math.abs(report.delta)).toBeLessThanOrEqual(40);
    expect(Math.abs(sum(plano) - 2000)).toBeLessThanOrEqual(40);
  });

  it("aumenta calorias quando o plano está abaixo da meta", () => {
    const { report } = autoBalancePlan(mkPlan(), 3200);
    expect(report.isBalanced).toBe(true);
    expect(report.finalKcal).toBeGreaterThan(report.originalKcal);
  });

  it("não reduz a proteína total ao corrigir para baixo", () => {
    const before = autoBalancePlan(mkPlan(), 99999).report.macros.protein;
    const after = autoBalancePlan(mkPlan(), 2000).report.macros.protein;
    expect(after).toBeGreaterThanOrEqual(before - 1);
  });

  it("zera os deltas por refeição (kcal declarada removida)", () => {
    const { plano } = autoBalancePlan(mkPlan(), 2000) as any;
    for (const m of plano.refeicoes) {
      expect(m.kcal_declarada).toBeUndefined();
      expect(m.calorias).toBe(m.kcal_calculada);
    }
  });
});
