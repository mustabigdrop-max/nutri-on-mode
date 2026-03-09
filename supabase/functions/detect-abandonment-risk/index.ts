import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Signal weights for risk calculation
const SIGNAL_WEIGHTS: Record<string, number> = {
  registro_queda: 3,      // Dropping registration rate
  abertura_sem_registro: 3, // Opens app without logging
  desvios_crescentes: 3,   // Increasing plan deviations
  humor_negativo: 2,       // Negative mood patterns
  resposta_emocional: 2,   // Guilt, stress responses
  refeicoes_puladas: 1,    // Skipped meals increasing
  tempo_uso_caindo: 1,     // App usage time dropping
  plateau_sem_suporte: 1,  // Weight plateau without adjustments
};

const MAX_RISK_SCORE = Object.values(SIGNAL_WEIGHTS).reduce((a, b) => a + b, 0);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId } = await req.json();
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const today = new Date().toISOString().split("T")[0];
    const threeDaysAgo = new Date(Date.now() - 3 * 86400000).toISOString().split("T")[0];
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0];
    const tenDaysAgo = new Date(Date.now() - 10 * 86400000).toISOString().split("T")[0];
    const fourteenDaysAgo = new Date(Date.now() - 14 * 86400000).toISOString().split("T")[0];

    // Fetch user profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (!profile) throw new Error("User not found");

    // Fetch recent meals (last 7 days + previous 7 days for comparison)
    const { data: recentMeals } = await supabase
      .from("meal_logs")
      .select("meal_date, meal_type, emotion, total_kcal")
      .eq("user_id", userId)
      .gte("meal_date", fourteenDaysAgo)
      .order("meal_date", { ascending: false });

    // Fetch mood check-ins
    const { data: moods } = await supabase
      .from("mood_checkins")
      .select("checkin_date, mood")
      .eq("user_id", userId)
      .gte("checkin_date", sevenDaysAgo);

    // Fetch weight logs
    const { data: weights } = await supabase
      .from("weight_logs")
      .select("weight_kg, logged_at")
      .eq("user_id", userId)
      .order("logged_at", { ascending: false })
      .limit(15);

    // Fetch plan revisions
    const { data: revisions } = await supabase
      .from("plan_revisions")
      .select("created_at, status")
      .eq("user_id", userId)
      .gte("created_at", fourteenDaysAgo);

    // Analyze signals
    const activeSignals: string[] = [];
    const signalDetails: Record<string, any> = {};
    let riskScore = 0;

    // Split meals into current week and previous week
    const thisWeekMeals = recentMeals?.filter(m => m.meal_date >= sevenDaysAgo) || [];
    const lastWeekMeals = recentMeals?.filter(m => m.meal_date < sevenDaysAgo && m.meal_date >= fourteenDaysAgo) || [];

    // Group by date
    const mealsByDate: Record<string, number> = {};
    thisWeekMeals.forEach(m => {
      mealsByDate[m.meal_date] = (mealsByDate[m.meal_date] || 0) + 1;
    });

    // SIGNAL 1: Registration rate dropping (3+ consecutive days with fewer meals)
    const dates = Object.keys(mealsByDate).sort().reverse();
    if (dates.length >= 3) {
      const recent3Days = dates.slice(0, 3).map(d => mealsByDate[d]);
      const avgRecent = recent3Days.reduce((a, b) => a + b, 0) / 3;
      const avgLastWeek = lastWeekMeals.length > 0 
        ? lastWeekMeals.length / 7 
        : 3; // Assume 3/day if no history
      
      if (avgRecent < avgLastWeek * 0.6) {
        activeSignals.push("registro_queda");
        signalDetails.registro_queda = {
          message: `Média de ${avgRecent.toFixed(1)} registros/dia (era ${avgLastWeek.toFixed(1)})`,
          severity: "high",
        };
        riskScore += SIGNAL_WEIGHTS.registro_queda;
      }
    }

    // SIGNAL 2: App opens without registration (would need session tracking - simplified)
    // Simplified: Check if there are days with 0 meals in recent period
    const daysWithNoMeals = [];
    for (let i = 0; i < 5; i++) {
      const d = new Date(Date.now() - i * 86400000).toISOString().split("T")[0];
      if (!mealsByDate[d] || mealsByDate[d] === 0) {
        daysWithNoMeals.push(d);
      }
    }
    if (daysWithNoMeals.length >= 3) {
      activeSignals.push("abertura_sem_registro");
      signalDetails.abertura_sem_registro = {
        message: `${daysWithNoMeals.length} dias sem registro nos últimos 5 dias`,
        severity: daysWithNoMeals.length >= 4 ? "high" : "medium",
      };
      riskScore += SIGNAL_WEIGHTS.abertura_sem_registro;
    }

    // SIGNAL 3: Negative mood recurrent (4+ days)
    const negativeMoods = ["cansado", "estressado", "ansioso", "triste", "desmotivado"];
    const negMoodCount = moods?.filter(m => negativeMoods.includes(m.mood)).length || 0;
    if (negMoodCount >= 4) {
      activeSignals.push("humor_negativo");
      signalDetails.humor_negativo = {
        message: `Humor negativo registrado ${negMoodCount}x nos últimos 7 dias`,
        severity: negMoodCount >= 5 ? "high" : "medium",
      };
      riskScore += SIGNAL_WEIGHTS.humor_negativo;
    }

    // SIGNAL 4: Increasing deviations (meals with guilt emotion or low quality)
    const guiltyMeals = thisWeekMeals.filter(m => m.emotion === "culpado");
    const lastWeekGuilty = lastWeekMeals.filter(m => m.emotion === "culpado");
    if (guiltyMeals.length > lastWeekGuilty.length && guiltyMeals.length >= 3) {
      activeSignals.push("desvios_crescentes");
      signalDetails.desvios_crescentes = {
        message: `${guiltyMeals.length} refeições com culpa (semana passada: ${lastWeekGuilty.length})`,
        severity: "medium",
      };
      riskScore += SIGNAL_WEIGHTS.desvios_crescentes;
    }

    // SIGNAL 5: Skipped meals increasing
    const mealsPerDayThisWeek = thisWeekMeals.length / Math.max(1, dates.length);
    const mealsPerDayLastWeek = lastWeekMeals.length / 7;
    if (mealsPerDayThisWeek < 1.5 && mealsPerDayLastWeek >= 2) {
      activeSignals.push("refeicoes_puladas");
      signalDetails.refeicoes_puladas = {
        message: `Média de ${mealsPerDayThisWeek.toFixed(1)} refeições/dia (era ${mealsPerDayLastWeek.toFixed(1)})`,
        severity: "medium",
      };
      riskScore += SIGNAL_WEIGHTS.refeicoes_puladas;
    }

    // SIGNAL 6: Emotional response (guilt 2+ times)
    if (guiltyMeals.length >= 2) {
      if (!activeSignals.includes("resposta_emocional")) {
        activeSignals.push("resposta_emocional");
        signalDetails.resposta_emocional = {
          message: `Sentimento de culpa após ${guiltyMeals.length} refeições`,
          severity: "medium",
        };
        riskScore += SIGNAL_WEIGHTS.resposta_emocional;
      }
    }

    // SIGNAL 7: Plateau without support
    if (weights && weights.length >= 5) {
      const recentWeights = weights.slice(0, 10).map(w => Number(w.weight_kg));
      const min = Math.min(...recentWeights);
      const max = Math.max(...recentWeights);
      const isPlateaued = (max - min) < 0.3;
      
      const hasRecentRevision = revisions && revisions.length > 0;
      
      if (isPlateaued && !hasRecentRevision) {
        activeSignals.push("plateau_sem_suporte");
        signalDetails.plateau_sem_suporte = {
          message: `Peso estagnado (variação < 300g) há ${weights.length}+ registros sem ajuste no plano`,
          severity: "medium",
        };
        riskScore += SIGNAL_WEIGHTS.plateau_sem_suporte;
      }
    }

    // Calculate final risk percentage and level
    const riskPct = Math.round((riskScore / MAX_RISK_SCORE) * 100);
    let riskLevel = "low";
    if (riskPct >= 61) riskLevel = "high";
    else if (riskPct >= 31) riskLevel = "medium";

    // Upsert risk score
    const { error: upsertError } = await supabase
      .from("abandonment_risk_scores")
      .upsert({
        user_id: userId,
        score_date: today,
        risk_score: riskPct,
        risk_level: riskLevel,
        active_signals: activeSignals,
        signal_details: signalDetails,
        coach_notified: false,
        ai_action_taken: false,
      }, { onConflict: "user_id,score_date" });

    if (upsertError) {
      console.error("Upsert error:", upsertError);
    }

    return new Response(JSON.stringify({
      success: true,
      risk: {
        score: riskPct,
        level: riskLevel,
        signals: activeSignals,
        details: signalDetails,
        recommendation: riskLevel === "high" 
          ? "Contato urgente recomendado dentro de 24h"
          : riskLevel === "medium"
          ? "Enviar mensagem de reengajamento pela IA"
          : "Monitoramento padrão",
      },
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("detect-abandonment-risk error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
