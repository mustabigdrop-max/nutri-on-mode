import { describe, it, expect } from "vitest";
import { parseProtocolToDays } from "./parseProtocolMarkdown";

describe("parseProtocolToDays — contrato anti-vazamento", () => {
  it("retorna fallback vazio para null/undefined", () => {
    expect(parseProtocolToDays(null)).toEqual({ days: [], isStructured: false, isFallback: true });
    expect(parseProtocolToDays(undefined)).toEqual({ days: [], isStructured: false, isFallback: true });
  });

  it("retorna fallback vazio para number/boolean", () => {
    expect(parseProtocolToDays(42 as any).isFallback).toBe(true);
    expect(parseProtocolToDays(true as any).days).toEqual([]);
  });

  it("retorna fallback vazio para string vazia ou só espaços", () => {
    expect(parseProtocolToDays("").intro).toBeUndefined();
    expect(parseProtocolToDays("   \n  ").intro).toBeUndefined();
  });

  it("NUNCA coloca JSON serializado no intro", () => {
    const raw = JSON.stringify({ block_overview: { title: "x" }, foo: [1, 2] });
    const r = parseProtocolToDays(raw);
    expect(r.intro).toBeUndefined();
    expect(r.days).toEqual([]);
    expect(r.isFallback).toBe(true);
  });

  it("NUNCA coloca JSON de array no intro", () => {
    const raw = JSON.stringify([{ x: 1 }, { x: 2 }]);
    const r = parseProtocolToDays(raw);
    // array de objetos vira dias, não intro
    expect(r.intro).toBeUndefined();
    expect(r.days.length).toBe(2);
  });

  it("JSON quebrado retorna fallback vazio (não vaza a string)", () => {
    const raw = '{"block_overview": {broken';
    const r = parseProtocolToDays(raw);
    expect(r.isFallback).toBe(true);
    expect(r.intro).toBeUndefined();
  });

  it("objeto com training_days vira dias normalizados", () => {
    const obj = {
      training_days: [
        { day_number: 1, session_title: "Peito", estimated_duration: "60min", exercises: [{ name: "Supino" }] },
        { session_title: "Costas", exercises: [] },
      ],
    };
    const r = parseProtocolToDays(obj);
    expect(r.isStructured).toBe(true);
    expect(r.isFallback).toBe(false);
    expect(r.days).toHaveLength(2);
    expect(r.days[0]).toMatchObject({ day_number: 1, session_title: "Peito", estimated_duration: "60min" });
    expect(r.days[1].day_number).toBe(2);
    expect(r.days[1].estimated_duration).toBe("90min");
  });

  it("training_days com itens malformados não quebra", () => {
    const obj = { training_days: [null, "string", 42, { session_title: "OK" }] };
    const r = parseProtocolToDays(obj as any);
    expect(r.days).toHaveLength(4);
    expect(r.days[3].session_title).toBe("OK");
    expect(r.days[0].session_title).toMatch(/Treino/);
  });

  it("objeto sem training_days retorna fallback (não é responsabilidade deste parser)", () => {
    const r = parseProtocolToDays({ block_overview: { title: "x" } });
    expect(r.isFallback).toBe(true);
    expect(r.days).toEqual([]);
  });

  it("array vazio retorna fallback", () => {
    expect(parseProtocolToDays([]).isFallback).toBe(true);
  });

  it("string JSON com training_days aninhados é parseada corretamente", () => {
    const raw = JSON.stringify({ training_days: [{ session_title: "D1" }, { session_title: "D2" }] });
    const r = parseProtocolToDays(raw);
    expect(r.isStructured).toBe(true);
    expect(r.days).toHaveLength(2);
  });

  it("markdown real com cabeçalhos de dia divide em days", () => {
    const md = `Intro geral do bloco.\n\n## Dia 1: Peito e Tríceps\nSupino 4x8\n\n## Dia 2 — Costas\nBarra fixa 4x8`;
    const r = parseProtocolToDays(md);
    expect(r.isFallback).toBe(false);
    expect(r.days).toHaveLength(2);
    expect(r.days[0].session_title.toLowerCase()).toContain("peito");
    expect(r.intro).toContain("Intro geral");
  });

  it("texto humano curto sem cabeçalho vira intro válido (fallback com conteúdo)", () => {
    const r = parseProtocolToDays("Treino leve hoje. Foco em mobilidade.");
    expect(r.isFallback).toBe(true);
    expect(r.days).toEqual([]);
    expect(r.intro).toContain("Treino leve");
  });

  it("intro gigante (>4000 chars) é descartado para evitar dump de lixo", () => {
    const huge = "a".repeat(5000);
    const r = parseProtocolToDays(huge);
    expect(r.intro).toBeUndefined();
    expect(r.isFallback).toBe(true);
  });

  it("objeto com referência circular não lança", () => {
    const a: any = { training_days: [{ session_title: "D1" }] };
    a.self = a;
    expect(() => parseProtocolToDays(a)).not.toThrow();
    const r = parseProtocolToDays(a);
    expect(r.days).toHaveLength(1);
  });
});
