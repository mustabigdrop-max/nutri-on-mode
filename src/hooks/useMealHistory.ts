import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useMealHistory = () => {
  const { user } = useAuth();
  const [mealHistoryContext, setMealHistoryContext] = useState("");

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      const { data: meals } = await supabase
        .from("meal_logs")
        .select("meal_type, total_kcal, total_protein, total_carbs, total_fat, meal_date, emotion, hunger_level, satiety_level, notes")
        .eq("user_id", user.id)
        .gte("meal_date", ninetyDaysAgo.toISOString().split("T")[0])
        .order("meal_date", { ascending: false })
        .limit(200);

      if (!meals || meals.length === 0) {
        setMealHistoryContext("Sem refeições registradas ainda.");
        return;
      }

      // Build summary by day
      const byDay: Record<string, { kcal: number; prot: number; carbs: number; fat: number; meals: string[]; emotions: string[] }> = {};
      for (const m of meals) {
        const day = m.meal_date;
        if (!byDay[day]) byDay[day] = { kcal: 0, prot: 0, carbs: 0, fat: 0, meals: [], emotions: [] };
        byDay[day].kcal += Number(m.total_kcal || 0);
        byDay[day].prot += Number(m.total_protein || 0);
        byDay[day].carbs += Number(m.total_carbs || 0);
        byDay[day].fat += Number(m.total_fat || 0);
        byDay[day].meals.push(m.meal_type);
        if (m.emotion) byDay[day].emotions.push(m.emotion);
      }

      const days = Object.entries(byDay).slice(0, 14); // Last 14 days detail
      const summary = days.map(([date, d]) =>
        `${date}: ${Math.round(d.kcal)}kcal (P:${Math.round(d.prot)}g C:${Math.round(d.carbs)}g G:${Math.round(d.fat)}g) - ${d.meals.length} refeições${d.emotions.length ? ` | Humor: ${d.emotions.join(", ")}` : ""}`
      ).join("\n");

      // Weekly patterns
      const dayOfWeekTotals: Record<number, number[]> = {};
      for (const m of meals) {
        const dow = new Date(m.meal_date + "T12:00:00").getDay();
        if (!dayOfWeekTotals[dow]) dayOfWeekTotals[dow] = [];
        dayOfWeekTotals[dow].push(Number(m.total_kcal || 0));
      }
      const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
      const patterns = Object.entries(dayOfWeekTotals)
        .map(([dow, cals]) => `${dayNames[Number(dow)]}: média ${Math.round(cals.reduce((a, b) => a + b, 0) / cals.length)}kcal/refeição`)
        .join("; ");

      setMealHistoryContext(
        `Total de ${meals.length} refeições nos últimos 90 dias.\n\nÚltimos 14 dias:\n${summary}\n\nPadrão semanal: ${patterns}`
      );
    };
    fetch();
  }, [user]);

  return mealHistoryContext;
};
