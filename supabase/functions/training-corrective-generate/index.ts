// Generates a corrective training protocol from APEX Visual sync data
// Uses Lovable AI Gateway (google/gemini-2.5-flash)

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function parseApexSection(text: string, key: string, nextKey?: string): string {
  if (!text) return "";
  const pattern = nextKey
    ? new RegExp(`##\\s*${key}([\\s\\S]*?)##\\s*${nextKey}`, "i")
    : new RegExp(`##\\s*${key}([\\s\\S]*)`, "i");
  return text.match(pattern)?.[1]?.trim() || "";
}

function extractApexTrainingData(analysisText: string) {
  return {
    correctiveProtocol: parseApexSection(analysisText, "PONTOS_FRACOS_PROTOCOLO", "CONDICIONAMENTO"),
    posturalCorrections: parseApexSection(analysisText, "CORRECOES_POSTURAIS", "PONTOS_FRACOS_PROTOCOLO"),
    posturalDeviations: parseApexSection(analysisText, "POSTURA_DESVIOS", "CORRECOES_POSTURAIS"),
    priority1: analysisText?.match(/PRIORIDADE_1:\s*([^\n]+)/i)?.[1]?.trim() || "",
    priority2: analysisText?.match(/PRIORIDADE_2:\s*([^\n]+)/i)?.[1]?.trim() || "",
    priority3: analysisText?.match(/PRIORIDADE_3:\s*([^\n]+)/i)?.[1]?.trim() || "",
  };
}

