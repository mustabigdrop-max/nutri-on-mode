import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Não autenticado" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Não autenticado" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { invite_token } = await req.json();

    if (!invite_token) {
      return new Response(
        JSON.stringify({ error: "Token de convite não fornecido" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate invite
    const { data: invite, error: inviteError } = await supabaseAdmin
      .from("coach_convites")
      .select("*")
      .eq("token", invite_token)
      .eq("usado", false)
      .single();

    if (inviteError || !invite) {
      return new Response(
        JSON.stringify({ error: "Convite inválido ou já utilizado" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check expiry
    if (new Date(invite.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: "Convite expirado. Solicite um novo ao seu coach." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get coach profile
    const { data: coachProfile } = await supabaseAdmin
      .from("coach_profiles")
      .select("*")
      .eq("user_id", invite.coach_id)
      .single();

    if (!coachProfile) {
      return new Response(
        JSON.stringify({ error: "Coach não encontrado" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check slots
    if ((coachProfile.alunos_ativos ?? 0) >= (coachProfile.max_alunos ?? 10)) {
      return new Response(
        JSON.stringify({ error: "O coach atingiu o limite de alunos do plano." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check user is not already linked
    const { data: existingProfile } = await supabaseAdmin
      .from("profiles")
      .select("role, coach_profile_id")
      .eq("user_id", user.id)
      .single();

    if (existingProfile?.role === "aluno_coach") {
      return new Response(
        JSON.stringify({ error: "Você já está vinculado a um coach." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Link student to coach
    await supabaseAdmin
      .from("profiles")
      .update({
        role: "aluno_coach",
        coach_profile_id: coachProfile.id,
        plano_atual: "ON +",
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    // Mark invite as used
    await supabaseAdmin
      .from("coach_convites")
      .update({ usado: true, aluno_id: user.id })
      .eq("id", invite.id);

    // Increment alunos_ativos
    await supabaseAdmin
      .from("coach_profiles")
      .update({ alunos_ativos: (coachProfile.alunos_ativos ?? 0) + 1 })
      .eq("id", coachProfile.id);

    // Add to coach_patients
    await supabaseAdmin.from("coach_patients").insert({
      coach_id: coachProfile.id,
      patient_user_id: user.id,
      status: "active",
    });

    return new Response(
      JSON.stringify({
        success: true,
        coach_name: coachProfile.professional_name || "Seu Coach",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Erro interno ao processar convite" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
