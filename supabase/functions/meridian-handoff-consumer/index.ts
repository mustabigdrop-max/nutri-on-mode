// MERIDIAN — Handoff Consumer
// Reads pending handoffs for a given user+module and returns AI-ready context.
// Optionally auto-marks them as "applied" when consumed.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const VALID_MODULES = ["nutriplan", "trainingon", "dr_vertex", "mce", "apex"];

interface HandoffRow {
  id: string;
  plan_id: string;
  competition_id: string;
  target_module: string;
  phase: string;
  payload: {
    module: string;
    module_label: string;
    headline: string;
    bullets: string[];
    metrics: Record<string, string | number>;
  };
  status: string;
  created_at: string;
}

function formatForPrompt(rows: HandoffRow[]): string {
  if (rows.length === 0) return "";
  const blocks = rows.map((r) => {
    const m = Object.entries(r.payload.metrics || {})
      .map(([k, v]) => `  - ${k}: ${v}`)
      .join("\n");
    return `### ${r.payload.module_label} · Fase ${r.phase}
**${r.payload.headline}**
${r.payload.bullets.map((b) => `- ${b}`).join("\n")}
${m ? `\nMétricas:\n${m}` : ""}`;
  });
  return `\n\n==== CONTEXTO MERIDIAN (handoffs ativos) ====\n${blocks.join("\n\n")}\n==== FIM CONTEXTO MERIDIAN ====\n`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing auth" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ error: "Invalid auth" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const callerId = userData.user.id;
    const body = await req.json().catch(() => ({}));
    const module: string | undefined = body.module;
    const patientUserId: string | undefined = body.patient_user_id;
    const autoApply: boolean = body.auto_apply === true;

    if (!module || !VALID_MODULES.includes(module)) {
      return new Response(JSON.stringify({ error: "Invalid module" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let targetUserId = callerId;
    if (patientUserId && patientUserId !== callerId) {
      const { data: isCoach } = await admin.rpc("is_coach_of_patient", {
        _coach_user_id: callerId,
        _patient_user_id: patientUserId,
      });
      if (!isCoach) {
        return new Response(JSON.stringify({ error: "No active coach-patient link" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      targetUserId = patientUserId;
    }

    const { data: rows, error: rowsErr } = await admin
      .from("meridian_handoffs")
      .select("id, plan_id, competition_id, target_module, phase, payload, status, created_at")
      .eq("user_id", targetUserId)
      .eq("target_module", module)
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(5);

    if (rowsErr) {
      return new Response(JSON.stringify({ error: rowsErr.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const handoffs = (rows as HandoffRow[]) || [];
    const promptContext = formatForPrompt(handoffs);

    if (autoApply && handoffs.length > 0) {
      const ids = handoffs.map((h) => h.id);
      await admin
        .from("meridian_handoffs")
        .update({ status: "applied", applied_at: new Date().toISOString() })
        .in("id", ids);
    }

    return new Response(
      JSON.stringify({
        module,
        count: handoffs.length,
        handoffs,
        prompt_context: promptContext,
        auto_applied: autoApply && handoffs.length > 0,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
