import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { allocateFormulas, dedupThemes, originality, preFilter } from "./logic.ts";

const ALL = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

Deno.test("20% of slots explore untested formulas", () => {
  const out = allocateFormulas(100, ALL, [{ formula_id: 1, usos: 3, retencao_3s_media: 70 }, { formula_id: 2, usos: 3, retencao_3s_media: 30 }]);
  assertEquals(out.length, 100);
  assertEquals(out.filter(id => id !== 1 && id !== 2).length, 20);
  assertEquals(out.filter(id => id === 1).length > out.filter(id => id === 2).length, true);
});

Deno.test("no measured formulas: spread over all 12", () => {
  assertEquals(new Set(allocateFormulas(24, ALL, [])).size, 12);
});

Deno.test("pre-filter rejects greeting and missing loop", () => {
  assertEquals(preFilter("Fala pessoal, hoje...", ["x"]), "Abertura com saudação ou aquecimento.");
  assertEquals(preFilter("Comer menos te trava.", []), "Nenhum loop aberto na estrutura.");
  assertEquals(preFilter("Comer menos te trava.", ["por quê?"]), null);
});

Deno.test("originality flags similar opening", () => {
  const r = originality({ tema: "b", abertura: "Comer menos pode travar seu cutting", formula_id: 1, funcoes: "a" },
    [{ tema: "a", abertura: "Comer menos pode travar o seu cutting", formula_id: 2, funcoes: "b" }]);
  assertEquals(r, 'Abertura parecida com "a".');
});

Deno.test("theme dedup", () => {
  assertEquals(dedupThemes(["Proteína à noite", "proteina a noite", "Creatina"], []).map(x => x.keep), [true, false, true]);
});

import { allocatePillars, assignAngles, effectiveQuotas, type Pillar } from "./logic.ts";
const P = (chave: string, qtd: number, exige = false): Pillar => ({ chave, nome: chave, publico: "geral", qtd_diaria: qtd, objetivo: ["alcance"], mecanismo: "", exige_caso_real: exige, ativo: true });
const SEVEN = [P("comportamento", 20), P("mitos", 20), P("suplementacao", 12), P("treino", 14), P("profissionais", 18), P("sistemas", 10), P("provas", 6, true)];
const ANG = ["mito", "erro comum", "número", "confissão", "comparação", "passo a passo", "caso real", "pergunta que dói", "desafio", "bastidor"];

Deno.test("pillar 7 without a real case gives its 6 slots to pillars 1, 2 and 5", () => {
  assertEquals(effectiveQuotas(SEVEN, false), [22, 22, 12, 14, 20, 10, 0]);
  assertEquals(effectiveQuotas(SEVEN, true), [20, 20, 12, 14, 18, 10, 6]);
});
Deno.test("batch of 100 follows qtd_diaria with no data", () => {
  const a = allocatePillars(100, SEVEN, true);
  assertEquals(SEVEN.map((_, i) => a.filter(x => x === i).length), [20, 20, 12, 14, 18, 10, 6]);
});
Deno.test("inactive pillar gets no slots", () => {
  const s = SEVEN.map((p, i) => (i === 2 ? { ...p, ativo: false } : p));
  assertEquals(allocatePillars(100, s, true).filter(x => x === 2).length, 0);
});
Deno.test("each pillar uses >= 5 angles and none above 30%", () => {
  for (const k of [10, 14, 20]) {
    const a = assignAngles(k, ANG, { mito: 60, "erro comum": 50 });
    const c: Record<string, number> = {}; a.forEach(x => (c[x] = (c[x] ?? 0) + 1));
    assertEquals(a.length, k);
    assertEquals(Object.keys(c).length >= 5, true);
    assertEquals(Math.max(...Object.values(c)) <= Math.floor(k * 0.3), true);
  }
});
