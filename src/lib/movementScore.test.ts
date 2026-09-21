import { describe, expect, it } from "vitest";
import { calcularMovementScore, classificar, referenciaPara } from "./movementScore";
import type { FrameAnalysis } from "./poseAnalysis";

const frame = (over: Partial<FrameAnalysis["angles"]>, t = 0): FrameAnalysis => ({
  t,
  angles: {
    leftKnee: 170, rightKnee: 170, leftHip: 170, rightHip: 170,
    leftElbow: 170, rightElbow: 170, leftShoulder: 30, rightShoulder: 30,
    trunkLean: 170, ...over,
  },
  hipY: 0.5,
});

const serie = (over: Partial<FrameAnalysis["angles"]>) =>
  Array.from({ length: 8 }, (_, i) => frame(over, i * 150));

describe("movement score", () => {
  it("resolve a referência por alias", () => {
    expect(referenciaPara("Agachamento com barra")?.exercicio).toBe("Agachamento");
    expect(referenciaPara("exercício inexistente")).toBeNull();
  });

  it("não calcula sem referência ou sem frames", () => {
    expect(calcularMovementScore("Exercício desconhecido", serie({}))).toBeNull();
    expect(calcularMovementScore("Agachamento", serie({}).slice(0, 3))).toBeNull();
  });

  it("dá nota alta para execução dentro das faixas", () => {
    const frames = [
      ...serie({ leftKnee: 85, rightKnee: 85, trunkLean: 90, leftHip: 80, rightHip: 80 }),
      ...serie({ leftHip: 172, rightHip: 172 }),
    ];
    const r = calcularMovementScore("Agachamento livre", frames)!;
    expect(r.score).toBeGreaterThanOrEqual(80);
    expect(["EXCELENTE", "PERFEITO", "BOM"]).toContain(r.classificacao);
    expect(r.componentes.every((c) => ["OK", "ATENÇÃO", "ERRO"].includes(c.status))).toBe(true);
    expect(r.overlayImageUrl).toContain("data:image/svg+xml");
  });

  it("limita o score a 40 quando há risco articular", () => {
    const frames = serie({ trunkLean: 20, leftKnee: 85, rightKnee: 85, leftHip: 80, rightHip: 80 });
    const r = calcularMovementScore("Agachamento", frames)!;
    expect(r.score).toBeLessThanOrEqual(40);
    expect(r.alertaSeguranca).toBeTruthy();
    expect(r.errosDetectados[0].seguranca).toBe(true);
  });

  it("classifica pelas faixas do brief", () => {
    expect(classificar(30)).toBe("PRECISA CORRIGIR");
    expect(classificar(55)).toBe("RAZOÁVEL");
    expect(classificar(75)).toBe("BOM");
    expect(classificar(90)).toBe("EXCELENTE");
    expect(classificar(100)).toBe("PERFEITO");
  });
});
