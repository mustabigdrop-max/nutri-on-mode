import { describe, expect, it } from "vitest";
import { detectRankChange, rankForScore, statusDoDelta } from "@/lib/apexRanks";
import { computeStreak, semanaPerfeita } from "@/lib/apexStreaks";
import { apexScoreGeral, assimetrias, deltasPorGrupo } from "@/lib/apexMuscleScore";
import { avaliarAchievements } from "@/lib/apexAchievements";

describe("ranks", () => {
  it("mapeia score para rank", () => {
    expect(rankForScore(78)?.nome).toBe("PRIME");
    expect(rankForScore(30)?.nome).toBe("SPARK");
    expect(rankForScore(100)?.nome).toBe("APEX ELITE");
    expect(rankForScore(null)).toBeNull();
  });

  it("detecta promoção e rebaixamento", () => {
    expect(detectRankChange(63, 68)?.direction).toBe("promotion");
    expect(detectRankChange(67, 49)?.direction).toBe("demotion");
    expect(detectRankChange(70, 72)).toBeNull();
  });

  it("classifica destaques pelo delta", () => {
    expect(statusDoDelta(18, false)).toBe("elite");
    expect(statusDoDelta(10, false)).toBe("good");
    expect(statusDoDelta(3, false)).toBe("moderate");
    expect(statusDoDelta(0, false)).toBe("neutral");
    expect(statusDoDelta(12, true)).toBe("deficit");
  });
});

describe("score geral e zonas", () => {
  const atual = { lats: 80, glute_max: 70, biceps_l: 60, biceps_r: 90 };
  const anterior = { lats: 70, glute_max: 68, biceps_l: 58, biceps_r: 86 };

  it("é a média das zonas preenchidas", () => {
    // lats 80, glute 70, biceps (60+90)/2 = 75 → média 75
    expect(apexScoreGeral(atual)).toBe(75);
    expect(apexScoreGeral(null)).toBeNull();
    expect(apexScoreGeral({})).toBeNull();
  });

  it("calcula assimetria pelo lado mais forte", () => {
    const a = assimetrias(atual).find((x) => x.grupo === "Bíceps");
    expect(Math.round(a?.pct ?? 0)).toBe(33);
  });

  it("calcula deltas por grupo", () => {
    const d = deltasPorGrupo(atual, anterior).find((x) => x.grupo === "Dorsal");
    expect(d?.delta).toBe(10);
  });
});

describe("streak", () => {
  const dia = (offset: number) => {
    const d = new Date(2026, 0, 20);
    d.setDate(d.getDate() - offset);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };
  const hoje = new Date(2026, 0, 20);

  it("conta dias consecutivos concluídos", () => {
    const logs = [0, 1, 2].map((i) => ({ log_date: dia(i), workout_type: "push", completed: true }));
    expect(computeStreak(logs, hoje).atual).toBe(3);
  });

  it("descanso prescrito não quebra o streak", () => {
    const logs = [
      { log_date: dia(0), workout_type: "pull", completed: true },
      { log_date: dia(1), workout_type: "rest", completed: false },
      { log_date: dia(2), workout_type: "push", completed: true },
    ];
    expect(computeStreak(logs, hoje).atual).toBe(2);
  });

  it("dia sem registro quebra o streak", () => {
    const logs = [
      { log_date: dia(0), workout_type: "pull", completed: true },
      { log_date: dia(2), workout_type: "push", completed: true },
    ];
    expect(computeStreak(logs, hoje).atual).toBe(1);
  });

  it("homework não conta como treino", () => {
    const logs = [{ log_date: dia(0), workout_type: "homework praxis", completed: true }];
    expect(computeStreak(logs, hoje).totalTreinos).toBe(0);
  });

  it("semana perfeita exige as sessões prescritas", () => {
    const logs = [0, 1, 2].map((i) => ({ log_date: dia(i), workout_type: "push", completed: true }));
    expect(semanaPerfeita(logs, 3, hoje)).toBe(true);
    expect(semanaPerfeita(logs, 5, hoje)).toBe(false);
    expect(semanaPerfeita(logs, 0, hoje)).toBe(false);
  });
});

describe("conquistas", () => {
  const base = {
    zonasAtuais: [{ grupo: "Dorsal", score: 72 }, { grupo: "Glúteo máximo", score: 71 }],
    deltas: [],
    assimetriasAtuais: [{ grupo: "Bíceps", pct: 4 }],
    assimetriasAnteriores: [{ grupo: "Bíceps", pct: 11 }],
    deficitsAnteriores: ["Glúteo máximo"],
    deficitsAtuais: [],
    totalTreinos: 120,
    bfPercent: 14.2,
    scoreAtual: 72,
    scoreAnterior: 50,
    rankAtual: rankForScore(72),
    jaFoiPromovido: true,
    semanaPerfeita: true,
    voltaPorCima: false,
  };

  it("desbloqueia somente o que os dados comprovam", () => {
    const ids = avaliarAchievements(base).map((a) => a.id);
    expect(ids).toContain("first-deficit-resolved");
    expect(ids).toContain("symmetry-achieved");
    expect(ids).toContain("all-above-70");
    expect(ids).toContain("100-workouts");
    expect(ids).toContain("bf-under-15");
    expect(ids).toContain("perfect-week");
    expect(ids).toContain("apex-jump-20");
    expect(ids).not.toContain("250-workouts");
    expect(ids).not.toContain("bf-under-12");
    expect(ids).not.toContain("prime-rank");
    expect(ids).not.toContain("comeback");
  });

  it("não inventa conquista sem dados", () => {
    const vazio = avaliarAchievements({
      ...base, zonasAtuais: [], assimetriasAtuais: [], assimetriasAnteriores: [], deficitsAnteriores: [],
      totalTreinos: 0, bfPercent: null, scoreAtual: null, scoreAnterior: null, rankAtual: null,
      jaFoiPromovido: false, semanaPerfeita: false,
    });
    expect(vazio).toHaveLength(0);
  });
});
