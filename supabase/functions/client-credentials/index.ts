import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "npm:zod";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const BodySchema = z.object({
  action: z.enum(["reset", "mark_welcome"]),
  client_id: z.string().uuid(),
});

const genPassword = () => `nutrion${Math.floor(1000 + Math.random() * 9000)}`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const token = authHeader.replace("Bearer ", "");

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims?.sub) return json({ error: "Unauthorized" }, 401);
    const callerId = claimsData.claims.sub as string;

    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return json({ error: Object.values(parsed.error.flatten().fieldErrors).flat()[0] ?? "Dados inválidos" }, 400);
    }
    const { action, client_id } = parsed.data;

    const admin = createClient(supabaseUrl, serviceRoleKey);

    // Autorização: coach do paciente ou admin
    const [{ data: isCoach }, { data: isAdmin }] = await Promise.all([
      admin.rpc("is_coach_of_patient", { _coach_user_id: callerId, _patient_user_id: client_id }),
      admin.rpc("has_role", { _user_id: callerId, _role: "admin" }),
    ]);
    if (!isCoach && !isAdmin) return json({ error: "Sem permissão sobre este cliente." }, 403);

    const { data: profile } = await admin
      .from("profiles")
      .select("email")
      .eq("user_id", client_id)
      .maybeSingle();

    if (action === "mark_welcome") {
      const { error } = await admin.from("client_credentials").upsert(
        {
          client_id,
          email: profile?.email ?? "",
          temp_password: "",
          welcome_sent: true,
          welcome_sent_at: new Date().toISOString(),
        },
        { onConflict: "client_id", ignoreDuplicates: false },
      );
      if (error) {
        // Se já existe, apenas atualiza os campos de boas-vindas
        const { error: updErr } = await admin
          .from("client_credentials")
          .update({ welcome_sent: true, welcome_sent_at: new Date().toISOString() })
          .eq("client_id", client_id);
        if (updErr) return json({ error: updErr.message }, 500);
      }
      return json({ ok: true });
    }

    // action === "reset"
    const newPassword = genPassword();
    const { error: authErr } = await admin.auth.admin.updateUserById(client_id, { password: newPassword });
    if (authErr) return json({ error: authErr.message || "Não foi possível resetar a senha." }, 400);

    const { data: existing } = await admin
      .from("client_credentials")
      .select("id")
      .eq("client_id", client_id)
      .maybeSingle();

    if (existing?.id) {
      await admin
        .from("client_credentials")
        .update({ temp_password: newPassword, password_changed: false, email: profile?.email ?? "" })
        .eq("id", existing.id);
    } else {
      await admin.from("client_credentials").insert({
        client_id,
        email: profile?.email ?? "",
        temp_password: newPassword,
      });
    }

    return json({ ok: true, temp_password: newPassword, email: profile?.email ?? "" });
  } catch (e) {
    console.error("client-credentials error", e);
    return json({ error: "Erro inesperado" }, 500);
  }
});
