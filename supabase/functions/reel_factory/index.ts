// Fábrica de Reels: batch ideation -> Architect/Writer (light model) -> pre-filter -> Critic (1 rewrite max) -> originality.
// Bounded chunks per invocation, per-batch lease, self-chaining with a hop budget and cooldown. Nothing is published.
import { adminClient, requireUser } from "../_shared/auth.ts";
import { CRITIC_LIMITS, normalizeCritique, objectiveChecks } from "../_shared/retentionCritic.ts";
import { ARQUITETO_PROMPT, ATLAS, CRITICO_PROMPT, REDATOR_PROMPT } from "../_shared/retentionPrompts.ts";
import { IDEIAS_PROMPT } from "./prompts.ts";
import { allocateFormulas, allocatePillars, assignAngles, type Pillar, dedupThemes, estimateCalls, originality, preFilter, type Prior } from "./logic.ts";

const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-cron-key" };
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...cors, "Content-Type": "application/json" } });
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;
const LIGHT = "google/gemini-3.1-flash-lite"; // ideation, Architect, Writer
const CRITIC_MODEL = "google/gemini-2.5-flash"; // same as gerar_reel so scores stay comparable
const CHUNK = 4;
const COOLDOWN_MS = 4000;
const TZ = -3;
const localToday = () => new Date(Date.now() + TZ * 3600e3).toISOString().slice(0, 10);
const localMidnightUtc = (d: string) => new Date(new Date(`${d}T00:00:00Z`).getTime() - TZ * 3600e3);
const str = (v: unknown, max = 1000) => typeof v === "string" ? v.trim().slice(0, max) : "";
type DB = ReturnType<typeof adminClient>;

class Halt extends Error { constructor(public kind: "pausado" | "erro", msg: string) { super(msg); } }

async function pass(model: string, system: string, input: unknown, counter: { n: number }): Promise<Record<string, any>> {
  for (let attempt = 0; attempt < 2; attempt++) {
    counter.n++;
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST", headers: { Authorization: `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model, response_format: { type: "json_object" },
        messages: [{ role: "system", content: `${system}\n\n${ATLAS}` }, { role: "user", content: JSON.stringify(input) }] }),
    });
    if (res.status === 429) throw new Halt("pausado", "Limite de uso atingido. O lote continua na próxima execução.");
    if (res.status === 402) throw new Halt("pausado", "Créditos esgotados no espaço de trabalho. Lote pausado.");
    if (res.status === 403) throw new Halt("pausado", "Acesso bloqueado pelo espaço de trabalho. Lote pausado.");
    if (!res.ok) { await res.text(); throw new Error(`Falha na geração (${res.status}).`); }
    const d = await res.json();
    try {
      const v = JSON.parse(String(d.choices?.[0]?.message?.content ?? "").replace(/```json|```/g, "").trim());
      if (v && typeof v === "object" && !Array.isArray(v)) return v;
    } catch { /* retry once */ }
  }
  throw new Error("Resposta inválida duas vezes.");
}

async function notify(db: DB, user_id: string, title: string, body: string) {
  await db.from("notifications").insert({ user_id, title, body, type: "reel_factory", action_url: "/coach/social", metadata: { origem: "reel_factory" } });
}

