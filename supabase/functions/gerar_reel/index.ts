import { adminClient, requireUser } from "../_shared/auth.ts";
import { CRITIC_LIMITS, normalizeCritique, objectiveChecks } from "../_shared/retentionCritic.ts";
import { loadEnginePrompts } from "../_shared/enginePrompts.ts";
import { verificarReel, temaAmplo, tetoVerificador, VERIFICADOR_REGRAS } from "../_shared/reelVerifier.ts";
import { rodarCritico2, limitarInflacao, inflado } from "../_shared/critico2.ts";
import { GATE, notaFinal, estadoQualidade, juntarPendencias, blocosParaRevisar, aplicarRevisao } from "../_shared/qualityGate.ts";
import { detectarTecnicas, errosDoReel } from "../_shared/academyRules.ts";
// Highest-quality model for Ângulo, Redator and Crítico; lighter one for the Arquiteto plan.
const MODEL_PRO = "google/gemini-2.5-pro", MODEL_LIGHT = "google/gemini-2.5-flash";
const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
const OBJETIVOS = ["alcance", "autoridade", "venda"];
const TONS = ["direto", "bem-humorado", "intenso"];
const QUERO_MAIS = ["comentarios", "salvamentos", "compartilhamentos", "seguidores"];
const FORCA = ["tensao", "relevancia_pessoal", "especificidade", "zero_aquecimento", "pergunta_aberta"];
/** Every third reel tests a formula the creator has not measured yet, so ranking keeps learning. */
const EXPLORE_EVERY = 3;
const CONTRATO_ARQUITETO = `\n\nCONTRATO DE FÓRMULA: escolha formula_id SOMENTE entre selecao_formula.permitidas (ids de formulas_atlas). Em modo "priorizar", prefira as do topo de ranking_formulas; em modo "explorar", teste uma delas. Se pedido.quero_mais vier preenchido, escolha o gatilho de CTA do Atlas para essa ação. Inclua no JSON: "formula_id": número, "formula_motivo": "uma frase", "gatilho_cta": "".`;
const CONTRATO_CRITICO = `\n\nINCLUA no JSON "forca_gancho": {"tensao":0-2,"relevancia_pessoal":0-2,"especificidade":0-2,"zero_aquecimento":0-2,"pergunta_aberta":0-2} avaliando a abertura (bloco 1) pela Escala de Força do Gancho.`;
type Block = { id: number; tempo: string; funcao: string; fala: string; texto_tela: string; estimulo_visual: string; gatilho: string };
class HttpError extends Error { constructor(public status: number, msg: string) { super(msg); } }
const str = (v: unknown, max = 1000) => typeof v === "string" ? v.trim().slice(0, max) : "";

/** One gateway call; invalid JSON is retried exactly once. */
async function pass(system: string, input: unknown, model = MODEL_PRO, signal?: AbortSignal): Promise<Record<string, unknown>> {
  for (let attempt = 0; attempt < 2; attempt++) {
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST", signal, headers: { Authorization: `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model, response_format: { type: "json_object" },
        messages: [{ role: "system", content: system }, { role: "user", content: JSON.stringify(input) }] }),
    });
    if (res.status === 429) throw new HttpError(429, "Limite de uso atingido. Tente em instantes.");
    if (res.status === 402) throw new HttpError(402, "Créditos esgotados no espaço de trabalho.");
    if (res.status === 403) { await res.text(); throw new HttpError(403, "Acesso ao gerador bloqueado no espaço de trabalho."); }
    if (!res.ok) { await res.text(); throw new HttpError(502, "Falha na geração. Tente novamente."); }
    const d = await res.json();
    try {
      const v = JSON.parse(String(d.choices?.[0]?.message?.content ?? "").replace(/```json|```/g, "").trim());
      if (v && typeof v === "object" && !Array.isArray(v)) return v;
    } catch { /* retry once */ }
  }
  throw new HttpError(502, "Resposta inválida duas vezes. Tente novamente.");
}

/** Per-request call budget (max 14 per generation) and Stop support. */
class Budget extends Error { constructor() { super("Teto de chamadas atingido."); } }
type Call = (system: string, input: unknown, model?: string) => Promise<Record<string, unknown>>;
function makeCall(ctx: { calls: number; max: number; ctrl: AbortController }): Call {
  return (system, input, model = MODEL_PRO) => {
    if (ctx.ctrl.signal.aborted) return Promise.reject(new HttpError(499, "Geração parada."));
    if (ctx.calls >= ctx.max) return Promise.reject(new Budget());
    ctx.calls++;
    return pass(system, input, model, ctx.ctrl.signal).catch(e => { if (ctx.ctrl.signal.aborted) throw new HttpError(499, "Geração parada."); throw e; });
  };
}

