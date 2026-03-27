import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { partner_id, session_token, ip } = await req.json();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

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

      // Log the alert
      const { data: partner } = await supabase
        .from("partners")
        .select("full_name")
        .eq("id", partner_id)
        .single();

      await supabase.from("session_alerts").insert({
        partner_id,
        partner_name: partner?.full_name,
        sessions_count: otherSessions.length + 1,
        ips: [...otherSessions.map((s: any) => s.ip_address), ip],
        action_taken: "pending",
      });

      return new Response(
        JSON.stringify({ allowed: false, reason: "session_duplicate" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Upsert current session
    await supabase.from("partner_sessions").upsert(
      {
        partner_id,
        session_token,
        ip_address: ip,
        last_active: new Date().toISOString(),
      },
      { onConflict: "session_token" }
    );

    return new Response(JSON.stringify({ allowed: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