async function context(db: DB, uid: string) {
  const since = new Date(Date.now() - 30 * 864e5).toISOString();
  const today = localToday();
  const [{ data: prof }, { data: voice }, { data: patterns }, { data: formulas }, { data: stats }, { data: plan }, { data: bank }, { data: scripts }] = await Promise.all([
    db.from("social_profile").select("content_pillars, niches, creator_profile").eq("coach_id", uid).maybeSingle(),
    db.from("creator_voice").select("expressoes_usa, expressoes_evita, nicho").eq("user_id", uid).maybeSingle(),
    db.from("retention_patterns").select("tipo, texto, retencao_media, amostras, confirmado").eq("user_id", uid).order("amostras", { ascending: false }).limit(40),
    db.from("hook_formulas").select("id, nome, template, exemplo, gatilho").order("id"),
    db.from("creator_formula_stats").select("formula_id, usos, retencao_3s_media").eq("user_id", uid),
    db.from("social_content_calendar").select("date, topic, pillar").eq("coach_id", uid).gte("date", today).order("date").limit(14),
    db.from("reel_bank").select("tema, abertura, formula_id, estrutura").eq("user_id", uid).gte("created_at", since).neq("status", "reprovado").limit(1000),
    db.from("retention_scripts").select("tema, formula_id, roteiro").eq("user_id", uid).gte("created_at", since).limit(500),
  ]);
  await db.rpc("seed_content_pillars", { _user_id: uid });
  const [{ data: cps }, { data: angs }, { data: cases }, { data: posted }, { data: results }] = await Promise.all([
    db.from("content_pillars").select("chave, nome, publico, qtd_diaria, objetivo, mecanismo, exige_caso_real, ativo").eq("user_id", uid).order("ordem"),
    db.from("content_angles").select("nome").order("id"),
    db.from("content_cases").select("id").eq("user_id", uid).eq("autorizado", true).eq("ativo", true).limit(1),
    db.from("reel_bank").select("pilar, angulo, script_id").eq("user_id", uid).not("script_id", "is", null).limit(2000),
    db.from("retention_results").select("script_id, pct_3s").eq("user_id", uid),
  ]);
  // Learning: measured 3s retention per pillar and per pillar|angle, from posted reels with retention entered.
  const r3 = new Map((results ?? []).filter((r: any) => r.pct_3s != null).map((r: any) => [r.script_id, Number(r.pct_3s)]));
  const acc = (m: Map<string, number[]>, k: string, v: number) => m.set(k, [...(m.get(k) ?? []), v]);
  const byP = new Map<string, number[]>(), byPA = new Map<string, number[]>();
  for (const b of posted ?? []) { const v = r3.get(b.script_id); if (v == null || !b.pilar) continue; acc(byP, b.pilar, v); if (b.angulo) acc(byPA, `${b.pilar}|${b.angulo}`, v); }
  const mean = (m: Map<string, number[]>) => Object.fromEntries([...m].map(([k, xs]) => [k, xs.reduce((a, b) => a + b, 0) / xs.length]));
  const pillars = (Array.isArray(prof?.content_pillars) ? prof!.content_pillars : []).map((p: any) => str(typeof p === "string" ? p : p?.nome ?? p?.name ?? p?.titulo, 80)).filter(Boolean);
  const priors: Prior[] = [
    ...(bank ?? []).map((b: any) => ({ tema: b.tema, abertura: b.abertura ?? "", formula_id: b.formula_id, funcoes: (b.estrutura?.blocos ?? []).map((x: any) => x.funcao).join("|") })),
    ...(scripts ?? []).map((s: any) => ({ tema: s.tema, abertura: s.roteiro?.blocos?.[0]?.fala ?? "", formula_id: s.formula_id, funcoes: (s.roteiro?.blocos ?? []).map((x: any) => x.funcao).join("|") })),
  ];
  return { matrix: (cps ?? []) as Pillar[], angles: (angs ?? []).map((a: any) => a.nome as string), hasCase: !!cases?.length, pillarPerf: mean(byP), comboPerf: mean(byPA), pillars, niches: prof?.niches ?? [], voice: voice ?? null, patterns: patterns ?? [], formulas: formulas ?? [], stats: stats ?? [], plan: plan ?? [], priors };
}

