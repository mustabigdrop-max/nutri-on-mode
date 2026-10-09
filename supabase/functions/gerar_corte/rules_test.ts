import { assertEquals } from "jsr:@std/assert@1";
import { blockReason } from "./rules.ts";

Deno.test("bloqueia pessoa realista", () => assertEquals(blockReason("um homem treinando"), "pessoa realista"));
Deno.test("bloqueia antes e depois", () => assertEquals(blockReason("comparação antes e depois"), "antes e depois"));
Deno.test("bloqueia MindForce", () => assertEquals(blockReason("pote do MindForce")?.startsWith("embalagem") || blockReason("MindForce na mesa")?.startsWith("produto MindForce"), true));
Deno.test("bloqueia imagem médica", () => assertEquals(blockReason("raio-x do joelho"), "imagem médica realista"));
Deno.test("libera conceito abstrato", () => assertEquals(blockReason("engrenagens representando o metabolismo"), null));