const toBlock = (v: any): Block => ({ id: Number(v?.id), tempo: str(v?.tempo, 20), funcao: str(v?.funcao, 40), fala: str(v?.fala),
  texto_tela: str(v?.texto_tela || v?.texto_na_tela, 200), estimulo_visual: str(v?.estimulo_visual, 300), gatilho: str(v?.gatilho, 80) });

const normAng = (v: any) => ({ titulo: str(v?.titulo, 200), tensao: str(v?.tensao, 300), situacao: str(v?.situacao, 300), pontos: Number.isFinite(Number(v?.pontos)) ? Number(v.pontos) : null });
function normAngulo(v: any) {
  const escolhido = normAng(v?.escolhido);
  if (!escolhido.titulo) return null;
  return { escolhido, outros: (Array.isArray(v?.outros) ? v.outros : []).map(normAng).filter((o: any) => o.titulo).slice(0, 4) };
}
const TIPOS = ["achado_cientifico", "posicao_do_metodo", "tecnica_de_execucao"];
const tipoDe = (...v: unknown[]) => v.map(x => str(x, 40)).find(x => TIPOS.includes(x)) ?? null;
const mean = (a: number[]) => a.length ? Math.round(a.reduce((x, y) => x + y, 0) / a.length * 10) / 10 : null;

function applyPatch(blocks: Block[], patch: Record<string, unknown>, ids: number[]) {
  for (const p of Array.isArray(patch.blocos) ? patch.blocos : []) {
    const target = blocks.find(b => b.id === Number((p as any)?.id) && ids.includes(b.id));
    if (!target) continue;
    const next = toBlock({ ...target, ...(p as any), id: target.id, tempo: target.tempo, funcao: target.funcao });
    if (next.fala) Object.assign(target, next);
  }
}

