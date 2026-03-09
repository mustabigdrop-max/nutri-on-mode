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

    // Get all users with profiles
    const { data: profiles } = await supabase.from("profiles").select("user_id, vet_kcal, protein_g, objetivo_principal");
    if (!profiles || profiles.length === 0) {
      return new Response(JSON.stringify({ message: "No profiles" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay() - 6); // Last Monday
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    const wsStr = weekStart.toISOString().split("T")[0];
    const weStr = weekEnd.toISOString().split("T")[0];

    let processed = 0;

    for (const profile of profiles) {
      const userId = profile.user_id;
      const kcalTarget = profile.vet_kcal || 2000;
      const proteinTarget = profile.protein_g || 150;

      // Get meal logs for the week
      const { data: meals } = await supabase
        .from("meal_logs")
        .select("*")
        .eq("user_id", userId)
        .gte("meal_date", wsStr)
        .lte("meal_date", weStr);

      if (!meals || meals.length === 0) continue;

      // ADHERENCE (40 pts): % of meals logged vs expected (3/day * 7 = 21)
      const expectedMeals = 21;
      const adherenceRaw = Math.min(meals.length / expectedMeals, 1);
      const adherenceScore = Math.round(adherenceRaw * 40);

      // QUALITY (20 pts): average quality_score of meals
      const qualityMeals = meals.filter(m => m.quality_score != null);
      const avgQuality = qualityMeals.length > 0
        ? qualityMeals.reduce((s, m) => s + (m.quality_score || 0), 0) / qualityMeals.length
        : 50;
      const qualityScore = Math.round((avgQuality / 100) * 20);

      // RECOVERY (20 pts): check if user logged meals after off-plan meals
      // Simple heuristic: if user has meals on consecutive days = good recovery
      const mealDates = [...new Set(meals.map(m => m.meal_date))].sort();
      let recoveryPts = 0;
      for (let i = 1; i < mealDates.length; i++) {
        const prev = new Date(mealDates[i - 1]);
        const curr = new Date(mealDates[i]);
        const diff = (curr.getTime() - prev.getTime()) / 86400000;
        if (diff <= 1) recoveryPts += 4;
        else if (diff <= 2) recoveryPts += 2;
      }
      const recoveryScore = Math.min(Math.round(recoveryPts), 20);

      // PROGRESS (20 pts): weight trend
      const { data: weights } = await supabase
        .from("weight_logs")
        .select("weight_kg, logged_at")
        .eq("user_id", userId)
        .order("logged_at", { ascending: false })
        .limit(2);

      let progressScore = 10; // default neutral
      if (weights && weights.length >= 2) {
        const diff = Number(weights[0].weight_kg) - Number(weights[1].weight_kg);
        const objetivo = profile.objetivo_principal || "saude_geral";
        if (objetivo === "emagrecimento") progressScore = diff < 0 ? 20 : diff === 0 ? 10 : 5;
        else if (objetivo === "hipertrofia") progressScore = diff > 0 ? 20 : diff === 0 ? 10 : 5;
        else progressScore = Math.abs(diff) < 0.5 ? 20 : 10;
      }

      const totalScore = adherenceScore + qualityScore + recoveryScore + progressScore;

      // Determine factors
      const scores = [
        { name: "Adesão ao plano", val: adherenceScore, max: 40 },
        { name: "Qualidade das escolhas", val: qualityScore, max: 20 },
        { name: "Recuperação após desvios", val: recoveryScore, max: 20 },
        { name: "Progresso de peso", val: progressScore, max: 20 },
      ];
      const best = scores.sort((a, b) => (b.val / b.max) - (a.val / a.max))[0];
      const worst = scores[scores.length - 1];

      await supabase.from("consistency_scores").upsert({
        user_id: userId,
        week_start: wsStr,
        week_end: weStr,
        total_score: totalScore,
        adherence_score: adherenceScore,
        quality_score: qualityScore,
        recovery_score: recoveryScore,
        progress_score: progressScore,
        percentile: Math.round(Math.random() * 30 + 50), // placeholder
        positive_factor: `${best.name} foi seu ponto forte (${best.val}/${best.max} pts)`,
        improvement_tip: `Foque em melhorar ${worst.name} (${worst.val}/${worst.max} pts)`,
      }, { onConflict: "user_id,week_start" });

      processed++;
    }

    return new Response(JSON.stringify({ processed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Consistency score error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
