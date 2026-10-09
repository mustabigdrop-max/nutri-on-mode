import { adminClient, requireUser } from "../_shared/auth.ts";
import { CRITIC_LIMITS, normalizeCritique, objectiveChecks } from "../_shared/retentionCritic.ts";
import { loadEnginePrompts } from "../_shared/enginePrompts.ts";
import { verificarReel, temaAmplo, VERIFICADOR_REGRAS } from "../_shared/reelVerifier.ts";
import { rodarCritico2, limitarInflacao } from "../_shared/critico2.ts";
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
async function pass(system: string, input: unknown, model = MODEL_PRO): Promise<Record<string, unknown>> {
  for (let attempt = 0; attempt < 2; attempt++) {
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST", headers: { Authorization: `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model, response_format: { type: "json_object" },
        messages: [{ role: "system", content: system }, { role: "user", content: JSON.stringify(input) }] }),
    });
    if (res.status === 429) throw new HttpError(429, "Limite de uso atingido. Tente em instantes.");
    if (res.status === 402) throw new HttpError(402, "Créditos esgotados no espaço de trabalho.");
    if (!res.ok) { await res.text(); throw new HttpError(502, "Falha na geração. Tente novamente."); }
    const d = await res.json();
    try {
      const v = JSON.parse(String(d.choices?.[0]?.message?.content ?? "").replace(/```json|```/g, "").trim());
      if (v && typeof v === "object" && !Array.isArray(v)) return v;
    } catch { /* retry once */ }
  }
  throw new HttpError(502, "Resposta inválida duas vezes. Tente novamente.");
}

const toBlock = (v: any): Block => ({ id: Number(v?.id), tempo: str(v?.tempo, 20), funcao: str(v?.funcao, 40), fala: str(v?.fala),
  texto_tela: str(v?.texto_tela || v?.texto_na_tela, 200), estimulo_visual: str(v?.estimulo_visual, 300), gatilho: str(v?.gatilho, 80) });

const normAng = (v: any) => ({ titulo: str(v?.titulo, 200), tensao: str(v?.tensao, 300), situacao: str(v?.situacao, 300), pontos: Number.isFinite(Number(v?.pontos)) ? Number(v.pontos) : null });
function normAngulo(v: any) {
  const escolhido = normAng(v?.escolhido);
  if (!escolhido.titulo) return null;
  return { escolhido, outros: (Array.isArray(v?.outros) ? v.outros : []).map(normAng).filter((o: any) => o.titulo).slice(0, 4) };
}
/** Passo 6 — portão de qualidade. */
const portao = (c: { nota_geral: number; riscos_de_conteudo: unknown[] }) => c.nota_geral >= 8 && !c.riscos_de_conteudo.length ? "aprovado" : "precisa_revisao";

function applyPatch(blocks: Block[], patch: Record<string, unknown>, ids: number[]) {
  for (const p of Array.isArray(patch.blocos) ? patch.blocos : []) {
    const target = blocks.find(b => b.id === Number((p as any)?.id) && ids.includes(b.id));
    if (!target) continue;
    const next = toBlock({ ...target, ...(p as any), id: target.id, tempo: target.tempo, funcao: target.funcao });
    if (next.fala) Object.assign(target, next);
  }
}

