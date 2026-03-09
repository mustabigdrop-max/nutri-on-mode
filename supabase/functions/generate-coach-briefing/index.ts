import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RISK_LABELS: Record<string, string> = {
  low: "🟢 BAIXO",
  medium: "🟡 MÉDIO",
  high: "🔴 ALTO",
};

const TONE_RECOMMENDATIONS: Record<string, string> = {
  positive: "Motivacional — Reforçar conquistas e manter momentum",
  struggling: "Acolhedor — Empatia antes de soluções técnicas",
  stagnant: "Analítico — Dados para identificar bloqueios",
  declining: "Desafiador — Confrontar padrões com carinho",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { coachId, patientId, weekStart } = await req.json();
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    // Calculate week boundaries
    const weekStartDate = new Date(weekStart);
    const weekEndDate = new Date(weekStartDate);
    weekEndDate.setDate(weekEndDate.getDate() + 6);
    const weekEndStr = weekEndDate.toISOString().split("T")[0];

    // Fetch patient profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", patientId)
      .single();

    if (!profile) throw new Error("Patient profile not found");

    // Fetch week's meal logs
    const { data: meals } = await supabase
      .from("meal_logs")
      .select("*")
      .eq("user_id", patientId)
      .gte("meal_date", weekStart)
      .lte("meal_date", weekEndStr)
      .order("meal_date", { ascending: true });

    // Fetch weight logs
    const { data: weights } = await supabase
      .from("weight_logs")
      .select("*")
      .eq("user_id", patientId)
      .order("logged_at", { ascending: false })
      .limit(14);

    // Fetch mood check-ins
    const { data: moods } = await supabase
      .from("mood_checkins")
      .select("*")
      .eq("user_id", patientId)
      .gte("checkin_date", weekStart)
      .lte("checkin_date", weekEndStr);

    // Fetch consistency scores
    const { data: scores } = await supabase
      .from("consistency_scores")
      .select("*")
      .eq("user_id", patientId)
      .order("week_start", { ascending: false })
      .limit(4);

    // Fetch meal plan items for the week
    const { data: planItems } = await supabase
      .from("meal_plan_items")
      .select("*")
      .eq("user_id", patientId)
      .eq("week_start", weekStart);

    // Calculate metrics
    const totalMeals = meals?.length || 0;
    const plannedMeals = 21; // 3 meals * 7 days
    const adherenceRate = Math.round((totalMeals / plannedMeals) * 100);
    
    const avgKcal = meals?.length 
      ? Math.round(meals.reduce((s, m) => s + (m.total_kcal || 0), 0) / Math.max(1, new Set(meals.map(m => m.meal_date)).size))
      : 0;
    const avgProtein = meals?.length
      ? Math.round(meals.reduce((s, m) => s + (m.total_protein || 0), 0) / Math.max(1, new Set(meals.map(m => m.meal_date)).size))
      : 0;
    const avgCarbs = meals?.length
      ? Math.round(meals.reduce((s, m) => s + (m.total_carbs || 0), 0) / Math.max(1, new Set(meals.map(m => m.meal_date)).size))
      : 0;
    const avgFat = meals?.length
      ? Math.round(meals.reduce((s, m) => s + (m.total_fat || 0), 0) / Math.max(1, new Set(meals.map(m => m.meal_date)).size))
      : 0;

    // Analyze patterns
    const mealsByDate: Record<string, any[]> = {};
    meals?.forEach(m => {
      if (!mealsByDate[m.meal_date]) mealsByDate[m.meal_date] = [];
      mealsByDate[m.meal_date].push(m);
    });

    const mealsByType: Record<string, number> = {};
    meals?.forEach(m => {
      mealsByType[m.meal_type] = (mealsByType[m.meal_type] || 0) + 1;
    });

    // Find critical points
    const criticalPoints: string[] = [];
    const positivePoints: string[] = [];

    // Check adherence
    if (adherenceRate < 50) {
      criticalPoints.push(`Adesão crítica: apenas ${adherenceRate}% das refeições registradas`);
    } else if (adherenceRate < 70) {
      criticalPoints.push(`Adesão abaixo do esperado: ${adherenceRate}% das refeições registradas`);
    } else if (adherenceRate >= 85) {
      positivePoints.push(`Excelente adesão: ${adherenceRate}% de registro`);
    }

    // Check protein
    const proteinTarget = profile.protein_g || 150;
    const proteinPct = Math.round((avgProtein / proteinTarget) * 100);
    if (proteinPct < 60) {
      criticalPoints.push(`Proteína crítica: média ${avgProtein}g/dia (${proteinPct}% da meta de ${proteinTarget}g)`);
    } else if (proteinPct >= 90) {
      positivePoints.push(`Proteína consistente: ${avgProtein}g/dia (${proteinPct}% da meta)`);
    }

    // Check emotional patterns
    const negMoods = moods?.filter(m => ["cansado", "estressado", "ansioso", "triste"].includes(m.mood)) || [];
    if (negMoods.length >= 3) {
      criticalPoints.push(`Humor negativo em ${negMoods.length} dias (${negMoods.map(m => m.mood).join(", ")})`);
    }

    // Check guilt emotions in meals
    const guiltyMeals = meals?.filter(m => m.emotion === "culpado") || [];
    if (guiltyMeals.length >= 2) {
      criticalPoints.push(`Registrou culpa após comer ${guiltyMeals.length}x esta semana`);
    }

    // Weight trend
    let weightTrend = "estável";
    let weightChange = 0;
    if (weights && weights.length >= 2) {
      const recent = weights[0].weight_kg;
      const older = weights[Math.min(6, weights.length - 1)].weight_kg;
      weightChange = Number((recent - older).toFixed(1));
      if (weightChange < -0.3) weightTrend = "perdendo";
      else if (weightChange > 0.3) weightTrend = "ganhando";
    }

    if (profile.goal === "lose_weight" && weightTrend === "perdendo") {
      positivePoints.push(`Peso em tendência de queda: ${weightChange}kg na semana`);
    } else if (profile.goal === "lose_weight" && weightTrend === "ganhando") {
      criticalPoints.push(`Peso subindo (${weightChange}kg) — objetivo é emagrecimento`);
    }

    // Determine risk level and tone
    let riskLevel = "low";
    let recommendedTone = "positive";
    
    if (criticalPoints.length >= 3 || adherenceRate < 40) {
      riskLevel = "high";
      recommendedTone = "struggling";
    } else if (criticalPoints.length >= 2 || adherenceRate < 60) {
      riskLevel = "medium";
      recommendedTone = "stagnant";
    } else if (positivePoints.length >= 2) {
      recommendedTone = "positive";
    }

    // Build AI prompt for analysis
    const prompt = `Você é um assistente de coaching nutricional. Analise os dados do paciente e gere um briefing para o coach.

PACIENTE: ${profile.full_name || "Paciente"}
OBJETIVO: ${profile.objetivo_principal || profile.goal || "não definido"}
META CALÓRICA: ${profile.vet_kcal || 2000}kcal | PROTEÍNA: ${proteinTarget}g
PERFIL COMPORTAMENTAL: ${profile.perfil_comportamental || "não identificado"}

DADOS DA SEMANA (${weekStart} a ${weekEndStr}):
- Refeições registradas: ${totalMeals} de 21 (${adherenceRate}%)
- Média diária: ${avgKcal}kcal | ${avgProtein}g prot | ${avgCarbs}g carbo | ${avgFat}g gord
- Tendência de peso: ${weightTrend} (${weightChange > 0 ? "+" : ""}${weightChange}kg)
- Score de consistência atual: ${scores?.[0]?.total_score || "N/A"}/100

PONTOS CRÍTICOS IDENTIFICADOS:
${criticalPoints.length > 0 ? criticalPoints.map(p => `→ ${p}`).join("\n") : "Nenhum ponto crítico identificado"}

PONTOS POSITIVOS:
${positivePoints.length > 0 ? positivePoints.map(p => `→ ${p}`).join("\n") : "Sem destaques positivos esta semana"}

HUMOR DA SEMANA:
${moods?.map(m => `${m.checkin_date}: ${m.mood}`).join(", ") || "Sem registros de humor"}

Gere um JSON com:
1. "ai_analysis": Análise em linguagem natural do comportamento do paciente (2-3 parágrafos)
2. "hypothesis": Hipótese sobre o que está causando os desvios (se houver)
3. "suggested_questions": Array com 3 perguntas específicas para o coach fazer no check-in
4. "suggested_adjustments": Array com 2-3 sugestões de ajustes no plano com justificativa
5. "positive_highlights": Array com conquistas para o coach reforçar

Responda APENAS com JSON válido, sem markdown.`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!aiResponse.ok) {
      const err = await aiResponse.text();
      console.error("AI error:", err);
      throw new Error("AI analysis failed");
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content || "{}";
    
    let parsed;
    try {
      // Clean potential markdown
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = {
        ai_analysis: "Análise não disponível",
        hypothesis: "",
        suggested_questions: [],
        suggested_adjustments: [],
        positive_highlights: positivePoints,
      };
    }

    // Build briefing data
    const briefingData = {
      patient_name: profile.full_name || "Paciente",
      objective: profile.objetivo_principal || profile.goal,
      weeks_in_program: Math.floor((Date.now() - new Date(profile.created_at).getTime()) / (7 * 86400000)),
      weight_current: weights?.[0]?.weight_kg,
      weight_trend: weightTrend,
      weight_change: weightChange,
      adherence_rate: adherenceRate,
      total_meals: totalMeals,
      consistency_score: scores?.[0]?.total_score || 0,
      macros: {
        kcal: { avg: avgKcal, target: profile.vet_kcal || 2000, pct: Math.round((avgKcal / (profile.vet_kcal || 2000)) * 100) },
        protein: { avg: avgProtein, target: proteinTarget, pct: proteinPct },
        carbs: { avg: avgCarbs, target: profile.carbs_g || 250, pct: Math.round((avgCarbs / (profile.carbs_g || 250)) * 100) },
        fat: { avg: avgFat, target: profile.fat_g || 70, pct: Math.round((avgFat / (profile.fat_g || 70)) * 100) },
      },
      critical_points: criticalPoints,
      mood_summary: moods?.map(m => ({ date: m.checkin_date, mood: m.mood })) || [],
      hypothesis: parsed.hypothesis || "",
    };

    // Upsert briefing
    const { error: insertError } = await supabase
      .from("coach_briefings")
      .upsert({
        coach_id: coachId,
        patient_id: patientId,
        week_start: weekStart,
        briefing_data: briefingData,
        ai_analysis: parsed.ai_analysis || "",
        suggested_questions: parsed.suggested_questions || [],
        suggested_adjustments: parsed.suggested_adjustments || [],
        recommended_tone: TONE_RECOMMENDATIONS[recommendedTone] || recommendedTone,
        risk_level: riskLevel,
        positive_highlights: parsed.positive_highlights || positivePoints,
        status: "pending",
      }, { onConflict: "coach_id,patient_id,week_start" });

    if (insertError) {
      console.error("Insert error:", insertError);
    }

    return new Response(JSON.stringify({
      success: true,
      briefing: {
        ...briefingData,
        ai_analysis: parsed.ai_analysis,
        suggested_questions: parsed.suggested_questions,
        suggested_adjustments: parsed.suggested_adjustments,
        recommended_tone: TONE_RECOMMENDATIONS[recommendedTone],
        risk_level: riskLevel,
        risk_label: RISK_LABELS[riskLevel],
        positive_highlights: parsed.positive_highlights || positivePoints,
      },
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-coach-briefing error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
