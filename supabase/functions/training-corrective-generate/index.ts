// Generates a corrective training protocol from APEX Visual sync data
// Uses Lovable AI Gateway (google/gemini-2.5-flash)

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function buildSystemPrompt(syncData: any, athlete: any, apexScores: Record<string, number> = {}) {
  const scoresLine = Object.entries(apexScores)
    .map(([k, v]) => {
      const mult =
        v < 5 ? "x1.4 (+40%)" : v < 7 ? "x1.2 (+20%)" : v >= 8 ? "x0.9 (-10%)" : "x1.0";
      return `• ${k}: ${v}/10 → multiplicador de volume ${mult}`;
    })
    .join("\n");
  const wp = (syncData?.weak_points || [])
    .map((w: any) => `• ${w.muscle}: ${w.score}/10 — ${w.diagnosis || ""}`)
    .join("\n");
  return `Você é o TrainingON — módulo de prescrição de treino do nutriON.
Você recebe os dados do APEX Visual Intelligence e gera um protocolo de treino específico para corrigir os pontos fracos identificados na análise visual, integrado ao treino principal do atleta.

DADOS DO ATLETA:
Nome: ${athlete?.name || "atleta"}
Objetivo: ${athlete?.goal || "n/d"}
Fase: ${athlete?.phase || "n/d"}
Protocolo farmacológico: ${athlete?.protocol || "não informado"}
Categoria de competição: ${syncData?.category || "n/d"}

ANÁLISE APEX — PONTOS FRACOS IDENTIFICADOS:
${wp || "—"}

DESVIOS POSTURAIS:
${syncData?.postural_deviations || "—"}

PROTOCOLO CORRETIVO DO APEX:
${syncData?.corrective_protocol || "—"}

CORREÇÕES POSTURAIS PRESCRITAS:
${syncData?.postural_corrections || "—"}

PRIORIDADES DO APEX:
1. ${syncData?.priorities?.p1 || "—"}
2. ${syncData?.priorities?.p2 || "—"}
3. ${syncData?.priorities?.p3 || "—"}

━━━ INSTRUÇÕES DE GERAÇÃO ━━━
Gere protocolo SEMANAL com:
1. ATIVAÇÃO PRÉ-TREINO (10-15 min): mobilidade para desvios + ativação de inibidos.
2. TREINO PRINCIPAL por dia: volume extra nos grupos fracos, frequência aumentada para score < 6.
3. CORRETIVOS PÓS-TREINO (10 min): isolamento + pump + intensificação.
4. PERIODIZAÇÃO: S1-2 ativação (RPE 7-8), S3-4 sobrecarga (RPE 8-9), S5 deload.

Use EXATAMENTE estes headers (markdown ##):

## RESUMO_CORRETIVO
## ATIVACAO_PRE_TREINO
## SEMANA_TIPO
Para cada exercício use:
EXERCICIO: nome
VARIACAO: variação
SERIES: X × Y reps
RPE: X
CUE: instrução
FOCO_CORRETIVO: sim/não + qual ponto fraco do APEX

## FREQUENCIA_GRUPOS_FRACOS
## PROGRESSAO_4_SEMANAS
## EXERCICIOS_CORRETIVOS_POS
## INTEGRACAO_APEX
`;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY não configurada");

    const { syncData, athlete } = await req.json();
    if (!syncData) throw new Error("syncData ausente");

    const system = buildSystemPrompt(syncData, athlete || {});

    const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: system },
          {
            role: "user",
            content: `Gere o protocolo de treino corretivo completo para ${
              athlete?.name || "o atleta"
            } baseado na análise APEX Visual.`,
          },
        ],
      }),
    });

    if (r.status === 429) {
      return new Response(
        JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em instantes." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (r.status === 402) {
      return new Response(
        JSON.stringify({ error: "Créditos esgotados. Adicione créditos ao workspace para continuar." }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (!r.ok) {
      const t = await r.text();
      console.error("AI gateway error", r.status, t);
      throw new Error(`Falha na IA (${r.status})`);
    }

    const data = await r.json();
    const text = data?.choices?.[0]?.message?.content || "";

    return new Response(JSON.stringify({ text }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("training-corrective-generate error", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