/** Verifier (code) + Crítico 1 and Crítico 2 in parallel; gate = min(C1, C2, verifier ceiling). */
async function avaliar(call: Call, P: any, contexto: unknown, estrutura: unknown, blocks: Block[], vopts: any) {
  const ver = verificarReel(blocks, { ...vopts, fatores: P.fatores });
  const sb = blocks.map(b => ({ id: b.id, tempo: b.tempo, fala: b.fala, caminho: [] as (string | number)[] }));
  const rubrica = VERIFICADOR_REGRAS.join("\n");
  const c1 = async () => {
    let raw: Record<string, unknown> = {}; let critica: ReturnType<typeof normalizeCritique> | null = null;
    for (let t = 0; t < 2 && !critica; t++) {
      raw = await call(P.critico + CONTRATO_CRITICO, { ...(contexto as object), estrutura, blocos: blocks, checagens_objetivas: sb.map(objectiveChecks), verificador: ver,
        ...(t ? { aviso: `Dê nota para TODOS os blocos: ids ${blocks.map(b => b.id).join(", ")}.` } : {}) });
      if (Array.isArray(raw.notas_por_bloco)) raw.notas_por_bloco = (raw.notas_por_bloco as any[]).map(n => ({ ...n, id: Number(n?.id ?? n?.bloco), nota: Number(n?.nota) }));
      try { critica = normalizeCritique(raw, sb); } catch (e) { if (t) throw e; }
    }
    if (!critica) throw new HttpError(502, "Crítica incompleta. Tente novamente.");
    return { raw, critica };
  };
  const [{ raw, critica }, c2first] = await Promise.all([c1(), rodarCritico2((sys, inp) => call(sys, inp), blocks, rubrica, [])]);
  let c2 = c2first;
  // Inflation detector: Crítico 1 gave 9-10 to >=50% of blocks -> Crítico 2 reruns harder.
  if (inflado(critica.notas_por_bloco.map(n => n.nota))) {
    try { c2 = await rodarCritico2((sys, inp) => call(sys, inp), blocks, rubrica, critica.notas_por_bloco.map(n => n.nota)); } catch (e) { if (!(e instanceof Budget)) throw e; }
  }
  const c1Riscos = [...critica.riscos_de_conteudo];
  const nota_c1 = mean(critica.notas_por_bloco.map(n => n.nota));
  const f: any = raw.forca_gancho ?? {};
  const forca = FORCA.every(k => Number.isFinite(Number(f[k]))) ? Object.fromEntries(FORCA.map(k => [k, Math.max(0, Math.min(2, Math.round(Number(f[k]))))])) : null;
  const frases_fracas = (Array.isArray(raw.frases_fracas) ? raw.frases_fracas : []).map((x: any) => ({ bloco: Number(x?.bloco), frase: str(x?.frase, 300), correcao: str(x?.correcao, 300) })).filter((x: any) => blocks.some(b => b.id === x.bloco) && x.frase);
  const motivos = critica.notas_por_bloco.map(n => {
    const v = ver.find(x => x.id === n.id)!;
    const nota_critico = n.nota;
    const nota_critico2 = c2.notas.get(n.id) ?? null;
    n.nota = Math.min(n.nota, nota_critico2 ?? 10, v.teto);
    if (v.motivos.length) n.causa_da_queda = [n.causa_da_queda, ...v.motivos].filter(Boolean).join(" ");
    for (const r of v.riscos) if (!critica.riscos_de_conteudo.some(x => x.id === n.id && x.risco === r)) critica.riscos_de_conteudo.push({ id: n.id, risco: r });
    return { id: n.id, nota: n.nota, nota_critico, nota_critico2, teto: v.teto, regras: v.motivos, avisos: v.avisos, riscos: v.riscos, comentario: n.causa_da_queda, frases_fracas: frases_fracas.filter((x: any) => x.bloco === n.id) };
  });
  const cortados = limitarInflacao(critica.notas_por_bloco);
  for (const id of cortados) { const m = motivos.find(x => x.id === id); if (m) { m.nota = 8; m.regras = [...m.regras, "Notas revisadas por inflação (máx. 40% dos blocos com 9 ou 10)"]; } }
  const critico2 = { pontos_fracos: c2.pontos_fracos, leniente: c2.leniente, nota_geral: c2.nota_geral, inflacao: c2.leniente || cortados.length > 0, aviso: c2.leniente || cortados.length ? "Notas revisadas por inflação" : null };
  critica.nota_geral = mean(critica.notas_por_bloco.map(n => n.nota)) ?? 0;
  const reescrever = critica.notas_por_bloco.filter(n => n.nota < CRITIC_LIMITS.rewriteBelow || ver.find(v => v.id === n.id)?.forcar_reescrita).map(n => n.id);
  critica.blocos_para_reescrever = reescrever;
  const teto_verificador = tetoVerificador(ver);
  const pendencias = juntarPendencias(ver.flatMap(v => v.pendencias), c1Riscos, c2.pontos_fracos);
  const nota_final = notaFinal(nota_c1, c2.nota_geral, teto_verificador);
  const estado = estadoQualidade(nota_final, pendencias);
  return { critica, motivos, frases_fracas, forca, reescrever, critico2, nota_c1, nota_c2: c2.nota_geral, teto_verificador, pendencias, nota_final, estado };
}
type Avaliacao = Awaited<ReturnType<typeof avaliar>>;
const gateCols = (a: Avaliacao) => ({ nota_final: a.nota_final, nota_c1: a.nota_c1, nota_c2: a.nota_c2, teto_verificador: a.teto_verificador, pendencias: a.pendencias, status_qualidade: a.estado });

