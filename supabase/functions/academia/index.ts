// Academia GRAVITAS — Laboratórios de Gancho, Figuras e Fala + quiz da aula.
// Medidas objetivas (verificador, contagens) rodam em código; o modelo só faz a análise qualitativa.
import { requireUser, adminClient } from "../_shared/auth.ts";
import { verificarBloco } from "../_shared/reelVerifier.ts";
import { jsonrepair } from "npm:jsonrepair@3.13.1";

const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...cors, "Content-Type": "application/json" } });
const MODEL = "google/gemini-2.5-flash";
const BASE = `Você é o analista de retórica e atenção do GRAVITAS (Coach Diogo Mello). Português do Brasil falado.
Regras: nunca invente estudos, números ou casos. Nunca acrescente dado que não esteja no texto do usuário. Sem elogio vazio. Frases curtas, até 14 palavras. Nunca use as palavras "IA" ou "AI". Responda SOMENTE JSON válido.`;
const FORMULAS = "1 Quebra de crença, 2 Erro comum, 3 Lacuna específica, 4 Lista com loop, 5 Contraste antes/depois, 6 Identidade (\"se você...\"), 7 Pergunta com resposta, 8 Mito-verdade, 9 Consequência oculta, 10 Prova demonstrada, 11 Caso real (só com caso autorizado), 12 Desafio direto";

