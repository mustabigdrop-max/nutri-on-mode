import { assertEquals, assert } from "https://deno.land/std@0.224.0/assert/mod.ts";
import {
  buildMealTemplate,
  classifyWorkoutWindow,
  enforceCeiaPosition,
  fromMinutes,
  toMinutes,
  type Refeicao,
} from "./meal_timing.ts";

// ─── Helpers ───────────────────────────────────────────────────────────────
const last = (refs: Refeicao[]) => refs[refs.length - 1];
const findCeia = (refs: Refeicao[]) =>
  refs.find((m) => /\bceia\b/i.test(String(m.refeicao || "")));
const findJantar = (refs: Refeicao[]) =>
  refs.find((m) =>
    /\bjantar\b/i.test(String(m.refeicao || "")) &&
    !/\bceia\b/i.test(String(m.refeicao || "")),
  );

// ─── classifyWorkoutWindow ────────────────────────────────────────────────
Deno.test("classifyWorkoutWindow: manhã / meio-dia / tarde / noite / descanso", () => {
  assertEquals(classifyWorkoutWindow("07:00"), "manha");
  assertEquals(classifyWorkoutWindow("13:30"), "meio_dia");
  assertEquals(classifyWorkoutWindow("17:00"), "tarde");
  assertEquals(classifyWorkoutWindow("20:00"), "noite");
  assertEquals(classifyWorkoutWindow(undefined), "descanso");
});

// ─── buildMealTemplate ────────────────────────────────────────────────────
Deno.test("template MANHÃ (07:00): pré-treino sólido = café, ceia 22:00 última", () => {
  const t = buildMealTemplate("manha", "07:00", { usaIntra: true, durationMin: 60 });
  assert(/Café da Manhã \/ Pré-Treino Sólido/.test(t[0].refeicao));
  assertEquals(t[0].horario, "06:00");
  assertEquals(last(t).refeicao, "Ceia");
  assertEquals(last(t).horario, "22:00");
  assert(t.some((m) => /Pós-Treino Sólido/.test(m.refeicao)));
});

Deno.test("template MEIO-DIA (13:30, caso usuário): almoço = pré-treino, ceia 22:00", () => {
  const t = buildMealTemplate("meio_dia", "13:30", { usaIntra: true, durationMin: 60 });
  assert(t.some((m) => /Almoço \/ Pré-Treino Sólido/.test(m.refeicao) && m.horario === "12:30"));
  assert(t.some((m) => /Intra-Treino/.test(m.refeicao)));
  assert(t.some((m) => /Pós-Treino Imediato/.test(m.refeicao)));
  assert(t.some((m) => m.refeicao === "Pós-Treino Sólido"));
  assertEquals(last(t).refeicao, "Ceia");
  assertEquals(last(t).horario, "22:00");
});

Deno.test("template MEIO-DIA sem intra-treino (uses_intra_malto=false)", () => {
  const t = buildMealTemplate("meio_dia", "13:30", { usaIntra: false, durationMin: 60 });
  assert(!t.some((m) => /Intra-Treino/.test(m.refeicao)));
  assertEquals(last(t).refeicao, "Ceia");
});

Deno.test("template TARDE (17:00): jantar = pós-sólido, ceia 22:30 última", () => {
  const t = buildMealTemplate("tarde", "17:00", { usaIntra: true, durationMin: 60 });
  assert(t.some((m) => /Lanche da Tarde \/ Pré-Treino Sólido/.test(m.refeicao) && m.horario === "16:00"));
  assert(t.some((m) => /Jantar \/ Pós-Treino Sólido/.test(m.refeicao)));
  assertEquals(last(t).refeicao, "Ceia");
  assertEquals(last(t).horario, "22:30");
});

Deno.test("template NOITE (20:00): jantar = pré-treino, ceia = pós-sólido", () => {
  const t = buildMealTemplate("noite", "20:00", { usaIntra: true, durationMin: 60 });
  assert(t.some((m) => /Jantar \/ Pré-Treino Sólido/.test(m.refeicao) && m.horario === "19:00"));
  assert(/Ceia/.test(last(t).refeicao));
  // Ceia é a última, possivelmente com tag pós-sólido
  assert(toMinutes(last(t).horario) >= 22 * 60);
});

Deno.test("template DESCANSO: 6 refeições, ceia 22:00 última", () => {
  const t = buildMealTemplate("descanso");
  assertEquals(t.length, 6);
  assertEquals(t[0].refeicao, "Café da Manhã");
  assertEquals(last(t).refeicao, "Ceia");
  assertEquals(last(t).horario, "22:00");
});

// ─── enforceCeiaPosition ──────────────────────────────────────────────────
Deno.test("enforceCeia: injeta Ceia 22:00 quando ausente", () => {
  const refs: Refeicao[] = [
    { refeicao: "Café da Manhã", horario: "07:00" },
    { refeicao: "Almoço", horario: "12:30" },
    { refeicao: "Jantar", horario: "19:30" },
  ];
  enforceCeiaPosition(refs);
  const c = findCeia(refs);
  assert(c, "Ceia deve existir");
  assertEquals(last(refs), c);
  assertEquals(c!.horario, "22:00");
});

Deno.test("enforceCeia: promove refeição noturna (>=21:00) a Ceia se nenhuma existir", () => {
  const refs: Refeicao[] = [
    { refeicao: "Café da Manhã", horario: "07:00" },
    { refeicao: "Jantar", horario: "19:30" },
    { refeicao: "Lanche Noturno", horario: "22:00" },
  ];
  enforceCeiaPosition(refs);
  const c = findCeia(refs);
  assert(c);
  assert(/Ceia/.test(c!.refeicao!));
  assertEquals(last(refs), c);
});

