import { describe, it, expect } from "vitest";
import { verificarBloco, termoProibido } from "../../supabase/functions/_shared/reelVerifier";
import { limitarInflacao, inflado, parseCritico2 } from "../../supabase/functions/_shared/critico2";
import { withAddendum } from "../../supabase/functions/_shared/engineDefaults";

const o = { proibidas: [], tipoAfirmacao: null, temFonte: false };
const b = (fala: string, id = 3) => ({ id, tempo: "20-25s", fala });

describe("PROMPT M1", () => {
  it("CTA 'comenta X se você entendeu' gets ceiling 6", () => {
    expect(verificarBloco(b("Comenta FOME se você entendeu."), 2, o).teto).toBe(6);
  });
  it("CTA with delivery is not capped at 6", () => {
    expect(verificarBloco(b("Comenta FOME que eu mando a lista."), 2, o).teto).toBeGreaterThan(6);
  });
  it("universal rule without source: ceiling 5 and risk", () => {
    const r = verificarBloco(b("Compre apenas no perímetro do mercado."), 2, o);
    expect(r.teto).toBe(5);
    expect(r.riscos).toContain("regra universal sem fonte");
  });
  it("title 'o que ninguém te contou' is a forbidden term", () => {
    expect(termoProibido("O que ninguém te contou sobre a creatina")).not.toBeNull();
  });
  it("note 10 requires a sourced number; otherwise max 9", () => {
    expect(verificarBloco(b("Domingo à noite, geladeira aberta."), 2, o).teto).toBe(9);
  });
  it("final notes keep at most 40% of blocks at 9 or 10", () => {
    const n = [9, 10, 9, 9, 8].map((nota, i) => ({ id: i + 1, nota }));
    limitarInflacao(n);
    expect(n.filter(x => x.nota >= 9).length).toBe(2);
  });
  it("inflation detector fires at 50% of blocks at 9-10", () => {
    expect(inflado([9, 9, 7, 6])).toBe(true);
    expect(inflado([9, 7, 7, 6])).toBe(false);
  });
  it("Crítico 2 parse keeps only known blocks and 3 weak points", () => {
    const c = parseCritico2({ notas_por_bloco: [{ bloco: 1, nota: 7 }, { bloco: 9, nota: 2 }], pontos_fracos: [1, 2, 3, 4].map(() => ({ bloco: 1, problema: "x" })) }, [{ id: 1, tempo: "0-2s", fala: "a" }]);
    expect(c.notas.get(1)).toBe(7); expect(c.notas.has(9)).toBe(false); expect(c.pontos_fracos.length).toBe(3);
  });
  it("Brasil context is appended once to edited bloco_0", () => {
    const once = withAddendum("bloco_0", "meu texto");
    expect(withAddendum("bloco_0", once)).toBe(once);
    expect(once.match(/CONTEXTO BRASIL/g)?.length).toBe(1);
  });
});
