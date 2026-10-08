// Command Center daily/weekly automation. Called hourly by the scheduler with the private cron key.
// Nothing is published: every output is saved as "pronto_para_revisar" for the user to approve.
import { adminClient } from "../_shared/auth.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;
const BATCH = 3; // users per run, per job type
const TZ_OFFSET_H = -3; // Brasília (no DST)

const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { "Content-Type": "application/json" } });
const localNow = () => new Date(Date.now() + TZ_OFFSET_H * 3600e3);
const ymd = (d: Date) => d.toISOString().slice(0, 10);
/** UTC instant for local midnight of a local yyyy-mm-dd. */
const localMidnightUtc = (day: string) => new Date(new Date(`${day}T00:00:00Z`).getTime() - TZ_OFFSET_H * 3600e3);

type DB = ReturnType<typeof adminClient>;

async function notify(db: DB, user_id: string, title: string, body: string, type = "command_center") {
  await db.from("notifications").insert({ user_id, title, body, type, action_url: "/coach/social", metadata: { origem: "cc_automation" } });
}

async function withRetry<T>(fn: () => Promise<T>): Promise<{ ok: true; value: T; tentativas: number } | { ok: false; erro: string; tentativas: number }> {
  try { return { ok: true, value: await fn(), tentativas: 1 }; } catch (e1) {
    if (e1 instanceof Skip) throw e1;
    await new Promise(r => setTimeout(r, 5000));
    try { return { ok: true, value: await fn(), tentativas: 2 }; } catch (e2) {
      if (e2 instanceof Skip) throw e2;
      return { ok: false, erro: e2 instanceof Error ? e2.message : String(e2), tentativas: 2 };
    }
  }
}
class Skip extends Error {}

