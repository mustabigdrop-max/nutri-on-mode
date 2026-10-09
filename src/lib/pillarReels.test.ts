import { describe, it, expect } from "vitest";
import { ressalvaIndex, canJumpTo, needsSourceWarning, voiceParts } from "./pillarReels";

const R = "Atenção: ninguém ali tinha doença renal crônica. Se você tem, fale com o médico antes.";
const blocos = [{ fala: "a" }, { fala: "b" }, { fala: "c" }, { fala: "d" }, { fala: R }, { fala: "f" }];

describe("reels de pilar", () => {
  it("acha o bloco 5 como ressalva", () => expect(ressalvaIndex(blocos, R)).toBe(4));
  it("não pula a ressalva", () => expect(canJumpTo(5, new Set([0, 1, 2, 3]), 4)).toBe(false));
  it("avança depois de ver a ressalva", () => expect(canJumpTo(5, new Set([0, 1, 2, 3, 4]), 4)).toBe(true));
  it("aviso só para fonte pendente sem conferência", () => {
    expect(needsSourceWarning({ fonte_status: "parcial" })).toBe(true);
    expect(needsSourceWarning({ fonte_status: "sem_fonte_primaria", fonte_conferida_em: "2026-10-09" })).toBe(false);
    expect(needsSourceWarning({ fonte_status: "verificada" })).toBe(false);
  });
  it("destaca ênfase e pausa", () => {
    const p = voiceParts("[ÊNFASE]Mito: carbo. [PAUSA 0,4s] Mas");
    expect(p.find(x => x.kind === "enfase")?.t).toBe("Mito: carbo");
    expect(p.some(x => x.kind === "pausa")).toBe(true);
  });
});
