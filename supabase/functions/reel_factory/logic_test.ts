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
