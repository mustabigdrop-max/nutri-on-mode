import { describe, it, expect } from "vitest";
import { parseProtocolText } from "./parseProtocolText";

describe("parseProtocolText", () => {
  describe("objetos estruturados", () => {
    it("passa objeto com block_overview direto como json", () => {
      const obj = { block_overview: { title: "Bloco 1" }, training_days: [] };
      expect(parseProtocolText(obj)).toEqual({ json: obj, markdown: null });
    });

    it("passa objeto com training_days direto como json", () => {
      const obj = { training_days: [{ day: "D1" }] };
      expect(parseProtocolText(obj)).toEqual({ json: obj, markdown: null });
    });

    it("passa objeto genérico como json (sem validação estrutural para objetos)", () => {
      const obj = { qualquer: "coisa" };
      expect(parseProtocolText(obj)).toEqual({ json: obj, markdown: null });
    });
  });

  describe("JSON serializado (string)", () => {
    it("parseia string JSON com block_overview", () => {
      const raw = JSON.stringify({ block_overview: { t: 1 }, training_days: [] });
      const r = parseProtocolText(raw);
      expect(r.json).toEqual({ block_overview: { t: 1 }, training_days: [] });
      expect(r.markdown).toBeNull();
    });

    it("parseia string JSON com training_days", () => {
      const raw = JSON.stringify({ training_days: [{ d: "D1" }] });
      const r = parseProtocolText(raw);
      expect(r.json).toEqual({ training_days: [{ d: "D1" }] });
      expect(r.markdown).toBeNull();
    });

    it("com espaços e quebras de linha ainda parseia", () => {
      const raw = `\n  ${JSON.stringify({ block_overview: {} })}  \n`;
      const r = parseProtocolText(raw);
      expect(r.json).toEqual({ block_overview: {} });
      expect(r.markdown).toBeNull();
    });

    it("JSON válido SEM estrutura esperada NUNCA vaza como markdown (evita JSON cru na tela)", () => {
      const raw = JSON.stringify({ foo: "bar", baz: [1, 2, 3] });
      const r = parseProtocolText(raw);
      expect(r.json).toBeNull();
      expect(r.markdown).toBeNull();
      // Garantia crítica: string JSON crua não escapa
      expect(r.markdown ?? "").not.toContain("{");
    });

    it("string quebrada que parece JSON (chaves) mas não parseia é tratada como markdown", () => {
      const raw = "{ isso não é json válido";
      const r = parseProtocolText(raw);
      expect(r.json).toBeNull();
      expect(r.markdown).toBe(raw);
    });
  });

  describe("markdown puro", () => {
    it("string markdown vira markdown", () => {
      const raw = "# Protocolo\n\n- Item 1\n- Item 2";
      expect(parseProtocolText(raw)).toEqual({ json: null, markdown: raw });
    });

    it("string simples vira markdown", () => {
      expect(parseProtocolText("Treino de peito")).toEqual({
        json: null,
        markdown: "Treino de peito",
      });
    });
  });

  describe("entradas inválidas / vazias", () => {
    it("null retorna vazio", () => {
      expect(parseProtocolText(null)).toEqual({ json: null, markdown: null });
    });

    it("undefined retorna vazio", () => {
      expect(parseProtocolText(undefined)).toEqual({ json: null, markdown: null });
    });

    it("string vazia retorna vazio", () => {
      expect(parseProtocolText("")).toEqual({ json: null, markdown: null });
    });

    it("string só com espaços retorna vazio", () => {
      expect(parseProtocolText("   \n  ")).toEqual({ json: null, markdown: null });
    });

    it("número retorna vazio", () => {
      expect(parseProtocolText(42 as any)).toEqual({ json: null, markdown: null });
    });

    it("boolean retorna vazio", () => {
      expect(parseProtocolText(true as any)).toEqual({ json: null, markdown: null });
    });
  });

  describe("garantia anti-vazamento (contrato crítico)", () => {
    it("markdown nunca é uma string JSON serializada estruturada", () => {
      const casos = [
        JSON.stringify({ block_overview: { a: 1 } }),
        JSON.stringify({ training_days: [{}] }),
        JSON.stringify({ improvement_alerts: [] }),
        JSON.stringify({ random: "obj" }),
      ];
      for (const raw of casos) {
        const { markdown } = parseProtocolText(raw);
        expect(markdown).toBeNull();
      }
    });
  });
});
