import { describe, it, expect, vi } from "vitest";
vi.mock("@/integrations/supabase/client", () => ({ supabase: {} }));
import { missingKeys, emptyCore, validateInstruction, ENGINE_PROMPT_DEFAULTS } from "@/lib/engineInstructions";

describe("instruções do motor", () => {
  it("seed só insere as 12 chaves que faltam", () => {
    expect(missingKeys([])).toHaveLength(12);
    expect(missingKeys([{ chave: "arquiteto" }, { chave: "atlas" }])).not.toContain("arquiteto");
    expect(missingKeys([{ chave: "arquiteto" }, { chave: "atlas" }])).toHaveLength(10);
  });
  it("aviso só considera contexto, arquiteto, redator e crítico", () => {
    const rows = ["bloco_0", "arquiteto", "redator", "critico"].map(c => ({ chave: c, conteudo: "x" }));
    expect(emptyCore([...rows, { chave: "atlas", conteudo: "" }])).toEqual([]);
    expect(emptyCore(rows.map(r => r.chave === "redator" ? { ...r, conteudo: " " } : r))).toEqual(["redator"]);
  });
  it("bloqueia texto vazio e siglas proibidas, só avisa marcador ausente", () => {
    expect(validateInstruction("arquiteto", "  ").erro).toBeTruthy();
    expect(validateInstruction("arquiteto", "Use IA aqui").erro).toBeTruthy();
    expect(validateInstruction("bloco_0", "sem marcadores").avisos).toHaveLength(4);
    expect(validateInstruction("bloco_0", ENGINE_PROMPT_DEFAULTS.bloco_0)).toEqual({ avisos: [] });
  });
});