Deno.test("enforceCeia: NÃO promove refeição peri-workout (Pós-Treino Imediato 21:30)", () => {
  const refs: Refeicao[] = [
    { refeicao: "Jantar / Pré-Treino Sólido", horario: "19:00" },
    { refeicao: "Intra-Treino", horario: "20:30" },
    { refeicao: "Pós-Treino Imediato", horario: "21:30" },
  ];
  enforceCeiaPosition(refs);
  const c = findCeia(refs);
  assert(c, "Ceia deve ser injetada (não pode promover peri-workout)");
  // Ceia deve ser a última
  assertEquals(last(refs), c);
  assert(toMinutes(c!.horario) > toMinutes("21:30"));
});

Deno.test("enforceCeia: reposiciona quando Ceia está antes do Jantar", () => {
  const refs: Refeicao[] = [
    { refeicao: "Almoço", horario: "12:30" },
    { refeicao: "Ceia", horario: "18:00" }, // ❌ antes do jantar
    { refeicao: "Jantar", horario: "19:30" },
  ];
  enforceCeiaPosition(refs);
  const c = findCeia(refs)!;
  const j = findJantar(refs)!;
  assert(toMinutes(c.horario) >= toMinutes(j.horario) + 150, "gap ≥ 2h30");
  assertEquals(last(refs), c);
});

Deno.test("enforceCeia: força gap mínimo 2h30 quando Ceia colada no Jantar", () => {
  const refs: Refeicao[] = [
    { refeicao: "Jantar", horario: "20:00" },
    { refeicao: "Ceia", horario: "20:30" }, // gap 30min ❌
  ];
  enforceCeiaPosition(refs);
  const c = findCeia(refs)!;
  assertEquals(c.horario, "22:30");
});

Deno.test("enforceCeia: clampa para janela [21:30, 23:30]", () => {
  const refs: Refeicao[] = [
    { refeicao: "Jantar", horario: "19:30" },
    { refeicao: "Ceia", horario: "20:00" }, // muito cedo
  ];
  enforceCeiaPosition(refs);
  assertEquals(findCeia(refs)!.horario, "22:00");

  const refs2: Refeicao[] = [
    { refeicao: "Jantar", horario: "21:00" },
    { refeicao: "Ceia", horario: "00:30" }, // tarde demais (fora janela)
  ];
  enforceCeiaPosition(refs2);
  const c2 = findCeia(refs2)!;
  // 00:30 = 30min → menor que 21:30 → clamp inferior; mas gap >=2h30 do jantar 21:00 = 23:30 → fica 23:30
  assertEquals(c2.horario, "23:30");
});

Deno.test("enforceCeia: treino noturno → Ceia / Pós-Treino Sólido permanece como última", () => {
  const refs: Refeicao[] = [
    { refeicao: "Jantar / Pré-Treino Sólido", horario: "19:00" },
    { refeicao: "Intra-Treino", horario: "20:30" },
    { refeicao: "Pós-Treino Imediato", horario: "21:30" },
    { refeicao: "Ceia / Pós-Treino Sólido", horario: "22:30" },
  ];
  enforceCeiaPosition(refs);
  const c = findCeia(refs)!;
  assertEquals(last(refs), c);
  assert(/Ceia \/ Pós-Treino Sólido/.test(c.refeicao!));
  assertEquals(c.horario, "22:30");
});

Deno.test("enforceCeia: ordena e renumera Refeição N", () => {
  const refs: Refeicao[] = [
    { refeicao: "Refeição 1 — Jantar", horario: "19:30" },
    { refeicao: "Refeição 2 — Café da Manhã", horario: "07:00" },
    { refeicao: "Refeição 3 — Almoço", horario: "12:30" },
    { refeicao: "Refeição 4 — Ceia", horario: "22:00" },
  ];
  enforceCeiaPosition(refs);
  assertEquals(refs[0].refeicao, "Refeição 1 — Café da Manhã");
  assertEquals(refs[1].refeicao, "Refeição 2 — Almoço");
  assertEquals(refs[2].refeicao, "Refeição 3 — Jantar");
  assertEquals(refs[3].refeicao, "Refeição 4 — Ceia");
});

// ─── Sanidade dos templates via enforce ───────────────────────────────────
Deno.test("integração: todos os templates passam pelo enforce sem alterações de Ceia", () => {
  const cases: Array<[Parameters<typeof buildMealTemplate>[0], string | undefined]> = [
    ["manha", "07:00"],
    ["meio_dia", "13:30"],
    ["tarde", "17:00"],
    ["noite", "20:00"],
    ["descanso", undefined],
  ];
  for (const [w, t] of cases) {
    const tpl = buildMealTemplate(w, t).map((m) => ({ ...m })) as Refeicao[];
    const ceiaAntes = findCeia(tpl)!.horario;
    enforceCeiaPosition(tpl);
    const ceiaDepois = findCeia(tpl)!.horario;
    assertEquals(
      ceiaAntes,
      ceiaDepois,
      `Template ${w} (${t}) teve Ceia movida pelo enforce: ${ceiaAntes} → ${ceiaDepois}`,
    );
    assert(/\bceia\b/i.test(String(last(tpl).refeicao)), `Ceia deve ser última em ${w}`);
  }
});

// ─── utilitários ──────────────────────────────────────────────────────────
Deno.test("toMinutes/fromMinutes: round-trip", () => {
  for (const h of ["00:00", "07:30", "13:30", "22:00", "23:30"]) {
    assertEquals(fromMinutes(toMinutes(h)), h);
  }
  assertEquals(toMinutes("lixo"), -1);
});