async function ideate(db: DB, batch: any, counter: { n: number }) {
  const ctx = await context(db, batch.user_id);
  const formulaIds = allocateFormulas(batch.n_ideias, ctx.formulas.map((f: any) => f.id), ctx.stats as any);
  type Slot = { idx: number; pilar: string; angulo: string | null; publico: string | null; objetivo: string | null; mecanismo: string | null; formula_id: number };
  let slots: Slot[];
  if (ctx.matrix.length && ctx.angles.length) {
    const pIdx = allocatePillars(batch.n_ideias, ctx.matrix, ctx.hasCase, ctx.pillarPerf);
    const angBy = new Map<number, string[]>();
    for (const i of new Set(pIdx)) { const nome = ctx.matrix[i].nome; const combo = Object.fromEntries(ctx.angles.map(a => [a, ctx.comboPerf[`${nome}|${a}`] ?? null])); angBy.set(i, assignAngles(pIdx.filter(x => x === i).length, ctx.angles, combo)); }
    slots = pIdx.map((pi, idx) => { const p = ctx.matrix[pi]; return { idx, pilar: p.nome, angulo: angBy.get(pi)!.shift() ?? null, publico: p.publico, objetivo: p.objetivo.join(" e "), mecanismo: p.mecanismo, formula_id: formulaIds[idx] }; });
  } else {
    const pil = ctx.pillars.length ? [...new Set(ctx.pillars)] : ["geral"];
    slots = formulaIds.map((fid, idx) => ({ idx, pilar: pil[idx % pil.length], angulo: null, publico: null, objetivo: null, mecanismo: null, formula_id: fid }));
  }
  const out = await pass(LIGHT, IDEIAS_PROMPT, { perfil: { nicho: ctx.niches, voz: ctx.voice }, planner: ctx.plan, padroes_vencedores: ctx.patterns.filter((p: any) => p.confirmado),
    temas_recentes: ctx.priors.map(p => p.tema).slice(0, 200), slots }, counter);
  const list = Array.isArray(out.ideias) ? out.ideias : [];
  const got = new Map(list.map((i: any) => [Number(i?.idx), str(i?.tema, 200)]));
  const tens = new Map(list.map((i: any) => [Number(i?.idx), str(i?.tensao, 240)]));
  const temas = slots.map(s => got.get(s.idx) ?? "");
  const dd = dedupThemes(temas, ctx.priors.map(p => p.tema));
  const ideias = slots.map((s, i) => ({ ...s, tema: temas[i], tensao: tens.get(s.idx) || null, descarte: dd[i].keep ? null : dd[i].motivo }));
  // Record discarded themes with reason right away.
  const rejected = ideias.filter(i => i.descarte).map(i => ({ user_id: batch.user_id, batch_id: batch.id, idx: i.idx, pilar: i.pilar, angulo: i.angulo, publico: i.publico, objetivo: i.objetivo, mecanismo: i.mecanismo, tensao: i.tensao, formula_id: i.formula_id, tema: i.tema || "(sem tema)", status: "reprovado", motivo_descarte: i.descarte }));
  if (rejected.length) await db.from("reel_bank").upsert(rejected, { onConflict: "batch_id,idx", ignoreDuplicates: true });
  return { ideias, descartados: rejected.length };
}

const toBlock = (v: any) => ({ id: Number(v?.id), tempo: str(v?.tempo, 20), funcao: str(v?.funcao, 40), fala: str(v?.fala), texto_tela: str(v?.texto_tela, 200), estimulo_visual: str(v?.estimulo_visual, 300), gatilho: str(v?.gatilho, 80) });
const span = (t: string) => { const m = t.match(/(\d+(?:\.\d+)?)\s*[-–]\s*(\d+(?:\.\d+)?)/); return m ? Math.max(0, Number(m[2]) - Number(m[1])) : 0; };

