import { jsonrepair } from "npm:jsonrepair@3.13.1";
import { adminClient, requireUser } from "../_shared/auth.ts";
import { loadCreatorProfile } from "../_shared/loadCreatorProfile.ts";
import { creatorScriptPrompt } from "../_shared/creatorScriptRules.ts";
import { CRITIC_LIMITS, normalizeCritique, objectiveChecks } from "../_shared/retentionCritic.ts";
import { ARCHITECT_PROMPT, CRITIC_PROMPT, REWRITE_PROMPT, WRITER_PROMPT } from "./prompts.ts";
const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
const OBJECTIVES = ["alcance", "autoridade", "venda"];
type Block = { id: number; tempo: string; funcao: string; fala: string; texto_tela: string; estimulo_visual: string; gatilho: string };
class HttpError extends Error { constructor(public status: number, msg: string) { super(msg); } }
const str = (v: unknown, max = 1000) => typeof v === "string" ? v.trim().slice(0, max) : "";

async function pass(system: string, input: unknown): Promise<Record<string, unknown>> {
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST", headers: { Authorization: `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: "google/gemini-2.5-flash", response_format: { type: "json_object" },
      messages: [{ role: "system", content: system }, { role: "user", content: JSON.stringify(input) }] }),
  });
  if (res.status === 429) throw new HttpError(429, "Limite de uso atingido. Tente em instantes.");
  if (res.status === 402) throw new HttpError(402, "Créditos esgotados no espaço de trabalho.");
  if (!res.ok) { await res.text(); throw new HttpError(502, "Falha na geração. Tente novamente."); }
  const d = await res.json();
  const raw = String(d.choices?.[0]?.message?.content ?? "{}").replace(/```json|```/g, "").trim();
  let v: unknown;
  try { v = JSON.parse(raw); } catch { try { v = JSON.parse(jsonrepair(raw)); } catch { throw new HttpError(502, "Resposta inválida. Tente novamente."); } }
  if (!v || typeof v !== "object" || Array.isArray(v)) throw new HttpError(502, "Resposta inválida. Tente novamente.");
  return v as Record<string, unknown>;
}

const toBlock = (v: any): Block => ({ id: Number(v?.id), tempo: str(v?.tempo, 20), funcao: str(v?.funcao, 40), fala: str(v?.fala),
  texto_tela: str(v?.texto_tela, 200), estimulo_visual: str(v?.estimulo_visual, 300), gatilho: str(v?.gatilho, 80) });
const critique = async (blocks: Block[], plan: unknown) => {
  const sb = blocks.map(b => ({ id: b.id, tempo: b.tempo, fala: b.fala, caminho: [] as (string | number)[] }));
  return normalizeCritique(await pass(CRITIC_PROMPT, { blocos: sb, planejamento: plan, checagens_objetivas: sb.map(objectiveChecks) }), sb);
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...cors, "Content-Type": "application/json" } });
  try {
    const auth = await requireUser(req);
    if (!auth.ok) return json({ error: "Não autenticado" }, auth.status);
    const body = await req.json();
    const tema = str(body.tema, 300), objetivo = str(body.objetivo, 20), tom = str(body.tom, 80);
    if (!tema || !OBJECTIVES.includes(objetivo) || !tom) return json({ error: "Preencha tema, objetivo (alcance, autoridade ou venda) e tom." }, 400);
    const rules = creatorScriptPrompt(await loadCreatorProfile(auth.userId), { objetivo, tom });
    const request = { tema, objetivo, tom };

    const plan = await pass(`${rules}\n\n${ARCHITECT_PROMPT}`, request);
    if (!Array.isArray(plan.blocos) || !plan.blocos.length) return json({ error: "Estrutura incompleta. Tente novamente." }, 502);
    const draft = await pass(`${rules}\n\n${WRITER_PROMPT}`, { ...request, estrutura: plan });
    const blocks = (Array.isArray(draft.blocos) ? draft.blocos : []).map(toBlock).filter(b => Number.isFinite(b.id) && b.fala && b.tempo);
    if (!blocks.length) return json({ error: "Roteiro incompleto. Tente novamente." }, 502);

    const history = [];
    let current = await critique(blocks, plan); history.push(current);
    let rounds = 0;
    while (rounds < CRITIC_LIMITS.maxRounds) {
      const weakIds = current.notas_por_bloco.filter(n => n.nota < CRITIC_LIMITS.rewriteBelow || current.riscos_de_conteudo.some(r => r.id === n.id)).map(n => n.id);
      if (!weakIds.length) break;
      const weak = blocks.filter(b => weakIds.includes(b.id));
      const patch = await pass(`${rules}\n\n${REWRITE_PROMPT}`, { estrutura: plan, blocos: weak.map(b => ({ ...b,
        critica: current.notas_por_bloco.find(n => n.id === b.id), riscos: current.riscos_de_conteudo.filter(r => r.id === b.id) })) });
      rounds++;
      for (const p of Array.isArray(patch.blocos) ? patch.blocos : []) {
        const target = blocks.find(b => b.id === Number(p?.id) && weakIds.includes(b.id));
        const next = toBlock({ ...target, ...p, id: target?.id, tempo: target?.tempo, funcao: target?.funcao });
        if (target && next.fala) Object.assign(target, next);
      }
      current = await critique(blocks, plan); history.push(current);
    }
    const notes = new Map(current.notas_por_bloco.map(n => [n.id, n]));
    const result = {
      planejamento: plan,
      blocos: blocks.map(b => ({ ...b, nota: notes.get(b.id)?.nota ?? null, causa_da_queda: notes.get(b.id)?.causa_da_queda ?? "", correcao: notes.get(b.id)?.correcao ?? "" })),
      nota_geral: current.nota_geral, veredito: current.veredito, riscos_de_conteudo: current.riscos_de_conteudo, rodadas: rounds, historico: history,
      avisos: current.notas_por_bloco.filter(n => n.nota < CRITIC_LIMITS.warnBelow).map(n => ({ id: n.id, texto: `Este trecho está fraco. Sugestão de gravação: ${n.correcao}` })),
      aberturas_alternativas: (Array.isArray(draft.aberturas_alternativas) ? draft.aberturas_alternativas : []).map(v => str(v, 300)).filter(Boolean).slice(0, 3),
      legenda: str(draft.legenda, 2200),
      hashtags: (Array.isArray(draft.hashtags) ? draft.hashtags : []).map(v => str(v, 60)).filter(Boolean).map(h => h.startsWith("#") ? h : `#${h}`).slice(0, 15),
    };
    const { data, error } = await adminClient().from("reel_generations").insert({ user_id: auth.userId, tema, objetivo, tom, result }).select("id, created_at").single();
    if (error) return json({ error: "Reel gerado, mas não foi possível salvar no histórico." }, 500);
    return json({ ...data, tema, objetivo, tom, result });
  } catch (e) {
    if (e instanceof HttpError) return json({ error: e.message }, e.status);
    return json({ error: e instanceof Error ? e.message : "Erro" }, 500);
  }
});
