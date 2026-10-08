import { adminClient, requireUser } from "../_shared/auth.ts";
import { CRITIC_LIMITS, normalizeCritique, objectiveChecks } from "../_shared/retentionCritic.ts";
import { ARQUITETO_PROMPT, ATLAS_DE_ATENCAO, CRITICO_PROMPT, REDATOR_PROMPT } from "./prompts.ts";
const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
const OBJETIVOS = ["alcance", "autoridade", "venda"];
const TONS = ["direto", "bem-humorado", "intenso"];
type Block = { id: number; tempo: string; funcao: string; fala: string; texto_tela: string; estimulo_visual: string; gatilho: string };
class HttpError extends Error { constructor(public status: number, msg: string) { super(msg); } }
const str = (v: unknown, max = 1000) => typeof v === "string" ? v.trim().slice(0, max) : "";

/** One gateway call; invalid JSON is retried exactly once. */
async function pass(system: string, input: unknown): Promise<Record<string, unknown>> {
  for (let attempt = 0; attempt < 2; attempt++) {
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST", headers: { Authorization: `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "google/gemini-2.5-flash", response_format: { type: "json_object" },
        messages: [{ role: "system", content: `${system}\n\n${ATLAS_DE_ATENCAO}` }, { role: "user", content: JSON.stringify(input) }] }),
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
  texto_tela: str(v?.texto_tela, 200), estimulo_visual: str(v?.estimulo_visual, 300), gatilho: str(v?.gatilho, 80) });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...cors, "Content-Type": "application/json" } });
  const auth = await requireUser(req);
  if (!auth.ok) return json({ error: "Não autenticado" }, auth.status);
  if (!ARQUITETO_PROMPT.trim() || !REDATOR_PROMPT.trim() || !CRITICO_PROMPT.trim())
    return json({ error: "As instruções do Arquiteto, Redator e Crítico ainda não foram configuradas." }, 503);
  let body: any; try { body = await req.json(); } catch { return json({ error: "Pedido inválido." }, 400); }
  const tema = str(body.tema, 300), objetivo = str(body.objetivo, 20), tom = str(body.tom, 20), rede = str(body.rede, 30) || "instagram";
  if (!tema || !OBJETIVOS.includes(objetivo) || !TONS.includes(tom)) return json({ error: "Preencha o tema, o objetivo e o tom." }, 400);

  // Stream NDJSON so the screen shows the real current step.
  const stream = new ReadableStream({ async start(ctrl) {
    const send = (v: unknown) => ctrl.enqueue(new TextEncoder().encode(JSON.stringify(v) + "\n"));
    try {
      const db = adminClient();
      const [{ data: voice }, { data: patterns }] = await Promise.all([
        db.from("creator_voice").select("expressoes_usa, expressoes_evita, nicho").eq("user_id", auth.userId).maybeSingle(),
        db.from("retention_patterns").select("tipo, texto, retencao_media, amostras, confirmado").eq("user_id", auth.userId).order("amostras", { ascending: false }).limit(40),
      ]);
      // Data, not instructions; absent values stay null.
      const contexto = { pedido: { tema, objetivo, tom, rede }, voz_do_criador: voice ?? null,
        padroes_confirmados: (patterns ?? []).filter(p => p.confirmado), indicios: (patterns ?? []).filter(p => !p.confirmado) };

      send({ etapa: "arquiteto" });
      const estrutura = await pass(ARQUITETO_PROMPT, contexto);
      send({ etapa: "redator" });
      const draft = await pass(REDATOR_PROMPT, { ...contexto, estrutura });
      const blocks = (Array.isArray(draft.blocos) ? draft.blocos : []).map(toBlock).filter(b => Number.isFinite(b.id) && b.fala && b.tempo);
      if (!blocks.length) throw new HttpError(502, "Roteiro incompleto. Tente novamente.");

      const critique = async () => {
        const sb = blocks.map(b => ({ id: b.id, tempo: b.tempo, fala: b.fala, caminho: [] as (string | number)[] }));
        return normalizeCritique(await pass(CRITICO_PROMPT, { ...contexto, estrutura, blocos: blocks, checagens_objetivas: sb.map(objectiveChecks) }), sb);
      };
      send({ etapa: "critico" });
      const historico = [];
      let current = await critique(); historico.push(current);
      let rodadas = 0;
      while (rodadas < CRITIC_LIMITS.maxRounds) {
        const weakIds = current.notas_por_bloco.filter(n => n.nota < CRITIC_LIMITS.rewriteBelow).map(n => n.id);
        if (!weakIds.length) break;
        send({ etapa: "reescrita", rodada: rodadas + 1 });
        const weak = blocks.filter(b => weakIds.includes(b.id));
        const patch = await pass(REDATOR_PROMPT, { ...contexto, estrutura, modo: "reescrita_parcial",
          blocos: weak.map(b => ({ ...b, critica: current.notas_por_bloco.find(n => n.id === b.id) })) });
        rodadas++;
        for (const p of Array.isArray(patch.blocos) ? patch.blocos : []) {
          const target = blocks.find(b => b.id === Number(p?.id) && weakIds.includes(b.id));
          if (!target) continue;
          const next = toBlock({ ...target, ...p, id: target.id, tempo: target.tempo, funcao: target.funcao });
          if (next.fala) Object.assign(target, next);
        }
        send({ etapa: "critico" });
        current = await critique(); historico.push(current);
      }
      const byId = new Map(current.notas_por_bloco.map(n => [n.id, n]));
      const roteiro = {
        blocos: blocks.map(b => ({ ...b, nota: byId.get(b.id)?.nota ?? null })),
        aberturas_alternativas: (Array.isArray(draft.aberturas_alternativas) ? draft.aberturas_alternativas : []).map(v => str(v, 300)).filter(Boolean).slice(0, 3),
        legenda: str(draft.legenda, 2200),
        hashtags: (Array.isArray(draft.hashtags) ? draft.hashtags : []).map(v => str(v, 60)).filter(Boolean).map(h => h.startsWith("#") ? h : `#${h}`).slice(0, 15),
      };
      const notas = { ...current, rodadas, historico,
        avisos: current.notas_por_bloco.filter(n => n.nota < CRITIC_LIMITS.warnBelow).map(n => ({ id: n.id, texto: `Este trecho está fraco. Sugestão de gravação: ${n.correcao}` })) };
      const { data, error } = await db.from("retention_scripts").insert({ user_id: auth.userId, tema, objetivo, tom, rede, estrutura, roteiro, notas, nota_geral: current.nota_geral })
        .select("*").single();
      if (error) throw new HttpError(500, "Reel gerado, mas não foi possível salvar no histórico.");
      send({ etapa: "pronto", script: data });
    } catch (e) {
      send({ etapa: "erro", error: e instanceof Error ? e.message : "Erro", status: e instanceof HttpError ? e.status : 500 });
    } finally { ctrl.close(); }
  } });
  return new Response(stream, { headers: { ...cors, "Content-Type": "application/x-ndjson" } });
});