class GwErr extends Error { constructor(public status: number, m: string) { super(m); } }
async function ask(system: string, user: string) {
  for (let i = 0; i < 2; i++) {
    const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST", headers: { Authorization: `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: MODEL, response_format: { type: "json_object" }, messages: [{ role: "system", content: `${BASE}\n\n${system}` }, { role: "user", content: user.slice(0, 6000) }] }),
    });
    if (r.status === 429) throw new GwErr(429, "Limite de uso atingido. Tente em instantes.");
    if (r.status === 402) throw new GwErr(402, "Créditos esgotados no espaço de trabalho.");
    if (!r.ok) throw new GwErr(502, "Falha na análise. Tente de novo.");
    const raw = String((await r.json()).choices?.[0]?.message?.content ?? "").replace(/```json|```/g, "").trim();
    try { return JSON.parse(raw); } catch { try { return JSON.parse(jsonrepair(raw)); } catch { /* retry */ } }
  }
  throw new GwErr(502, "Resposta inválida. Tente de novo.");
}
const clamp = (n: unknown, max: number) => Math.max(0, Math.min(max, Math.round(Number(n) || 0)));

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  try {
    const auth = await requireUser(req);
    if (!auth.ok) return json({ error: "Faça login novamente." }, 401);
    const body = await req.json().catch(() => ({}));
    const modo = String(body.modo ?? "");
    const texto = String(body.texto ?? "").trim();
    const db = adminClient();
    const { data: prom } = await db.from("engine_prompts").select("conteudo").eq("user_id", auth.userId).eq("chave", "proibidas").maybeSingle();
    const proibidas = String((prom as any)?.conteudo ?? "crucial\nmuda tudo\nfaz toda a diferença\nincrível\npoderoso\ntransformador\nrevolucionário\no segredo\nde uma vez por todas\nninguém te conta").split("\n").map(s => s.trim()).filter(Boolean);

    if (modo === "quiz") {
      const { data: l } = await db.from("academy_lessons").select("titulo,conceito,no_reel,fraco,forte").eq("slug", String(body.slug)).maybeSingle();
      if (!l) return json({ error: "Aula não encontrada." }, 404);
      const out = await ask(`Crie 3 perguntas de múltipla escolha (4 opções) usando SOMENTE o texto da aula. Não acrescente nenhuma informação externa. JSON: {"perguntas":[{"pergunta":"","opcoes":["","","",""],"correta":0}]}`, JSON.stringify(l));
      const ps = (Array.isArray(out.perguntas) ? out.perguntas : []).filter((p: any) => p?.pergunta && Array.isArray(p.opcoes) && p.opcoes.length >= 2).slice(0, 3);
      return json({ perguntas: ps.map((p: any) => ({ pergunta: String(p.pergunta), opcoes: p.opcoes.map(String).slice(0, 4), correta: clamp(p.correta, 3) })) });
    }

    if (!texto || texto.length > 6000) return json({ error: "Escreva o texto (até 6000 caracteres)." }, 400);

    if (modo === "gancho") {
      const v = verificarBloco({ id: 1, tempo: "0-2s", fala: texto }, 0, { proibidas, temFonte: false });
      const out = await ask(`Laboratório de Gancho. Avalie a abertura pelos 5 critérios do Atlas, cada um 0 a 2: tensao_clara, promessa_6s, especificidade, identificacao, curiosidade_sem_enganar. Depois dê 3 reescritas, cada uma com uma fórmula DIFERENTE do Atlas (${FORMULAS}), sem saudação, até 12 palavras, sem inventar número ou estudo. JSON: {"criterios":{"tensao_clara":0,"promessa_6s":0,"especificidade":0,"identificacao":0,"curiosidade_sem_enganar":0},"comentario":"","reescritas":[{"formula":"","texto":""}]}`, texto);
      const c = out.criterios ?? {};
      const crit = Object.fromEntries(["tensao_clara", "promessa_6s", "especificidade", "identificacao", "curiosidade_sem_enganar"].map(k => [k, clamp(c[k], 2)]));
      const soma = Object.values(crit).reduce((s: number, x) => s + (x as number), 0);
      const nota10 = Math.min(soma, v.teto);
      const vistas = new Set<string>();
      const reescritas = (Array.isArray(out.reescritas) ? out.reescritas : []).filter((r: any) => { const f = String(r?.formula ?? "").toLowerCase(); if (!r?.texto || vistas.has(f)) return false; vistas.add(f); return true; }).slice(0, 3);
      return json({ nota10, nota: nota10 * 10, criterios: crit, verificador: v, comentario: String(out.comentario ?? ""), reescritas, eixos: { gancho: nota10 * 10 } });
    }

    if (modo === "figuras") {
      const figura = String(body.figura ?? "").slice(0, 40);
      const ideia = String(body.ideia ?? "").slice(0, 300);
      const out = await ask(`Laboratório de Figuras. Figura pedida: ${figura}. Ideia: ${ideia}. Diga se a figura foi aplicada na frase do usuário, explique em 1 a 2 frases e dê uma versão melhorada usando a mesma figura e mantendo o sentido. JSON: {"aplicada":true,"nota":0,"feedback":"","versao_melhorada":""} (nota 0 a 100).`, texto);
      const nota = clamp(out.nota, 100);
      return json({ aplicada: !!out.aplicada, nota, feedback: String(out.feedback ?? ""), versao_melhorada: String(out.versao_melhorada ?? ""), eixos: { figuras: nota } });
    }

    if (modo === "fala") {
      const out = await ask(`Laboratório de Fala. Analise a transcrição: gancho (Atlas) 0 a 100; especificidade (cite os elementos concretos encontrados); perguntas_sem_resposta (liste); cta (existe? único? tem motivo?) 0 a 100; prova (demonstração ou dado com fonte presente no texto) 0 a 100; voz (variação implícita, frases faladas) 0 a 100; uma figura de retórica detectada (ou "nenhuma"); 3 trechos literais para reescrever, cada um com versão melhor sem inventar dado; nota_qualitativa 0 a 100; 3 ajustes para a próxima gravação. JSON: {"gancho":0,"especificidade":{"nota":0,"elementos":[]},"perguntas_sem_resposta":[],"cta":{"nota":0,"comentario":""},"prova":0,"voz":0,"figura":{"nome":"","trecho":""},"trechos":[{"original":"","melhor":""}],"nota_qualitativa":0,"ajustes":["","",""]}`, texto);
      return json({ analise: out });
    }

    if (modo === "reescrever") {
      const out = await ask(`Reescreva o texto inteiro para ter mais atenção: abertura com tensão em até 12 palavras, sem saudação, frases até 14 palavras, sem muletas, 1 loop aberto fechado depois, CTA único com motivo. Mantenha o sentido. NÃO acrescente nenhum número, estudo ou caso que não esteja no original. JSON: {"texto":""}`, texto);
      return json({ texto: String(out.texto ?? "") });
    }
    return json({ error: "Modo inválido." }, 400);
  } catch (e) {
    if (e instanceof GwErr) return json({ error: e.message }, e.status);
    return json({ error: e instanceof Error ? e.message : "Erro" }, 500);
  }
});
