import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface AlertCandidate {
  tipo_alerta: string;
  mensagem: string;
  priority: number; // 1=urgent, 2=important, 3=motivational
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No auth header");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    // Fetch user data in parallel
    const today = new Date().toISOString().split("T")[0];
    const hour = new Date().getHours();
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0];
    const threeDaysAgo = new Date(Date.now() - 3 * 86400000).toISOString().split("T")[0];

    const [profileRes, todayMealsRes, recentMealsRes, weightRes, existingAlertsRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", user.id).single(),
      supabase.from("meal_logs").select("*").eq("user_id", user.id).eq("meal_date", today),
      supabase.from("meal_logs").select("*").eq("user_id", user.id).gte("meal_date", sevenDaysAgo).order("meal_date", { ascending: false }),
      supabase.from("weight_logs").select("*").eq("user_id", user.id).order("logged_at", { ascending: false }).limit(14),
      supabase.from("alertas_preditivos").select("*").eq("user_id", user.id).gte("enviado_em", new Date(Date.now() - 24 * 3600000).toISOString()),
    ]);

    const profile = profileRes.data;
    const todayMeals = todayMealsRes.data || [];
    const recentMeals = recentMealsRes.data || [];
    const weightLogs = weightRes.data || [];
    const todayAlerts = existingAlertsRes.data || [];

    if (!profile) throw new Error("No profile found");

    // Max 3 alerts per day
    if (todayAlerts.length >= 3) {
      return new Response(JSON.stringify({ alerts: [], message: "Daily alert limit reached" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const objetivo = profile.objetivo_principal || "saude_geral";
    const kcalTarget = profile.vet_kcal || 2000;
    const proteinTarget = profile.protein_g || 150;
    const streakDays = profile.streak_days || 0;
    const metaPeso = profile.meta_peso;
    const currentWeight = profile.weight_kg;
    const fullName = profile.full_name?.split(" ")[0] || "Piloto";

    // Today's totals
    const todayTotals = {
      kcal: todayMeals.reduce((s: number, m: any) => s + (Number(m.total_kcal) || 0), 0),
      protein: todayMeals.reduce((s: number, m: any) => s + (Number(m.total_protein) || 0), 0),
      carbs: todayMeals.reduce((s: number, m: any) => s + (Number(m.total_carbs) || 0), 0),
    };

    // Meal types logged today
    const todayMealTypes = new Set(todayMeals.map((m: any) => m.meal_type));

    // Recent days analysis
    const mealsByDate: Record<string, any[]> = {};
    recentMeals.forEach((m: any) => {
      if (!mealsByDate[m.meal_date]) mealsByDate[m.meal_date] = [];
      mealsByDate[m.meal_date].push(m);
    });

    const recentDates = Object.keys(mealsByDate).sort().reverse();
    const alerts: AlertCandidate[] = [];

    // Already sent alert types today
    const sentTypes = new Set(todayAlerts.map((a: any) => a.tipo_alerta));

    // ── CATEGORY 1: MEAL ALERTS ──

    // 1.1 Late meal
    if (hour >= 13 && hour < 16 && !todayMealTypes.has("almoco") && !todayMealTypes.has("lunch") && !sentTypes.has("refeicao_atrasada")) {
      alerts.push({
        tipo_alerta: "refeicao_atrasada",
        mensagem: `🍽️ Oi ${fullName}! Você costuma almoçar por volta do meio-dia. Já passou da hora — já comeu? Registra aqui antes de esquecer 😊`,
        priority: 2,
      });
    }

    // 1.2 Low protein by dinner time
    if (hour >= 18 && todayTotals.protein < proteinTarget * 0.5 && todayMeals.length > 0 && !sentTypes.has("proteina_baixa")) {
      const faltam = Math.round(proteinTarget - todayTotals.protein);
      alerts.push({
        tipo_alerta: "proteina_baixa",
        mensagem: `💪 ${fullName}, você está com ${Math.round(todayTotals.protein)}g de proteína até agora (meta: ${proteinTarget}g). Faltam ${faltam}g para fechar o dia. No jantar, prioriza uma fonte proteica — frango, peixe ou ovo resolvem isso rapidinho.`,
        priority: 2,
      });
    }

    // 1.3 Breakfast skipped pattern (check if Monday/Tuesday pattern)
    const dayOfWeek = new Date().getDay();
    if (hour >= 10 && hour < 12 && !todayMealTypes.has("cafe_da_manha") && !todayMealTypes.has("breakfast") && !sentTypes.has("cafe_pulado")) {
      // Check if user skips breakfast on this weekday often
      let skippedCount = 0;
      recentDates.forEach(date => {
        const d = new Date(date);
        if (d.getDay() === dayOfWeek) {
          const hasBf = mealsByDate[date].some((m: any) => m.meal_type === "cafe_da_manha" || m.meal_type === "breakfast");
          if (!hasBf) skippedCount++;
        }
      });
      if (skippedCount >= 2) {
        alerts.push({
          tipo_alerta: "cafe_pulado",
          mensagem: `☀️ ${fullName}, notei que neste dia da semana você costuma pular o café da manhã. Aveia, ovo cozido ou iogurte grego são rápidos e já resolvem.`,
          priority: 3,
        });
      }
    }

    // ── CATEGORY 2: WEEKLY PATTERN ALERTS ──

    // 2.1 Friday alert (if Friday and high deviation history)
    if (dayOfWeek === 5 && hour >= 10 && hour < 14 && !sentTypes.has("sexta_alerta")) {
      let fridayDeviations = 0;
      recentDates.forEach(date => {
        const d = new Date(date);
        if (d.getDay() === 5) {
          const dayKcal = mealsByDate[date].reduce((s: number, m: any) => s + (Number(m.total_kcal) || 0), 0);
          if (dayKcal > kcalTarget * 1.3 || mealsByDate[date].some((m: any) => m.emotion === "livre" || m.notes?.includes("comi fora"))) {
            fridayDeviations++;
          }
        }
      });
      if (fridayDeviations >= 2) {
        alerts.push({
          tipo_alerta: "sexta_alerta",
          mensagem: `📅 ${fullName}, as sextas costumam ser desafiadoras para você. Se sair para comer, usa o botão 'Comi fora' e a gente ajusta o resto do dia. Uma refeição não desfaz uma semana de consistência. 💪`,
          priority: 3,
        });
      }
    }

    // 2.3 Streak at risk
    if (hour >= 20 && todayMeals.length === 0 && streakDays >= 3 && !sentTypes.has("streak_risco")) {
      alerts.push({
        tipo_alerta: "streak_risco",
        mensagem: `🔥 Sua sequência de ${streakDays} dias está em risco! Registra qualquer coisa que você comeu hoje — mesmo que tenha sido simples. Manter o hábito de registrar vale mais do que a refeição perfeita.`,
        priority: 2,
      });
    }

    // ── CATEGORY 3: PROGRESS ALERTS ──

    // 3.1 Plateau detection
    if (weightLogs.length >= 5 && !sentTypes.has("plateau")) {
      const recentWeights = weightLogs.slice(0, 10).map((w: any) => Number(w.weight_kg));
      const min = Math.min(...recentWeights);
      const max = Math.max(...recentWeights);
      if (max - min < 0.3) {
        // Calculate average recent kcal
        const last14Meals = recentMeals.slice(0, 30);
        const avgKcal = last14Meals.length > 0 ? Math.round(last14Meals.reduce((s: number, m: any) => s + (Number(m.total_kcal) || 0), 0) / Math.max(recentDates.length, 1)) : 0;
        alerts.push({
          tipo_alerta: "plateau",
          mensagem: `📊 ${fullName}, seu peso está estável há vários dias. Isso é normal no processo — mas pode ser hora de ajustar algo. Sua média calórica recente foi de ${avgKcal} kcal/dia. Quer que eu avise seu coach para revisar o plano?`,
          priority: 2,
        });
      }
    }

    // 3.3 Close to goal
    if (metaPeso && currentWeight && !sentTypes.has("meta_proxima")) {
      const diff = Math.abs(currentWeight - metaPeso);
      if (diff <= 3 && diff > 0) {
        alerts.push({
          tipo_alerta: "meta_proxima",
          mensagem: `🎯 ${fullName}, você está a APENAS ${diff.toFixed(1)}kg da sua meta! Se mantiver esse ritmo, chega lá em breve. Não para agora. 🔥`,
          priority: 3,
        });
      }
    }

    // ── CATEGORY 4: OBJECTIVE-SPECIFIC ALERTS ──

    // Aggressive deficit (weight loss goal)
    if (objetivo === "emagrecimento" && !sentTypes.has("deficit_agressivo")) {
      const last3DaysKcal: number[] = [];
      recentDates.slice(0, 3).forEach(date => {
        const dayKcal = mealsByDate[date].reduce((s: number, m: any) => s + (Number(m.total_kcal) || 0), 0);
        last3DaysKcal.push(dayKcal);
      });
      if (last3DaysKcal.length === 3 && last3DaysKcal.every(k => k > 0 && k < 1000)) {
        const avg = Math.round(last3DaysKcal.reduce((a, b) => a + b, 0) / 3);
        alerts.push({
          tipo_alerta: "deficit_agressivo",
          mensagem: `⚠️ ${fullName}, nos últimos 3 dias você consumiu em média ${avg} kcal — bem abaixo do plano de ${kcalTarget} kcal. Déficit muito agressivo pode desacelerar o metabolismo e aumentar a perda de músculo.`,
          priority: 1,
        });
      }
    }

    // Hypertrophy: protein too low
    if (objetivo === "hipertrofia" && !sentTypes.has("proteina_hipertrofia")) {
      const last3DaysProt: number[] = [];
      recentDates.slice(0, 3).forEach(date => {
        const dayProt = mealsByDate[date].reduce((s: number, m: any) => s + (Number(m.total_protein) || 0), 0);
        last3DaysProt.push(dayProt);
      });
      if (last3DaysProt.length === 3 && last3DaysProt.every(p => p < proteinTarget * 0.8 && p > 0)) {
        const avg = Math.round(last3DaysProt.reduce((a, b) => a + b, 0) / 3);
        alerts.push({
          tipo_alerta: "proteina_hipertrofia",
          mensagem: `💪 ${fullName}, sua proteína ficou abaixo da meta nos últimos 3 dias (média: ${avg}g | meta: ${proteinTarget}g). Sem proteína suficiente, o músculo não cresce. Hoje: prioriza proteína em TODAS as refeições. 🎯`,
          priority: 1,
        });
      }
    }

    // ── CATEGORY 5: EMOTIONAL ──

    // After guilty free meal
    const recentGuilty = recentMeals.find((m: any) => m.emotion === "culpado" && m.meal_date === today);
    if (recentGuilty && !sentTypes.has("acolhimento_culpa")) {
      alerts.push({
        tipo_alerta: "acolhimento_culpa",
        mensagem: `${fullName}, quero te lembrar de algo importante: uma refeição não define seu progresso. O que define é o que você faz DEPOIS. Próxima refeição: volta ao plano, sem drama. ${streakDays} dias de consistência não somem por uma refeição. 💙`,
        priority: 2,
      });
    }

    // Sort by priority and limit
    alerts.sort((a, b) => a.priority - b.priority);
    const maxNew = 3 - todayAlerts.length;
    const toInsert = alerts.slice(0, maxNew);

    // Insert alerts
    if (toInsert.length > 0) {
      const rows = toInsert.map(a => ({
        user_id: user.id,
        tipo_alerta: a.tipo_alerta,
        mensagem: a.mensagem,
        lido: false,
      }));
      await supabase.from("alertas_preditivos").insert(rows);
    }

    // Return all today's alerts (existing + new)
    const { data: allAlerts } = await supabase
      .from("alertas_preditivos")
      .select("*")
      .eq("user_id", user.id)
      .eq("lido", false)
      .order("enviado_em", { ascending: false })
      .limit(5);

    return new Response(JSON.stringify({ alerts: allAlerts || [] }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-alerts error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
