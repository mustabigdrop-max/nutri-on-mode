/**
 * Fuzzing tests para parseProtocolToDays.
 *
 * Objetivos:
 *  1. Nunca lançar exceção (não quebrar a UI).
 *  2. Sempre retornar a estrutura ParsedProtocol bem-formada.
 *  3. Nunca vazar conteúdo bruto tipo JSON serializado em `intro`,
 *     `session_title`, `body` ou `muscle_tags`.
 *  4. Aceitar entradas aleatórias, malformadas, cíclicas e adversariais.
 */

import { describe, it, expect } from "vitest";
import { parseProtocolToDays, type ParsedProtocol } from "./parseProtocolMarkdown";

// ---------- PRNG determinístico (Mulberry32) ----------
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------- Geradores aleatórios ----------
function randString(rand: () => number, maxLen = 80): string {
  const len = Math.floor(rand() * maxLen);
  const chars =
    "abcdef 123{}[]:,\"'\n\tçãéêôü/\\*_-#~`<>%$@!?ABCD ";
  let s = "";
  for (let i = 0; i < len; i++) {
    s += chars[Math.floor(rand() * chars.length)];
  }
  return s;
}

function randValue(rand: () => number, depth = 0): any {
  const r = rand();
  if (depth > 4) return randString(rand);
  if (r < 0.1) return null;
  if (r < 0.15) return undefined;
  if (r < 0.2) return rand() < 0.5;
  if (r < 0.3) return Math.floor(rand() * 1e6) * (rand() < 0.5 ? -1 : 1);
  if (r < 0.35) return NaN;
  if (r < 0.4) return Infinity;
  if (r < 0.7) return randString(rand);
  if (r < 0.85) {
    const n = Math.floor(rand() * 6);
    return Array.from({ length: n }, () => randValue(rand, depth + 1));
  }
  const obj: Record<string, any> = {};
  const n = Math.floor(rand() * 5);
  const keys = ["session_title", "title", "day_number", "estimated_duration", "exercises", "muscle_target", "training_days", "foo", "x"];
  for (let i = 0; i < n; i++) {
    const k = keys[Math.floor(rand() * keys.length)];
    obj[k] = randValue(rand, depth + 1);
  }
  return obj;
}

// ---------- Validador de forma segura ----------
function assertSafe(result: ParsedProtocol, source: unknown) {
  expect(result).toBeDefined();
  expect(Array.isArray(result.days)).toBe(true);
  expect(typeof result.isStructured).toBe("boolean");
  expect(typeof result.isFallback).toBe("boolean");

  const looksJson = (v: unknown) =>
    typeof v === "string" &&
    (/^\s*[{[]/.test(v) && /[}\]]\s*$/.test(v)) &&
    (() => { try { JSON.parse(v); return true; } catch { return false; } })();

  if (result.intro !== undefined) {
    expect(typeof result.intro).toBe("string");
    expect(result.intro.length).toBeLessThanOrEqual(4000);
    expect(looksJson(result.intro), `intro vazou JSON: ${result.intro.slice(0, 80)}`).toBe(false);
  }

  for (const d of result.days) {
    expect(typeof d.day_number).toBe("number");
    expect(Number.isFinite(d.day_number)).toBe(true);
    expect(typeof d.session_title).toBe("string");
    expect(typeof d.estimated_duration).toBe("string");
    expect(Array.isArray(d.muscle_tags)).toBe(true);
    expect(typeof d.body).toBe("string");
    expect(looksJson(d.session_title), `title vazou JSON`).toBe(false);
    expect(looksJson(d.body), `body vazou JSON`).toBe(false);
    for (const tag of d.muscle_tags) {
      expect(typeof tag).toBe("string");
      expect(looksJson(tag)).toBe(false);
    }
  }
  void source;
}

// ================== TESTES ==================

describe("parseProtocolToDays — fuzzing", () => {
  it("nunca lança e sempre retorna estrutura segura para 500 entradas aleatórias", () => {
    const rand = mulberry32(1337);
    for (let i = 0; i < 500; i++) {
      const input = randValue(rand);
      let out: ParsedProtocol;
      expect(() => { out = parseProtocolToDays(input); }).not.toThrow();
      assertSafe(out!, input);
    }
  });

  it("lida com strings puramente aleatórias sem vazar JSON", () => {
    const rand = mulberry32(42);
    for (let i = 0; i < 300; i++) {
      const s = randString(rand, 500);
      const out = parseProtocolToDays(s);
      assertSafe(out, s);
    }
  });

  it("JSON serializado (com e sem training_days) nunca aparece cru no intro/body", () => {
    const rand = mulberry32(7);
    for (let i = 0; i < 200; i++) {
      const obj = randValue(rand, 0);
      const serialized = (() => { try { return JSON.stringify(obj); } catch { return "{}"; } })();
      const out = parseProtocolToDays(serialized);
      assertSafe(out, serialized);
    }
  });

  it("JSON quase-válido (truncado / corrompido) cai em fallback sem vazar", () => {
    const rand = mulberry32(99);
    const base = JSON.stringify({
      training_days: [
        { session_title: "Push", exercises: [{ name: "Supino" }] },
        { session_title: "Pull", exercises: [{ name: "Remada" }] },
      ],
    });
    for (let i = 0; i < 100; i++) {
      const cut = base.slice(0, Math.max(1, Math.floor(rand() * base.length)));
      const out = parseProtocolToDays(cut);
      assertSafe(out, cut);
    }
  });

  it("objetos com referências circulares não quebram", () => {
    const a: any = { training_days: [{ session_title: "X" }] };
    a.self = a;
    a.training_days[0].parent = a;
    let out!: ParsedProtocol;
    expect(() => { out = parseProtocolToDays(a); }).not.toThrow();
    assertSafe(out, a);
    expect(out.isStructured).toBe(true);
  });

  it("tipos exóticos (Symbol, function, BigInt, Date, Map, Set) não quebram", () => {
    const inputs: any[] = [
      Symbol("x"),
      () => 42,
      typeof BigInt !== "undefined" ? BigInt(10) : 10,
      new Date(),
      new Map([["a", 1]]),
      new Set([1, 2, 3]),
      new Error("boom"),
      /regex/gi,
    ];
    for (const inp of inputs) {
      let out!: ParsedProtocol;
      expect(() => { out = parseProtocolToDays(inp); }).not.toThrow();
      assertSafe(out, inp);
    }
  });

  it("training_days com itens malformados normaliza sem crashar", () => {
    const rand = mulberry32(2024);
    for (let i = 0; i < 100; i++) {
      const td = Array.from({ length: Math.floor(rand() * 6) }, () => randValue(rand, 3));
      const out = parseProtocolToDays({ training_days: td });
      assertSafe(out, td);
    }
  });

  it("markdown gigante (> 4000 chars) sem cabeçalho de dia não vaza no intro", () => {
    const big = "x".repeat(10_000);
    const out = parseProtocolToDays(big);
    assertSafe(out, big);
    expect(out.intro).toBeUndefined();
    expect(out.isFallback).toBe(true);
  });

  it("markdown válido com cabeçalhos de dia preserva estrutura", () => {
    const md = "Aquecimento leve\n\nDia 1 — Push\nSupino 4x8\n\nDia 2 — Pull\nRemada 4x10";
    const out = parseProtocolToDays(md);
    assertSafe(out, md);
    expect(out.days.length).toBe(2);
    expect(out.isFallback).toBe(false);
  });
});
