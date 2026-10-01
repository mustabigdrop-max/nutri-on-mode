import { describe, expect, it } from "vitest";
import { computeCycle, patternSequence, addDays } from "./trainingCycle";

const seq = patternSequence("3x1")!;
// 2026-09-30 é quarta-feira
const start = "2026-09-30";

describe("ciclo 3x1", () => {
  it("mantém treino/folga por 3+ semanas, sem depender do dia da semana", () => {
    const days = computeCycle({ sequence: seq, startDate: start, until: addDays(start, 27), workoutCount: 3 });
    expect(days).toHaveLength(28);
    days.forEach((d, i) => expect(d.isTraining).toBe(i % 4 !== 3));
    const trained = days.filter((d) => d.isTraining).map((d) => d.workoutIndex);
    trained.forEach((w, i) => expect(w).toBe(i % 3));
  });

  it("folga extra desliza o ciclo um dia", () => {
    const fx = addDays(start, 1);
    const days = computeCycle({ sequence: seq, startDate: start, until: addDays(start, 8), workoutCount: 3, adjustments: { [fx]: "folga_extra" } });
    expect(days.map((d) => (d.isTraining ? "T" : "F")).join("")).toBe("TFTTFTTTF");
    expect(days[2].workoutIndex).toBe(1);
  });

  it("treino adiantado num dia de folga consome a folga", () => {
    const fx = addDays(start, 3); // folga original
    const days = computeCycle({ sequence: seq, startDate: start, until: addDays(start, 8), workoutCount: 3, adjustments: { [fx]: "treino_adiantado" } });
    expect(days.map((d) => (d.isTraining ? "T" : "F")).join("")).toBe("TTTTTTFTT");
  });
});
