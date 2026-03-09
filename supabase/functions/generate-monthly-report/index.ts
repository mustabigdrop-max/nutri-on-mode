import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    const monthStart = lastMonth.toISOString().split("T")[0];
    const monthEnd = lastMonthEnd.toISOString().split("T")[0];
    const reportMonth = monthStart;

    const { data: profiles } = await supabase.from("profiles").select("user_id, vet_kcal, protein_g, carbs_g, fat_g, objetivo_principal, full_name");
    if (!profiles) return new Response(JSON.stringify({ message: "No profiles" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

    let processed = 0;

    for (const profile of profiles) {
      const userId = profile.user_id;

      // Get meals for the month
      const { data: meals } = await supabase.from("meal_logs").select("*")
        .eq("user_id", userId).gte("meal_date", monthStart).lte("meal_date", monthEnd);
      if (!meals || meals.length < 5) continue;

      // Get consistency scores for the month
      const { data: scores } = await supabase.from("consistency_scores").select("*")
        .eq("user_id", userId).gte("week_start", monthStart).lte("week_end", monthEnd)
        .order("total_score", { ascending: false });

      // Get weights
      const { data: weights } = await supabase.from("weight_logs").select("weight_kg, logged_at")
        .eq("user_id", userId).gte("logged_at", monthStart).lte("logged_at", monthEnd + "T23:59:59")
        .order("logged_at");

      const totalMeals = meals.length;
      const avgScore = scores && scores.length > 0
        ? Math.round(scores.reduce((s, sc) => s + sc.total_score, 0) / scores.length)
        : 0;
      const bestWeek = scores && scores.length > 0 ? scores[0] : null;

      // Top foods
      const foodCount: Record<string, number> = {};
      meals.forEach(m => {
        (m.food_names || []).forEach((f: string) => {
          const key = f.trim();
          foodCount[key] = (foodCount[key] || 0) + 1;
        });
      });
      const topFoods = Object.entries(foodCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }));

      // Macro averages
      const days = new Set(meals.map(m => m.meal_date)).size;
      const macroAvg = {
        protein_avg: Math.round(meals.reduce((s, m) => s + (Number(m.total_protein) || 0), 0) / days),
        carbs_avg: Math.round(meals.reduce((s, m) => s + (Number(m.total_carbs) || 0), 0) / days),
        fat_avg: Math.round(meals.reduce((s, m) => s + (Number(m.total_fat) || 0), 0) / days),
        kcal_avg: Math.round(meals.reduce((s, m) => s + (Number(m.total_kcal) || 0), 0) / days),
        protein_target: profile.protein_g || 150,
        carbs_target: profile.carbs_g || 250,
        fat_target: profile.fat_g || 65,
        kcal_target: profile.vet_kcal || 2000,
      };

      // Protein days hit
      const dailyProtein: Record<string, number> = {};
      meals.forEach(m => {
        dailyProtein[m.meal_date] = (dailyProtein[m.meal_date] || 0) + (Number(m.total_protein) || 0);
      });
      const proteinDaysHit = Object.values(dailyProtein).filter(p => p >= (profile.protein_g || 150) * 0.8).length;

      // Pattern analysis
      const mealsByHour: Record<string, number> = {};
      const mealsByDay: Record<string, number> = {};
      const dayNames = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
      meals.forEach(m => {
        const h = new Date(m.created_at).getHours();
        const period = h < 10 ? "Manhã" : h < 14 ? "Almoço" : h < 18 ? "Tarde" : "Noite";
        mealsByHour[period] = (mealsByHour[period] || 0) + 1;
        const d = dayNames[new Date(m.meal_date).getDay()];
        mealsByDay[d] = (mealsByDay[d] || 0) + 1;
      });
      const bestTime = Object.entries(mealsByHour).sort((a, b) => b[1] - a[1])[0]?.[0];
      const worstTime = Object.entries(mealsByHour).sort((a, b) => a[1] - b[1])[0]?.[0];
      const bestDay = Object.entries(mealsByDay).sort((a, b) => b[1] - a[1])[0]?.[0];
      const worstDay = Object.entries(mealsByDay).sort((a, b) => a[1] - b[1])[0]?.[0];

      const weightStart = weights && weights.length > 0 ? Number(weights[0].weight_kg) : null;
      const weightEnd = weights && weights.length > 0 ? Number(weights[weights.length - 1].weight_kg) : null;

      await supabase.from("monthly_reports").upsert({
        user_id: userId,
        report_month: reportMonth,
        total_meals_logged: totalMeals,
        avg_consistency_score: avgScore,
        best_week: bestWeek ? 1 : 0,
        best_week_score: bestWeek?.total_score || 0,
        top_foods: topFoods,
        pattern_analysis: { best_time: bestTime, worst_time: worstTime, best_day: bestDay, worst_day: worstDay },
        macro_averages: macroAvg,
        projection: weightEnd && weightStart ? {
          projected_weight: Math.round((weightEnd + (weightEnd - weightStart)) * 10) / 10,
          tip: "Mantenha a consistência nos registros",
        } : {},
        focus_next_month: [
          macroAvg.protein_avg < macroAvg.protein_target ? "Aumentar proteína diária" : "Manter proteína consistente",
          "Registrar todas as refeições",
          "Melhorar hidratação",
        ],
        ai_message: `${profile.full_name || "Piloto"}, você registrou ${totalMeals} refeições esse mês. ${avgScore >= 70 ? "Resultado excelente — continue assim!" : avgScore >= 50 ? "Bom progresso — foque em consistência." : "Cada registro conta. Vamos juntos no próximo mês!"}`,
        weight_start: weightStart,
        weight_end: weightEnd,
        protein_days_hit: proteinDaysHit,
      }, { onConflict: "user_id,report_month" });

      processed++;
    }

    return new Response(JSON.stringify({ processed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Monthly report error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
