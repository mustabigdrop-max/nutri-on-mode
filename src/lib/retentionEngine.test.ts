import { describe, it, expect } from "vitest";
import { contentScore } from "./retentionEngine";

describe("contentScore", () => {
  it("is null without reels", () => {
    expect(contentScore([], []).score).toBeNull();
  });
  it("averages hook, retention, real 3s and rhythm", () => {
    const now = new Date("2026-10-08T12:00:00");
    const s = [{ id: "a", created_at: "2026-10-08T10:00:00", nota_geral: 8, roteiro: { blocos: [{ id: 1 }] }, notas: { notas_por_bloco: [{ id: 1, nota: 6 }] } }];
    const r = [{ script_id: "a", pct_3s: 70 }];
    const out = contentScore(s, r, now);
    expect(out.subs.map(x => x.v)).toEqual([60, 80, 70, 14]);
    expect(out.score).toBe(56);
  });
});
