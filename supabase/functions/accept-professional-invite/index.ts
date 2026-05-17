import { createClient } from "npm:@supabase/supabase-js@2.45.0";

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
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Não autenticado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const jwt = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await admin.auth.getUser(jwt);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Não autenticado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { invite_code } = await req.json();
    if (!invite_code || typeof invite_code !== "string") {
      return new Response(JSON.stringify({ error: "Código inválido" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: invite, error: invErr } = await admin
      .from("professional_invites")
      .select("*")
      .eq("invite_code", invite_code)
      .eq("status", "pending")
      .maybeSingle();

    if (invErr || !invite) {
      return new Response(
        JSON.stringify({ error: "Convite inválido ou já utilizado" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (new Date(invite.expires_at) < new Date()) {
      await admin
        .from("professional_invites")
        .update({ status: "expired" })
        .eq("id", invite.id);
      return new Response(
        JSON.stringify({ error: "Convite expirado. Solicite um novo ao seu profissional." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: coachProfile } = await admin
      .from("coach_profiles")
      .select("*")
      .eq("id", invite.coach_profile_id)
      .single();

    if (!coachProfile) {
      return new Response(
        JSON.stringify({ error: "Profissional não encontrado" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: existingProfile } = await admin
      .from("profiles")
      .select("role, coach_profile_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (existingProfile?.role === "aluno_coach" && existingProfile?.coach_profile_id) {
      return new Response(
        JSON.stringify({ error: "Você já está vinculado a um profissional." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Link
    await admin
      .from("profiles")
      .update({
        role: "aluno_coach",
        coach_profile_id: coachProfile.id,
        plano_atual: "ON +",
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    await admin
      .from("professional_invites")
      .update({
        status: "accepted",
        accepted_by_user_id: user.id,
        accepted_at: new Date().toISOString(),
      })
      .eq("id", invite.id);

    await admin
      .from("coach_profiles")
      .update({ alunos_ativos: (coachProfile.alunos_ativos ?? 0) + 1 })
      .eq("id", coachProfile.id);

    await admin.from("coach_patients").insert({
      coach_id: coachProfile.id,
      patient_user_id: user.id,
      status: "active",
    });

    // Notify coach
    await admin.from("notifications").insert({
      user_id: coachProfile.user_id,
      type: "invite_accepted",
      title: "Novo cliente vinculado",
      body: `${user.email} aceitou seu convite.`,
      action_url: "/coach/dashboard",
      metadata: { patient_user_id: user.id, invite_id: invite.id },
    });

    return new Response(
      JSON.stringify({
        success: true,
        coach_name: coachProfile.professional_name || "Seu Profissional",
        professional_type: coachProfile.professional_type,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("accept-professional-invite error", err);
    return new Response(
      JSON.stringify({ error: "Erro interno ao processar convite" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