/** "Reescrever este bloco": rewrites one block of a saved reel, then re-runs Verificador and both Críticos. */
async function reescreverBloco(userId: string, body: any) {
  const db = adminClient();
  const call = makeCall({ calls: 0, max: 6, ctrl: new AbortController() });
  const id = str(body.script_id, 40), blocoId = Number(body.bloco_id), instrucao = str(body.instrucao, 500);
  const { data: s } = await db.from("retention_scripts").select("*").eq("id", id).eq("user_id", userId).maybeSingle();
  if (!s) return { error: "Reel não encontrado." };
  const P = await loadEnginePrompts(db, userId, { tema: s.tema, scriptId: s.id, pilar: s.pilar });
  const blocks: Block[] = (s.roteiro?.blocos ?? []).map((b: any) => toBlock(b));
  const alvo = blocks.find(b => b.id === blocoId);
  if (!alvo) return { error: "Bloco não encontrado." };
  const { count } = await db.from("script_sources").select("id", { count: "exact", head: true }).eq("script_id", s.id);
  const vopts = { proibidas: P.proibidas, tipoAfirmacao: s.tipo_afirmacao, temFonte: (count ?? 0) > 0 };
  const prev = (s.motivos_nota ?? []).find((m: any) => m.id === blocoId);
  const contexto = { pedido: { tema: s.angulo?.escolhido?.titulo ?? s.tema, objetivo: s.objetivo, tom: s.tom } };
  const antes = alvo.fala;
  const patch = await call(P.redator, { ...contexto, estrutura: s.estrutura, modo: "reescrita_parcial", proibidas: P.proibidas,
    blocos: [{ ...alvo, instrucao_do_usuario: instrucao || null, motivos: prev ?? null, pendencias: (s.pendencias ?? []).filter((p: any) => p.bloco === blocoId) }] });
  applyPatch(blocks, patch, [blocoId]);
  const r = await avaliar(call, P, contexto, s.estrutura, blocks, vopts);
  const byId = new Map(r.critica.notas_por_bloco.map(n => [n.id, n]));
  const roteiro = { ...s.roteiro, blocos: (s.roteiro?.blocos ?? []).map((b: any) => ({ ...b, ...(b.id === blocoId ? blocks.find(x => x.id === blocoId) : {}), nota: byId.get(b.id)?.nota ?? b.nota })) };
  const notas = { ...s.notas, notas_por_bloco: r.critica.notas_por_bloco, riscos_de_conteudo: r.critica.riscos_de_conteudo, nota_geral: r.critica.nota_geral };
  const historico_revisoes = [...(s.historico_revisoes ?? []), { rodada: (s.historico_revisoes ?? []).length + 1, nota_final: r.nota_final, pendencias: r.pendencias.length, motivo: "Reescrita manual do bloco", blocos_alterados: [{ id: blocoId, antes, depois: blocks.find(x => x.id === blocoId)?.fala ?? "" }] }];
  const { data, error } = await db.from("retention_scripts").update({ roteiro, notas, nota_geral: r.critica.nota_geral, motivos_nota: r.motivos, critico2: r.critico2, historico_revisoes, ...gateCols(r) }).eq("id", s.id).select("*").single();
  if (error) return { error: "Não foi possível salvar o bloco." };
  return { script: data };
}

