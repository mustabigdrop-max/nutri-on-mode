import { describe, it, expect } from "vitest";
import { calcXp, nivelDe, medirFala, radarDominio, contarMuleta } from "@/lib/academy";

describe("Academia", () => {
  it("XP: 10 por aula, 5 por tentativa com nota 70+", () => {
    expect(calcXp(3, [70, 69, 95])).toBe(40);
  });
  it("níveis Ouvinte/Orador/Retor/Mestre", () => {
    expect(nivelDe(99).nome).toBe("Ouvinte");
    expect(nivelDe(100).nome).toBe("Orador");
    expect(nivelDe(300).nome).toBe("Retor");
    expect(nivelDe(600).nome).toBe("Mestre");
  });
  it("muletas por 100 palavras, frase longa e saudação", () => {
    const t = "Oi pessoal. Tipo, então, a dieta começa no mercado e não no prato que você monta à noite quando chega cansado. Né.";
    const m = medirFala(t, { duracao_seg: 10 });
    expect(m.saudacao).toBe(true);
    expect(m.frases_longas.length).toBe(1);
    expect(m.muletas.find(x => x.termo === "tipo")?.n).toBe(1);
    expect(m.pps).toBeCloseTo(m.total_palavras / 10, 2);
  });
  it("sem duração não calcula palavras por segundo", () => {
    expect(medirFala("Comida depois.").pps).toBeNull();
  });
  it("muleta não conta dentro de outra palavra", () => {
    expect(contarMuleta("assim assimetria", "assim")).toBe(1);
  });
  it("radar sem tentativas = null (mostra EXEMPLO)", () => {
    expect(radarDominio([])).toBeNull();
    expect(radarDominio([{ created_at: "2026-01-01", resultado: { eixos: { gancho: 80 } } }])?.gancho).toBe(80);
  });
});
