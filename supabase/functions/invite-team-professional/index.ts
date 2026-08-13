import { createClient } from "npm:@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const ROLE_LABEL: Record<string, string> = {
  nutricionista: "Nutricionista",
  personal_trainer: "Personal Trainer",
  medico_esportivo: "Médico do Esporte",
  nutrologo: "Nutrólogo",
  fisioterapeuta: "Fisioterapeuta",
  psicologo: "Psicólogo",
  coach_esportivo: "Coach Esportivo",
  preparador_fisico: "Preparador Físico",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const authHeader = req.headers.get("authorization");
    if (!authHeader) return json({ error: "Não autenticado" }, 401);
    const { data: { user }, error: authError } = await admin.auth.getUser(authHeader.replace("Bearer ", ""));
    if (authError || !user) return json({ error: "Não autenticado" }, 401);

    const { patient_id, email, professional_role, message } = await req.json();
    if (!patient_id || !email || !professional_role || !ROLE_LABEL[professional_role]) {
      return json({ error: "Dados do convite inválidos" }, 400);
    }
    const normalizedEmail = String(email).trim().toLowerCase();

    // Autorização: quem convida deve ser membro ativo da equipe OU coach do paciente
    const { data: membership } = await admin
      .from("patient_team")
      .select("id, professional_role")
      .eq("patient_id", patient_id)
      .eq("professional_id", user.id)
      .eq("status", "active")
      .maybeSingle();

    let inviterRole = membership?.professional_role as string | undefined;

    if (!membership) {
      const { data: isCoach } = await admin.rpc("is_coach_of_patient", {
        _coach_user_id: user.id,
        _patient_user_id: patient_id,
      });
      if (!isCoach) return json({ error: "Você não faz parte da equipe deste paciente" }, 403);

      // Auto-cadastra o profissional principal na equipe
      const { data: inviterProfile } = await admin
        .from("profiles")
        .select("professional_type, professional_role")
        .eq("user_id", user.id)
        .maybeSingle();
      const legacy = inviterProfile?.professional_type;
      inviterRole = (inviterProfile?.professional_role as string) ||
        (legacy === "personal_trainer" ? "personal_trainer"
          : legacy === "medico" ? "medico_esportivo"
          : legacy === "bodybuilding_coach" ? "coach_esportivo"
          : "nutricionista");

      await admin.from("patient_team").upsert({
        patient_id,
        professional_id: user.id,
        professional_role: inviterRole,
        status: "active",
        invited_by: user.id,
        patient_consent: true,
        patient_consent_at: new Date().toISOString(),
        accepted_at: new Date().toISOString(),
      }, { onConflict: "patient_id,professional_id" });
    }

    // Resolver profissional convidado pelo email
    const { data: invitee } = await admin
      .from("profiles")
      .select("user_id, full_name")
      .ilike("email", normalizedEmail)
      .maybeSingle();

    if (!invitee) {
      return json({ error: "Nenhum profissional cadastrado no nutriON com esse email. Peça para ele criar a conta primeiro." }, 404);
    }
    if (invitee.user_id === patient_id) return json({ error: "O paciente não pode ser convidado como profissional" }, 400);

    const { data: existing } = await admin
      .from("patient_team")
      .select("id, status")
      .eq("patient_id", patient_id)
      .eq("professional_id", invitee.user_id)
      .maybeSingle();

    if (existing && existing.status === "active") {
      return json({ error: "Este profissional já faz parte da equipe" }, 400);
    }

    const payload = {
      patient_id,
      professional_id: invitee.user_id,
      professional_role,
      status: "pending",
      invited_by: user.id,
      invite_message: message || null,
      patient_consent: false,
    };

    if (existing) {
      await admin.from("patient_team").update(payload).eq("id", existing.id);
    } else {
      const { error: insErr } = await admin.from("patient_team").insert(payload);
      if (insErr) return json({ error: insErr.message }, 400);
    }

    const { data: inviterProfile } = await admin
      .from("profiles")
      .select("full_name")
      .eq("user_id", user.id)
      .maybeSingle();
    const inviterName = inviterProfile?.full_name || "Um profissional";
    const roleLabel = ROLE_LABEL[professional_role];

    const { data: patientProfile } = await admin
      .from("profiles")
      .select("full_name")
      .eq("user_id", patient_id)
      .maybeSingle();
    const patientName = patientProfile?.full_name || "seu paciente";

    // Notificar profissional convidado
    await admin.from("notifications").insert({
      user_id: invitee.user_id,
      type: "team_invite",
      title: "Convite para equipe profissional",
      body: `${inviterName} convidou você para acompanhar ${patientName} como ${roleLabel}.`,
      action_url: "/coach/equipe",
      metadata: { patient_id, professional_role },
    });

    // Notificar paciente para consentimento
    await admin.from("notifications").insert({
      user_id: patient_id,
      type: "team_consent",
      title: "Novo profissional na sua equipe",
      body: `${inviterName} adicionou ${invitee.full_name || "um profissional"} (${roleLabel}) à sua equipe. Autorize o compartilhamento dos seus dados.`,
      action_url: "/minha-equipe",
      metadata: { professional_id: invitee.user_id, professional_role },
    });

    // Timeline
    await admin.from("patient_timeline").insert({
      patient_id,
      actor_id: user.id,
      actor_role: inviterRole ?? null,
      actor_name: inviterName,
      event_type: "team_invite",
      title: `Convite enviado para ${roleLabel}`,
      description: `${invitee.full_name || normalizedEmail} foi convidado para a equipe`,
      data_category: "notes",
    });

    return json({ success: true });
  } catch (err) {
    console.error("invite-team-professional error", err);
    return json({ error: "Erro interno ao enviar convite" }, 500);
  }
});
