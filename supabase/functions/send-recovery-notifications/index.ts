import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Recovery notification windows (minutes after signup)
const NOTIFICATION_WINDOWS = [
  {
    minMinutes: 25,
    maxMinutes: 35,
    key: "recovery_30min",
    title: "Seu plano está esperando ⏳",
    message: (name: string) =>
      `${name}, só falta uma coisa para ativar sua IA: o primeiro registro. Pode ser qualquer coisa que você comeu hoje — café, fruta, biscoito. Qualquer coisa. Registrar agora leva 30 segundos!`,
  },
  {
    minMinutes: 115,
    maxMinutes: 125,
    key: "recovery_2h",
    title: "Sua IA está esperando 🤖",
    message: (name: string) =>
      `${name}, sua IA está esperando o primeiro dado. Sem o primeiro registro, não consigo aprender nada sobre você. O que você comeu hoje até agora? Registrar leva 30 segundos!`,
  },
  {
    minMinutes: 710,
    maxMinutes: 730,
    key: "recovery_12h",
    title: "Hora do almoço! 🍽️",
    message: (name: string) =>
      `Hora do almoço, ${name}! É o momento perfeito para o primeiro registro. Me conta o que você está comendo agora e eu cuido do resto.`,
  },
  {
    minMinutes: 1070,
    maxMinutes: 1090,
    key: "recovery_18h",
    title: "O dia está acabando",
    message: (name: string) =>
      `${name}, o dia está acabando. Você cadastrou no nutriON hoje mas ainda não registrou nada. Sem dados, não consigo te ajudar. Me conta qualquer coisa que você comeu — mesmo que tenha sido fora do plano.`,
  },
  {
    minMinutes: 1250,
    maxMinutes: 1270,
    key: "recovery_21h",
    title: "Última chance do dia 😊",
    message: (name: string) =>
      `Última chance do dia, ${name}. Registra qualquer refeição de hoje — mesmo que tenha sido pizza, lanche, ou só um café com pão. Sem julgamento. Só preciso começar a te conhecer.`,
  },
  {
    // Day 2 morning — 24-30h after signup
    minMinutes: 1440,
    maxMinutes: 1800,
    key: "recovery_day2",
    title: "Novo dia, nova chance ☀️",
    message: (name: string) =>
      `Novo dia, nova chance, ${name}. Ontem foi difícil — hoje começa do zero. Primeira coisa do dia: me conta o que você vai tomar de café!`,
  },
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const now = new Date();
    let totalSent = 0;

    // Get users who signed up recently (last 48h) and haven't registered first meal
    const cutoff48h = new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString();

    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("user_id, full_name, created_at, first_meal_registered")
      .eq("first_meal_registered", false)
      .gte("created_at", cutoff48h);

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
      throw profilesError;
    }

    if (!profiles || profiles.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: "No users need recovery notifications", sent: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    for (const profile of profiles) {
      const signupTime = new Date(profile.created_at).getTime();
      const minutesSinceSignup = (now.getTime() - signupTime) / (1000 * 60);
      const userName = profile.full_name || "usuário";

      // Check activation_metrics for reengagement count (max 4/day)
      const { data: metrics } = await supabase
        .from("activation_metrics")
        .select("reengagement_sent")
        .eq("user_id", profile.user_id)
        .single();

      const sentCount = metrics?.reengagement_sent || 0;
      // After day 1, limit to 1 notification per day
      if (minutesSinceSignup > 1440 && sentCount >= 5) continue;

      for (const window of NOTIFICATION_WINDOWS) {
        if (minutesSinceSignup >= window.minMinutes && minutesSinceSignup <= window.maxMinutes) {
          // Check if this specific notification was already sent
          const { data: existing } = await supabase
            .from("alertas_preditivos")
            .select("id")
            .eq("user_id", profile.user_id)
            .eq("tipo_alerta", window.key)
            .limit(1);

          if (existing && existing.length > 0) continue;

          // Insert notification
          const { error: insertError } = await supabase
            .from("alertas_preditivos")
            .insert({
              user_id: profile.user_id,
              tipo_alerta: window.key,
              mensagem: window.message(userName),
              lido: false,
            });

          if (!insertError) {
            totalSent++;

            // Increment reengagement_sent counter
            await supabase
              .from("activation_metrics")
              .upsert(
                {
                  user_id: profile.user_id,
                  reengagement_sent: sentCount + 1,
                },
                { onConflict: "user_id" }
              );
          } else {
            console.error(`Error sending notification to ${profile.user_id}:`, insertError);
          }
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        checked: profiles.length,
        sent: totalSent,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("send-recovery-notifications error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
