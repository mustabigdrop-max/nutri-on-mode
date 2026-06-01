// Shared helper to fetch MERIDIAN handoffs and format them for AI prompt injection.
// Used by: nutri-coach, generate-training-plan, dr-vertex-analyze, mce-agent, apex-agent.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

export type MeridianTargetModule = "nutriplan" | "trainingon" | "dr_vertex" | "mce" | "apex";

interface HandoffRow {
  id: string;
  phase: string;
  payload: {
    module_label: string;
    headline: string;
    bullets: string[];
    metrics: Record<string, string | number>;
  };
}

/**
 * Resolve the target user for MERIDIAN context:
 * - returns patientUserId if caller is an active coach of that patient
 * - otherwise returns the caller's own id
 * - returns null if no caller could be identified
 */
export async function resolveMeridianUserId(
  req: Request,
  patientUserId?: string | null,
): Promise<string | null> {
  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!SUPABASE_URL || !ANON_KEY || !SERVICE_KEY) return null;

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return null;

    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData } = await userClient.auth.getUser();
    const callerId = userData?.user?.id;
    if (!callerId) return null;

    if (!patientUserId || patientUserId === callerId) return callerId;

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data: isCoach } = await admin.rpc("is_coach_of_patient", {
      _coach_user_id: callerId,
      _patient_user_id: patientUserId,
    });
    return isCoach ? patientUserId : callerId;
  } catch {
    return null;
  }
}

/**
 * Fetch pending MERIDIAN handoffs for the given user+module and return a
 * markdown block ready to be appended to a system prompt.
 *
 * - Safe by default: silently returns "" on any error (never blocks AI flows).
 * - If `autoApply` is true, found handoffs are marked as "applied".
 */
export async function fetchMeridianContext(
  userId: string | null,
  module: MeridianTargetModule,
  opts: { autoApply?: boolean } = {},
): Promise<string> {
  try {
    if (!userId) return "";
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!SUPABASE_URL || !SERVICE_KEY) return "";

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data, error } = await admin
      .from("meridian_handoffs")
      .select("id, phase, payload")
      .eq("user_id", userId)
      .eq("target_module", module)
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(3);

    if (error || !data || data.length === 0) return "";

    const rows = data as HandoffRow[];
    const blocks = rows.map((r) => {
      const metrics = Object.entries(r.payload.metrics || {})
        .map(([k, v]) => `  - ${k}: ${v}`)
        .join("\n");
      return `### ${r.payload.module_label} · Fase ${r.phase}
**${r.payload.headline}**
${r.payload.bullets.map((b) => `- ${b}`).join("\n")}
${metrics ? `\nMétricas:\n${metrics}` : ""}`;
    });

    if (opts.autoApply) {
      const ids = rows.map((r) => r.id);
      await admin
        .from("meridian_handoffs")
        .update({ status: "applied", applied_at: new Date().toISOString() })
        .in("id", ids);
    }

    return `\n\n==== CONTEXTO MERIDIAN (handoffs ativos do preparador) ====
Estas diretrizes vêm do plano de competição MERIDIAN do atleta. Respeite-as como
restrições de alto nível ao gerar recomendações deste módulo.

${blocks.join("\n\n")}
==== FIM CONTEXTO MERIDIAN ====
`;
  } catch (e) {
    console.warn("[meridian-context] fetch failed:", e);
    return "";
  }
}

/**
 * Convenience: resolve user + fetch context in one call.
 */
export async function buildMeridianPromptBlock(
  req: Request,
  module: MeridianTargetModule,
  patientUserId?: string | null,
): Promise<string> {
  const uid = await resolveMeridianUserId(req, patientUserId);
  return fetchMeridianContext(uid, module);
}
