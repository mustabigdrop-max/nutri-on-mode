import { describe, expect, it } from "vitest";
import { decideStratum, STRATUM_VOLUME_LANDMARKS } from "./stratumDecisionEngine";

describe("STRATUM decision engine", () => {
  it("bloqueia falha e técnicas para iniciantes", () => {
    const out = decideStratum({ level: "iniciante", phase: "acumulação", goal: "hipertrofia", week: 4, frequency: 3 });
    expect(out.failureRule).toBe("bloqueada");
    expect(out.advancedTechniquesAllowed).toBe(false);
    expect(out.compoundRir).toBe("3-5");
  });

  it("bloqueia técnicas e avaliação APEX no deload", () => {
    const out = decideStratum({ level: "avançado", phase: "deload", week: 4, frequency: 5 });
    expect(out.advancedTechniquesAllowed).toBe(false);
    expect(out.apexCadence).toBe("nenhuma");
    expect(out.volumeModifierPercent).toBe(-30);
  });

  it("só libera BFR com supervisão e sem contraindicação", () => {
    expect(decideStratum({ hasBfrSupervision: false }).bfrAllowed).toBe(false);
    expect(decideStratum({ hasBfrSupervision: true, hasBfrContraindication: true }).bfrAllowed).toBe(false);
    expect(decideStratum({ hasBfrSupervision: true, hasBfrContraindication: false }).bfrAllowed).toBe(true);
  });

  it("aplica zona de força na realização", () => {
    const out = decideStratum({ goal: "força", phase: "realização", level: "avançado", week: 4 });
    expect(out.compoundReps).toBe("1-3");
    expect(out.compoundRir).toBe("1");
  });

  it("mantém landmarks dentro dos limites declarados", () => {
    Object.values(STRATUM_VOLUME_LANDMARKS).forEach((v) => {
      expect(v.mev).toBeLessThanOrEqual(v.mav[0]);
      expect(v.mav[1]).toBeLessThanOrEqual(v.mrv);
    });
  });
});