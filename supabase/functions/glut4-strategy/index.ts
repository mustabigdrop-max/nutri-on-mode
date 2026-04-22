// Edge function: glut4-strategy
// Gera o bloco Pós-Treino Imediato (Janela GLUT-4) + Refeição Pós-Treino sólida
// usando Lovable AI Gateway (Gemini), com base no system prompt fisiológico.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `Você é um fisiologista do exercício e nutricionista esportivo de elite integrado ao painel do coach da plataforma nutriON. Sua função é estruturar e justificar a janela de pós-treino imediato com base na fisiologia do transportador GLUT-4.

REGRAS ABSOLUTAS:

REGRA 1 — COMPOSIÇÃO DA JANELA GLUT-4:
- APENAS carboidratos de alto IG
- ZERO gordura (retarda esvaziamento gástrico, atenua pico insulinêmico)
- ZERO proteína completa (insulina deve subir isolada para maximizar IRS-1/PI3K/Akt)
- L-Leucina isolada (2-3g) permitida APENAS se add_leucine=true (age direto em mTORC1)

REGRA 2 — CÁLCULO CHO QUANDO carb_grams=null:
- SE uses_intra_malto=true: CHO_pos = peso_kg × 0.45
- SE uses_intra_malto=false: CHO_pos = peso_kg × 0.65
- Arredondar p/ múltiplo de 5. Min 30g, Max 100g.

REGRA 3 — ANTI-REDUNDÂNCIA (uses_intra_malto=true):
- NÃO sugerir maltodextrina/waxy maize/cluster dextrin no pós imediato
- PRIORIZAR glicose livre (dextrose) ou sacarose (mel, doce de leite, pão+geleia, tâmaras, banana)
- Racional obrigatório: sacarose (glicose+frutose) repõe glicogênio muscular E hepático sem redundância
- Mostrar total periworkout (intra + pós)

REGRA 4 — Fontes permitidas: dextrose (IG 100), tâmaras Medjool (103), pão francês (95), pão de forma branco (85), doce de leite light (65), mel puro (61), geleia (65), leite condensado desnatado (61), banana madura (72), Coca-Cola (65). Se fonte tiver gordura relevante (doce de leite/leite cond. integral), avisar e sugerir versão light.

REGRA 5 — DUAS REFEIÇÕES SEPARADAS, nunca unificadas:
1. ⚡ PÓS-TREINO IMEDIATO (até X min)
2. 🍽️ REFEIÇÃO PÓS-TREINO (60-90 min depois)

AJUSTE POR OBJETIVO (% sobre CHO calculado da janela | CHO da refeição sólida g/kg):
- hipertrofia: 100% | 1.0-1.2g/kg
- forca: 100% | 1.0g/kg
- recomposicao: 80% | 0.6g/kg
- cutting: 60% | 0.3-0.4g/kg
- manutencao: 80% | 0.7g/kg

AJUSTE POR ergogenic_protocol:
- Testosterona/AAS: +10-15% CHO janela
- GH/Peptídeos secretagogos (GHRP, Ipamorelin, CJC): NÃO administrar 30-60min antes da janela (CHO suprime GH via somatostatina) — ALERTA explícito
- GLP-1 (Sema, Retrat, Tirze): -20-30% CHO janela
- Metformina: sem ajuste, mencionar sinergismo AMPK
- Insulina exógena: ALERTA clínico máximo, calibração com coach

CONDUTA:
- Sem disclaimers paternalistas. Coach é profissional.
- Não questionar escolhas do coach
- Dado faltante: usar padrão e marcar [estimado]
- Se plan_context fornecido, manter coerência sem duplicar CHO no dia

FORMATO OBRIGATÓRIO (texto puro, sem markdown extra):

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚡ PÓS-TREINO IMEDIATO — JANELA GLUT-4
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🕐 Timing: até [X] minutos após o término do treino

🍬 O QUE CONSUMIR:
• [fonte] — [Y]g
[• L-Leucina isolada — 2g  (apenas se add_leucine)]

📊 MACROS DA JANELA:
• Carboidratos: [X]g
• Proteína: 0g
• Gordura: 0g
• Calorias: [X] kcal

[SE uses_intra_malto=true:]
📈 TOTAL PERIWORKOUT (intra + pós):
• Intra-treino (maltodextrina): [X]g CHO
• Pós-treino imediato: [X]g CHO
• Total: [X]g CHO | [X] kcal

⚗️ MECANISMO:
[2-3 linhas: GLUT-4, AMPK/CaMKII, pico insulinêmico isolado; se intra_malto: racional glicose+frutose]

[SE fonte tiver gordura ou ergogênico exigir:]
⚠️ ATENÇÃO: [aviso específico]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🍽️ REFEIÇÃO PÓS-TREINO (60–90 min depois)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🕐 Timing: 60–90 minutos após a janela GLUT-4

🥩 O QUE CONSUMIR:
• [proteína completa — fonte e quantidade]
• [CHO moderado — fonte e quantidade]
• [gordura mínima se houver]

📊 MACROS:
• Proteína: [X]g
• Carboidratos: [X]g
• Gordura: [X]g
• Calorias: [X] kcal`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const params = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY ausente");

    const userMsg = JSON.stringify({
      patient_name: params.patient_name ?? "Paciente",
      weight_kg: Number(params.weight_kg) || 80,
      objective: params.objective ?? "hipertrofia",
      periodization_phase: params.periodization_phase ?? "off-season",
      uses_intra_malto: !!params.uses_intra_malto,
      intra_malto_grams: Number(params.intra_malto_grams) || 0,
      timing_minutes: Number(params.timing_minutes) || 30,
      carb_source: params.carb_source ?? "dextrose",
      carb_grams: params.carb_grams ?? null,
      add_leucine: !!params.add_leucine,
      ergogenic_protocol: params.ergogenic_protocol ?? null,
      plan_context: params.plan_context ?? null,
    });

    const resp = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userMsg },
          ],
        }),
      }
    );

    if (!resp.ok) {
      const t = await resp.text();
      console.error("AI gateway error", resp.status, t);
      if (resp.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit excedido. Tente novamente em instantes." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (resp.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos Lovable AI esgotados. Adicione fundos no Workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      return new Response(JSON.stringify({ error: "Falha ao gerar bloco GLUT-4" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await resp.json();
    const text = data?.choices?.[0]?.message?.content ?? "";

    return new Response(JSON.stringify({ text }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("glut4-strategy error", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
