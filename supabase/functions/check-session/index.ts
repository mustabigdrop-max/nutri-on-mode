import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { guard } from "../_shared/auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Requires a valid auth JWT — the partner is resolved from the caller's own
    // identity, never from a client-supplied partner_id.
    const g = await guard(req, corsHeaders);
    if ("response" in g) return g.response;

    const { session_token, ip } = await req.json();
    if (!session_token || typeof session_token !== "string" || session_token.length > 200) {
      return json({ error: "session_token inválido" }, 400);
    }
    const ipAddress =
      typeof ip === "string" && ip.length <= 64
        ? ip
        : req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: partner } = await supabase
      .from("partners")
      .select("id, full_name")
      .eq("user_id", g.userId)
      .maybeSingle();

    if (!partner) return json({ error: "Forbidden" }, 403);

    const partner_id = partner.id;

    // Get all active sessions for this partner
    const { data: sessions } = await supabase
      .from("partner_sessions")
      .select("*")
      .eq("partner_id", partner_id);

    const otherSessions =
      sessions?.filter((s: any) => s.session_token !== session_token) ?? [];

    if (otherSessions.length > 0) {
      // Block the partner
      await supabase
        .from("partners")
        .update({ status: "blocked" })
        .eq("id", partner_id);

      await supabase.from("session_alerts").insert({
        partner_id,
        partner_name: partner.full_name,
        sessions_count: otherSessions.length + 1,
        ips: [...otherSessions.map((s: any) => s.ip_address), ipAddress],
        action_taken: "pending",
      });

      return json({ allowed: false, reason: "session_duplicate" });
    }

    // Upsert current session
    await supabase.from("partner_sessions").upsert(
      {
        partner_id,
        session_token,
        ip_address: ipAddress,
        last_active: new Date().toISOString(),
      },
      { onConflict: "session_token" }
    );

    return json({ allowed: true });
  } catch (error) {
    console.error("check-session error", error);
    return json({ error: "Erro interno" }, 500);
  }
});
