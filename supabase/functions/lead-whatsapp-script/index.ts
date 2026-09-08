import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { requireUser, adminClient } from "../_shared/auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SCHEMA = `{
  "msg_inicial": "string (max 200 chars)",
  "msg_sim": "string (max 500 chars)",
  "msg_fechamento": "string (max 400 chars)",
  "msg_followup_24h": "string (max 150 chars)",
  "msg_nao_agora": "string (max 200 chars)",
  "msg_objecao_preco": "string (max 200 chars)",
  "resposta_destacada": "string"
}`;

const RULES = `REGRAS DO SCRIPT:
- Usar SEMPRE o primeiro nome do lead, nunca o completo.
- Tom: coach que entende o problema, não vendedor. Linguagem BR coloquial, sem formalidade excessiva.
- Nunca falar de preço na mensagem inicial nem no msg_sim.
- msg_inicial: abertura curta, menciona o diagnóstico MCE e pergunta SEMPRE se tem 5 minutos.
- msg_sim: cita os 3 números M/C/E, explica na prática o maior gap e cita entre aspas 1 resposta específica do diagnóstico (a mais reveladora). Termina com pergunta aberta.
- msg_fechamento: conecta o protocolo MCE ao objetivo declarado, lista 3 entregas concretas, termina com pergunta de avanço.
- msg_followup_24h: curto, sem pressão, usa o maior gap como gancho.
- msg_nao_agora: 1 dica prática gratuita baseada no gap, porta aberta.
- msg_objecao_preco: reforça valor, nunca discute preço em si.
- resposta_destacada: a resposta do diagnóstico que mais revela o padrão do lead.
- Padrões a detectar nas respostas e usar na conversa:
  * "sei o que deveria / não consigo manter" → informação não é o problema, SISTEMA é.
  * "motivado / relaxo / compenso" → ciclo do tudo-ou-nada e compensação.
  * "feeling / improviso / sem plano" → falta de planejamento.
  * "internet / sozinho / nunca tive acompanhamento" → acompanhamento como diferencial.
- Não mencionar que você é um sistema automatizado. Nunca usar as palavras "IA" ou "inteligência artificial".`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const auth = await requireUser(req);
    if (!auth.ok) {
      return new Response(JSON.stringify({ error: auth.error }), {
        status: auth.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { lead_id, answers_text } = await req.json().catch(() => ({}));
    if (!lead_id || typeof lead_id !== "string") {
      return new Response(JSON.stringify({ error: "lead_id é obrigatório" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = adminClient();
    const { data: lead } = await admin.from("mce_leads").select("*").eq("id", lead_id).maybeSingle();
    if (!lead) {
      return new Response(JSON.stringify({ error: "Lead não encontrado" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const scores: Record<string, number> = {
      Mentalidade: lead.score_mentalidade,
      Comportamento: lead.score_comportamento,
      Execução: lead.score_execucao,
    };
    const gap = Object.entries(scores).sort((a, b) => a[1] - b[1])[0];

    // O texto legível das perguntas/respostas vive no frontend (data/mceDiagnostico),
    // então o cliente envia answers_text já resolvido; o JSON cru é fallback.
    const respostas = Array.isArray(answers_text) && answers_text.length
      ? answers_text
      : (lead.answers as unknown[] | null) || [];

    const ctx = `Dados do lead:
- Nome: ${lead.name}
- Objetivo: ${lead.goal || "não informado"}
- Score total: ${lead.score_total}% (${lead.level})
- Mentalidade: ${lead.score_mentalidade}%
- Comportamento: ${lead.score_comportamento}%
- Execução: ${lead.score_execucao}%
- Maior gap: ${gap[0]} (${gap[1]}%)
- Respostas do diagnóstico (JSON): ${JSON.stringify(respostas)}

${RULES}

Retorne APENAS JSON válido no schema:
${SCHEMA}`;

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content:
              "Você escreve scripts de WhatsApp para o Coach Diogo Mello, do nutriON, falando com leads que fizeram o Diagnóstico MCE (Mentalidade, Comportamento, Execução). Responda SEMPRE apenas JSON válido, sem markdown.",
          },
          { role: "user", content: ctx },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (res.status === 429) {
      return new Response(JSON.stringify({ error: "Limite de uso atingido. Tente novamente em instantes." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (res.status === 402) {
      return new Response(JSON.stringify({ error: "Créditos esgotados no workspace." }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!res.ok) throw new Error(`Gateway ${res.status}: ${await res.text()}`);

    const json = await res.json();
    const raw = json?.choices?.[0]?.message?.content ?? "{}";
    let parsed: Record<string, string>;
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = JSON.parse(String(raw).replace(/```json|```/g, "").trim());
    }

    return new Response(JSON.stringify({ script: parsed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Falha ao gerar script" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