function buildIntegratedApexPrompt(opts: {
  athlete: any;
  apexWeakPoints: Array<{ muscle: string; score: number; priority?: string }>;
  apexData: ReturnType<typeof extractApexTrainingData>;
  trainingMethod: string;
  weeklyVolume: Record<string, number>;
  currentWeek: number;
  splitType: string;
  frequency: number;
}) {
  const { athlete, apexWeakPoints, apexData, trainingMethod, weeklyVolume, currentWeek, splitType, frequency } = opts;
  const tm = (trainingMethod || "").toLowerCase();
  const isGVT = /gvt/.test(tm);
  const isFST7 = /fst.?7/.test(tm);

  const weakLines = apexWeakPoints.map((p) => `• ${p.muscle}: ${p.score}/10 — prioridade ${p.priority || (p.score <= 3 ? "CRÍTICA" : p.score <= 5 ? "ALTA" : "MODERADA")}`).join("\n");
  const volumeLines = Object.entries(weeklyVolume).map(([m, s]) => {
    const perSession = Math.ceil((s as number) / Math.max(frequency, 1));
    return `${m}: ${s} séries/semana → ${perSession} séries/sessão (${frequency}× por sem)`;
  }).join("\n");

  const methodBlock = isGVT
    ? `GVT ATIVO — 10 séries × 1 exercício principal por grupo. Volume mínimo GVT = 10 séries/sessão.
Para grupos com volume prescrito < 10 séries/sem: usar método convencional (3-4×8-12) nesse grupo.
Para grupos com 20 séries/sem: 2 sessões GVT (10 cada).`
    : isFST7
    ? `FST-7 ATIVO — última série de isolamento: 7×8-12 com 30-45s descanso. Aplicar FST-7 preferencialmente nos grupos identificados como fracos pelo APEX.`
    : `Distribuir séries entre 2-4 exercícios por grupo. Compostos multi-articulares para grupos fracos. Exercícios corretivos do APEX entram como acessórios/finalizadores.`;

  return `Você é o TrainingON — módulo de prescrição de treino do nutriON.
Você integra os exercícios corretivos do APEX Visual ao treino principal sem ultrapassar o volume semanal prescrito.

━━━ PERFIL DO ATLETA ━━━
Nome: ${athlete?.name || "atleta"}
Objetivo: ${athlete?.goal || "n/d"}
Fase: ${athlete?.phase || "n/d"}
Protocolo farmacológico: ${athlete?.protocol || "não informado"}
Semana do mesociclo: ${currentWeek}
Split: ${splitType}
Método principal: ${trainingMethod}
Frequência: ${frequency}× por semana

━━━ PONTOS FRACOS DO APEX ━━━
${weakLines || "—"}

━━━ VOLUME SEMANAL PRESCRITO (RESPEITAR OBRIGATORIAMENTE) ━━━
${volumeLines || "—"}

REGRA CRÍTICA: total de séries de TRABALHO de cada grupo na semana NÃO pode ultrapassar o prescrito em mais de 10%.
Feeder sets NÃO contam. Distribua entre os dias do split.

━━━ PRIORIDADES APEX ━━━
1. ${apexData.priority1 || "—"}
2. ${apexData.priority2 || "—"}
3. ${apexData.priority3 || "—"}

━━━ DESVIOS POSTURAIS ━━━
${apexData.posturalDeviations || "Nenhum informado"}

━━━ CORREÇÕES POSTURAIS (warm-up) ━━━
${apexData.posturalCorrections || "Nenhum informado"}

━━━ EXERCÍCIOS CORRETIVOS APEX ━━━
${apexData.correctiveProtocol || "Nenhum informado"}

━━━ INTEGRAÇÃO OBRIGATÓRIA ━━━
1. WARM-UP de cada sessão: incluir correções posturais APEX dos grupos do dia (NÃO conta para volume). Formato: exercício + séries + reps + cue.
2. EXERCÍCIOS PRINCIPAIS: respeitar ${trainingMethod}. Em grupos fracos, adicionar cue de ativação APEX e marcar [APEX] no nome quando vier diretamente do APEX.
3. EXERCÍCIOS CORRETIVOS APEX: aparecem como ACESSÓRIOS/FINALIZADORES, SUBSTITUINDO (não somando) um acessório existente do grupo, para não ultrapassar volume.
4. COMPATIBILIDADE COM MÉTODO:
${methodBlock}
5. VALIDAÇÃO FINAL OBRIGATÓRIA: ao terminar o plano, declarar a seção VALIDAÇÃO DE VOLUME SEMANAL no formato exato: "• grupo: X sér / Y sér — OK|REVISAR". Se algum grupo > 110% do prescrito, redistribua antes de finalizar.

━━━ FORMATO DE SAÍDA ━━━
Para cada dia do split:

DIA X — [NOME DA SESSÃO] — [GRUPOS PRINCIPAIS]

WARM-UP APEX (não conta para volume):
• [exercício] — [séries×reps] — [cue]

FEEDER SETS [exercício principal]:
• Feeder 1: [%] × [reps] — [cue]
• Feeder 2: [%] × [reps] — [cue]

SÉRIES DE TRABALHO:
1. [exercício] [APEX se corretivo]
   Grupo: [grupo]
   [N] × [reps] — RPE [X] — [descanso]
   Cue: [instrução]
   Conta para volume: [N] séries de [grupo]

VOLUME DO DIA:
• [grupo]: [N] séries (acumulado semana: [N]/[prescrito])

---

Ao final:

VALIDAÇÃO DE VOLUME SEMANAL:
• [grupo]: [realizado] sér / [prescrito] sér — [OK|REVISAR]

EXERCÍCIOS CORRETIVOS APEX INTEGRADOS:
• [lista — qual exercício e em qual dia]

WARM-UPS POSTURAIS INCLUÍDOS:
• [lista — exercício + dia]
`;
}

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

SCORES APEX POR GRUPO MUSCULAR (aplicar multiplicador de volume automático):
${scoresLine || "— sem dados de score por grupo —"}

REGRA DE MULTIPLICADOR DE VOLUME (obrigatória):
- score < 5  → +40% volume (séries x 1.4)
- score < 7  → +20% volume (séries x 1.2)
- score 7    → volume padrão (x 1.0)
- score >= 8 → -10% volume (manutenção, x 0.9)
Para CADA exercício no SEMANA_TIPO, aplique o multiplicador correto e mostre o ajuste no campo VOLUME_AJUSTE no formato: "12 → 17 séries (+40% · score APEX 4/10)".

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
GRUPO: grupo muscular alvo (em minúsculas, ex: deltoides, dorsais, peitoral, quadriceps, posterior, panturrilha, biceps, triceps, gluteos, abdomen)
SERIES: X × Y reps
VOLUME_AJUSTE: ajuste aplicado segundo score APEX (ex: "12 → 17 séries (+40% · score 4/10)") ou "padrão"
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

    const { syncData, athlete, apexScores } = await req.json();
    if (!syncData) throw new Error("syncData ausente");

    const system = buildSystemPrompt(syncData, athlete || {}, apexScores || {});

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
