import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface Payload {
  destinatario_id: string;
  titulo?: string;
  corpo?: string;
  referencia_id?: string | null;
  tipo?: string;
}

const DEFAULT_TITLE = "Novo protocolo recebido!";
const DEFAULT_BODY =
  "Seu coach enviou um novo protocolo para você. Acesse agora.";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = (await req.json()) as Payload;
    const {
      destinatario_id,
      titulo,
      corpo,
      referencia_id = null,
      tipo = "protocolo",
    } = body;

    if (!destinatario_id) {
      return new Response(
        JSON.stringify({ error: "destinatario_id é obrigatório" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const finalTitle = titulo?.trim() || DEFAULT_TITLE;
    const finalBody = corpo?.trim() || DEFAULT_BODY;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // 1. Inserir notificação no banco (best-effort: tenta `notificacoes`, cai para `coach_notifications`)
    let dbError: string | null = null;
    const { error: notifError } = await supabase.from("notificacoes").insert({
      user_id: destinatario_id,
      titulo: finalTitle,
      corpo: finalBody,
      tipo,
      referencia_id,
      lida: false,
    });

    if (notifError) {
      dbError = notifError.message;
      // Fallback para tabela existente no projeto
      await supabase.from("coach_notifications").insert({
        recipient_user_id: destinatario_id,
        sender_user_id: destinatario_id,
        notification_type: tipo,
        title: finalTitle,
        message: finalBody,
        reference_id: referencia_id,
      });
    }

    // 2. Buscar push token (tenta user_profiles, cai para profiles)
    let pushToken: string | null = null;
    const { data: up } = await supabase
      .from("user_profiles")
      .select("expo_push_token")
      .eq("user_id", destinatario_id)
      .maybeSingle();
    pushToken = (up as any)?.expo_push_token || null;

    if (!pushToken) {
      const { data: pf } = await supabase
        .from("profiles")
        .select("expo_push_token")
        .eq("user_id", destinatario_id)
        .maybeSingle();
      pushToken = (pf as any)?.expo_push_token || null;
    }

    // 3. Disparar push via Expo
    let pushResult: unknown = null;
    if (pushToken) {
      try {
        const resp = await fetch("https://exp.host/--/api/v2/push/send", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Accept-encoding": "gzip, deflate",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            to: pushToken,
            title: finalTitle,
            body: finalBody,
            sound: "default",
            data: { referencia_id, tipo },
          }),
        });
        pushResult = await resp.json();
      } catch (e) {
        pushResult = { error: (e as Error).message };
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        push_sent: !!pushToken,
        push_result: pushResult,
        db_warning: dbError,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
