import { describe, expect, it } from "vitest";
import { RETENTION_RULES, retentionTiming } from "../../supabase/functions/_shared/retentionStructure";

describe("vertical retention timing", () => {
  it("clamps total duration to 25-45 seconds", () => {
    expect(retentionTiming(15).duracao_total_seg).toBe(25);
    expect(retentionTiming(60).duracao_total_seg).toBe(45);
    expect(retentionTiming(NaN).duracao_total_seg).toBe(35);
  });
  it("starts with a 0-2s stop and 2-6s promise", () => {
    expect(retentionTiming(35).blocos.slice(0, 2)).toEqual([
      { tempo: "0-2s", funcao: "parada" }, { tempo: "2-6s", funcao: "promessa" },
    ]);
  });
  it("keeps all development blocks between 5 and 7 seconds with no gaps", () => {
    for (let total = 25; total <= 45; total++) {
      const schedule = retentionTiming(total);
      let previousEnd = 0;
      for (const block of schedule.blocos) {
        const [start, end] = block.tempo.replace("s", "").split("-").map(Number);
        expect(start).toBe(previousEnd);
        if (block.funcao === "desenvolvimento") {
          expect(end - start).toBeGreaterThanOrEqual(5);
          expect(end - start).toBeLessThanOrEqual(7);
        }
        previousEnd = end;
      }
      expect(previousEnd).toBe(total);
      expect(schedule.blocos.filter(block => block.funcao === "cta")).toHaveLength(1);
      expect(schedule.blocos.at(-2)?.funcao).toBe("payoff");
    }
  });
  it("requires three loops and the six specified trigger choices", () => {
    expect(RETENTION_RULES.openLoops).toBe(3);
    expect(RETENTION_RULES.triggers).toEqual([
      "quebra_de_crenca", "curiosidade", "identidade", "medo_de_perder", "prova", "polemica",
    ]);
  });
});