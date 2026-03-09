import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { userId } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Fetch circadian profile
    const { data: circProfile } = await supabase
      .from("circadian_profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (!circProfile) {
      return new Response(JSON.stringify({ error: "Perfil circadiano não encontrado" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch user profile for macros
    const { data: userProfile } = await supabase
      .from("profiles")
      .select("vet_kcal, protein_g, carbs_g, fat_g, goal, weight_kg, active_protocol")
      .eq("user_id", userId)
      .single();

    // Fetch workout schedule for today
    const dayOfWeek = new Date().getDay();
    const { data: todayWorkout } = await supabase
      .from("workout_schedule")
      .select("workout_type, workout_time, duration_minutes")
      .eq("user_id", userId)
      .eq("day_of_week", dayOfWeek)
      .maybeSingle();

    const prompt = `Você é um nutricionista especializado em cronobiologia e nutrição circadiana.

Gere um plano alimentar circadiano personalizado baseado nos seguintes dados:

PERFIL CIRCADIANO:
- Horário de acordar: ${circProfile.wake_time}
- Horário de dormir: ${circProfile.sleep_time}
- Cronotipo: ${circProfile.chronotype}
- Pico de energia: ${circProfile.peak_energy}
- Frequência de refeições: ${circProfile.meal_frequency}x/dia

METAS NUTRICIONAIS:
- VET: ${userProfile?.vet_kcal || 2000} kcal
- Proteína: ${userProfile?.protein_g || 150}g
- Carboidratos: ${userProfile?.carbs_g || 250}g
- Gordura: ${userProfile?.fat_g || 65}g
- Objetivo: ${userProfile?.goal || "manutenção"}
- Protocolo ativo: ${userProfile?.active_protocol || "flexível"}

${todayWorkout ? `TREINO HOJE:
- Tipo: ${todayWorkout.workout_type}
- Horário: ${todayWorkout.workout_time}
- Duração: ${todayWorkout.duration_minutes}min` : "SEM TREINO HOJE"}

REGRAS CIRCADIANAS OBRIGATÓRIAS:
1. Carboidratos: 35% nas primeiras 4h após acordar (sensibilidade insulínica máxima)
2. Pré-treino: 25% dos carbs independente do horário
3. Pós-treino: 20% dos carbs (carbs rápidos)
4. Após 20h: máximo 10% dos carbs (resistência insulínica noturna)
5. Vespertino: deslocar todas as janelas +2-3h, refeições maiores à tarde/noite
6. Proteína: máximo 40g por refeição, distribuir uniformemente
7. Última refeição: priorizar caseína (digestão lenta)
8. Primeira refeição: proteína rápida (whey, ovos)
9. Manhã: gorduras saturadas + omega-3 (produção hormonal)
10. Noite: evitar gordura alta (prejudica sono)
11. 06-09h: cortisol alto → apenas carbs de baixo IG
12. 12-14h: cortisol baixo → janela da refeição principal
13. 21-23h: alimentos ricos em triptofano para sono

Retorne APENAS JSON válido (sem markdown):
{
  "meals": [
    {
      "time": "HH:MM",
      "label": "Nome da refeição",
      "context_tag": "Pico Insulínico|Janela Principal|Cortisol Caindo|Pré-treino|Pós-treino|Janela Anabólica|Preparação Sono",
      "carbs_g": number,
      "protein_g": number,
      "fat_g": number,
      "foods": ["alimento 1", "alimento 2"],
      "tip": "dica circadiana breve"
    }
  ],
  "ai_message": "mensagem personalizada de 2-3 frases sobre o cronotipo do usuário e como o plano foi otimizado"
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "user", content: prompt }],
        stream: false,
      }),
    });

    if (!response.ok) {
      const t = await response.text();
      console.error("AI error:", response.status, t);
      return new Response(JSON.stringify({ error: "Erro na geração do plano circadiano" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content || "";
    const jsonStr = content.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(jsonStr);

    const meals = parsed.meals || [];
    const totalCalories = meals.reduce((s: number, m: any) => s + (m.carbs_g * 4 + m.protein_g * 4 + m.fat_g * 9), 0);
    const totalProtein = meals.reduce((s: number, m: any) => s + m.protein_g, 0);
    const totalCarbs = meals.reduce((s: number, m: any) => s + m.carbs_g, 0);
    const totalFat = meals.reduce((s: number, m: any) => s + m.fat_g, 0);

    // Save to DB
    const { error: insertError } = await supabase.from("circadian_meal_plans").insert({
      user_id: userId,
      meals: meals,
      total_calories: Math.round(totalCalories),
      total_protein: Math.round(totalProtein),
      total_carbs: Math.round(totalCarbs),
      total_fat: Math.round(totalFat),
      chronotype_applied: circProfile.chronotype,
      workout_integrated: !!todayWorkout,
      ai_message: parsed.ai_message || null,
    });

    if (insertError) {
      console.error("Insert error:", insertError);
      throw insertError;
    }

    return new Response(JSON.stringify({ success: true, meals, ai_message: parsed.ai_message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-circadian-plan error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
