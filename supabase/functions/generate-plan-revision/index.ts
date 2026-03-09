import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, coachId } = await req.json();
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    // Calculate 14-day period
    const today = new Date();
    const periodEnd = today.toISOString().split("T")[0];
    const periodStart = new Date(Date.now() - 14 * 86400000).toISOString().split("T")[0];

    // Fetch user profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (!profile) throw new Error("User not found");

    // Fetch meal logs for the period
    const { data: meals } = await supabase
      .from("meal_logs")
      .select("*")
      .eq("user_id", userId)
      .gte("meal_date", periodStart)
      .lte("meal_date", periodEnd)
      .order("meal_date", { ascending: true });

    // Fetch current meal plan
    const { data: planItems } = await supabase
      .from("meal_plan_items")
      .select("*")
      .eq("user_id", userId)
      .order("day_index", { ascending: true });

    // Analyze eating patterns
    const mealsByType: Record<string, { count: number; foods: string[]; avgKcal: number; avgProtein: number }> = {};
    const foodFrequency: Record<string, number> = {};
    const substitutionPatterns: Record<string, { original: string; substitute: string; count: number }[]> = {};
    
    meals?.forEach(meal => {
      const type = meal.meal_type;
      if (!mealsByType[type]) {
        mealsByType[type] = { count: 0, foods: [], avgKcal: 0, avgProtein: 0 };
      }
      mealsByType[type].count++;
      mealsByType[type].avgKcal += (meal.total_kcal || 0);
      mealsByType[type].avgProtein += (meal.total_protein || 0);
      
      // Track food names
      if (meal.food_names) {
        meal.food_names.forEach((f: string) => {
          foodFrequency[f] = (foodFrequency[f] || 0) + 1;
          mealsByType[type].foods.push(f);
        });
      }
    });

    // Calculate averages
    Object.keys(mealsByType).forEach(type => {
      const data = mealsByType[type];
      if (data.count > 0) {
        data.avgKcal = Math.round(data.avgKcal / data.count);
        data.avgProtein = Math.round(data.avgProtein / data.count);
      }
    });

    // Analyze plan items that are never consumed
    const plannedFoods: Record<string, { mealType: string; count: number }> = {};
    planItems?.forEach(item => {
      const key = item.food_name.toLowerCase();
      if (!plannedFoods[key]) {
        plannedFoods[key] = { mealType: item.meal_type, count: 0 };
      }
      plannedFoods[key].count++;
    });

    // Find foods planned but never eaten
    const neverEaten: string[] = [];
    const alwaysSubstituted: string[] = [];
    
    Object.keys(plannedFoods).forEach(food => {
      const freq = foodFrequency[food] || 0;
      if (freq === 0) {
        neverEaten.push(food);
      } else if (freq < plannedFoods[food].count * 0.3) {
        alwaysSubstituted.push(food);
      }
    });

    // Find frequently eaten foods not in plan
    const topEatenFoods = Object.entries(foodFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    // Calculate meal type adherence
    const mealTypeStats: Record<string, { planned: number; logged: number; rate: number }> = {};
    const mealTypes = ["cafe_manha", "lanche_manha", "almoco", "lanche_tarde", "jantar", "ceia"];
    
    mealTypes.forEach(type => {
      const planned = 14; // 14 days
      const logged = mealsByType[type]?.count || 0;
      mealTypeStats[type] = {
        planned,
        logged,
        rate: Math.round((logged / planned) * 100),
      };
    });

    // Find most skipped meal
    const mostSkippedMeal = Object.entries(mealTypeStats)
      .sort((a, b) => a[1].rate - b[1].rate)[0];

    // Build AI prompt
    const prompt = `Você é um nutricionista analisando o comportamento alimentar real de um paciente para propor ajustes no plano alimentar.

PACIENTE: ${profile.full_name || "Paciente"}
OBJETIVO: ${profile.objetivo_principal || profile.goal || "não definido"}
PERFIL COMPORTAMENTAL: ${profile.perfil_comportamental || "não identificado"}
METAS: ${profile.vet_kcal}kcal | ${profile.protein_g}g proteína | ${profile.carbs_g}g carbos | ${profile.fat_g}g gordura

PERÍODO ANALISADO: ${periodStart} a ${periodEnd} (14 dias)

REFEIÇÕES POR TIPO:
${Object.entries(mealsByType).map(([type, data]) => 
  `- ${type}: ${data.count} registros (média: ${data.avgKcal}kcal, ${data.avgProtein}g prot)`
).join("\n")}

ALIMENTOS DO PLANO NUNCA CONSUMIDOS:
${neverEaten.length > 0 ? neverEaten.join(", ") : "Nenhum"}

ALIMENTOS SEMPRE SUBSTITUÍDOS (< 30% de adesão):
${alwaysSubstituted.length > 0 ? alwaysSubstituted.join(", ") : "Nenhum"}

TOP 10 ALIMENTOS MAIS CONSUMIDOS:
${topEatenFoods.map(([food, count]) => `- ${food}: ${count}x`).join("\n")}

REFEIÇÃO MAIS PULADA: ${mostSkippedMeal?.[0] || "N/A"} (${mostSkippedMeal?.[1]?.rate || 0}% de adesão)

ESTATÍSTICAS POR REFEIÇÃO:
${Object.entries(mealTypeStats).map(([type, stats]) => 
  `- ${type}: ${stats.logged}/14 dias (${stats.rate}%)`
).join("\n")}

Com base nestes dados, proponha ajustes ESPECÍFICOS no plano alimentar para aumentar a adesão real.

IMPORTANTE: 
- Substitua alimentos que nunca são comidos por opções que o paciente realmente consome
- Simplifique refeições que são frequentemente puladas
- Mantenha os macros o mais próximo possível das metas
- Cada ajuste deve ter impacto calculado em macros

Retorne um JSON com:
{
  "analysis_summary": "Resumo da análise em 2-3 frases",
  "proposed_changes": [
    {
      "meal_type": "tipo da refeição",
      "change_type": "substituir" | "simplificar" | "adicionar" | "remover",
      "original": "alimento/refeição original (se aplicável)",
      "proposed": "nova proposta",
      "justification": "por que esta mudança faz sentido baseado nos dados",
      "impact": {
        "kcal": número (diferença),
        "protein": número (diferença em g),
        "adherence_expected": "porcentagem esperada de adesão"
      }
    }
  ],
  "impact_summary": {
    "total_kcal_change": número,
    "total_protein_change": número,
    "expected_adherence_improvement": "porcentagem"
  }
}

Responda APENAS com JSON válido.`;

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
      throw new Error("AI analysis failed");
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content || "{}";
    
    let parsed;
    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = {
        analysis_summary: "Análise não disponível",
        proposed_changes: [],
        impact_summary: {},
      };
    }

    // Save revision proposal
    const { data: revision, error: insertError } = await supabase
      .from("plan_revisions")
      .insert({
        user_id: userId,
        coach_id: coachId,
        analysis_period_start: periodStart,
        analysis_period_end: periodEnd,
        proposed_changes: parsed.proposed_changes || [],
        analysis_summary: parsed.analysis_summary || "",
        impact_summary: parsed.impact_summary || {},
        status: "pending",
      })
      .select()
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
    }

    return new Response(JSON.stringify({
      success: true,
      revision: {
        id: revision?.id,
        period: { start: periodStart, end: periodEnd },
        analysis: parsed.analysis_summary,
        changes: parsed.proposed_changes,
        impact: parsed.impact_summary,
        raw_data: {
          mealsByType,
          neverEaten,
          alwaysSubstituted,
          topFoods: topEatenFoods,
          mealTypeStats,
        },
      },
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-plan-revision error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
