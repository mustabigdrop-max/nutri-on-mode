import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Horários por perfil PCA (hora do dia)
const PCA_SCHEDULES: Record<string, { manha: number; almoco: number | null; noite: number }> = {
  atleta_mental:          { manha: 6,  almoco: 14,   noite: 21 },
  sabotador_emocional:    { manha: 7,  almoco: 12,   noite: 19 },
  executor_inconsistente: { manha: 8,  almoco: 12,   noite: 20 },
  perfeccionista_paralisado: { manha: 9, almoco: null, noite: 21 },
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const supabase = createClient(supabaseUrl, supabaseKey);
    const now = new Date();
    const currentHour = now.getUTCHours() - 3; // BRT (UTC-3)
    let totalSent = 0;

    // Get active users with profiles
    const { data: profiles, error } = await supabase
      .from("profiles")
      .select("user_id, full_name, perfil_comportamental, streak_days, protein_g, onboarding_completed")
      .eq("onboarding_completed", true)
      .not("perfil_comportamental", "is", null);

    if (error) throw error;
    if (!profiles || profiles.length === 0) {
      return new Response(JSON.stringify({ success: true, sent: 0, message: "No users" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    for (const profile of profiles) {
      const pcaKey = (profile.perfil_comportamental || "").toLowerCase().replace(/\s+/g, "_");
      const schedule = PCA_SCHEDULES[pcaKey];
      if (!schedule) continue;

      // Determine time slot
      let horario: string | null = null;
      if (Math.abs(currentHour - schedule.manha) <= 0) horario = "manha";
      else if (schedule.almoco && Math.abs(currentHour - schedule.almoco) <= 0) horario = "almoco";
      else if (Math.abs(currentHour - schedule.noite) <= 0) horario = "noite";
      if (!horario) continue;

      // Check max 3 notifications per day
      const today = now.toISOString().split("T")[0];
      const { data: todayAlerts } = await supabase
        .from("alertas_preditivos")
        .select("id")
        .eq("user_id", profile.user_id)
        .gte("enviado_em", `${today}T00:00:00`)
        .lte("enviado_em", `${today}T23:59:59`);
      if (todayAlerts && todayAlerts.length >= 3) continue;

      // Check already sent this slot
      const { data: existing } = await supabase
        .from("alertas_preditivos")
        .select("id")
        .eq("user_id", profile.user_id)
        .eq("tipo_alerta", `pca_${horario}`)
        .gte("enviado_em", `${today}T00:00:00`)
        .limit(1);
      if (existing && existing.length > 0) continue;

      // Get last meal and protein average
      const { data: lastMeal } = await supabase
        .from("meal_logs")
        .select("created_at")
        .eq("user_id", profile.user_id)
        .order("created_at", { ascending: false })
        .limit(1);

      const { data: recentMeals } = await supabase
        .from("meal_logs")
        .select("total_protein")
        .eq("user_id", profile.user_id)
        .order("created_at", { ascending: false })
        .limit(7);

      const avgProtein = recentMeals?.length
        ? Math.round(recentMeals.reduce((s, m) => s + (m.total_protein || 0), 0) / recentMeals.length)
        : 0;

      // Generate notification via AI
      const prompt = `Você é o assistente do nutriON enviando uma notificação proativa.

# DADOS DO USUÁRIO
Nome: ${profile.full_name || "usuário"}
Perfil PCA: ${pcaKey}
Horário da notificação: ${horario}
Streak atual: ${profile.streak_days || 0} dias
Última refeição registrada: ${lastMeal?.[0]?.created_at || "nenhuma"}
Proteína média últimos 7 dias: ${avgProtein}g
Meta diária de proteína: ${profile.protein_g || 120}g

# INSTRUÇÃO
Gere UMA notificação push curta (max 2 linhas / 120 caracteres).
Adapte o tom ao perfil PCA do usuário.
Se streak > 7: comemore brevemente.
Se sem registro há > 24h: reengaje sem culpa.
Se proteína abaixo de 80% da meta: sugira 1 alimento específico.

# FORMATO DE RESPOSTA (JSON puro, sem markdown):
{
  "titulo": "string max 40 chars",
  "corpo": "string max 80 chars",
  "acao": "registrar | ver_protocolo | chat"
}`;

      try {
        const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash-lite",
            messages: [
              { role: "system", content: "Você gera notificações push curtas em JSON. Responda APENAS com JSON válido." },
              { role: "user", content: prompt },
            ],
          }),
        });

        if (!aiResp.ok) {
          console.error(`AI error for ${profile.user_id}: ${aiResp.status}`);
          continue;
        }

        const aiData = await aiResp.json();
        const content = aiData.choices?.[0]?.message?.content || "";
        let notification;
        try {
          const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
          notification = JSON.parse(cleaned);
        } catch {
          continue;
        }

        // Insert notification
        const { error: insertError } = await supabase
          .from("alertas_preditivos")
          .insert({
            user_id: profile.user_id,
            tipo_alerta: `pca_${horario}`,
            mensagem: `**${notification.titulo}**\n${notification.corpo}`,
            lido: false,
          });

        if (!insertError) totalSent++;
      } catch (e) {
        console.error(`Notification error for ${profile.user_id}:`, e);
      }
    }

    return new Response(JSON.stringify({ success: true, checked: profiles.length, sent: totalSent }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("generate-proactive-notification error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
