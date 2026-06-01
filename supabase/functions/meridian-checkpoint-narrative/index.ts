// MERIDIAN — Análise narrativa por checkpoint (Gemini 2.5 Flash via Lovable AI).
// Gera assessment estruturado (status / progresso / ajustes / alertas) e persiste em meridian_weekly_checkpoints.ai_assessment.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `Você é o oficial-tático MERIDIAN analisando UM checkpoint semanal de um fisiculturista em prep.
Linguagem SITREP militar curta, PT-BR, sem emojis, sem floreio.

Avalie o checkpoint atual em relação ao anterior (se houver) e ao alvo de palco.
Classifique STATUS:
- VERDE: progresso na taxa-alvo, sem flags
- AMARELO: desvio leve (perda <0.4%/sem ou aderência <80% OU 1 marker subótimo)
- VERMELHO: perda >1.2%/sem, RED-S (amenorreia >2 meses), aderência <60%, ou energia/sono <4

Regras invioláveis:
- NUNCA prescrever medicamentos, hormônios, peptídeos, AAS, SARMs, doses farmacológicas.
- Atleta NATURAL: reforce drug-test compliance, jamais sugerir ergogênicos proibidos.
- Atleta LIFESTYLE: priorize sustentabilidade > shape extremo.
- Mulher com flag RED-S: ordene pausa + reavaliação clínica.
- Use apenas números do contexto. Não invente dados.

Responda SEMPRE via tool call "checkpoint_assessment".`;

const TOOL = {
  type: "function" as const,
  function: {
    name: "checkpoint_assessment",
    description: "Análise tática de um checkpoint MERIDIAN.",
    parameters: {
      type: "object",
      properties: {
        status: { type: "string", enum: ["VERDE", "AMARELO", "VERMELHO"] },
        headline: { type: "string", description: "1 linha resumindo o estado tático." },
        progresso: { type: "string", description: "1-2 linhas: delta peso, aderência, tendência vs alvo." },
        ajustes: {
          type: "array",
          items: { type: "string" },
          description: "1-3 ordens táticas imperativas para a próxima semana (sem prescrição médica).",
        },
        alertas: {
          type: "array",
          items: { type: "string" },
          description: "0-3 riscos críticos detectados. Vazio se nenhum.",
        },
      },
      required: ["status", "headline", "progresso", "ajustes", "alertas"],
      additionalProperties: false,
    },
  },
};

interface Payload {
  checkpoint_id: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY ausente.");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "missing auth" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { checkpoint_id } = (await req.json()) as Payload;
    if (!checkpoint_id) throw new Error("checkpoint_id obrigatório");

    const { data: cp, error: cpErr } = await supabase
      .from("meridian_weekly_checkpoints")
      .select("*")
      .eq("id", checkpoint_id)
      .eq("user_id", user.id)
      .maybeSingle();
    if (cpErr) throw cpErr;
    if (!cp) {
      return new Response(JSON.stringify({ error: "checkpoint not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const [{ data: plan }, { data: prevCps }, { data: adj }] = await Promise.all([
      supabase
        .from("meridian_plans")
        .select("*, meridian_competitions(*)")
        .eq("id", cp.plan_id)
        .maybeSingle(),
      supabase
        .from("meridian_weekly_checkpoints")
        .select("checkpoint_date, weight_kg, bf_percent, adherence_pct, energy_level, sleep_quality")
        .eq("plan_id", cp.plan_id)
        .lt("checkpoint_date", cp.checkpoint_date)
        .order("checkpoint_date", { ascending: false })
        .limit(3),
      supabase
        .from("meridian_plan_adjustments")
        .select("adjustment_type, kcal_delta, cardio_delta_min, reason")
        .eq("checkpoint_id", checkpoint_id)
        .maybeSingle(),
    ]);

    const comp = (plan as any)?.meridian_competitions ?? {};
    const track = (plan as any)?.calculation_inputs?.athlete_snapshot?.athlete_track ?? "ENHANCED";
    const sex = (plan as any)?.calculation_inputs?.athlete_snapshot?.biological_sex ?? "MALE";

    const today = cp.checkpoint_date;
    const daysToStage = comp?.competition_date
      ? Math.max(
          Math.round(
            (new Date(comp.competition_date).getTime() - new Date(today).getTime()) / 86400000,
          ),
          0,
        )
      : null;

    const prev = (prevCps ?? [])[0];
    const deltaWeight =
      prev?.weight_kg && cp.weight_kg ? Number((cp.weight_kg - prev.weight_kg).toFixed(2)) : null;
    const deltaPct =
      prev?.weight_kg && cp.weight_kg
        ? Number((((cp.weight_kg - prev.weight_kg) / prev.weight_kg) * 100).toFixed(2))
        : null;

    const ctx = {
      track,
      sex,
      competition: { name: comp?.name, date: comp?.competition_date, category: comp?.category },
      targets: {
        weight_kg: (plan as any)?.stage_target_weight_kg,
        bf_percent: (plan as any)?.stage_target_bf_percent,
      },
      days_to_stage: daysToStage,
      weeks_to_stage: daysToStage != null ? Math.floor(daysToStage / 7) : null,
      current_checkpoint: {
        date: cp.checkpoint_date,
        phase: cp.current_phase,
        week_number: cp.week_number,
        weight_kg: cp.weight_kg,
        bf_percent: cp.bf_percent,
        waist_cm: cp.waist_cm,
        energy: cp.energy_level,
        hunger: cp.hunger_level,
        sleep: cp.sleep_quality,
        training: cp.training_performance,
        mood: cp.mood,
        adherence_pct: cp.adherence_pct,
        notes: cp.notes,
      },
      previous_checkpoints: prevCps ?? [],
      delta_weight_kg: deltaWeight,
      delta_weight_pct_week: deltaPct,
      auto_adjustment: adj ?? null,
      plan_warnings: (plan as any)?.warnings ?? [],
    };

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `Analise este checkpoint MERIDIAN e responda via tool call:\n${JSON.stringify(ctx, null, 2)}`,
          },
        ],
        tools: [TOOL],
        tool_choice: { type: "function", function: { name: "checkpoint_assessment" } },
        temperature: 0.3,
      }),
    });

    if (!aiRes.ok) {
      const text = await aiRes.text();
      if (aiRes.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições atingido. Tente em alguns minutos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      if (aiRes.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos Lovable AI esgotados." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway ${aiRes.status}: ${text}`);
    }

    const aiData = await aiRes.json();
    const toolCall = aiData?.choices?.[0]?.message?.tool_calls?.[0];
    let assessment: any = null;
    if (toolCall?.function?.arguments) {
      try {
        assessment = JSON.parse(toolCall.function.arguments);
      } catch {
        assessment = null;
      }
    }
    if (!assessment) {
      throw new Error("Resposta da IA inválida.");
    }

    const payload = {
      ...assessment,
      generated_at: new Date().toISOString(),
      model: "google/gemini-2.5-flash",
      context_summary: {
        delta_weight_kg: deltaWeight,
        delta_weight_pct_week: deltaPct,
        days_to_stage: daysToStage,
        track,
        sex,
      },
    };

    await supabase
      .from("meridian_weekly_checkpoints")
      .update({ ai_assessment: payload, updated_at: new Date().toISOString() })
      .eq("id", checkpoint_id)
      .eq("user_id", user.id);

    return new Response(JSON.stringify({ assessment: payload }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("[meridian-checkpoint-narrative]", e);
    return new Response(JSON.stringify({ error: e?.message ?? "unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
