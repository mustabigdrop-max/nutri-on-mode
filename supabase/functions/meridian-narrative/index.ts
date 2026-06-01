// MERIDIAN Bloco 9 — Narrativa SITREP via Lovable AI (Gemini 2.5 Flash).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `Você é o oficial-tático do MERIDIAN, um sistema de preparação para fisiculturistas.
Sua linguagem é SITREP militar curta, em PT-BR, sem emojis.
Formato obrigatório:

SITREP // SEMANA <n>
STATUS: <VERDE|AMARELO|VERMELHO>
ALVO: <peso/bf de palco> em <X semanas>
PROGRESSO: 1-2 linhas sobre delta peso, aderência, treino/cardio.
RISCOS: 1-2 linhas com riscos críticos ou "nenhum risco crítico".
ORDEM TÁTICA: 2-3 bullets imperativos para a próxima semana.

Regras invioláveis:
- Nunca prescrever medicamentos, hormônios, peptídeos ou doses farmacológicas.
- Se houver flag de RED-S (amenorreia >2 meses) ou perda >1.2%/sem, ordenar pausa + reavaliação.
- Atleta NATURAL: nunca sugerir AAS/SARMs; reforçar drug-test compliance.
- Atleta LIFESTYLE: priorizar sustentabilidade e adesão > shape extremo.
- Não inventar números: use apenas o que está no contexto.`;

interface Payload {
  plan_id: string;
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

    const { plan_id } = (await req.json()) as Payload;
    if (!plan_id) throw new Error("plan_id obrigatório");

    // Buscar plano + competição + checkpoints recentes
    const [{ data: plan }, { data: checkpoints }] = await Promise.all([
      supabase.from("meridian_plans").select("*, meridian_competitions(*)").eq("id", plan_id).eq("user_id", user.id).maybeSingle(),
      supabase.from("meridian_checkpoints").select("*").eq("plan_id", plan_id).order("checkpoint_date", { ascending: false }).limit(4),
    ]);

    if (!plan) {
      return new Response(JSON.stringify({ error: "plan not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const comp = (plan as any).meridian_competitions;
    const track = plan?.calculation_inputs?.athlete_snapshot?.athlete_track ?? "ENHANCED";
    const sex = plan?.calculation_inputs?.athlete_snapshot?.biological_sex ?? "MALE";

    const today = new Date().toISOString().slice(0, 10);
    const daysToStage = Math.max(
      Math.round((new Date(comp.competition_date).getTime() - new Date(today).getTime()) / 86400000),
      0,
    );
    const weeksToStage = Math.floor(daysToStage / 7);

    const ctx = {
      track,
      sex,
      competition: { name: comp.name, federation: comp.federation, date: comp.competition_date, category: comp.category },
      targets: { weight: plan.stage_target_weight_kg, bf: plan.stage_target_bf_percent },
      viability: plan.viability_status,
      buffer_weeks: plan.buffer_weeks,
      weeks_to_stage: weeksToStage,
      warnings: plan.warnings ?? [],
      recent_checkpoints: (checkpoints ?? []).map((c: any) => ({
        date: c.checkpoint_date,
        weight: c.weight_kg,
        bf: c.bf_percent,
        adherence: c.adherence_score,
        notes: c.notes,
        flags: c.flags,
      })),
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
          { role: "user", content: `Gere o SITREP semanal com base neste contexto JSON:\n${JSON.stringify(ctx, null, 2)}` },
        ],
        temperature: 0.4,
      }),
    });

    if (!aiRes.ok) {
      const text = await aiRes.text();
      if (aiRes.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições atingido. Tente em alguns minutos." }), {
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
    const narrative = aiData?.choices?.[0]?.message?.content ?? "";

    return new Response(JSON.stringify({ narrative, context: ctx }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("[meridian-narrative]", e);
    return new Response(JSON.stringify({ error: e?.message ?? "unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
