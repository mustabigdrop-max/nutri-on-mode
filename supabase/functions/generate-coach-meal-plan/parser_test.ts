import { assertEquals, assert } from "https://deno.land/std@0.224.0/assert/mod.ts";
import {
  convertSingleQuotedStrings,
  repairJsonLikeText,
  extractTopLevelObjects,
  selectBestCandidate,
  parseMealPlanResponse,
  stripHorarioFromTitle,
} from "./parser.ts";

// ---------- extractTopLevelObjects ----------

Deno.test("extractTopLevelObjects: detecta um único objeto", () => {
  const src = `{"refeicoes":[{"id":1}]}`;
  const objs = extractTopLevelObjects(src);
  assertEquals(objs.length, 1);
  assertEquals(objs[0], src);
});

Deno.test("extractTopLevelObjects: detecta múltiplos objetos top-level", () => {
  const src = `{"explicacao":"prefacio"}\n\n{"refeicoes":[{"r":1}]}`;
  const objs = extractTopLevelObjects(src);
  assertEquals(objs.length, 2);
  assert(objs[1].includes('"refeicoes"'));
});

Deno.test("extractTopLevelObjects: ignora chaves dentro de strings", () => {
  const src = `{"texto":"isto tem { e } dentro","refeicoes":[]}`;
  const objs = extractTopLevelObjects(src);
  assertEquals(objs.length, 1);
});

// ---------- selectBestCandidate ----------

Deno.test("selectBestCandidate: prioriza objeto contendo refeicoes", () => {
  const a = `{"explicacao":"este e o objeto explicativo bem comprido com muito texto"}`;
  const b = `{"refeicoes":[1,2]}`;
  const best = selectBestCandidate([a, b]);
  assertEquals(best, b);
});

Deno.test("selectBestCandidate: sem refeicoes retorna o maior", () => {
  const a = `{"x":1}`;
  const b = `{"y":2,"z":3,"w":4}`;
  assertEquals(selectBestCandidate([a, b]), b);
});

Deno.test("selectBestCandidate: vazio retorna null", () => {
  assertEquals(selectBestCandidate([]), null);
});

// ---------- convertSingleQuotedStrings / repairJsonLikeText ----------

Deno.test("convertSingleQuotedStrings: aspas simples viram duplas", () => {
  const out = convertSingleQuotedStrings(`{'a':'b'}`);
  assertEquals(JSON.parse(out).a, "b");
});

Deno.test("repairJsonLikeText: remove vírgulas pendentes", () => {
  const out = repairJsonLikeText(`{"a":1,"b":[1,2,],}`);
  const parsed = JSON.parse(out);
  assertEquals(parsed.a, 1);
  assertEquals(parsed.b.length, 2);
});

Deno.test("repairJsonLikeText: remove caracteres invisíveis", () => {
  const out = repairJsonLikeText(`\uFEFF{"a":1}\u200B`);
  assertEquals(JSON.parse(out).a, 1);
});

// ---------- parseMealPlanResponse ----------

Deno.test("parseMealPlanResponse: JSON cru válido", () => {
  const r = parseMealPlanResponse(`{"refeicoes":[{"r":1}]}`) as any;
  assertEquals(r.refeicoes.length, 1);
});

Deno.test("parseMealPlanResponse: remove fences ```json", () => {
  const raw = "```json\n{\"refeicoes\":[]}\n```";
  const r = parseMealPlanResponse(raw) as any;
  assert(Array.isArray(r.refeicoes));
});

Deno.test("parseMealPlanResponse: múltiplos objetos — escolhe o que tem refeicoes", () => {
  const raw = `{"intro":"vou gerar"}\n{"refeicoes":[{"x":1},{"x":2}]}`;
  const r = parseMealPlanResponse(raw) as any;
  assertEquals(r.refeicoes.length, 2);
});

Deno.test("parseMealPlanResponse: aspas simples e vírgulas pendentes são reparadas", () => {
  const raw = `{'refeicoes':[{'nome':'Almoço',},],}`;
  const r = parseMealPlanResponse(raw) as any;
  assertEquals(r.refeicoes[0].nome, "Almoço");
});

Deno.test("parseMealPlanResponse: lixo total retorna null", () => {
  const r = parseMealPlanResponse("isto não é json nenhum {{{");
  assertEquals(r, null);
});

Deno.test("parseMealPlanResponse: string vazia retorna null", () => {
  assertEquals(parseMealPlanResponse(""), null);
});

// ---------- stripHorarioFromTitle ----------

Deno.test("stripHorarioFromTitle: remove parêntese com horário e descrição", () => {
  assertEquals(
    stripHorarioFromTitle("Almoço (11:00 - Almoço)"),
    "Almoço",
  );
});

Deno.test("stripHorarioFromTitle: remove sufixo - HH:MM", () => {
  assertEquals(
    stripHorarioFromTitle("Café da manhã - 07:30"),
    "Café da manhã",
  );
});

Deno.test("stripHorarioFromTitle: aceita formato com h", () => {
  assertEquals(
    stripHorarioFromTitle("Lanche (15h30)"),
    "Lanche",
  );
});

Deno.test("stripHorarioFromTitle: título sem horário fica intacto", () => {
  assertEquals(stripHorarioFromTitle("Jantar"), "Jantar");
});

Deno.test("stripHorarioFromTitle: string vazia é tolerada", () => {
  assertEquals(stripHorarioFromTitle(""), "");
});
