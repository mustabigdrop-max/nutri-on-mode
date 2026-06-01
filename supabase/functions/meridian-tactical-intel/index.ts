// MERIDIAN — Tactical Intel Briefing (Drug Tests + Multi-Show + Recovery).
// Gera 3 análises operacionais agregadas via Gemini 2.5 Flash.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `Você é o oficial-tático MERIDIAN gerando um briefing operacional consolidado para um fisiculturista.
Linguagem SITREP militar curta, PT-BR, sem emojis, sem floreio.

Avalie 3 frentes táticas:
1. DRUG_TESTS (compliance antidoping para federações naturais)
2. MULTI_SHOW (viabilidade de encadear shows secundários)
3. RECOVERY (reverse diet + deload pós-palco)

Regras invioláveis:
- NUNCA prescrever medicamentos, hormônios, peptídeos, AAS, SARMs.
- Atleta NATURAL: zero tolerância a substâncias proibidas; reforce washout adequado de suplementos suspeitos.
- Gap entre shows <14d com peak harder = AMARELO/VERMELHO.
- Recovery <4 semanas pós-show = risco binge/rebote → AMARELO.
- RED-S ou sex=FEMALE com flags → priorizar saúde > shape.

Responda SEMPRE via tool call "tactical_briefing".`;

const TOOL = {
  type: "function" as const,
  function: {
    name: "tactical_briefing",
    description: "Briefing tático MERIDIAN consolidado.",
    parameters: {
      type: "object",
      properties: {
        drug_tests: {
          type: "object",
          properties: {
            status: { type: "string", enum: ["VERDE", "AMARELO", "VERMELHO", "NA"] },
            headline: { type: "string" },
            ordens: { type: "array", items: { type: "string" }, description: "1-3 ordens táticas." },
            alertas: { type: "array", items: { type: "string" } },
          },
          required: ["status", "headline", "ordens", "alertas"],
          additionalProperties: false,
        },
        multi_show: {
          type: "object",
          properties: {
            status: { type: "string", enum: ["VERDE", "AMARELO", "VERMELHO", "NA"] },
            headline: { type: "string" },
            ordens: { type: "array", items: { type: "string" } },
            alertas: { type: "array", items: { type: "string" } },
          },
          required: ["status", "headline", "ordens", "alertas"],
          additionalProperties: false,
        },
        recovery: {
          type: "object",
          properties: {
            status: { type: "string", enum: ["VERDE", "AMARELO", "VERMELHO", "NA"] },
            headline: { type: "string" },
            ordens: { type: "array", items: { type: "string" } },
            alertas: { type: "array", items: { type: "string" } },
          },
          required: ["status", "headline", "ordens", "alertas"],
          additionalProperties: false,
        },
      },
      required: ["drug_tests", "multi_show", "recovery"],
      additionalProperties: false,
    },
  },
};

interface Payload {
  plan_id: string;
  competition_id: string;
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

    const { plan_id, competition_id } = (await req.json()) as Payload;
    if (!plan_id || !competition_id) throw new Error("plan_id e competition_id obrigatórios");

    const [
      { data: plan },
      { data: comp },
      { data: drugTests },
      { data: chains },
      { data: recovery },
      { data: allComps },
    ] = await Promise.all([
      supabase.from("meridian_plans").select("*").eq("id", plan_id).maybeSingle(),
      supabase.from("meridian_competitions").select("*").eq("id", competition_id).maybeSingle(),
      supabase.from("meridian_drug_tests" as any).select("*").eq("user_id", user.id).eq("competition_id", competition_id),
      supabase.from("meridian_multi_show_chains" as any).select("*").eq("primary_competition_id", competition_id),
      supabase.from("meridian_post_stage_recovery" as any).select("*").eq("plan_id", plan_id).eq("competition_id", competition_id).maybeSingle(),
      supabase.from("meridian_competitions").select("*").eq("user_id", user.id),
    ]);

    const track = (plan as any)?.calculation_inputs?.athlete_snapshot?.athlete_track ?? "ENHANCED";
    const sex = (plan as any)?.calculation_inputs?.athlete_snapshot?.biological_sex ?? "MALE";

    const ctx = {
      track,
      sex,
      competition: comp,
      plan_targets: {
        weight_kg: (plan as any)?.stage_target_weight_kg,
        bf_percent: (plan as any)?.stage_target_bf_percent,
        peak_week_start: (plan as any)?.peak_week_start_date,
      },
      drug_tests: drugTests ?? [],
      multi_show_chains: (chains ?? []).map((c: any) => ({
        secondary_id: c.secondary_competition_id,
        secondary_name: (allComps ?? []).find((x: any) => x.id === c.secondary_competition_id)?.name,
        gap_days: c.gap_days,
        strategy: c.strategy,
        mini_refeed_days: c.mini_refeed_days,
        viability: c.viability_status,
        warnings: c.warnings,
      })),
      recovery: recovery ?? null,
    };

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `Gere o briefing tático MERIDIAN consolidado para este atleta:\n${JSON.stringify(ctx, null, 2)}` },
        ],
        tools: [TOOL],
        tool_choice: { type: "function", function: { name: "tactical_briefing" } },
        temperature: 0.3,
      }),
    });

    if (!aiRes.ok) {
      const text = await aiRes.text();
      if (aiRes.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições atingido." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
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
    let briefing: any = null;
    if (toolCall?.function?.arguments) {
      try { briefing = JSON.parse(toolCall.function.arguments); } catch { briefing = null; }
    }
    if (!briefing) throw new Error("Resposta da IA inválida.");

    return new Response(
      JSON.stringify({
        briefing: {
          ...briefing,
          generated_at: new Date().toISOString(),
          model: "google/gemini-2.5-flash",
        },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e: any) {
    console.error("[meridian-tactical-intel]", e);
    return new Response(JSON.stringify({ error: e?.message ?? "unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
