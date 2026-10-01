import { describe, expect, it } from "vitest";
import { computeCycle, patternSequence, addDays } from "./trainingCycle";
import { planFatigue, restDayContent, reduceSets, type FatigueWorkout, type NivelCliente } from "./trainingFatigue";

const ex = (name: string, muscle: string, sets: number) => ({ name, muscle, sets });
// Três treinos pesados (grupos grandes) para forçar a regra anti-empilhamento.
const workouts: FatigueWorkout[] = [
  { title: "Push", muscleTags: [], exercises: [ex("Supino reto", "Peitoral", 4), ex("Supino inclinado", "Peitoral", 4), ex("Crucifixo", "Peitoral", 4), ex("Tríceps corda", "Tríceps", 3)] },
  { title: "Pull", muscleTags: [], exercises: [ex("Puxada", "Costas", 4), ex("Remada curvada", "Costas", 4), ex("Remada baixa", "Costas", 4), ex("Rosca direta", "Bíceps", 3)] },
  { title: "Legs", muscleTags: [], exercises: [ex("Agachamento", "Quadríceps", 4), ex("Leg press", "Quadríceps", 4), ex("Stiff", "Posterior", 4), ex("Panturrilha", "Panturrilha", 4)] },
];
const start = "2026-09-30";
const days = computeCycle({ sequence: patternSequence("3x1")!, startDate: start, until: addDays(start, 11), workoutCount: 3 });

describe.each<[NivelCliente, number]>([["iniciante", 0], ["intermediario", 10], ["avancado", 20]])("3x1 cliente %s", (nivel, eve) => {
  const plan = planFatigue({ days, workouts, nivel, objetivo: "hipertrofia" });
  it("sem dois PESADOS seguidos no bloco", () => {
    for (let b = 0; b < 3; b++) {
      const lv = [0, 1, 2].map((k) => plan[addDays(start, b * 4 + k)].level);
      lv.slice(1).forEach((l, k) => expect(!(l === "PESADO" && lv[k] === "PESADO")).toBe(true));
    }
  });
  it("véspera da folga reduz volume conforme nível", () => {
    const last = plan[addDays(start, 2)];
    expect(last.volumeReduction).toBe(Math.max(eve, last.originalLevel === "PESADO" && plan[addDays(start, 1)].level === "PESADO" ? 15 : 0));
    if (eve) expect(reduceSets(4, last.volumeReduction)).toBeLessThan(4);
  });
});

describe("dia de folga", () => {
  it("folga total", () => expect(restDayContent("total", workouts).type).toBe("total"));
  it("recuperação ativa sem séries", () => {
    const r = restDayContent("recuperacao_ativa", workouts);
    expect(r.type === "recuperacao_ativa" && r.items.length).toBe(3);
  });
  it("sessão leve usa exercícios do plano do grupo prioritário", () => {
    const r = restDayContent("sessao_leve", workouts, "Costas");
    if (r.type !== "sessao_leve") throw new Error();
    expect(r.exercises.length).toBeGreaterThanOrEqual(2);
    expect(r.exercises.length).toBeLessThanOrEqual(4);
    r.exercises.forEach((e) => expect(e.rpe).toBe("5-6"));
  });
});
