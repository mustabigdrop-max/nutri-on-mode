import { useState, useEffect, useMemo } from "react";
import BottomNav from "@/components/BottomNav";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import {
  ArrowLeft, TrendingUp, TrendingDown, Scale, Flame,
  Target, BarChart3, Award, Calendar
} from "lucide-react";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { format, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";

type Period = "7d" | "30d" | "90d";

interface WeightEntry {
  date: string;
  weight: number;
  body_fat_pct?: number;
}

interface DayMacro {
  date: string;
  label: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  score: number;
  meals: number;
}

const ProgressPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useProfile();
  const [period, setPeriod] = useState<Period>("30d");
  const [weightData, setWeightData] = useState<WeightEntry[]>([]);
  const [macroData, setMacroData] = useState<DayMacro[]>([]);
  const [loading, setLoading] = useState(true);

  const daysBack = period === "7d" ? 7 : period === "30d" ? 30 : 90;
  const startDate = format(subDays(new Date(), daysBack), "yyyy-MM-dd");

  useEffect(() => {
    if (!user) return;
    const fetchAll = async () => {
      setLoading(true);

      // Weight logs
      const { data: weights } = await supabase
        .from("weight_logs")
        .select("weight_kg, body_fat_pct, logged_at")
        .eq("user_id", user.id)
        .gte("logged_at", startDate)
        .order("logged_at", { ascending: true });

      setWeightData(
        (weights ?? []).map(w => ({
          date: format(new Date(w.logged_at), "dd/MM"),
          weight: Number(w.weight_kg),
          body_fat_pct: w.body_fat_pct ? Number(w.body_fat_pct) : undefined,
        }))
      );

      // Meal logs grouped by day
      const { data: meals } = await supabase
        .from("meal_logs")
        .select("meal_date, total_kcal, total_protein, total_carbs, total_fat, quality_score")
        .eq("user_id", user.id)
        .gte("meal_date", startDate)
        .order("meal_date", { ascending: true });

      const dayMap: Record<string, DayMacro> = {};
      (meals ?? []).forEach(m => {
        const key = m.meal_date;
        if (!dayMap[key]) {
          dayMap[key] = {
            date: key,
            label: format(new Date(key + "T12:00:00"), "dd/MM"),
            kcal: 0, protein: 0, carbs: 0, fat: 0, score: 0, meals: 0,
          };
        }
        const d = dayMap[key];
        d.kcal += Number(m.total_kcal) || 0;
        d.protein += Number(m.total_protein) || 0;
        d.carbs += Number(m.total_carbs) || 0;
        d.fat += Number(m.total_fat) || 0;
        d.score += Number(m.quality_score) || 0;
        d.meals++;
      });
      // Average score per day
      Object.values(dayMap).forEach(d => {
        if (d.meals > 0) d.score = Math.round(d.score / d.meals);
      });

      setMacroData(Object.values(dayMap));
      setLoading(false);
    };
    fetchAll();
  }, [user, period]);

  // Stats calculations
  const stats = useMemo(() => {
    const avgKcal = macroData.length > 0
      ? Math.round(macroData.reduce((s, d) => s + d.kcal, 0) / macroData.length) : 0;
    const avgProtein = macroData.length > 0
      ? Math.round(macroData.reduce((s, d) => s + d.protein, 0) / macroData.length) : 0;
    const avgScore = macroData.length > 0
      ? Math.round(macroData.reduce((s, d) => s + d.score, 0) / macroData.length) : 0;
    const totalMeals = macroData.reduce((s, d) => s + d.meals, 0);

    const firstWeight = weightData.length > 0 ? weightData[0].weight : null;
    const lastWeight = weightData.length > 0 ? weightData[weightData.length - 1].weight : null;
    const weightDiff = firstWeight && lastWeight ? +(lastWeight - firstWeight).toFixed(1) : null;

    return { avgKcal, avgProtein, avgScore, totalMeals, weightDiff, firstWeight, lastWeight };
  }, [macroData, weightData]);

  const chartTextColor = "hsl(var(--muted-foreground))";

  return (
    <div className="min-h-screen bg-background pb-8">
      <div className="absolute inset-0 bg-grid opacity-10" />

      {/* Header */}
      <div className="relative z-10 flex items-center gap-3 px-4 pt-4 pb-3 border-b border-border bg-background/95 backdrop-blur">
        <button onClick={() => navigate("/dashboard")} className="p-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-sm font-bold text-foreground">Progresso</h1>
          <p className="text-[10px] text-muted-foreground font-mono">Peso, macros e score</p>
        </div>
      </div>

      <div className="relative z-10 px-4 mt-4 max-w-lg mx-auto space-y-4">
        {/* Period selector */}
        <div className="flex gap-2">
          {(["7d", "30d", "90d"] as const).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                period === p ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground"
              }`}
            >
              {p === "7d" ? "7 dias" : p === "30d" ? "30 dias" : "90 dias"}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Stats cards */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-2 gap-3"
            >
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Scale className="w-4 h-4 text-primary" />
                  <span className="text-[10px] text-muted-foreground font-mono">Peso</span>
                </div>
                {stats.weightDiff !== null ? (
                  <>
                    <p className="text-2xl font-bold text-foreground">{stats.lastWeight}kg</p>
                    <div className="flex items-center gap-1 mt-1">
                      {stats.weightDiff < 0 ? (
                        <TrendingDown className="w-3 h-3 text-primary" />
                      ) : stats.weightDiff > 0 ? (
                        <TrendingUp className="w-3 h-3 text-destructive" />
                      ) : null}
                      <span className={`text-xs font-mono ${
                        stats.weightDiff < 0 ? "text-primary" :
                        stats.weightDiff > 0 ? "text-destructive" : "text-muted-foreground"
                      }`}>
                        {stats.weightDiff > 0 ? "+" : ""}{stats.weightDiff}kg
                      </span>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">Sem registros</p>
                )}
              </div>

              <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Flame className="w-4 h-4 text-accent" />
                  <span className="text-[10px] text-muted-foreground font-mono">Méd. Kcal/dia</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{stats.avgKcal}</p>
                <p className="text-xs text-muted-foreground font-mono mt-1">
                  Meta: {profile?.vet_kcal || "—"} kcal
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-primary" />
                  <span className="text-[10px] text-muted-foreground font-mono">Méd. Proteína</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{stats.avgProtein}g</p>
                <p className="text-xs text-muted-foreground font-mono mt-1">
                  Meta: {profile?.protein_g || "—"}g
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-4 h-4 text-accent" />
                  <span className="text-[10px] text-muted-foreground font-mono">Score Médio</span>
                </div>
                <p className={`text-2xl font-bold ${
                  stats.avgScore >= 70 ? "text-primary" :
                  stats.avgScore >= 40 ? "text-accent" : "text-destructive"
                }`}>{stats.avgScore}</p>
                <p className="text-xs text-muted-foreground font-mono mt-1">
                  {stats.totalMeals} refeições
                </p>
              </div>
            </motion.div>

            {/* Weight chart */}
            {weightData.length > 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="rounded-xl border border-border bg-card p-4"
              >
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Scale className="w-3.5 h-3.5" /> Evolução de Peso
                </h3>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={weightData}>
                    <defs>
                      <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: chartTextColor }} />
                    <YAxis domain={["dataMin - 1", "dataMax + 1"]} tick={{ fontSize: 10, fill: chartTextColor }} />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                    />
                    <Area type="monotone" dataKey="weight" stroke="hsl(var(--primary))" fill="url(#weightGrad)" strokeWidth={2} name="Peso (kg)" />
                  </AreaChart>
                </ResponsiveContainer>
              </motion.div>
            )}

            {/* Calories chart */}
            {macroData.length > 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="rounded-xl border border-border bg-card p-4"
              >
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Flame className="w-3.5 h-3.5" /> Calorias Diárias
                </h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={macroData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="label" tick={{ fontSize: 10, fill: chartTextColor }} />
                    <YAxis tick={{ fontSize: 10, fill: chartTextColor }} />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                    />
                    <Bar dataKey="kcal" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Kcal" />
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>
            )}

            {/* Macros evolution */}
            {macroData.length > 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="rounded-xl border border-border bg-card p-4"
              >
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                  <BarChart3 className="w-3.5 h-3.5" /> Macronutrientes (g/dia)
                </h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={macroData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="label" tick={{ fontSize: 10, fill: chartTextColor }} />
                    <YAxis tick={{ fontSize: 10, fill: chartTextColor }} />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                    />
                    <Line type="monotone" dataKey="protein" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} name="Proteína (g)" />
                    <Line type="monotone" dataKey="carbs" stroke="hsl(var(--accent))" strokeWidth={2} dot={false} name="Carboidrato (g)" />
                    <Line type="monotone" dataKey="fat" stroke="hsl(var(--destructive))" strokeWidth={2} dot={false} name="Gordura (g)" />
                  </LineChart>
                </ResponsiveContainer>
              </motion.div>
            )}

            {/* Quality Score evolution */}
            {macroData.filter(d => d.score > 0).length > 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="rounded-xl border border-border bg-card p-4"
              >
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Award className="w-3.5 h-3.5" /> Score de Qualidade
                </h3>
                <ResponsiveContainer width="100%" height={160}>
                  <AreaChart data={macroData.filter(d => d.score > 0)}>
                    <defs>
                      <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="label" tick={{ fontSize: 10, fill: chartTextColor }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: chartTextColor }} />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                    />
                    <Area type="monotone" dataKey="score" stroke="hsl(var(--accent))" fill="url(#scoreGrad)" strokeWidth={2} name="Score" />
                  </AreaChart>
                </ResponsiveContainer>
              </motion.div>
            )}

            {/* Empty state */}
            {macroData.length === 0 && weightData.length === 0 && (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground mb-1">Sem dados neste período</p>
                <p className="text-xs text-muted-foreground">Registre refeições e pesos para ver seus gráficos</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ProgressPage;
