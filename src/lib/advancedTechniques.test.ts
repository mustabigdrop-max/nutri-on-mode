import { describe, expect, it } from "vitest";
import { selectSessionTechniques } from "./advancedTechniques";

const exercises = [
  { name: "Supino reto com barra" },
  { name: "Crucifixo no cabo" },
  { name: "Tríceps na polia" },
];

describe("advanced technique safety", () => {
  it("não programa técnica para iniciante, semana inicial ou deload", () => {
    expect(selectSessionTechniques({ exercises, week: 4, level: "iniciante" })).toEqual({});
    expect(selectSessionTechniques({ exercises, week: 2, level: "avancado" })).toEqual({});
    expect(selectSessionTechniques({ exercises, week: 4, level: "avancado", isDeload: true })).toEqual({});
  });

  it("usa cluster apenas em compostos de força na fase adequada", () => {
    const result = selectSessionTechniques({ exercises, week: 3, level: "intermediario", goal: "força", phase: "transmutação" });
    expect(result).toEqual({ "Supino reto com barra": "CLUSTER_SET" });
  });

  it("prioriza rest-pause e limita hipertrofia a dois isoladores", () => {
    const result = selectSessionTechniques({ exercises, week: 3, level: "avancado", goal: "hipertrofia", phase: "acumulação" });
    expect(Object.keys(result)).toHaveLength(2);
    expect(result["Crucifixo no cabo"]).toBe("REST_PAUSE");
    expect(result["Supino reto com barra"]).toBeUndefined();
  });
});