/** Diretor de Reels: theme order = typed > today's plan > pillar rotation; angles used in the last 14 days are avoided. */
async function escolherTema(db: any, uid: string, typed: string) {
  if (typed) return { tema: typed, fonte: "digitado", evitar: [] as string[] };
  const since = new Date(Date.now() - 14 * 864e5).toISOString();
  const { data: usados } = await db.from("retention_scripts").select("angulo_usado, angulo").eq("user_id", uid).gte("created_at", since).limit(200);
  const evitar = [...new Set((usados ?? []).map((u: any) => u.angulo_usado || u.angulo?.escolhido?.titulo).filter(Boolean))] as string[];
  const hoje = new Date(Date.now() - 3 * 36e5).toISOString().slice(0, 10);
  const { data: plan } = await db.from("social_content_calendar").select("topic, hook").eq("coach_id", uid).eq("date", hoje).limit(1).maybeSingle();
  const doPlano = String(plan?.topic || plan?.hook || "").trim();
  if (doPlano) return { tema: doPlano.slice(0, 300), fonte: "pacote_do_dia", evitar };
  const { data: pil } = await db.from("content_pillars").select("nome").eq("user_id", uid).eq("ativo", true).order("ordem");
  const nomes = (pil ?? []).map((p: any) => p.nome).filter(Boolean);
  if (!nomes.length) return null;
  const dia = Math.floor(Date.now() / 864e5);
  return { tema: nomes[dia % nomes.length], fonte: "pilar_do_dia", evitar };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...cors, "Content-Type": "application/json" } });
  // Scheduled runs (cc_automation) authenticate with the private cron key and pass the target user.
  const cronKey = req.headers.get("x-cron-key");
  const auth: { ok: true; userId: string } | { ok: false; status: number } = cronKey ? await (async () => {
    const { data } = await adminClient().from("cc_job_state").select("cron_key").eq("id", 1).maybeSingle();
    const uid = req.headers.get("x-user-id") ?? "";
    return data?.cron_key && data.cron_key === cronKey && /^[0-9a-f-]{36}$/.test(uid) ? { ok: true as const, userId: uid } : { ok: false as const, status: 401 };
  })() : await requireUser(req);
  if (!auth.ok) return json({ error: "Não autenticado" }, auth.status);
  let body: any; try { body = await req.json(); } catch { return json({ error: "Pedido inválido." }, 400); }
  if (body.modo === "reescrever_bloco") return json(await reescreverBloco(auth.userId, body));
  const diretor = body.diretor === true && !cronKey;
  const origem = cronKey ? "automacao" : diretor ? "diretor" : "manual";
  const objetivo = OBJETIVOS.includes(str(body.objetivo, 20)) ? str(body.objetivo, 20) : diretor ? "alcance" : "";
  const tom = TONS.includes(str(body.tom, 20)) ? str(body.tom, 20) : diretor ? "direto" : "";
  const rede = str(body.rede, 30) || "instagram";
  const teste = body.teste === true && !cronKey;
  const quero_mais = QUERO_MAIS.includes(str(body.quero_mais, 30)) ? str(body.quero_mais, 30) : null;
  if ((!diretor && !str(body.tema, 300)) || !objetivo || !tom) return json({ error: "Preencha o tema, o objetivo e o tom." }, 400);

  const ctx = { calls: 0, max: teste ? 20 : GATE.maxChamadas, ctrl: new AbortController() };
  const call = makeCall(ctx);
  req.signal?.addEventListener?.("abort", () => ctx.ctrl.abort());
  // Stream NDJSON so the screen shows the real current step.
  const stream = new ReadableStream({ async start(ctrl) {
    const send = (v: unknown) => { if (!ctx.ctrl.signal.aborted) try { ctrl.enqueue(new TextEncoder().encode(JSON.stringify(v) + "\n")); } catch { ctx.ctrl.abort(); } };
    try {
      const db = adminClient();
      // Daily limit (reel_factory_settings.limite_roteiros_dia): each final reel counts as 1; seeded templates do not.
      if (!teste) {
        const ini = new Date(); ini.setUTCHours(3, 0, 0, 0); if (ini.getTime() > Date.now()) ini.setTime(ini.getTime() - 864e5);
        const [{ data: cfg }, { count: feitos }] = await Promise.all([
          db.from("reel_factory_settings").select("limite_roteiros_dia").eq("user_id", auth.userId).maybeSingle(),
          db.from("retention_scripts").select("id", { count: "exact", head: true }).eq("user_id", auth.userId).gte("created_at", ini.toISOString()).in("origem", ["manual", "diretor", "automacao", "fabrica"]),
        ]);
        const limite = cfg?.limite_roteiros_dia ?? 100;
        if ((feitos ?? 0) >= limite) throw new HttpError(409, `Limite de ${limite} gerações por dia atingido (${feitos} hoje).`);
      }
      send({ etapa: "tema" });
      const escolha = diretor ? await escolherTema(db, auth.userId, str(body.tema, 300)) : { tema: str(body.tema, 300), fonte: "digitado", evitar: [] as string[] };
      if (!escolha) throw new HttpError(400, "Cadastre pelo menos um pilar na Matriz ou digite um tema.");
      const tema = escolha.tema;
      send({ etapa: "tema", tema, fonte: escolha.fonte });
      const P = await loadEnginePrompts(db, auth.userId, { tema });
      const { data: pilares } = await db.from("content_pillars").select("nome").eq("user_id", auth.userId);
      const [{ data: voice }, { data: patterns }, { data: formulas }, { data: stats }, { count }] = await Promise.all([
        db.from("creator_voice").select("expressoes_usa, expressoes_evita, nicho").eq("user_id", auth.userId).maybeSingle(),
        db.from("retention_patterns").select("tipo, texto, retencao_media, amostras, confirmado").eq("user_id", auth.userId).order("amostras", { ascending: false }).limit(40),
        db.from("hook_formulas").select("id, nome, template, exemplo, gatilho").order("id"),
        db.from("creator_formula_stats").select("formula_id, usos, retencao_3s_media, comentarios_media, salvamentos_media").eq("user_id", auth.userId),
        db.from("retention_scripts").select("id", { count: "exact", head: true }).eq("user_id", auth.userId),
      ]);
      const { data: lastRes } = await db.from("retention_results").select("curva_real").eq("user_id", auth.userId).eq("status", "lancado").order("created_at", { ascending: false }).limit(1).maybeSingle();
      const ajustes = Array.isArray((lastRes as any)?.curva_real?.analise?.ajuste_para_proximo_reel) ? (lastRes as any).curva_real.analise.ajuste_para_proximo_reel.slice(0, 3) : [];
      const all = formulas ?? [];
      const measured = (stats ?? []).filter(s => s.usos > 0);
      const ranking = [...measured].sort((a, b) => Number(b.retencao_3s_media ?? -1) - Number(a.retencao_3s_media ?? -1))
        .map(s => ({ ...s, nome: all.find(f => f.id === s.formula_id)?.nome }));
      const explorar = measured.length > 0 && ((count ?? 0) + 1) % EXPLORE_EVERY === 0;
      const untested = all.filter(f => !measured.some(s => s.formula_id === f.id)).map(f => f.id);
      const permitidas = explorar ? (untested.length ? untested : [...measured].sort((a, b) => a.usos - b.usos).slice(0, 3).map(s => s.formula_id)) : all.map(f => f.id);
      // Data, not instructions; absent values stay null.
      const tecnica_dica = str(body.tecnica_dica, 80) || null;
      const dicaId = Number(body.formula_dica); const dica_formula = Number.isInteger(dicaId) && all.some(f => f.id === dicaId) ? dicaId : null;
      const contexto: any = { pedido: { tema, objetivo, tom, rede, quero_mais, dica_formula, tecnica_dica }, formulas_atlas: all, ranking_formulas: ranking,
        selecao_formula: { modo: explorar ? "explorar" : "priorizar", permitidas }, voz_do_criador: voice ?? null,
        padroes_confirmados: (patterns ?? []).filter(p => p.confirmado), indicios: (patterns ?? []).filter(p => !p.confirmado), ajuste_do_ultimo_resultado: ajustes };

      // Passo 0 — Ângulo: broad themes become concrete angles before the Arquiteto.
      let angulo: any = null;
      const escolhidoIn = body.angulo_escolhido && typeof body.angulo_escolhido === "object" ? body.angulo_escolhido : null;
      if (escolhidoIn && !teste) angulo = normAngulo({ escolhido: escolhidoIn, outros: body.angulo_outros });
      else if (!teste && (diretor || temaAmplo(tema, (pilares ?? []).map((p: any) => p.nome)))) {
        send({ etapa: "angulo" });
        angulo = normAngulo(await call(P.angulo, { tema_amplo: tema, objetivo, voz_do_criador: voice ?? null, padroes_confirmados: contexto.padroes_confirmados,
          ...(escolha.evitar.length ? { angulos_usados_ultimos_14_dias: escolha.evitar.slice(0, 30), aviso: "Não repita ângulos usados nos últimos 14 dias." } : {}) }));
        if (angulo) {
          // Order by Passo 0 points; drop angles used in the last 14 days when there is an alternative.
          const cands = [angulo.escolhido, ...angulo.outros].sort((a: any, b: any) => Number(b.pontos ?? 0) - Number(a.pontos ?? 0));
          const novos = cands.filter((c: any) => !escolha.evitar.some(e => e.toLowerCase() === c.titulo.toLowerCase()));
          const ord = novos.length ? novos : cands;
          angulo = { escolhido: ord[0], outros: ord.slice(1, 5) };
        }
      }
      const pilarPedido = str(body.pilar, 120);
      if (angulo && pilarPedido && !teste) {
        const cands = [angulo.escolhido, ...angulo.outros];
        let ok: any = null;
        for (const c of cands.slice(0, 3)) {
          const v = await call('Responda SOMENTE JSON {"resposta":"sim"} ou {"resposta":"nao"}.', { pergunta: `O ângulo "${c.titulo}" pertence ao pilar "${pilarPedido}"? sim/não` }, MODEL_LIGHT);
          if (/^s/i.test(String(v.resposta ?? ""))) { ok = c; break; }
        }
        if (ok && ok !== angulo.escolhido) angulo = { escolhido: ok, outros: cands.filter(c => c !== ok).slice(0, 4) };
        if (!ok) angulo.pilar_aviso = `Nenhum ângulo confirmado no pilar "${pilarPedido}".`;
        angulo.pilar = pilarPedido;
      }
      if (teste) {
        if (angulo?.escolhido?.titulo) Object.assign(contexto.pedido, { tema: angulo.escolhido.titulo, tema_original: tema, angulo: angulo.escolhido });
        const out: { passe: string; ok: boolean; ms: number; erro?: string }[] = [];
        const prev: Record<string, unknown> = {};
        for (const [passe, sys] of [["arquiteto", P.arquiteto + CONTRATO_ARQUITETO], ["redator", P.redator], ["critico", P.critico + CONTRATO_CRITICO]] as const) {
          send({ etapa: passe });
          const t0 = Date.now();
          try {
            const input = passe === "arquiteto" ? contexto : passe === "redator" ? { ...contexto, estrutura: out[0]?.ok ? prev.estrutura : {} } : { ...contexto, estrutura: prev.estrutura, blocos: (prev.draft as any)?.blocos ?? [] };
            const v = await call(sys, input, passe === "arquiteto" ? MODEL_LIGHT : MODEL_PRO);
            if (passe === "arquiteto") prev.estrutura = v; else if (passe === "redator") prev.draft = v;
            out.push({ passe, ok: true, ms: Date.now() - t0 });
          } catch (e) {
            if (e instanceof HttpError && (e.status === 429 || e.status === 402 || e.status === 403)) throw e;
            out.push({ passe, ok: false, ms: Date.now() - t0, erro: e instanceof Error ? e.message : "Erro" });
          }
        }
        send({ etapa: "teste", resultado: out });
        return;
      }

      // Porta de qualidade: up to 3 revision rounds per angle, up to 3 angles, 14 model calls in total.
      const angulos = angulo ? [angulo.escolhido, ...angulo.outros].slice(0, GATE.maxAngulos) : [null];
      let best: any = null; let rodadasTotal = 0; let parouPor: string | null = null;
      const historico_revisoes: any[] = [];
      const t0 = Date.now();
      for (let ai = 0; ai < angulos.length; ai++) {
        const ang = angulos[ai];
        if (ai > 0 && ctx.max - ctx.calls < 4) { parouPor = "teto de chamadas"; break; }
        if (Date.now() - t0 > 270_000) { parouPor = "tempo"; break; }
        if (ai > 0) send({ etapa: "angulo", troca: true, angulo: ang?.titulo });
        const pedido = { ...contexto.pedido, ...(ang ? { tema: ang.titulo, tema_original: tema, angulo: ang } : {}) };
        const cx = { ...contexto, pedido };
        try {
          send({ etapa: "arquiteto" });
          const estrutura = await call(P.arquiteto + CONTRATO_ARQUITETO, cx, MODEL_LIGHT);
          let formula_id = Number(estrutura.formula_id);
          if (!permitidas.includes(formula_id)) { formula_id = permitidas[0] ?? null as any; estrutura.formula_motivo = "Fórmula definida pelo sistema: a escolha da análise ficou fora das permitidas."; }
          const formula = all.find(f => f.id === formula_id) ?? null;
          Object.assign(estrutura, { formula_id: formula?.id ?? null, formula_nome: formula?.nome ?? null, formula_modo: explorar ? "explorar" : "priorizar" });
          send({ etapa: "redator" });
          const draft = await call(P.redator, { ...cx, estrutura });
          const blocks = (Array.isArray(draft.blocos) ? draft.blocos : []).map((b: any, i: number) => toBlock({ ...b, id: b?.id ?? i + 1 })).filter(b => Number.isFinite(b.id) && b.fala && b.tempo);
          if (!blocks.length) throw new HttpError(502, "Roteiro incompleto. Tente novamente.");
          const tipo_afirmacao = tipoDe(draft.tipo_afirmacao, estrutura.tipo_afirmacao);
          const vopts = { proibidas: P.proibidas, tipoAfirmacao: tipo_afirmacao, temFonte: false };
          send({ etapa: "verificador" });
          send({ etapa: "critico" });
          let cur = await avaliar(call, P, cx, estrutura, blocks, vopts);
          const hist: any[] = [cur.critica];
          historico_revisoes.push({ rodada: historico_revisoes.length + 1, angulo: ang?.titulo ?? tema, nota_final: cur.nota_final, pendencias: cur.pendencias.length, blocos_alterados: [], motivo: "Primeira versão" });
          let rod = 0;
          while (cur.estado === "rascunho" && rod < GATE.maxRodadasPorAngulo) {
            if (ctx.max - ctx.calls < 3) { parouPor = "teto de chamadas"; break; }
            if (Date.now() - t0 > 270_000) { parouPor = "tempo"; break; }
            rod++; rodadasTotal++;
            send({ etapa: "revisao", rodada: rod });
            const alvo = blocosParaRevisar(cur.critica.notas_por_bloco, cur.pendencias);
            const out = await call(P.revisor, { pedido, blocos: blocks, blocos_para_revisar: alvo, pendencias: cur.pendencias,
              notas: cur.critica.notas_por_bloco.map(n => ({ id: n.id, nota: n.nota })), frases_fracas: cur.frases_fracas }, MODEL_PRO);
            const { mudancas, rejeitadas } = aplicarRevisao(blocks, out, alvo);
            send({ etapa: "verificador" }); send({ etapa: "critico", rodada: rod });
            cur = await avaliar(call, P, cx, estrutura, blocks, vopts); hist.push(cur.critica);
            historico_revisoes.push({ rodada: historico_revisoes.length + 1, angulo: ang?.titulo ?? tema, nota_final: cur.nota_final, pendencias: cur.pendencias.length, blocos_alterados: mudancas, rejeitadas, motivo: mudancas.length ? mudancas.map(m => m.regra).filter(Boolean).join(", ") || "revisão" : "nenhuma mudança aplicada" });
          }
          const snap = { ang, estrutura, draft, blocks: blocks.map(b => ({ ...b })), cur, hist, formula, tipo_afirmacao, rod };
          if (!best || cur.nota_final > best.cur.nota_final || (cur.estado !== "rascunho" && best.cur.estado === "rascunho")) best = snap;
          if (cur.estado !== "rascunho" || parouPor) break;
        } catch (e) {
          if (e instanceof Budget) { parouPor = "teto de chamadas"; break; }
          if (best && !(e instanceof HttpError && [402, 403, 429, 499].includes(e.status))) { parouPor = "erro na troca de ângulo"; break; }
          throw e;
        }
      }
      if (!best) throw new HttpError(502, "Não foi possível gerar o roteiro. Tente novamente.");
      const { cur, blocks, draft, estrutura, formula } = best;
      const crit = cur.critica;
      const byId = new Map(crit.notas_por_bloco.map((n: any) => [n.id, n]));
      const roteiro = {
        blocos: blocks.map((b: Block) => ({ ...b, nota: (byId.get(b.id) as any)?.nota ?? null })),
        aberturas_alternativas: (Array.isArray(draft.aberturas_alternativas) ? draft.aberturas_alternativas : []).map((v: any) => str(typeof v === "string" ? v : v?.fala, 300)).filter(Boolean).slice(0, 3),
        legenda: str(draft.legenda || draft.legenda_post, 2200),
        hashtags: (Array.isArray(draft.hashtags) ? draft.hashtags : []).map((v: any) => str(v, 60)).filter(Boolean).map((h: string) => h.startsWith("#") ? h : `#${h}`).slice(0, 15),
        versao_tiktok: str(draft.versao_tiktok, 2000) || null, versao_shorts: str(draft.versao_shorts, 2000) || null,
      };
      const notas = { ...crit, rodadas: best.rod, historico: best.hist, frases_fracas: cur.frases_fracas, forca_gancho: cur.forca, forca_gancho_total: cur.forca ? Object.values(cur.forca as Record<string, number>).reduce((a, b) => a + b, 0) : null,
        avisos: crit.notas_por_bloco.filter((n: any) => n.nota < CRITIC_LIMITS.warnBelow).map((n: any) => ({ id: n.id, texto: `Este trecho está fraco. Sugestão de gravação: ${n.correcao}` })),
        chamadas: ctx.calls, parou_por: parouPor };
      const angSalvo = angulo ? { ...angulo, escolhido: best.ang ?? angulo.escolhido, outros: [angulo.escolhido, ...angulo.outros].filter((o: any) => o.titulo !== best.ang?.titulo).slice(0, 4) } : null;
      const { data, error } = await db.from("retention_scripts").insert({ user_id: auth.userId, formula_id: formula?.id ?? null, quero_mais, tema, objetivo, tom, rede, estrutura, roteiro, notas, nota_geral: crit.nota_geral, origem,
        angulo: angSalvo, angulo_usado: best.ang?.titulo ?? null, motivos_nota: cur.motivos, critico2: cur.critico2, tipo_afirmacao: best.tipo_afirmacao,
        rodadas: rodadasTotal, historico_revisoes, ...gateCols(cur),
        tecnicas: [...new Set([...detectarTecnicas(blocks, formula?.nome), ...(tecnica_dica ? [tecnica_dica] : [])])] })
        .select("*").single();
      if (error) throw new HttpError(500, "Reel gerado, mas não foi possível salvar no histórico.");
      for (const e of errosDoReel(cur.motivos as any, blocks)) await db.from("error_notebook").insert({ ...e, user_id: auth.userId, origem: "reel", origem_id: data.id }).then(() => {}, () => {});
      send({ etapa: "pronto", script: data });
    } catch (e) {
      send({ etapa: "erro", error: e instanceof Error ? e.message : "Erro", status: e instanceof HttpError ? e.status : 500 });
    } finally { try { ctrl.close(); } catch { /* closed */ } }
  }, cancel() { ctx.ctrl.abort(); } });
  return new Response(stream, { headers: { ...cors, "Content-Type": "application/x-ndjson" } });
});
