import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

import { guard } from "../_shared/auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { weekly_log_id } = await req.json();
    if (!weekly_log_id) {
      return json({ error: "weekly_log_id required" }, 400);
    }

    const PERPLEXITY_API_KEY = Deno.env.get("PERPLEXITY_API_KEY");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!PERPLEXITY_API_KEY) return json({ error: "PERPLEXITY_API_KEY missing" }, 500);
    if (!LOVABLE_API_KEY) return json({ error: "LOVABLE_API_KEY missing" }, 500);

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

    // 1) Load weekly log + plan
    const { data: log, error: logErr } = await supabase
      .from("competition_weekly_logs")
      .select("*")
      .eq("id", weekly_log_id)
      .maybeSingle();
    if (logErr || !log) return json({ error: "log not found" }, 404);

    const { data: plan } = await supabase
      .from("competition_plans")
      .select("*")
      .eq("id", log.competition_plan_id)
      .maybeSingle();
    if (!plan) return json({ error: "plan not found" }, 404);

    // Autorização: apenas o atleta do plano ou o coach responsável
    const g = await guard(req, corsHeaders);
    if ("response" in g) return g.response;
    if (g.userId !== plan.athlete_id) {
      const { data: ownsPlan } = await supabase.rpc("user_owns_competition_plan", {
        _user_id: g.userId,
        _plan_id: plan.id,
      });
      if (ownsPlan !== true) {
        return new Response(JSON.stringify({ error: "Forbidden" }), {
          status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // 2) Load previous logs for trend
    const { data: history } = await supabase
      .from("competition_weekly_logs")
      .select("semana,peso,bf_estimado,recovery_score,aderencia_dieta,aderencia_treino,energia_geral,qualidade_sono")
      .eq("competition_plan_id", log.competition_plan_id)
      .order("semana", { ascending: true })
      .limit(10);

    const blocoAtual = (plan.blocos as any[])?.find(
      (b) => log.semana >= b.semana_inicio && log.semana <= b.semana_fim,
    );

    // 3) Perplexity — evidence search
    const pplxQuery = `
Atleta de bodybuilding em prep para competição (${plan.federacao} ${plan.categoria}).
Bloco atual: ${blocoAtual?.nome || "N/D"} (${blocoAtual?.tipo}).
Semana ${log.semana} de ${plan.blocos?.[plan.blocos.length - 1]?.semana_fim || "?"}.
Peso atual: ${log.peso}kg | Meta palco: ${plan.peso_alvo_palco}kg.
Taxa alvo perda semanal: ${blocoAtual?.taxa_perda_alvo || 0.6}%.
Sintomas: recovery ${log.recovery_score}/10, energia ${log.energia_geral}/10, sono ${log.qualidade_sono}/10, DOMS ${log.dor_muscular}/10.
Aderência: dieta ${log.aderencia_dieta}% / treino ${log.aderencia_treino}%.
Força: ${log.forca_status}. Compulsão: ${log.episodio_compulsao ? "sim" : "não"}.

Busque evidência científica recente (2023-2025) sobre:
1. Taxa ideal de perda semanal vs. preservação muscular para este bloco.
2. Sinais de overreaching/RED-S a partir destes marcadores.
3. Quando ajustar calorias vs. cardio vs. volume.
4. Estratégias para os sintomas reportados.
Responda em PT-BR, conciso (até 400 palavras), com referências.`;

    const pplxRes = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PERPLEXITY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "sonar-pro",
        messages: [
          { role: "system", content: "Você é um pesquisador científico de bodybuilding, peptídeos e fisiologia esportiva. Cite estudos recentes." },
          { role: "user", content: pplxQuery },
        ],
        search_recency_filter: "year",
        temperature: 0.2,
      }),
    });

    let evidencia = "";
    let citations: string[] = [];
    if (pplxRes.ok) {
      const pplxData = await pplxRes.json();
      evidencia = pplxData.choices?.[0]?.message?.content || "";
      citations = pplxData.citations || [];
    } else {
      console.error("Perplexity error:", pplxRes.status, await pplxRes.text());
    }

    // 4) Gemini — structured adjustments via tool calling
    const geminiPrompt = `
DADOS DO ATLETA:
- Plano: ${plan.nome_competicao} (${plan.federacao} / ${plan.categoria})
- Semana ${log.semana} | Bloco: ${blocoAtual?.nome} (${blocoAtual?.tipo})
- Peso: ${log.peso}kg (alvo palco: ${plan.peso_alvo_palco}kg)
- Histórico (semana → peso): ${(history || []).map((h: any) => `${h.semana}:${h.peso}`).join(", ")}

CHECK-IN ATUAL:
- Recovery ${log.recovery_score}/10 | Energia ${log.energia_geral}/10 | Sono ${log.qualidade_sono}/10 (${log.horas_sono_media}h)
- DOMS ${log.dor_muscular}/10 | Força ${log.forca_status}
- Aderência dieta ${log.aderencia_dieta}% | treino ${log.aderencia_treino}%
- Posing ${log.posing_minutos}min (com música: ${log.posing_com_musica})
- Maior dificuldade: ${log.maior_dificuldade || "—"}
- Compulsão: ${log.episodio_compulsao}

EVIDÊNCIA CIENTÍFICA (Perplexity):
${evidencia}

PROTOCOLO DO BLOCO:
- Déficit alvo: ${blocoAtual?.deficit_pct}%
- Taxa perda alvo: ${blocoAtual?.taxa_perda_alvo}%/semana
- Volume: ${blocoAtual?.volume} | Cardio: ${blocoAtual?.cardio}

Como APEX Elite Coach, gere análise + ajustes para a próxima semana.
`;

    const tool = {
      type: "function",
      function: {
        name: "competition_adjustments",
        description: "Análise estruturada e ajustes para a próxima semana",
        parameters: {
          type: "object",
          properties: {
            analise_semana: {
              type: "string",
              description: "Análise narrativa da semana (5-10 frases) cobrindo evolução, riscos e oportunidades.",
            },
            taxa_perda_real_pct: { type: "number", description: "Taxa de perda real desta semana (%)" },
            status_geral: {
              type: "string",
              enum: ["on_track", "atencao", "ajuste_critico"],
            },
            ajuste_calorico: {
              type: "number",
              description: "Ajuste calórico em kcal (negativo = cortar, positivo = aumentar). Range típico: -300 a +200.",
            },
            ajuste_volume: {
              type: "number",
              description: "Ajuste de volume de treino (% vs. semana anterior). Ex: -10 a +10.",
            },
            ajuste_cardio: {
              type: "number",
              description: "Ajuste de cardio (minutos/semana adicionais ou cortados). Ex: -60 a +120.",
            },
            ajustes_proxima_semana: {
              type: "object",
              properties: {
                nutricao: { type: "string" },
                treino: { type: "string" },
                cardio: { type: "string" },
                recovery: { type: "string" },
                posing: { type: "string" },
                farma: { type: "string" },
              },
              required: ["nutricao", "treino", "cardio", "recovery", "posing"],
            },
            alertas: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  nivel: { type: "string", enum: ["info", "atencao", "critico"] },
                  titulo: { type: "string" },
                  detalhe: { type: "string" },
                },
                required: ["nivel", "titulo", "detalhe"],
              },
            },
          },
          required: [
            "analise_semana", "taxa_perda_real_pct", "status_geral",
            "ajuste_calorico", "ajuste_volume", "ajuste_cardio",
            "ajustes_proxima_semana", "alertas",
          ],
        },
      },
    };

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          {
            role: "system",
            content: "Você é APEX Elite Coach: bodybuilding competitivo de nível mundial. Decisões cirúrgicas, baseadas em evidência. Priorize preservação de massa magra e segurança hormonal/metabólica. Para o pré-peak/peak week seja conservador; para off-season agressivo no estímulo.",
          },
          { role: "user", content: geminiPrompt },
        ],
        tools: [tool],
        tool_choice: { type: "function", function: { name: "competition_adjustments" } },
      }),
    });

    if (!aiRes.ok) {
      const t = await aiRes.text();
      console.error("Gemini error:", aiRes.status, t);
      if (aiRes.status === 429) return json({ error: "Rate limit. Tente novamente em instantes." }, 429);
      if (aiRes.status === 402) return json({ error: "Créditos esgotados. Adicione em Settings > Workspace > Usage." }, 402);
      return json({ error: "AI gateway error" }, 500);
    }

    const aiData = await aiRes.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) return json({ error: "no tool call" }, 500);

    const result = JSON.parse(toolCall.function.arguments);

    // 5) Persist into weekly log
    await supabase
      .from("competition_weekly_logs")
      .update({
        analise_semana: result.analise_semana,
        ajuste_calorico: Math.round(result.ajuste_calorico),
        ajuste_volume: Math.round(result.ajuste_volume),
        ajuste_cardio: Math.round(result.ajuste_cardio),
        ajustes_proxima_semana: result.ajustes_proxima_semana,
        alertas: result.alertas,
      })
      .eq("id", weekly_log_id);

    return json({
      success: true,
      analise: result,
      evidencia,
      citations,
    });
  } catch (e) {
    console.error("analyze-competition-checkin error:", e);
    return json({ error: e instanceof Error ? e.message : "Unknown" }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
