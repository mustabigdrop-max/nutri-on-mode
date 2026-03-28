import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "npm:zod";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const CreatePartnerSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres"),
  full_name: z.string().trim().min(2, "Informe o nome completo"),
  plan: z.string().trim().min(1).optional(),
  modules: z.array(z.string().trim().min(1)).optional(),
  internal_note: z.string().trim().max(2000).optional().nullable(),
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const token = authHeader.replace("Bearer ", "");

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: claimsData,
      error: claimsError,
    } = await userClient.auth.getClaims(token);

    if (claimsError || !claimsData?.claims?.sub) {
      console.error("create-partner unauthorized", claimsError);
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const callerUserId = claimsData.claims.sub;

    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const { data: roles, error: rolesError } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", callerUserId);

    if (rolesError) {
      console.error("create-partner role lookup error", rolesError);
      return new Response(JSON.stringify({ error: "Erro ao validar permissões" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!roles?.some((r: any) => r.role === "admin")) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = CreatePartnerSchema.safeParse(await req.json());
    if (!body.success) {
      return new Response(
        JSON.stringify({ error: body.error.issues[0]?.message || "Dados inválidos" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const {
      email,
      password,
      full_name,
      plan,
      modules,
      internal_note,
    } = body.data;
    const normalizedEmail = email.trim().toLowerCase();

    const { data: existingPartner, error: existingPartnerError } = await adminClient
      .from("partners")
      .select("id")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (existingPartnerError) {
      console.error("create-partner existing partner lookup error", existingPartnerError);
      return new Response(JSON.stringify({ error: "Erro ao verificar parceiro existente" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (existingPartner) {
      return new Response(JSON.stringify({ error: "Já existe um parceiro com este email" }), {
        status: 409,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let userId: string;

    const { data: newUser, error: createErr } =
      await adminClient.auth.admin.createUser({
        email: normalizedEmail,
        password,
        email_confirm: true,
        user_metadata: { full_name },
      });

    if (createErr) {
      if (createErr.message?.includes("already been registered")) {
        // User exists in auth — find their ID and reuse
        const { data: listData, error: listErr } = await adminClient.auth.admin.listUsers();
        if (listErr) {
          console.error("create-partner list users error", listErr);
          return new Response(JSON.stringify({ error: "Erro ao buscar usuário existente" }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        const existingUser = listData.users.find(
          (u: any) => u.email?.toLowerCase() === normalizedEmail
        );
        if (!existingUser) {
          return new Response(JSON.stringify({ error: "Usuário existe mas não foi encontrado" }), {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        userId = existingUser.id;
      } else {
        console.error("create-partner auth create error", createErr);
        return new Response(JSON.stringify({ error: createErr.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } else {
      userId = newUser.user.id;
    }

    const { error: insertErr } = await adminClient.from("partners").insert({
      user_id: userId,
      full_name,
      email: normalizedEmail,
      plan: plan || "on_plus",
      modules: modules || ["pca", "protocolo_atleta", "nutricao_sport", "cardio_on"],
      internal_note,
      created_by: callerUserId,
      status: "active",
      referral_count: 0,
      commission_total: 0,
    });

    if (insertErr) {
      console.error("create-partner partner insert error", insertErr);
      await adminClient.auth.admin.deleteUser(newUser.user.id);
      return new Response(JSON.stringify({ error: insertErr.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ success: true, user_id: newUser.user.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("create-partner unexpected error", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Erro interno" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
