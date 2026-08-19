import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const url = Deno.env.get("SUPABASE_URL")!;

    const userClient = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const { participant_id } = await req.json();
    if (!participant_id) {
      return new Response(JSON.stringify({ error: "participant_id required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: participant } = await admin
      .from("challenge_participants")
      .select("id, user_id, full_name, challenge_id, target_kcal, protein_g, carbs_g, fat_g, objetivo")
      .eq("id", participant_id)
      .maybeSingle();

    if (!participant) {
      return new Response(JSON.stringify({ error: "participant not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Authorize: requester must own the challenge (coach) or be an admin.
    const { data: challenge } = await admin
      .from("gym_challenges")
      .select("id, coach_user_id, gym_id")
      .eq("id", participant.challenge_id)
      .maybeSingle();

    const { data: isAdmin } = await admin.rpc("has_role", { _user_id: user.id, _role: "admin" });

    if (!isAdmin && challenge?.coach_user_id !== user.id) {
      return new Response(JSON.stringify({ error: "forbidden" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: coachProfile } = await admin
      .from("coach_profiles")
      .select("id")
      .eq("user_id", challenge?.coach_user_id ?? user.id)
      .maybeSingle();

    await admin.from("profiles").update({
      origin: "challenge",
      migrated_from_challenge: true,
      migrated_at: new Date().toISOString(),
      gym_id: challenge?.gym_id ?? null,
      ...(coachProfile ? { coach_profile_id: coachProfile.id, role: "aluno_coach" } : {}),
    }).eq("user_id", participant.user_id);

    if (coachProfile) {
      await admin.from("coach_patients").upsert({
        coach_id: coachProfile.id,
        patient_user_id: participant.user_id,
        status: "active",
      }, { onConflict: "coach_id,patient_user_id" });
    }

    await admin
      .from("challenge_participants")
      .update({ migrated_to_client: true })
      .eq("id", participant.id);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("challenge-migrate-participant error", e);
    return new Response(JSON.stringify({ error: "internal error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
