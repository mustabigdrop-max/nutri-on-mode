import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ── Mapeamento produto Kiwify → plano interno ───────────────
const PRODUCT_MAP: Record<string, string> = {
  "2U4q4d9": "on",
  "6pXyygp": "full",
  "zbtOulj": "max",
  "VaPRGfQ": "starter",
};

function mapProduct(productId: string): string {
  return PRODUCT_MAP[productId] ?? "on";
}

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ── 1. Validação do token de segurança ──────────────────
    const KIWIFY_TOKEN = Deno.env.get("KIWIFY_WEBHOOK_TOKEN");
    if (!KIWIFY_TOKEN) {
      throw new Error("KIWIFY_WEBHOOK_TOKEN not configured");
    }

    const signature = req.headers.get("x-kiwify-signature") ??
                      req.headers.get("x-webhook-token") ?? "";

    if (signature !== KIWIFY_TOKEN) {
      console.error("Invalid webhook signature");
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── 2. Parse do payload ─────────────────────────────────
    const body = await req.json();
    console.log("Kiwify webhook received:", JSON.stringify(body));

    const event = body.order_status ?? body.event ?? body.status;
    const email = (body.Customer?.email ?? body.customer?.email ?? body.email ?? "").toLowerCase().trim();
    const orderId = body.order_id ?? body.Order?.order_id ?? "";
    const productId = body.Product?.product_id ?? body.product?.id ?? "";
    const plano = mapProduct(productId);

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Missing customer email" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── 3. Supabase client (service role) ───────────────────
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // ── 4. Determinar período (mensal / semestral) ──────────
    const planName = body.Product?.product_name ?? body.product?.name ?? "";
    const periodo = planName.toLowerCase().includes("semestral") ? "semestral" : "mensal";
    const expiresAt = periodo === "semestral"
      ? new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString()
      : null;

    // ── 5. Processar eventos ────────────────────────────────
    if (event === "paid" || event === "approved" || event === "completed") {
      // Verificar se o usuário já existe
      const { data: existingUsers } = await supabase.auth.admin.listUsers();
      const user = existingUsers?.users?.find(
        (u) => u.email?.toLowerCase() === email
      );

      if (user) {
        // Usuário já existe → ativar assinatura diretamente
        await supabase.from("subscriptions").upsert(
          {
            user_id: user.id,
            email,
            plano,
            periodo,
            kiwify_order_id: orderId,
            kiwify_product_id: productId,
            status: "active",
            activated_at: new Date().toISOString(),
            expires_at: expiresAt,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" }
        );

        // Atualizar perfil
        await supabase
          .from("profiles")
          .update({ plano_atual: plano, email, updated_at: new Date().toISOString() })
          .eq("user_id", user.id);

        // Incrementar vagas do coach se plano max
        if (plano === "max") {
          await supabase.rpc("increment_coach_slots");
        }

        console.log(`Subscription activated for existing user: ${email} → ${plano}`);
      } else {
        // Usuário não existe ainda → salvar como pendente
        await supabase.from("subscriptions_pending").upsert(
          {
            email,
            plano,
            periodo,
            kiwify_order_id: orderId,
            expires_at: expiresAt,
          },
          { onConflict: "email" }
        );

        console.log(`Pending subscription saved for: ${email} → ${plano}`);
      }
    } else if (event === "refunded" || event === "chargedback" || event === "canceled") {
      // Cancelar assinatura
      const { data: sub } = await supabase
        .from("subscriptions")
        .select("user_id, plano")
        .eq("email", email)
        .single();

      if (sub) {
        await supabase
          .from("subscriptions")
          .update({
            status: event === "canceled" ? "canceled" : "expired",
            canceled_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", sub.user_id);

        await supabase
          .from("profiles")
          .update({ plano_atual: "free", updated_at: new Date().toISOString() })
          .eq("user_id", sub.user_id);

        // Decrementar vagas do coach se era plano max
        if (sub.plano === "max") {
          await supabase.rpc("decrement_coach_slots");
        }

        console.log(`Subscription ${event} for: ${email}`);
      }

      // Limpar pendentes também
      await supabase.from("subscriptions_pending").delete().eq("email", email);
    }

    return new Response(
      JSON.stringify({ success: true, event, email, plano }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Webhook error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