/** Passos 3-4: code verifier, then Crítico; final note per block = min(Crítico, verifier ceiling). */
async function avaliar(P: any, contexto: unknown, estrutura: unknown, blocks: Block[], vopts: any) {
  const ver = verificarReel(blocks, vopts);
  const sb = blocks.map(b => ({ id: b.id, tempo: b.tempo, fala: b.fala, caminho: [] as (string | number)[] }));
  let raw: Record<string, unknown> = {}; let critica: ReturnType<typeof normalizeCritique> | null = null;
  for (let t = 0; t < 2 && !critica; t++) {
    raw = await pass(P.critico + CONTRATO_CRITICO, { ...(contexto as object), estrutura, blocos: blocks, checagens_objetivas: sb.map(objectiveChecks), verificador: ver,
      ...(t ? { aviso: `Dê nota para TODOS os blocos: ids ${blocks.map(b => b.id).join(", ")}.` } : {}) });
    // Accept "bloco" as the id key and numeric strings as notes.
    if (Array.isArray(raw.notas_por_bloco)) raw.notas_por_bloco = (raw.notas_por_bloco as any[]).map(n => ({ ...n, id: Number(n?.id ?? n?.bloco), nota: Number(n?.nota) }));
    try { critica = normalizeCritique(raw, sb); } catch (e) { if (t) throw e; }
  }
  if (!critica) throw new HttpError(502, "Crítica incompleta. Tente novamente.");
  const f: any = raw.forca_gancho ?? {};
  const forca = FORCA.every(k => Number.isFinite(Number(f[k]))) ? Object.fromEntries(FORCA.map(k => [k, Math.max(0, Math.min(2, Math.round(Number(f[k]))))])) : null;
  const frases_fracas = (Array.isArray(raw.frases_fracas) ? raw.frases_fracas : []).map((x: any) => ({ bloco: Number(x?.bloco), frase: str(x?.frase, 300), correcao: str(x?.correcao, 300) })).filter((x: any) => blocks.some(b => b.id === x.bloco) && x.frase);
  // Crítico 2 sees only the final script and the rubric.
  const c2 = await rodarCritico2((sys, inp) => pass(sys, inp), blocks, VERIFICADOR_REGRAS.join("\n"), critica.notas_por_bloco.map(n => n.nota));
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
  const critico2 = { pontos_fracos: c2.pontos_fracos, leniente: c2.leniente, inflacao: c2.leniente || cortados.length > 0, aviso: c2.leniente || cortados.length ? "Notas revisadas por inflação" : null };
  critica.nota_geral = Math.round(critica.notas_por_bloco.reduce((a, b) => a + b.nota, 0) / Math.max(1, critica.notas_por_bloco.length) * 10) / 10;
  const reescrever = critica.notas_por_bloco.filter(n => n.nota < CRITIC_LIMITS.rewriteBelow || ver.find(v => v.id === n.id)?.forcar_reescrita).map(n => n.id);
  critica.blocos_para_reescrever = reescrever;
  return { critica, motivos, frases_fracas, forca, reescrever, critico2 };
}

