import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface NutrientSummary {
  nutrient: string;
  label: string;
  total: number;
  unit: string;
  recommended: number;
  pct: number;
  color: string;
}

export interface DailyNutrientData {
  date: string;
  [nutrient: string]: number | string;
}

const NUTRIENT_CONFIG: Record<string, { label: string; recommended: number; unit: string; color: string }> = {
  vitamina_a_mcg: { label: "Vitamina A", recommended: 900, unit: "mcg", color: "hsl(var(--primary))" },
  vitamina_c_mg: { label: "Vitamina C", recommended: 90, unit: "mg", color: "hsl(var(--accent))" },
  vitamina_d_mcg: { label: "Vitamina D", recommended: 15, unit: "mcg", color: "hsl(45, 90%, 55%)" },
  vitamina_e_mg: { label: "Vitamina E", recommended: 15, unit: "mg", color: "hsl(120, 60%, 50%)" },
  vitamina_k_mcg: { label: "Vitamina K", recommended: 120, unit: "mcg", color: "hsl(180, 60%, 50%)" },
  vitamina_b12_mcg: { label: "Vitamina B12", recommended: 2.4, unit: "mcg", color: "hsl(280, 60%, 60%)" },
  ferro_mg: { label: "Ferro", recommended: 8, unit: "mg", color: "hsl(0, 70%, 50%)" },
  calcio_mg: { label: "Cálcio", recommended: 1000, unit: "mg", color: "hsl(200, 70%, 70%)" },
  zinco_mg: { label: "Zinco", recommended: 11, unit: "mg", color: "hsl(35, 80%, 55%)" },
  magnesio_mg: { label: "Magnésio", recommended: 400, unit: "mg", color: "hsl(160, 60%, 50%)" },
  potassio_mg: { label: "Potássio", recommended: 2600, unit: "mg", color: "hsl(25, 80%, 55%)" },
  sodio_mg: { label: "Sódio", recommended: 2300, unit: "mg", color: "hsl(0, 0%, 60%)" },
  omega3_mg: { label: "Ômega-3", recommended: 1600, unit: "mg", color: "hsl(210, 80%, 55%)" },
  fibras_g: { label: "Fibras", recommended: 25, unit: "g", color: "hsl(90, 60%, 45%)" },
  folato_mcg: { label: "Folato", recommended: 400, unit: "mcg", color: "hsl(60, 70%, 50%)" },
  selenio_mcg: { label: "Selênio", recommended: 55, unit: "mcg", color: "hsl(300, 50%, 55%)" },
};

export const useMicronutrients = (period: "week" | "month" = "week") => {
  const { user } = useAuth();
  const [nutrients, setNutrients] = useState<NutrientSummary[]>([]);
  const [dailyData, setDailyData] = useState<DailyNutrientData[]>([]);
  const [deficiencies, setDeficiencies] = useState<NutrientSummary[]>([]);
  const [diversityCount, setDiversityCount] = useState(0);
  const [avgQualityScore, setAvgQualityScore] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      setLoading(true);
      const daysBack = period === "week" ? 7 : 30;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysBack);
      const startStr = startDate.toISOString().split("T")[0];

      // Fetch nutrients
      const { data: nutrientRows } = await supabase
        .from("meal_nutrients")
        .select("nutrient, amount, unit, created_at")
        .eq("user_id", user.id)
        .gte("created_at", startDate.toISOString());

      // Fetch meal logs for quality score and diversity
      const { data: meals } = await supabase
        .from("meal_logs")
        .select("quality_score, food_names, meal_date")
        .eq("user_id", user.id)
        .gte("meal_date", startStr);

      // Aggregate nutrients
      const totals: Record<string, number> = {};
      const dailyMap: Record<string, Record<string, number>> = {};

      for (const row of nutrientRows || []) {
        const key = row.nutrient;
        totals[key] = (totals[key] || 0) + Number(row.amount);
        const day = row.created_at.split("T")[0];
        if (!dailyMap[day]) dailyMap[day] = {};
        dailyMap[day][key] = (dailyMap[day][key] || 0) + Number(row.amount);
      }

      // Build summaries
      const summaries: NutrientSummary[] = Object.entries(NUTRIENT_CONFIG).map(([key, cfg]) => {
        const total = totals[key] || 0;
        const avgPerDay = total / daysBack;
        const pct = Math.round((avgPerDay / cfg.recommended) * 100);
        return { nutrient: key, label: cfg.label, total: Math.round(avgPerDay * 10) / 10, unit: cfg.unit, recommended: cfg.recommended, pct, color: cfg.color };
      });

      setNutrients(summaries);
      setDeficiencies(summaries.filter(n => n.pct < 50 && n.total > 0));

      // Daily data for charts
      const days = Object.entries(dailyMap)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, vals]) => ({ date, ...vals }));
      setDailyData(days as DailyNutrientData[]);

      // Diversity: unique food names this period
      const allFoods = new Set<string>();
      for (const m of meals || []) {
        if (m.food_names) for (const f of m.food_names) allFoods.add(f.toLowerCase());
      }
      setDiversityCount(allFoods.size);

      // Average quality score
      const scores = (meals || []).filter(m => m.quality_score != null).map(m => m.quality_score!);
      setAvgQualityScore(scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0);

      setLoading(false);
    };
    fetch();
  }, [user, period]);

  return { nutrients, dailyData, deficiencies, diversityCount, avgQualityScore, loading, NUTRIENT_CONFIG };
};
