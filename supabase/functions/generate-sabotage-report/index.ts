import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DAYS_PT: Record<string, string> = {
  "0": "Domingo", "1": "Segunda", "2": "Terça", "3": "Quarta",
  "4": "Quinta", "5": "Sexta", "6": "Sábado",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Get all active profiles
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, full_name, vet_kcal, protein_g, objetivo_principal, meta_peso, weight_kg")
      .eq("onboarding_completed", true);

    if (!profiles || profiles.length === 0) {
      return new Response(JSON.stringify({ ok: true, processed: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const now = new Date();
    // Calculate last week: Monday to Sunday
    const dayOfWeek = now.getDay(); // 0=Sun
    const sundayEnd = new Date(now);
    sundayEnd.setDate(now.getDate() - (dayOfWeek === 0 ? 0 : dayOfWeek));
    const mondayStart = new Date(sundayEnd);
    mondayStart.setDate(sundayEnd.getDate() - 6);

    const weekStart = mondayStart.toISOString().split("T")[0];
    const weekEnd = sundayEnd.toISOString().split("T")[0];

    let processed = 0;

    for (const profile of profiles) {
      const userId = profile.user_id;
      const fullName = profile.full_name?.split(" ")[0] || "Piloto";
      const kcalTarget = profile.vet_kcal || 2000;
      const proteinTarget = profile.protein_g || 150;

      // Fetch week's meal logs
      const { data: meals } = await supabase
        .from("meal_logs")
        .select("*")
        .eq("user_id", userId)
        .gte("meal_date", weekStart)
        .lte("meal_date", weekEnd)
        .order("created_at", { ascending: true });

      if (!meals || meals.length === 0) continue;

      // Analyze by day
      const byDate: Record<string, typeof meals> = {};
      for (const m of meals) {
        const d = m.meal_date;
        if (!byDate[d]) byDate[d] = [];
        byDate[d].push(m);
      }

      const dates = Object.keys(byDate).sort();
      let proteinDaysHit = 0;
      let totalKcal = 0;
      const hourDeviations: Record<string, number> = {};
      const dayDeviations: Record<string, number> = {};
      let offPlanCount = 0;
      let onPlanCount = 0;
      const emotions: string[] = [];
      const highlights: string[] = [];

      for (const date of dates) {
        const dayMeals = byDate[date];
        const dayKcal = dayMeals.reduce((s, m) => s + (Number(m.total_kcal) || 0), 0);
        const dayProtein = dayMeals.reduce((s, m) => s + (Number(m.total_protein) || 0), 0);

        totalKcal += dayKcal;

        if (dayProtein >= proteinTarget * 0.8) proteinDaysHit++;

        // Check if day was on or off plan (within 20% of target)
        const kcalDiff = Math.abs(dayKcal - kcalTarget) / kcalTarget;
        if (kcalDiff <= 0.2) {
          onPlanCount++;
        } else {
          offPlanCount++;
          // Track which day of week and hour had deviations
          const dateObj = new Date(date + "T12:00:00");
          const dow = dateObj.getDay().toString();
          dayDeviations[dow] = (dayDeviations[dow] || 0) + 1;
        }

        // Track emotions
        for (const m of dayMeals) {
          if (m.emotion) emotions.push(m.emotion);
          // Track late-night meals as deviations
          const createdHour = new Date(m.created_at).getHours();
          if (createdHour >= 21 || dayKcal > kcalTarget * 1.2) {
            const hKey = `${createdHour}h`;
            hourDeviations[hKey] = (hourDeviations[hKey] || 0) + 1;
          }
        }
      }

      // Determine worst hour
      let worstHour = "";
      let maxHourDev = 0;
      for (const [h, count] of Object.entries(hourDeviations)) {
        if (count > maxHourDev) { maxHourDev = count; worstHour = h; }
      }

      // Determine worst day
      let worstDay = "";
      let maxDayDev = 0;
      for (const [d, count] of Object.entries(dayDeviations)) {
        if (count > maxDayDev) { maxDayDev = count; worstDay = DAYS_PT[d] || d; }
      }

      // Main trigger
      const guiltyCount = emotions.filter(e => ["culpado", "guilty", "ansioso", "stressed"].includes(e)).length;
      const mainTrigger = guiltyCount >= 2
        ? "Comer emocional (estresse/culpa)"
        : worstHour && parseInt(worstHour) >= 21
          ? `Refeições tardias (depois das ${worstHour})`
          : offPlanCount > 3
            ? "Excesso calórico frequente"
            : "Padrão irregular de refeições";

      // Average deficit
      const avgKcal = totalKcal / Math.max(dates.length, 1);
      const avgDeficit = kcalTarget - avgKcal;

      // Weight trend
      const { data: weights } = await supabase
        .from("weight_logs")
        .select("weight_kg, logged_at")
        .eq("user_id", userId)
        .order("logged_at", { ascending: false })
        .limit(4);

      let weightTrend = "estável";
      let projectedKg = 0;
      if (weights && weights.length >= 2) {
        const diff = Number(weights[0].weight_kg) - Number(weights[weights.length - 1].weight_kg);
        if (diff < -0.3) weightTrend = "descendo";
        else if (diff > 0.3) weightTrend = "subindo";
        projectedKg = diff * 4; // project 4 weeks
      }

      // Positive highlights
      if (proteinDaysHit >= 5) highlights.push(`Proteína batida em ${proteinDaysHit} de ${dates.length} dias 💪`);
      if (onPlanCount >= 5) highlights.push(`${onPlanCount} refeições dentro do plano ✅`);
      if (meals.length >= 14) highlights.push(`${meals.length} refeições registradas — consistência!`);
      if (weightTrend === "descendo") highlights.push("Peso em tendência de queda 📉");
      if (highlights.length === 0) highlights.push(`${meals.length} refeições registradas na semana`);

      // AI suggestion
      let suggestion = "";
      if (worstHour && parseInt(worstHour) >= 21) {
        suggestion = `Prepare um lanche proteico às 20h para evitar a fome noturna. Iogurte grego ou ovo cozido resolvem em 2 minutos.`;
      } else if (worstDay) {
        suggestion = `${worstDay} é seu dia mais difícil. Que tal deixar as refeições preparadas na véspera?`;
      } else if (offPlanCount > onPlanCount) {
        suggestion = `Foque em registrar pelo menos 3 refeições por dia. Consistência vale mais que perfeição.`;
      } else {
        suggestion = `Continue no ritmo! Tente manter a proteína acima de ${Math.round(proteinTarget * 0.8)}g por dia.`;
      }

      // Upsert report
      const { error } = await supabase.from("weekly_sabotage_reports").upsert({
        user_id: userId,
        week_start: weekStart,
        week_end: weekEnd,
        total_meals_planned: dates.length * 3,
        total_meals_logged: meals.length,
        meals_on_plan: onPlanCount,
        meals_off_plan: offPlanCount,
        worst_hour: worstHour || null,
        worst_day: worstDay || null,
        main_trigger: mainTrigger,
        protein_days_hit: proteinDaysHit,
        avg_kcal_deficit: Math.round(avgDeficit),
        weight_trend: weightTrend,
        projected_kg_30d: projectedKg ? Math.round(projectedKg * 10) / 10 : null,
        positive_highlights: highlights,
        sabotage_pattern: { hourDeviations, dayDeviations, emotionTriggers: guiltyCount },
        ai_suggestion: suggestion,
        read: false,
      }, { onConflict: "user_id,week_start" });

      if (!error) processed++;
    }

    return new Response(JSON.stringify({ ok: true, processed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("sabotage-report error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