async function buildOne(ctx: any, idea: any, counter: { n: number }) {
  const formula = ctx.formulas.find((f: any) => f.id === idea.formula_id) ?? null;
  const contexto = { pedido: { tema: idea.tema, objetivo: idea.objetivo ?? "alcance", tom: "direto", rede: "instagram", pilar: idea.pilar, angulo: idea.angulo, publico: idea.publico, mecanismo: idea.mecanismo, tensao: idea.tensao }, formulas_atlas: ctx.formulas,
    selecao_formula: { modo: "fixa", permitidas: [idea.formula_id] }, voz_do_criador: ctx.voice,
    padroes_confirmados: ctx.patterns.filter((p: any) => p.confirmado), indicios: ctx.patterns.filter((p: any) => !p.confirmado) };
  const estrutura = await pass(LIGHT, ARQUITETO_PROMPT + `\n\nUse formula_id ${idea.formula_id}. Inclua "formula_id" e "loops_abertos" no JSON.`, contexto, counter);
  Object.assign(estrutura, { formula_id: formula?.id ?? null, formula_nome: formula?.nome ?? null });
  const draft = await pass(LIGHT, REDATOR_PROMPT, { ...contexto, estrutura }, counter);
  const blocks = (Array.isArray(draft.blocos) ? draft.blocos : []).map(toBlock).filter((b: any) => Number.isFinite(b.id) && b.fala && b.tempo);
  if (!blocks.length) return { motivo: "Roteiro incompleto." };
  const pre = preFilter(blocks[0].fala, estrutura.loops_abertos);
  if (pre) return { motivo: pre, estrutura, blocks, draft };

  const critique = async () => {
    const sb = blocks.map((b: any) => ({ id: b.id, tempo: b.tempo, fala: b.fala, caminho: [] as (string | number)[] }));
    const raw = await pass(CRITIC_MODEL, CRITICO_PROMPT, { ...contexto, estrutura, blocos: blocks, checagens_objetivas: sb.map(objectiveChecks) }, counter);
    return normalizeCritique(raw, sb);
  };
  const historico = [];
  let current = await critique(); historico.push(current);
  const weakIds = current.notas_por_bloco.filter(n => n.nota < CRITIC_LIMITS.rewriteBelow).map(n => n.id);
  if (weakIds.length) { // at most one rewrite round in batch mode
    const patch = await pass(LIGHT, REDATOR_PROMPT, { ...contexto, estrutura, modo: "reescrita_parcial",
      blocos: blocks.filter((b: any) => weakIds.includes(b.id)).map((b: any) => ({ ...b, critica: current.notas_por_bloco.find(n => n.id === b.id) })) }, counter);
    for (const p of Array.isArray(patch.blocos) ? patch.blocos : []) {
      const t = blocks.find((b: any) => b.id === Number(p?.id) && weakIds.includes(b.id));
      if (!t) continue;
      const nx = toBlock({ ...t, ...p, id: t.id, tempo: t.tempo, funcao: t.funcao });
      if (nx.fala) Object.assign(t, nx);
    }
    current = await critique(); historico.push(current);
  }
  const byId = new Map(current.notas_por_bloco.map(n => [n.id, n]));
  const roteiro = { blocos: blocks.map((b: any) => ({ ...b, nota: byId.get(b.id)?.nota ?? null })),
    aberturas_alternativas: (Array.isArray(draft.aberturas_alternativas) ? draft.aberturas_alternativas : []).map((v: any) => str(v, 300)).filter(Boolean).slice(0, 3),
    legenda: str(draft.legenda, 2200), hashtags: (Array.isArray(draft.hashtags) ? draft.hashtags : []).map((v: any) => str(v, 60)).filter(Boolean).slice(0, 15) };
  const notas = { ...current, rodadas: historico.length - 1, historico };
  return { estrutura, roteiro, notas, nota: current.nota_geral, blocks };
}

async function processChunk(db: DB, batch: any, counter: { n: number }) {
  const ctx = await context(db, batch.user_id);
  const ideias: any[] = batch.ideias;
  const slice = ideias.slice(batch.cursor, batch.cursor + CHUNK).filter(i => !i.descarte);
  const built = await Promise.all(slice.map(async idea => {
    for (let t = 0; t < 2; t++) { // one retry per item
      try { return { idea, r: await buildOne(ctx, idea, counter) }; }
      catch (e) { if (e instanceof Halt) throw e; if (t === 1) return { idea, r: { motivo: "Falha ao gerar (tentado 2 vezes)." } as any }; }
    }
    return { idea, r: { motivo: "Falha ao gerar." } as any };
  }));
  let ok = 0, bad = 0;
  for (const { idea, r } of built) {
    const abertura = r.blocks?.[0]?.fala ?? null;
    const funcoes = (r.blocks ?? []).map((b: any) => b.funcao).join("|");
    let motivo: string | null = r.motivo ?? null;
    if (!motivo) motivo = originality({ tema: idea.tema, abertura: abertura ?? "", formula_id: idea.formula_id, funcoes }, ctx.priors);
    const dur = Number(r.estrutura?.duracao_total_seg) || (r.blocks ?? []).reduce((s: number, b: any) => s + span(b.tempo), 0) || null;
    const row = { user_id: batch.user_id, batch_id: batch.id, idx: idea.idx, pilar: idea.pilar, angulo: idea.angulo ?? null, publico: idea.publico ?? null, objetivo: idea.objetivo ?? null, mecanismo: idea.mecanismo ?? null, tensao: idea.tensao ?? null, formula_id: idea.formula_id, formula_nome: r.estrutura?.formula_nome ?? null,
      tema: idea.tema, abertura, duracao_seg: dur, nota: r.nota ?? null, estrutura: r.estrutura ?? null, roteiro: r.roteiro ?? (r.blocks ? { blocos: r.blocks } : null), notas: r.notas ?? null,
      status: motivo ? "reprovado" : "novo", motivo_descarte: motivo };
    await db.from("reel_bank").upsert(row, { onConflict: "batch_id,idx", ignoreDuplicates: true });
    if (motivo) bad++; else ok++;
  }
  return { ok, bad, next: Math.min(ideias.length, batch.cursor + CHUNK) };
}

