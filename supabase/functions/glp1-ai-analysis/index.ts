import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }
    const userId = claimsData.claims.sub;

    // Fetch all relevant data in parallel
    const today = new Date().toISOString().split("T")[0];
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0];

    const [profileRes, glp1ProfileRes, logsRes, scoresRes, mealLogsRes, waterRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", userId).single(),
      supabase.from("glp1_profiles").select("*").eq("user_id", userId).single(),
      supabase.from("glp1_daily_logs").select("*").eq("user_id", userId).order("log_date", { ascending: false }).limit(14),
      supabase.from("glp1_weekly_scores").select("*").eq("user_id", userId).order("week_start", { ascending: false }).limit(4),
      supabase.from("meal_logs").select("total_kcal, total_protein, meal_date").eq("user_id", userId).gte("meal_date", sevenDaysAgo),
      supabase.from("water_logs").select("ml_total, log_date").eq("user_id", userId).gte("log_date", sevenDaysAgo),
    ]);

    const profile = profileRes.data;
    const glp1Profile = glp1ProfileRes.data;

    if (!profile || !glp1Profile) {
      return new Response(JSON.stringify({ error: "Profile not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const dailyLogs = logsRes.data || [];
    const weeklyScores = scoresRes.data || [];
    const mealLogs = mealLogsRes.data || [];
    const waterLogs = waterRes.data || [];
    const weight = profile.weight_kg || 70;
    const proteinGoal = Math.round(weight * 2.0);
    const kcalGoal = Math.max(1000, Math.round(weight * 20));
    const name = profile.full_name?.split(" ")[0] || "Piloto";

    // Aggregate meal data by day
    const mealsByDate: Record<string, { kcal: number; protein: number }> = {};
    mealLogs.forEach((m: any) => {
      if (!mealsByDate[m.meal_date]) mealsByDate[m.meal_date] = { kcal: 0, protein: 0 };
      mealsByDate[m.meal_date].kcal += Number(m.total_kcal) || 0;
      mealsByDate[m.meal_date].protein += Number(m.total_protein) || 0;
    });

    const waterByDate: Record<string, number> = {};
    waterLogs.forEach((w: any) => {
      waterByDate[w.log_date] = (waterByDate[w.log_date] || 0) + Number(w.ml_total);
    });

    // Build context for AI
    const profileClass = glp1Profile.profile_class || "iniciante";
    const medication = glp1Profile.medication || "ozempic";
    const objective = glp1Profile.objective || "emagrecer";
    const exitWeek = glp1Profile.exit_week || 0;

    const last7DaysSummary = Object.entries(mealsByDate)
      .sort(([a], [b]) => b.localeCompare(a))
      .slice(0, 7)
      .map(([date, data]) => `${date}: ${Math.round(data.kcal)}kcal, ${Math.round(data.protein)}g proteína, ${waterByDate[date] || 0}ml água`)
      .join("\n");

    const glp1LogsSummary = dailyLogs.slice(0, 7).map((l: any) =>
      `${l.log_date}: ${l.protein_g}g prot, ${l.total_kcal}kcal, ${l.hydration_ml}ml água, náusea:${l.nausea_level}/10, energia:${l.energy_level}/10`
    ).join("\n");

    const latestScore = weeklyScores[0];
    const scoreSummary = latestScore
      ? `Score: ${latestScore.protocol_score}/100, Prot média: ${latestScore.avg_protein_g}g, Kcal média: ${latestScore.avg_kcal}`
      : "Sem score semanal ainda";

    const systemPrompt = `Você é o nutricionista especialista em GLP-1 do nutriON. 
Analise os dados do paciente e gere:
1. alerts: array de até 4 alertas personalizados (cada um com type: "warning"|"success"|"info", e text: string curto e direto)
2. weekly_analysis: string com análise semanal em 2-3 parágrafos curtos, linguagem empática e direta
3. recommendations: array de 3 ações concretas para a próxima semana
4. protocol_adjustments: string curta com sugestão de ajuste se necessário, ou null

Regras:
- Priorize alertas de risco de sarcopenia (proteína baixa)
- Alerte se kcal < 1000 por mais de 2 dias
- Celebre conquistas (5+ dias batendo meta de proteína)
- Para perfil "saida", foque em reganho e transição
- Use o nome do paciente
- Seja direto, motivador, nunca genérico
- Responda APENAS via tool call, sem texto`;

    const userPrompt = `Paciente: ${name}
Peso: ${weight}kg | Meta proteína: ${proteinGoal}g/dia | Meta kcal: ${kcalGoal}/dia
Medicamento: ${medication} | Perfil: ${profileClass} | Objetivo: ${objective}
${profileClass === "saida" ? `Semana de saída: ${exitWeek}/12` : ""}

Últimos 7 dias (refeições):
${last7DaysSummary || "Sem dados de refeições"}

Logs GLP-1 (últimos 7 dias):
${glp1LogsSummary || "Sem logs GLP-1"}

Score semanal anterior: ${scoreSummary}`;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [{
          type: "function",
          function: {
            name: "glp1_analysis",
            description: "Return GLP-1 protocol analysis with alerts and recommendations",
            parameters: {
              type: "object",
              properties: {
                alerts: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      type: { type: "string", enum: ["warning", "success", "info"] },
                      text: { type: "string" },
                    },
                    required: ["type", "text"],
                    additionalProperties: false,
                  },
                },
                weekly_analysis: { type: "string" },
                recommendations: {
                  type: "array",
                  items: { type: "string" },
                },
                protocol_adjustments: { type: "string" },
              },
              required: ["alerts", "weekly_analysis", "recommendations"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "glp1_analysis" } },
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errText);
      throw new Error("AI gateway error");
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall?.function?.arguments) {
      throw new Error("No tool call in AI response");
    }

    const analysis = JSON.parse(toolCall.function.arguments);

    // Calculate and upsert weekly score
    const weekDays = dailyLogs.filter((l: any) => l.log_date >= sevenDaysAgo);
    if (weekDays.length >= 3) {
      const avgProtein = Math.round(weekDays.reduce((s: number, l: any) => s + (Number(l.protein_g) || 0), 0) / weekDays.length);
      const avgKcal = Math.round(weekDays.reduce((s: number, l: any) => s + (Number(l.total_kcal) || 0), 0) / weekDays.length);
      const avgHydration = Math.round(weekDays.reduce((s: number, l: any) => s + (Number(l.hydration_ml) || 0), 0) / weekDays.length);

      // Score calculation
      const proteinScore = Math.min(40, Math.round((avgProtein / proteinGoal) * 40));
      const kcalScore = avgKcal >= 1000 ? Math.min(30, Math.round((avgKcal / kcalGoal) * 30)) : Math.round((avgKcal / 1000) * 15);
      const hydrationScore = Math.min(30, Math.round((avgHydration / 2500) * 30));
      const protocolScore = Math.min(100, proteinScore + kcalScore + hydrationScore);

      const weekStart = sevenDaysAgo;
      const weekEnd = today;

      await supabase.from("glp1_weekly_scores").upsert({
        user_id: userId,
        week_start: weekStart,
        week_end: weekEnd,
        avg_protein_g: avgProtein,
        avg_kcal: avgKcal,
        avg_hydration_ml: avgHydration,
        protocol_score: protocolScore,
        alerts_triggered: (analysis.alerts || []).filter((a: any) => a.type === "warning").length,
      }, { onConflict: "user_id,week_start" });
    }

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("glp1-ai-analysis error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