async function callGerarReel(cronKey: string, userId: string, tema: string) {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/gerar_reel`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: ANON, Authorization: `Bearer ${ANON}`, "x-cron-key": cronKey, "x-user-id": userId },
    body: JSON.stringify({ tema, objetivo: "alcance", tom: "direto" }),
  });
  if (!res.ok) { let m = `Motor de Retenção respondeu ${res.status}`; try { m = (await res.json())?.error || m; } catch { /* */ } throw new Error(m); }
  const text = await res.text();
  for (const line of text.split("\n")) {
    if (!line.trim()) continue;
    const ev = JSON.parse(line);
    if (ev.etapa === "erro") throw new Error(ev.error);
    if (ev.etapa === "pronto") return ev.script;
  }
  throw new Error("A geração foi interrompida.");
}

async function daily(db: DB, cronKey: string, uid: string, today: string, limite: number) {
  const ini = localMidnightUtc(today), ontemIni = new Date(ini.getTime() - 864e5);
  const { count } = await db.from("retention_scripts").select("id", { count: "exact", head: true }).eq("user_id", uid).gte("created_at", ini.toISOString());
  if ((count ?? 0) >= limite) throw new Skip(`Limite de ${limite} geração(ões) por dia já atingido.`);
  const { data: plan } = await db.from("social_content_calendar").select("topic, hook, scheduled_time, format").eq("coach_id", uid).eq("date", today).limit(1).maybeSingle();
  const tema = (plan?.topic || plan?.hook || "").trim();
  if (!tema) throw new Skip("Sem tema no Planner para hoje.");

  const script = await callGerarReel(cronKey, uid, tema);

  const [{ data: ontem }, { data: best }] = await Promise.all([
    db.from("retention_scripts").select("id, tema, nota_geral").eq("user_id", uid).gte("created_at", ontemIni.toISOString()).lt("created_at", ini.toISOString()).order("created_at", { ascending: false }).limit(1).maybeSingle(),
    db.from("retention_results").select("script_id, pct_3s, created_at").eq("user_id", uid).lt("created_at", new Date(ini.getTime() - 14 * 864e5).toISOString()).order("pct_3s", { ascending: false }).limit(1).maybeSingle(),
  ]);
  const { data: ontemRes } = ontem ? await db.from("retention_results").select("pct_3s, tempo_medio, curva_real").eq("script_id", ontem.id).maybeSingle() : { data: null };
  const { data: bestScript } = best ? await db.from("retention_scripts").select("tema").eq("id", best.script_id).maybeSingle() : { data: null };

  const conteudo = {
    revisao_ontem: ontem ? {
      tema: ontem.tema, nota_prevista: ontem.nota_geral,
      pct_3s: ontemRes?.pct_3s ?? null, tempo_medio: ontemRes?.tempo_medio ?? null,
      maior_queda: (ontemRes as any)?.curva_real?.maior_queda ?? null,
      pendente: !ontemRes ? "Retenção de ontem ainda não lançada." : null,
    } : null,
    acao_do_dia: { texto: `Gravar e revisar o reel: ${script.tema}`, horario: plan?.scheduled_time ? String(plan.scheduled_time).slice(0, 5) : null },
    reciclagem: best && bestScript ? { tema: bestScript.tema, pct_3s: best.pct_3s, texto: `Reteve ${best.pct_3s}% nos 3s. Candidato a novo formato.` } : null,
    tendencia: null, tendencia_nota: "Nenhuma fonte de tendência conectada.",
  };
  await db.from("cc_briefings").upsert({ user_id: uid, data: today, tipo: "diario", conteudo, script_id: script.id, status: "pronto_para_revisar" }, { onConflict: "user_id,data,tipo" });
  await notify(db, uid, "Seu reel de hoje está pronto.", `${script.tema} · pronto para revisar.`);
  return { script_id: script.id, tema };
}

async function weekly(db: DB, uid: string, today: string) {
  const fim = localMidnightUtc(today), ini = new Date(fim.getTime() - 7 * 864e5 + 864e5);
  const { data: scripts } = await db.from("retention_scripts").select("id, tema, nota_geral, formula_id").eq("user_id", uid).gte("created_at", ini.toISOString());
  const ids = (scripts ?? []).map(s => s.id);
  const { data: results } = ids.length ? await db.from("retention_results").select("script_id, pct_3s, curva_real").in("script_id", ids) : { data: [] as any[] };
  const withRes = (results ?? []).map(r => ({ ...r, s: scripts!.find(s => s.id === r.script_id) })).sort((a, b) => Number(b.pct_3s ?? -1) - Number(a.pct_3s ?? -1));
  const quedas = new Map<string, number>();
  for (const r of withRes) { const b = (r as any).curva_real?.maior_queda?.bloco; if (b != null) quedas.set(String(b), (quedas.get(String(b)) ?? 0) + 1); }
  const pior = [...quedas.entries()].sort((a, b) => b[1] - a[1])[0];

  const { data: goal } = await db.from("creator_goals").select("*").eq("user_id", uid).maybeSingle();
  let meta: any = null;
  if (goal) {
    const gIni = localMidnightUtc(goal.inicio);
    const dias = Math.max(0, Math.min(90, (Date.now() - gIni.getTime()) / 864e5));
    const { data: rs } = await db.from("retention_results").select("pct_3s").eq("user_id", uid).gte("created_at", gIni.toISOString());
    const vals = (rs ?? []).map(r => Number(r.pct_3s)).filter(Number.isFinite);
    const atual = goal.metrica === "reels_publicados" ? (rs ?? []).length : vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
    const esperado = Number(goal.alvo) * (dias / 90);
    const abaixoPct = esperado > 0 ? Math.round(((esperado - atual) / esperado) * 100) : 0;
    const semanasRest = Math.max(1, (90 - dias) / 7);
    const ritmo = goal.metrica === "reels_publicados" ? Math.ceil(Math.max(0, Number(goal.alvo) - atual) / semanasRest) : null;
    meta = { metrica: goal.metrica, alvo: Number(goal.alvo), atual: Math.round(atual * 10) / 10, esperado: Math.round(esperado * 10) / 10, abaixo_pct: abaixoPct, dia: Math.floor(dias),
      ajuste_plano: ritmo != null ? `Ritmo necessário: ${ritmo} reel(s) com resultado por semana até o dia 90.` : `Média necessária: ${goal.alvo}% passando dos 3s.` };
  }
  const alerta = meta && meta.abaixo_pct > 15 ? {
    texto: `Você está ${meta.abaixo_pct}% abaixo da curva da meta.`,
    acao: meta.metrica === "reels_publicados" ? `Esta semana: gravar, postar e lançar a retenção de ${Math.max(1, Math.ceil(meta.esperado - meta.atual))} reel(s).` : "Esta semana: reusar a fórmula que mais reteve no topo do ranking e reforçar os 3 primeiros segundos.",
  } : null;

  const conteudo = {
    reels_semana: (scripts ?? []).length, com_resultado: withRes.length,
    o_que_reteve: withRes[0] ? { tema: withRes[0].s?.tema, pct_3s: withRes[0].pct_3s } : null,
    o_que_cortar: pior ? { texto: `O bloco ${pior[0]} foi a maior queda em ${pior[1]} reel(s). Encurtar ou trocar esse trecho.` } : null,
    meta, alerta,
  };
  await db.from("cc_briefings").upsert({ user_id: uid, data: today, tipo: "semanal", conteudo, status: "pronto_para_revisar" }, { onConflict: "user_id,data,tipo" });
  if (alerta) await notify(db, uid, "Meta 90 dias abaixo da curva", `${alerta.texto} ${alerta.acao}`);
  else await notify(db, uid, "Revisão da semana pronta", "Sua revisão semanal está pronta para revisar.");
  return { reels: conteudo.reels_semana, alerta: !!alerta };
}

Deno.serve(async (req) => {
  const db = adminClient();
  const { data: state } = await db.from("cc_job_state").select("cron_key, lease_until").eq("id", 1).maybeSingle();
  const key = req.headers.get("x-cron-key");
  if (!state?.cron_key || key !== state.cron_key) return json({ error: "Não autorizado" }, 401);

  const nowIso = new Date().toISOString();
  const q = db.from("cc_job_state").update({ lease_until: new Date(Date.now() + 10 * 60e3).toISOString(), last_run_at: nowIso }).eq("id", 1);
  const { data: leased } = await (state.lease_until ? q.lt("lease_until", nowIso) : q.is("lease_until", null)).select("id");
  if (!leased?.length) return json({ skipped: "locked" });

  const out: any[] = [];
  try {
    const ln = localNow(), today = ymd(ln), hour = ln.getUTCHours(), sunday = ln.getUTCDay() === 0;

    const { data: dueDaily } = await db.from("cc_automation_settings").select("user_id, limite_diario, ultimo_diario")
      .eq("pausado", false).lte("hora", hour).or(`ultimo_diario.is.null,ultimo_diario.lt.${today}`).limit(BATCH);
    for (const s of dueDaily ?? []) {
      // Claim first so a crash never re-runs the same day.
      const { data: claimed } = await db.from("cc_automation_settings").update({ ultimo_diario: today }).eq("user_id", s.user_id)
        .or(`ultimo_diario.is.null,ultimo_diario.lt.${today}`).select("user_id");
      if (!claimed?.length) continue;
      try {
        const r = await withRetry(() => daily(db, state.cron_key, s.user_id, today, s.limite_diario));
        if (r.ok) await db.from("cc_automation_runs").insert({ user_id: s.user_id, tipo: "diario", status: "ok", tentativas: r.tentativas, detalhes: r.value });
        else {
          await db.from("cc_automation_runs").insert({ user_id: s.user_id, tipo: "diario", status: "erro", erro: r.erro, tentativas: r.tentativas });
          await notify(db, s.user_id, "A automação de hoje falhou", `Tentamos duas vezes. Motivo: ${r.erro}`);
        }
        out.push({ tipo: "diario", ok: r.ok });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        await db.from("cc_automation_runs").insert({ user_id: s.user_id, tipo: "diario", status: "pulado", erro: msg });
        await notify(db, s.user_id, "Reel de hoje não gerado", msg);
        out.push({ tipo: "diario", pulado: msg });
      }
    }

    if (sunday) {
      const { data: dueWeekly } = await db.from("cc_automation_settings").select("user_id")
        .eq("pausado", false).lte("hora", hour).or(`ultima_semanal.is.null,ultima_semanal.lt.${today}`).limit(BATCH);
      for (const s of dueWeekly ?? []) {
        const { data: claimed } = await db.from("cc_automation_settings").update({ ultima_semanal: today }).eq("user_id", s.user_id)
          .or(`ultima_semanal.is.null,ultima_semanal.lt.${today}`).select("user_id");
        if (!claimed?.length) continue;
        const r = await withRetry(() => weekly(db, s.user_id, today));
        await db.from("cc_automation_runs").insert({ user_id: s.user_id, tipo: "semanal", status: r.ok ? "ok" : "erro", erro: r.ok ? null : r.erro, tentativas: r.tentativas, detalhes: r.ok ? r.value : {} });
        if (!r.ok) await notify(db, s.user_id, "A revisão semanal falhou", `Tentamos duas vezes. Motivo: ${r.erro}`);
        out.push({ tipo: "semanal", ok: r.ok });
      }
    }
  } finally {
    await db.from("cc_job_state").update({ lease_until: null }).eq("id", 1);
  }
  return json({ ok: true, out });
});