async function kick(cronKey: string, batchId: string, budget: number) {
  await new Promise(r => setTimeout(r, COOLDOWN_MS));
  await fetch(`${SUPABASE_URL}/functions/v1/reel_factory`, { method: "POST", headers: { "Content-Type": "application/json", apikey: ANON, "x-cron-key": cronKey }, body: JSON.stringify({ mode: "process", batch_id: batchId, budget }) });
}

async function runBatch(db: DB, cronKey: string, batchId: string, budget: number) {
  const nowIso = new Date().toISOString();
  const { data: leased } = await db.from("reel_factory_batches").update({ lease_until: new Date(Date.now() + 5 * 60e3).toISOString(), status: "rodando", updated_at: nowIso })
    .eq("id", batchId).in("status", ["fila", "rodando"]).or(`lease_until.is.null,lease_until.lt.${nowIso}`).select("*");
  const batch = leased?.[0];
  if (!batch) return { skipped: "locked_or_done" };
  const { data: s } = await db.from("reel_factory_settings").select("pausado").eq("user_id", batch.user_id).maybeSingle();
  if (s?.pausado) { await db.from("reel_factory_batches").update({ status: "pausado", erro: "Fábrica pausada pelo usuário.", lease_until: null }).eq("id", batch.id); return { paused: true }; }
  if (!ARQUITETO_PROMPT.trim() || !REDATOR_PROMPT.trim() || !CRITICO_PROMPT.trim()) {
    await db.from("reel_factory_batches").update({ status: "erro", erro: "As instruções do Arquiteto, Redator e Crítico ainda não foram configuradas.", lease_until: null }).eq("id", batch.id);
    await db.from("cc_automation_runs").insert({ user_id: batch.user_id, tipo: "fabrica", status: "erro", erro: "Instruções do Motor de Retenção não configuradas.", detalhes: { batch_id: batch.id } });
    await notify(db, batch.user_id, "Fábrica de Reels parada", "As instruções do Motor de Retenção ainda não foram configuradas.");
    return { erro: "prompts" };
  }
  const counter = { n: 0 };
  try {
    let patch: Record<string, unknown> = {};
    if (batch.etapa === "ideias") {
      const r = await ideate(db, batch, counter);
      patch = { ideias: r.ideias, etapa: "roteiros", descartados: batch.descartados + r.descartados };
    } else {
      const r = await processChunk(db, batch, counter);
      patch = { cursor: r.next, aprovados: batch.aprovados + r.ok, descartados: batch.descartados + r.bad };
    }
    const done = batch.etapa === "roteiros" && Number(patch.cursor) >= (batch.ideias as any[]).length;
    await db.from("reel_factory_batches").update({ ...patch, chamadas: batch.chamadas + counter.n, status: done ? "concluido" : "rodando", lease_until: null, updated_at: new Date().toISOString() }).eq("id", batch.id);
    if (done) {
      await db.from("cc_automation_runs").insert({ user_id: batch.user_id, tipo: "fabrica", status: "ok", tentativas: batch.tentativas + 1, detalhes: { batch_id: batch.id, aprovados: patch.aprovados, descartados: patch.descartados, chamadas: batch.chamadas + counter.n } });
      await notify(db, batch.user_id, "Seu lote de hoje está pronto.", `${Math.min(10, Number(patch.aprovados) || 0)} reels esperando você.`);
      return { done: true };
    }
    if (budget > 0) (globalThis as any).EdgeRuntime?.waitUntil(kick(cronKey, batch.id, budget - 1));
    return { continued: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (e instanceof Halt) {
      await db.from("reel_factory_batches").update({ status: "pausado", erro: msg, chamadas: batch.chamadas + counter.n, lease_until: null }).eq("id", batch.id);
      await db.from("cc_automation_runs").insert({ user_id: batch.user_id, tipo: "fabrica", status: "erro", erro: msg, detalhes: { batch_id: batch.id } });
      await notify(db, batch.user_id, "Fábrica de Reels pausada", msg);
      return { paused: msg };
    }
    const tentativas = batch.tentativas + 1;
    const final = tentativas > 1;
    await db.from("reel_factory_batches").update({ status: final ? "erro" : "rodando", erro: msg, tentativas, chamadas: batch.chamadas + counter.n, lease_until: null }).eq("id", batch.id);
    if (final) {
      await db.from("cc_automation_runs").insert({ user_id: batch.user_id, tipo: "fabrica", status: "erro", erro: msg, tentativas, detalhes: { batch_id: batch.id } });
      await notify(db, batch.user_id, "Fábrica de Reels falhou", `Tentamos duas vezes. Motivo: ${msg}`);
    } else if (budget > 0) (globalThis as any).EdgeRuntime?.waitUntil(kick(cronKey, batch.id, budget - 1));
    return { erro: msg };
  }
}

async function createBatch(db: DB, uid: string, origem: "manual" | "agendado") {
  const { data: s } = await db.from("reel_factory_settings").select("*").eq("user_id", uid).maybeSingle();
  const cfg = s ?? { n_ideias: 100, limite_roteiros_dia: 100, pausado: false };
  if (cfg.pausado) return { error: "A fábrica está pausada.", status: 409 };
  const today = localToday();
  const { count } = await db.from("reel_bank").select("id", { count: "exact", head: true }).eq("user_id", uid).gte("created_at", localMidnightUtc(today).toISOString()).not("roteiro", "is", null);
  const n = Math.min(cfg.n_ideias, cfg.limite_roteiros_dia - (count ?? 0));
  if (n < 5) return { error: "Limite diário de gerações atingido.", status: 409 };
  const { data, error } = await db.from("reel_factory_batches").insert({ user_id: uid, data: today, origem, n_ideias: n, estimativa_chamadas: estimateCalls(n) }).select("*").single();
  if (error) return { error: error.code === "23505" ? "Já existe um lote hoje." : "Não foi possível criar o lote.", status: 409 };
  return { batch: data };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  const db = adminClient();
  let body: any = {}; try { body = await req.json(); } catch { /* empty */ }
  const { data: state } = await db.from("cc_job_state").select("cron_key").eq("id", 1).maybeSingle();
  const cronKey = state?.cron_key as string;
  const hops = (n: number) => Math.ceil(n / CHUNK) + 4;

  // ---------- scheduler / chain ----------
  if (req.headers.get("x-cron-key")) {
    if (req.headers.get("x-cron-key") !== cronKey) return json({ error: "Não autorizado" }, 401);
    if (body.mode === "process" && typeof body.batch_id === "string") return json(await runBatch(db, cronKey, body.batch_id, Math.max(0, Math.min(60, Number(body.budget) || 0))));
    // hourly tick: start due automatic batches + resume stalled ones (bounded)
    const ln = new Date(Date.now() + TZ * 3600e3), hour = ln.getUTCHours(), today = localToday();
    const { data: due } = await db.from("reel_factory_settings").select("user_id").eq("automatico", true).eq("pausado", false).lte("hora", hour).limit(3);
    const started: string[] = [];
    for (const d of due ?? []) {
      const { data: has } = await db.from("reel_factory_batches").select("id").eq("user_id", d.user_id).eq("data", today).limit(1);
      if (has?.length) continue;
      const r = await createBatch(db, d.user_id, "agendado");
      if ("batch" in r && r.batch) { started.push(r.batch.id); (globalThis as any).EdgeRuntime?.waitUntil(runBatch(db, cronKey, r.batch.id, hops(r.batch.n_ideias))); }
    }
    const { data: stalled } = await db.from("reel_factory_batches").select("id, n_ideias").in("status", ["fila", "rodando"]).lt("updated_at", new Date(Date.now() - 15 * 60e3).toISOString()).limit(3);
    for (const b of stalled ?? []) (globalThis as any).EdgeRuntime?.waitUntil(runBatch(db, cronKey, b.id, hops(b.n_ideias)));
    return json({ started, resumed: (stalled ?? []).length });
  }

  // ---------- user actions ----------
  const auth = await requireUser(req);
  if (!auth.ok) return json({ error: "Não autenticado" }, auth.status);
  const uid = auth.userId;
  const action = String(body.action ?? "");

  if (action === "estimate") {
    const n = Math.max(5, Math.min(100, Number(body.n) || 100));
    return json({ n, chamadas: estimateCalls(n) });
  }
  if (action === "start") {
    const r = await createBatch(db, uid, "manual");
    if (!("batch" in r) || !r.batch) return json({ error: (r as any).error }, (r as any).status ?? 400);
    (globalThis as any).EdgeRuntime?.waitUntil(runBatch(db, cronKey, r.batch.id, hops(r.batch.n_ideias)));
    return json({ batch: r.batch });
  }
  if (action === "resume" && typeof body.batch_id === "string") {
    const { data: b } = await db.from("reel_factory_batches").select("id, user_id, status, n_ideias").eq("id", body.batch_id).maybeSingle();
    if (!b || b.user_id !== uid || b.status !== "pausado") return json({ error: "Lote não pode ser retomado." }, 400);
    await db.from("reel_factory_batches").update({ status: "rodando", erro: null }).eq("id", b.id);
    (globalThis as any).EdgeRuntime?.waitUntil(runBatch(db, cronKey, b.id, hops(b.n_ideias)));
    return json({ ok: true });
  }
  if (action === "choose" && typeof body.reel_id === "string") {
    const { data: item } = await db.from("reel_bank").select("*").eq("id", body.reel_id).maybeSingle();
    if (!item || item.user_id !== uid || !["novo", "guardado"].includes(item.status) || !item.roteiro) return json({ error: "Reel indisponível." }, 400);
    const { data: s } = await db.from("reel_factory_settings").select("limite_agendados_dia, ritmo_semana").eq("user_id", uid).maybeSingle();
    const limite = s?.limite_agendados_dia ?? 1, ritmo = s?.ritmo_semana ?? 5;
    const today = localToday();
    const { count: hoje } = await db.from("reel_bank").select("id", { count: "exact", head: true }).eq("user_id", uid).eq("agendado_para", today);
    if ((hoje ?? 0) >= limite) return json({ error: `Limite de ${limite} reel(s) agendado(s) por dia atingido.` }, 409);
    const wk = new Date(`${today}T00:00:00Z`); const dow = (wk.getUTCDay() + 6) % 7; const monday = new Date(wk.getTime() - dow * 864e5).toISOString().slice(0, 10);
    const { count: semana } = await db.from("reel_bank").select("id", { count: "exact", head: true }).eq("user_id", uid).gte("agendado_para", monday);
    const { data: script, error } = await db.from("retention_scripts").insert({ user_id: uid, tema: item.tema, objetivo: "alcance", tom: "direto", rede: "instagram", estrutura: item.estrutura,
      roteiro: item.roteiro, notas: item.notas, nota_geral: item.nota, formula_id: item.formula_id, origem: "fabrica" }).select("id").single();
    if (error) return json({ error: "Não foi possível agendar." }, 500);
    await db.from("reel_bank").update({ status: "escolhido", agendado_para: today, script_id: script.id }).eq("id", item.id);
    const aviso = (semana ?? 0) + 1 > ritmo ? `Acima do ritmo definido: ${(semana ?? 0) + 1} reels nesta semana para um ritmo de ${ritmo}.` : null;
    return json({ ok: true, script_id: script.id, aviso });
  }
  return json({ error: "Ação inválida." }, 400);
});
