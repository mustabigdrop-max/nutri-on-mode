import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { BarChart3, Battery, Beef, Timer } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  DAY_NAMES,
  WORKOUT_TYPES,
  type WorkoutType,
} from "@/hooks/useWorkoutSchedule";

interface WeeklyPlanDay {
  dow: number;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  type: string;
  category: string;
}

interface Props {
  weeklyPlan: WeeklyPlanDay[];
}

const CATEGORY_COLORS: Record<string, string> = {
  musculacao: "hsl(var(--primary))",
  cardio: "hsl(var(--accent))",
  descanso: "hsl(var(--muted-foreground))",
};

const NutriSyncAnalysisTab = ({ weeklyPlan }: Props) => {
  const { user } = useAuth();
  const todayDow = new Date().getDay();
  const maxKcal = Math.max(...weeklyPlan.map(d => d.kcal), 1);

  // Fetch meal_logs last 7 days for protein balance + timing quality
  const [mealData, setMealData] = useState<{ totalProtein: number; timingScore: number; carbsLast3Days: number }>({
    totalProtein: 0,
    timingScore: 0,
    carbsLast3Days: 0,
  });

  useEffect(() => {
    if (!user) return;
    const fetchMealData = async () => {
      const now = new Date();
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      const threeDaysAgo = new Date(now);
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      const { data: logs } = await supabase
        .from("meal_logs")
        .select("meal_type, total_protein, total_carbs, meal_date")
        .eq("user_id", user.id)
        .gte("meal_date", weekAgo.toISOString().split("T")[0])
        .order("meal_date", { ascending: false });

      if (!logs || logs.length === 0) {
        setMealData({ totalProtein: 0, timingScore: 0, carbsLast3Days: 0 });
        return;
      }

      const totalProtein = logs.reduce((sum, l) => sum + (l.total_protein || 0), 0);

      // Carbs last 3 days
      const threeDaysAgoStr = threeDaysAgo.toISOString().split("T")[0];
      const recent = logs.filter(l => l.meal_date >= threeDaysAgoStr);
      const carbsLast3Days = recent.reduce((sum, l) => sum + (l.total_carbs || 0), 0);

      // Timing quality: % of days with pre/post workout logs
      const prePosts = logs.filter(l =>
        l.meal_type?.includes("pre") || l.meal_type?.includes("post") || l.meal_type?.includes("pos")
      );
      const uniqueDays = new Set(logs.map(l => l.meal_date));
      const daysWithTiming = new Set(prePosts.map(l => l.meal_date));
      const timingScore = uniqueDays.size > 0 ? Math.round((daysWithTiming.size / uniqueDays.size) * 100) : 0;

      setMealData({ totalProtein: Math.round(totalProtein), timingScore, carbsLast3Days: Math.round(carbsLast3Days) });
    };
    fetchMealData();
  }, [user]);

  // Glycogen estimation
  const glycogenStatus = useMemo(() => {
    // Simplified: if carbs < 450g over 3 days with 3+ training days → depleted
    const avgCarbsPerDay = mealData.carbsLast3Days / 3;
    if (avgCarbsPerDay > 250) return { label: "Cheio", color: "text-accent", bg: "bg-accent/10 border-accent/20", emoji: "🟢" };
    if (avgCarbsPerDay > 120) return { label: "Parcial", color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/20", emoji: "🟡" };
    return { label: "Depletado", color: "text-destructive", bg: "bg-destructive/10 border-destructive/20", emoji: "🔴" };
  }, [mealData.carbsLast3Days]);

  // Weekly protein target
  const weeklyProteinTarget = useMemo(() => {
    return weeklyPlan.reduce((sum, d) => sum + d.protein, 0);
  }, [weeklyPlan]);

  const proteinProgress = weeklyProteinTarget > 0 ? Math.min(100, Math.round((mealData.totalProtein / weeklyProteinTarget) * 100)) : 0;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      {/* Weekly Kcal Chart - SVG */}
      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold text-foreground">Calorias Ajustadas — Semana</h3>
        </div>

        <div className="flex items-end gap-1.5 h-40">
          {weeklyPlan.map((day) => {
            const height = (day.kcal / maxKcal) * 100;
            const isToday = day.dow === todayDow;
            const barColor = CATEGORY_COLORS[day.category] || CATEGORY_COLORS.descanso;
            const typeInfo = WORKOUT_TYPES[day.type as WorkoutType];

            return (
              <div key={day.dow} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[9px] font-mono text-muted-foreground">{day.kcal}</span>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ delay: day.dow * 0.05, duration: 0.4 }}
                  className={`w-full rounded-t-md relative ${isToday ? "ring-2 ring-primary ring-offset-1 ring-offset-background" : ""}`}
                  style={{ backgroundColor: barColor, minHeight: 4 }}
                />
                <span className={`text-[9px] font-mono font-bold ${isToday ? "text-primary" : "text-muted-foreground"}`}>
                  {DAY_NAMES[day.dow]}
                </span>
                <span className="text-[8px]">{typeInfo?.emoji || "😴"}</span>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-3 justify-center">
          {[
            { label: "Musculação", color: CATEGORY_COLORS.musculacao },
            { label: "Cardio", color: CATEGORY_COLORS.cardio },
            { label: "Descanso", color: CATEGORY_COLORS.descanso },
          ].map(l => (
            <div key={l.label} className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: l.color }} />
              <span className="text-[9px] font-mono text-muted-foreground">{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Glycogen Card */}
      <div className={`rounded-2xl border p-4 ${glycogenStatus.bg}`}>
        <div className="flex items-center gap-2 mb-2">
          <Battery className="w-4 h-4" />
          <h3 className="text-sm font-bold text-foreground">Depleção de Glicogênio</h3>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-2xl">{glycogenStatus.emoji}</span>
          <div>
            <p className={`text-lg font-bold font-mono ${glycogenStatus.color}`}>{glycogenStatus.label}</p>
            <p className="text-[10px] font-mono text-muted-foreground">
              Média últimos 3 dias: {Math.round(mealData.carbsLast3Days / 3)}g carb/dia
            </p>
          </div>
        </div>
        {glycogenStatus.label === "Depletado" && (
          <p className="text-[10px] font-mono text-destructive mt-2">
            ⚠️ Refeed recomendado: aumente carbs em 50-80g nas próximas refeições
          </p>
        )}
      </div>

      {/* Protein Balance */}
      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="flex items-center gap-2 mb-2">
          <Beef className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold text-foreground">Balanço Proteico Semanal</h3>
        </div>
        <div className="flex items-center justify-between text-xs font-mono mb-2">
          <span className="text-muted-foreground">Consumido: <strong className="text-foreground">{mealData.totalProtein}g</strong></span>
          <span className="text-muted-foreground">Meta: <strong className="text-foreground">{weeklyProteinTarget}g</strong></span>
        </div>
        <div className="w-full h-3 rounded-full bg-muted overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${proteinProgress}%` }}
            transition={{ duration: 0.6 }}
            className={`h-full rounded-full ${proteinProgress >= 90 ? "bg-accent" : proteinProgress >= 60 ? "bg-primary" : "bg-destructive"}`}
          />
        </div>
        <p className={`text-[10px] font-mono mt-1 ${proteinProgress >= 90 ? "text-accent" : proteinProgress >= 60 ? "text-primary" : "text-destructive"}`}>
          {proteinProgress}% da meta semanal atingida
        </p>
      </div>

      {/* Timing Quality */}
      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="flex items-center gap-2 mb-2">
          <Timer className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold text-foreground">Qualidade do Timing</h3>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-16 h-16">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <circle cx="18" cy="18" r="15.5" fill="none" strokeWidth="3" className="stroke-muted" />
              <circle
                cx="18" cy="18" r="15.5" fill="none" strokeWidth="3"
                className={mealData.timingScore >= 70 ? "stroke-accent" : mealData.timingScore >= 40 ? "stroke-primary" : "stroke-destructive"}
                strokeDasharray={`${(mealData.timingScore / 100) * 97.4} 97.4`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold font-mono text-foreground">{mealData.timingScore}%</span>
            </div>
          </div>
          <div>
            <p className="text-xs font-mono text-foreground">Dias com pré/pós-treino correto</p>
            <p className="text-[10px] font-mono text-muted-foreground">
              {mealData.timingScore >= 70 ? "✅ Excelente timing nutricional!" : mealData.timingScore >= 40 ? "🟡 Melhorar registro de pré/pós-treino" : "🔴 Registre suas refeições pré e pós-treino"}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default NutriSyncAnalysisTab;