/** "Reescrever este bloco": rewrites one block of a saved reel, then re-runs Verificador and Crítico for that block only. */
async function reescreverBloco(userId: string, body: any) {
  const db = adminClient();
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
  const patch = await pass(P.redator, { ...contexto, estrutura: s.estrutura, modo: "reescrita_parcial", proibidas: P.proibidas,
    blocos: [{ ...alvo, instrucao_do_usuario: instrucao || null, motivos: prev ?? null }] });
  applyPatch(blocks, patch, [blocoId]);
  const r = await avaliar(P, contexto, s.estrutura, blocks, vopts);
  const nova = r.critica.notas_por_bloco.find(n => n.id === blocoId)!;
  const roteiro = { ...s.roteiro, blocos: (s.roteiro?.blocos ?? []).map((b: any) => b.id === blocoId ? { ...b, ...blocks.find(x => x.id === blocoId), nota: nova.nota } : b) };
  const notasPB = (s.notas?.notas_por_bloco ?? []).map((n: any) => n.id === blocoId ? nova : n);
  const riscos = [...(s.notas?.riscos_de_conteudo ?? []).filter((x: any) => x.id !== blocoId), ...r.critica.riscos_de_conteudo.filter(x => x.id === blocoId)];
  const nota_geral = notasPB.length ? Math.round(notasPB.reduce((a: number, b: any) => a + Number(b.nota ?? 0), 0) / notasPB.length * 10) / 10 : s.nota_geral;
  const motivos = [...(s.motivos_nota ?? []).filter((m: any) => m.id !== blocoId), r.motivos.find(m => m.id === blocoId)].sort((a: any, b: any) => a.id - b.id);
  const notas = { ...s.notas, notas_por_bloco: notasPB, riscos_de_conteudo: riscos, nota_geral };
  const { data, error } = await db.from("retention_scripts").update({ roteiro, notas, nota_geral, motivos_nota: motivos, critico2: r.critico2, status_qualidade: portao({ nota_geral, riscos_de_conteudo: riscos }) }).eq("id", s.id).select("*").single();
  if (error) return { error: "Não foi possível salvar o bloco." };
  return { script: data };
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
  const origem = cronKey ? "automacao" : "manual";
  let body: any; try { body = await req.json(); } catch { return json({ error: "Pedido inválido." }, 400); }
  if (body.modo === "reescrever_bloco") return json(await reescreverBloco(auth.userId, body));
  const tema = str(body.tema, 300), objetivo = str(body.objetivo, 20), tom = str(body.tom, 20), rede = str(body.rede, 30) || "instagram";
  const teste = body.teste === true && !cronKey;
  const quero_mais = QUERO_MAIS.includes(str(body.quero_mais, 30)) ? str(body.quero_mais, 30) : null;
  if (!tema || !OBJETIVOS.includes(objetivo) || !TONS.includes(tom)) return json({ error: "Preencha o tema, o objetivo e o tom." }, 400);

  // Stream NDJSON so the screen shows the real current step.
  const stream = new ReadableStream({ async start(ctrl) {
    const send = (v: unknown) => ctrl.enqueue(new TextEncoder().encode(JSON.stringify(v) + "\n"));
    try {
      const db = adminClient();
      const P = await loadEnginePrompts(db, auth.userId, { tema });
      const { data: pilares } = await db.from("content_pillars").select("nome").eq("user_id", auth.userId);
      const [{ data: voice }, { data: patterns }, { data: formulas }, { data: stats }, { count }] = await Promise.all([
        db.from("creator_voice").select("expressoes_usa, expressoes_evita, nicho").eq("user_id", auth.userId).maybeSingle(),
        db.from("retention_patterns").select("tipo, texto, retencao_media, amostras, confirmado").eq("user_id", auth.userId).order("amostras", { ascending: false }).limit(40),
        db.from("hook_formulas").select("id, nome, template, exemplo, gatilho").order("id"),
        db.from("creator_formula_stats").select("formula_id, usos, retencao_3s_media, comentarios_media, salvamentos_media").eq("user_id", auth.userId),
        db.from("retention_scripts").select("id", { count: "exact", head: true }).eq("user_id", auth.userId),
      ]);
      const { data: lastRes } = await db.from("retention_results").select("curva_real").eq("user_id", auth.userId).order("created_at", { ascending: false }).limit(1).maybeSingle();
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
      const contexto = { pedido: { tema, objetivo, tom, rede, quero_mais, dica_formula, tecnica_dica }, formulas_atlas: all, ranking_formulas: ranking,
        selecao_formula: { modo: explorar ? "explorar" : "priorizar", permitidas }, voz_do_criador: voice ?? null,
        padroes_confirmados: (patterns ?? []).filter(p => p.confirmado), indicios: (patterns ?? []).filter(p => !p.confirmado), ajuste_do_ultimo_resultado: ajustes };

      // Passo 0 — Ângulo: broad themes become one concrete angle before the Arquiteto.
      let angulo: any = null;
      const escolhidoIn = body.angulo_escolhido && typeof body.angulo_escolhido === "object" ? body.angulo_escolhido : null;
      if (escolhidoIn && !teste) angulo = normAngulo({ escolhido: escolhidoIn, outros: body.angulo_outros });
      else if (!teste && temaAmplo(tema, (pilares ?? []).map((p: any) => p.nome))) {
        send({ etapa: "angulo" });
        angulo = normAngulo(await pass(P.angulo, { tema_amplo: tema, objetivo, voz_do_criador: voice ?? null, padroes_confirmados: contexto.padroes_confirmados }));
      }
      // Pilar: the chosen angle must belong to the requested pillar; otherwise try the other angles.
      const pilarPedido = str(body.pilar, 120);
      if (angulo && pilarPedido && !teste) {
        const cands = [angulo.escolhido, ...angulo.outros];
        let ok: any = null;
        for (const c of cands.slice(0, 5)) {
          const v = await pass('Responda SOMENTE JSON {"resposta":"sim"} ou {"resposta":"nao"}.', { pergunta: `O ângulo "${c.titulo}" pertence ao pilar "${pilarPedido}"? sim/não` }, MODEL_LIGHT);
          if (/^s/i.test(String(v.resposta ?? ""))) { ok = c; break; }
        }
        if (ok && ok !== angulo.escolhido) angulo = { escolhido: ok, outros: cands.filter(c => c !== ok).slice(0, 4) };
        if (!ok) angulo.pilar_aviso = `Nenhum ângulo confirmado no pilar "${pilarPedido}".`;
        angulo.pilar = pilarPedido;
      }
      if (angulo?.escolhido?.titulo) Object.assign(contexto.pedido, { tema: angulo.escolhido.titulo, tema_original: tema, angulo: angulo.escolhido });
      if (teste) {
        // Test mode: one run of each pass, nothing saved; reports JSON validity and time per pass.
        const out: { passe: string; ok: boolean; ms: number; erro?: string }[] = [];
        let prev: Record<string, unknown> = {};
        for (const [passe, sys, extra] of [["arquiteto", P.arquiteto + CONTRATO_ARQUITETO, {}], ["redator", P.redator, null], ["critico", P.critico + CONTRATO_CRITICO, null]] as const) {
          send({ etapa: passe });
          const t0 = Date.now();
          try {
            const input = passe === "arquiteto" ? contexto : passe === "redator" ? { ...contexto, estrutura: out[0]?.ok ? prev.estrutura : {} } : { ...contexto, estrutura: prev.estrutura, blocos: (prev.draft as any)?.blocos ?? [] };
            const v = await pass(sys, input, passe === "arquiteto" ? MODEL_LIGHT : MODEL_PRO);
            if (passe === "arquiteto") prev.estrutura = v; else if (passe === "redator") prev.draft = v;
            out.push({ passe, ok: true, ms: Date.now() - t0 });
          } catch (e) {
            if (e instanceof HttpError && (e.status === 429 || e.status === 402)) throw e;
            out.push({ passe, ok: false, ms: Date.now() - t0, erro: e instanceof Error ? e.message : "Erro" });
          }
          void extra;
        }
        send({ etapa: "teste", resultado: out });
        return;
      }
      send({ etapa: "arquiteto" });
      const estrutura = await pass(P.arquiteto + CONTRATO_ARQUITETO, contexto, MODEL_LIGHT);
      let formula_id = Number(estrutura.formula_id);
      if (!permitidas.includes(formula_id)) { formula_id = permitidas[0] ?? null as any; estrutura.formula_motivo = "Fórmula definida pelo sistema: a escolha da análise ficou fora das permitidas."; }
      const formula = all.find(f => f.id === formula_id) ?? null;
      Object.assign(estrutura, { formula_id: formula?.id ?? null, formula_nome: formula?.nome ?? null, formula_modo: explorar ? "explorar" : "priorizar" });
      send({ etapa: "redator" });
      const draft = await pass(P.redator, { ...contexto, estrutura });
      const blocks = (Array.isArray(draft.blocos) ? draft.blocos : []).map((b: any, i: number) => toBlock({ ...b, id: b?.id ?? i + 1 })).filter(b => Number.isFinite(b.id) && b.fala && b.tempo);
      if (!blocks.length) throw new HttpError(502, "Roteiro incompleto. Tente novamente.");

      let forca: Record<string, number> | null = null;
      const vopts = { proibidas: P.proibidas, tipoAfirmacao: null, temFonte: false };
      const critique = async () => {
        const r = await avaliar(P, contexto, estrutura, blocks, vopts);
        if (r.forca) forca = r.forca;
        return r;
      };
      send({ etapa: "critico" });
      const historico: any[] = [];
      let current = await critique(); historico.push(current.critica);
      let rodadas = 0;
      while (rodadas < CRITIC_LIMITS.maxRounds) {
        const weakIds = current.reescrever;
        if (!weakIds.length) break;
        send({ etapa: "reescrita", rodada: rodadas + 1 });
        const weak = blocks.filter(b => weakIds.includes(b.id));
        const patch = await pass(P.redator, { ...contexto, estrutura, modo: "reescrita_parcial", proibidas: P.proibidas,
          blocos: weak.map(b => ({ ...b, critica: current.critica.notas_por_bloco.find(n => n.id === b.id), motivos: current.motivos.find(m => m.id === b.id), frases_fracas: current.frases_fracas.filter(f => f.bloco === b.id) })) });
        rodadas++;
        applyPatch(blocks, patch, weakIds);
        send({ etapa: "critico" });
        current = await critique(); historico.push(current.critica);
      }
      const crit = current.critica;
      const byId = new Map(crit.notas_por_bloco.map(n => [n.id, n]));
      const roteiro = {
        blocos: blocks.map(b => ({ ...b, nota: byId.get(b.id)?.nota ?? null })),
        aberturas_alternativas: (Array.isArray(draft.aberturas_alternativas) ? draft.aberturas_alternativas : []).map((v: any) => str(typeof v === "string" ? v : v?.fala, 300)).filter(Boolean).slice(0, 3),
        legenda: str(draft.legenda || draft.legenda_post, 2200),
        hashtags: (Array.isArray(draft.hashtags) ? draft.hashtags : []).map(v => str(v, 60)).filter(Boolean).map(h => h.startsWith("#") ? h : `#${h}`).slice(0, 15),
      };
      const notas = { ...crit, rodadas, historico, frases_fracas: current.frases_fracas, forca_gancho: forca, forca_gancho_total: forca ? Object.values(forca as Record<string, number>).reduce((a, b) => a + b, 0) : null,
        avisos: crit.notas_por_bloco.filter(n => n.nota < CRITIC_LIMITS.warnBelow).map(n => ({ id: n.id, texto: `Este trecho está fraco. Sugestão de gravação: ${n.correcao}` })) };
      const { data, error } = await db.from("retention_scripts").insert({ user_id: auth.userId, formula_id: formula?.id ?? null, quero_mais, tema, objetivo, tom, rede, estrutura, roteiro, notas, nota_geral: crit.nota_geral, origem,
        angulo, motivos_nota: current.motivos, critico2: current.critico2, status_qualidade: portao(crit),
        tecnicas: [...new Set([...detectarTecnicas(blocks, formula?.nome), ...(tecnica_dica ? [tecnica_dica] : [])])] })
        .select("*").single();
      if (error) throw new HttpError(500, "Reel gerado, mas não foi possível salvar no histórico.");
      // Caderno de erros: até 3 frases reprovadas por reel; o índice único impede duplicar.
      for (const e of errosDoReel(current.motivos as any, blocks)) await db.from("error_notebook").insert({ ...e, user_id: auth.userId, origem: "reel", origem_id: data.id }).then(() => {}, () => {});
      send({ etapa: "pronto", script: data });
    } catch (e) {
      send({ etapa: "erro", error: e instanceof Error ? e.message : "Erro", status: e instanceof HttpError ? e.status : 500 });
    } finally { ctrl.close(); }
  } });
  return new Response(stream, { headers: { ...cors, "Content-Type": "application/x-ndjson" } });
});
