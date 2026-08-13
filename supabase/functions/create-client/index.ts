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
  email: z.string().trim().email().max(255),
  password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres").max(72),
  full_name: z.string().trim().min(2, "Informe o nome completo").max(120),
  phone: z.string().trim().max(30).optional().nullable(),
  sex: z.string().trim().max(20).optional().nullable(),
  age: z.number().int().min(10).max(110).optional().nullable(),
  weight: z.number().min(20).max(400).optional().nullable(),
  height: z.number().min(80).max(260).optional().nullable(),
  objective: z.string().trim().max(80).optional().nullable(),
  notes: z.string().trim().max(2000).optional().nullable(),
});

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

    const callerUserId = claimsData.claims.sub as string;
    const admin = createClient(supabaseUrl, serviceRoleKey);

    // Só coaches (perfil profissional) podem cadastrar clientes
    const { data: coachProfile, error: coachErr } = await admin
      .from("coach_profiles")
      .select("id")
      .eq("user_id", callerUserId)
      .maybeSingle();

    if (coachErr) {
      console.error("create-client coach lookup error", coachErr);
      return json({ error: "Erro ao validar permissões" }, 500);
    }
    if (!coachProfile?.id) return json({ error: "Apenas coaches podem cadastrar clientes." }, 403);

    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return json({ error: Object.values(parsed.error.flatten().fieldErrors).flat()[0] ?? "Dados inválidos" }, 400);
    }
    const b = parsed.data;
    const email = b.email.toLowerCase();

    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email,
      password: b.password,
      email_confirm: true,
      user_metadata: { full_name: b.full_name },
    });

    if (authError) {
      const msg = authError.message ?? "";
      if (/already|registered|exists/i.test(msg)) {
        return json({ error: "Este email já está cadastrado." }, 400);
      }
      console.error("create-client auth error", authError);
      return json({ error: msg || "Erro ao criar conta" }, 400);
    }

    const userId = authData.user!.id;

    const { error: profileError } = await admin
      .from("profiles")
      .update({
        full_name: b.full_name,
        email,
        phone: b.phone || null,
        sex: b.sex || null,
        age: b.age ?? null,
        weight_kg: b.weight ?? null,
        height_cm: b.height ?? null,
        objetivo_principal: b.objective || null,
        goal: b.objective || null,
        coach_notes: b.notes || null,
        role: "aluno_coach",
        coach_profile_id: coachProfile.id,
        created_by: callerUserId,
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    if (profileError) console.error("create-client profile error", profileError);

    const { error: linkError } = await admin
      .from("coach_patients")
      .insert({ coach_id: coachProfile.id, patient_user_id: userId, status: "active", notes: b.notes || null });

    if (linkError) console.error("create-client link error", linkError);

    return json({
      userId,
      message: `Cliente ${b.full_name} criado com sucesso.`,
      credentials: { email, password: b.password },
    });
  } catch (err) {
    console.error("create-client unexpected error", err);
    return json({ error: err instanceof Error ? err.message : "Erro inesperado" }, 500);
  }
});
