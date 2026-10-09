import { describe, it, expect } from "vitest";
import { suggestCut, eligibleCuts, cutFileName, cutsCsv } from "./cutGenerator";

describe("Gerador de Cortes", () => {
  it("número sem fonte não vira card de dado", () => {
    expect(suggestCut({ id: 1, tempo: "2-6s", fala: "70% das pessoas erram isso" }).tipo).not.toBe("dado");
  });
  it("número com fonte do roteiro vira card de dado", () => {
    expect(suggestCut({ id: 1, tempo: "2-6s", fala: "70% erram", fonte: "Hall, 2019, Cell Metab" }).tipo).toBe("dado");
  });
  it("duração entre 2 e 3s", () => {
    const d = suggestCut({ id: 1, tempo: "0-2s", funcao: "parada", fala: "Pare" }).duracao;
    expect(d).toBeGreaterThanOrEqual(2); expect(d).toBeLessThanOrEqual(3);
  });
  it("no máximo 6 cortes e sem o CTA", () => {
    const blocks = Array.from({ length: 9 }, (_, i) => ({ id: i + 1, tempo: `${i * 5}-${i * 5 + 5}s`, fala: "frase do bloco", funcao: i === 8 ? "cta" : "corpo" }));
    const c = eligibleCuts(blocks); expect(c.length).toBe(6); expect(c.some(x => x.bloco === "9")).toBe(false);
  });
  it("nome do arquivo por bloco e tempo", () => { expect(cutFileName(0, "0-2s")).toBe("01_0-2s.png"); });
  it("CSV traz início do bloco em segundos", () => {
    expect(cutsCsv([{ file: "02_2-6s.png", bloco: "2", tempo: "2-6s", tipo: "texto", duracao: 3, texto: "x" }]).split("\n")[1]).toContain('"2","3"');
  });
});
