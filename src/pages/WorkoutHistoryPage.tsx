import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, LineChart, Line, Legend } from "recharts";
import { ArrowLeft, Dumbbell, CheckCircle2, XCircle, TrendingUp, Flame, Droplets, Calendar } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { useWorkoutSchedule, WORKOUT_TYPES, getWorkoutAdjustment, DAY_NAMES, type WorkoutType } from "@/hooks/useWorkoutSchedule";
import BottomNav from "@/components/BottomNav";
import WorkoutShareCard from "@/components/workout/WorkoutShareCard";

interface DailyLog {
  id: string;
  log_date: string;
  workout_type: string;
  completed: boolean;
  calories_adjusted: number | null;
  protein_adjusted: number | null;
  hydration_adjusted: number | null;
}

const WorkoutHistoryPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useProfile();
  const { schedule } = useWorkoutSchedule();
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [weekOffset, setWeekOffset] = useState(0); // 0 = current, -1 = last week, etc.

  const baseKcal = profile?.vet_kcal || 2000;
  const baseCarbs = profile?.carbs_g || 250;
  const baseFat = profile?.fat_g || 65;
  const weightKg = profile?.weight_kg || 70;

  // Calculate the week range
  const weekRange = useMemo(() => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const start = new Date(now);
    start.setDate(now.getDate() - dayOfWeek + (weekOffset * 7));
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return { start, end };
  }, [weekOffset]);

  useEffect(() => {
    if (!user) return;
    const fetchLogs = async () => {
      setLoading(true);
      const startStr = weekRange.start.toISOString().split("T")[0];
      const endStr = weekRange.end.toISOString().split("T")[0];
      const { data } = await supabase
        .from("workout_daily_logs")
        .select("*")
        .eq("user_id", user.id)
        .gte("log_date", startStr)
        .lte("log_date", endStr)
        .order("log_date");
      setLogs((data || []) as DailyLog[]);
      setLoading(false);
    };
    fetchLogs();
  }, [user, weekRange]);

  // Build 7-day data combining schedule + logs
  const weekData = useMemo(() => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekRange.start);
      date.setDate(weekRange.start.getDate() + i);
      const dateStr = date.toISOString().split("T")[0];
      const dayOfWeek = date.getDay();

      const scheduleEntry = schedule.find(s => s.day_of_week === dayOfWeek);
      const log = logs.find(l => l.log_date === dateStr);
      const wType = (scheduleEntry?.workout_type || "rest") as WorkoutType;
      const adj = getWorkoutAdjustment(wType, weightKg);
      const adjustedKcal = Math.round(baseKcal * adj.kcalMultiplier);
      const wInfo = WORKOUT_TYPES[wType];

      days.push({
        day: DAY_NAMES[dayOfWeek],
        date: dateStr,
        dayOfWeek,
        workoutType: wType,
        emoji: wInfo?.emoji || "😴",
        label: wInfo?.shortLabel || "Descanso",
        planned: wType !== "rest",
        completed: log?.completed || false,
        adjustedKcal,
        baseKcal,
        kcalDiff: adjustedKcal - baseKcal,
        protein: Math.round(adj.proteinPerKg * weightKg),
        hydration: adj.hydrationLiters,
        isPast: date <= new Date(),
      });
    }
    return days;
  }, [weekRange, schedule, logs, baseKcal, weightKg]);

  // Stats
  const stats = useMemo(() => {
    const planned = weekData.filter(d => d.planned && d.isPast);
    const completed = planned.filter(d => d.completed);
    const consistency = planned.length > 0 ? Math.round((completed.length / planned.length) * 100) : 0;
    const totalKcalAdj = weekData.reduce((s, d) => s + d.kcalDiff, 0);
    const avgHydration = weekData.reduce((s, d) => s + d.hydration, 0) / 7;

    return { planned: planned.length, completed: completed.length, consistency, totalKcalAdj, avgHydration };
  }, [weekData]);

  // Chart data for kcal comparison
  const kcalChartData = weekData.map(d => ({
    day: d.day,
    base: d.baseKcal,
    ajustado: d.adjustedKcal,
    emoji: d.emoji,
  }));

  const formatWeekLabel = () => {
    const s = weekRange.start;
    const e = weekRange.end;
    const fmt = (d: Date) => `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}`;
    if (weekOffset === 0) return `Esta semana (${fmt(s)} - ${fmt(e)})`;
    if (weekOffset === -1) return `Semana passada (${fmt(s)} - ${fmt(e)})`;
    return `${fmt(s)} - ${fmt(e)}`;
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="absolute inset-0 bg-grid opacity-10" />
      <div className="relative z-10 max-w-lg mx-auto px-4 pt-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-6"
        >
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-card transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-foreground">Histórico de Treinos</h1>
            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
              NutriSync · Consistência & Calorias
            </p>
          </div>
        </motion.div>

        {/* Week navigator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex items-center justify-between mb-4"
        >
          <button
            onClick={() => setWeekOffset(w => w - 1)}
            className="px-3 py-1.5 rounded-lg border border-border bg-card text-xs font-mono text-foreground hover:border-primary/30 transition-colors"
          >
            ← Anterior
          </button>
          <span className="text-xs font-mono text-muted-foreground">{formatWeekLabel()}</span>
          <button
            onClick={() => setWeekOffset(w => Math.min(w + 1, 0))}
            disabled={weekOffset >= 0}
            className="px-3 py-1.5 rounded-lg border border-border bg-card text-xs font-mono text-foreground hover:border-primary/30 transition-colors disabled:opacity-30"
          >
            Próxima →
          </button>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="grid grid-cols-3 gap-2 mb-5"
        >
          <div className="rounded-xl border border-border bg-card p-3 text-center">
            <TrendingUp className="w-4 h-4 text-primary mx-auto mb-1" />
            <p className="text-xl font-bold font-mono text-foreground">{stats.consistency}%</p>
            <p className="text-[9px] font-mono text-muted-foreground">Consistência</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-3 text-center">
            <Flame className="w-4 h-4 text-primary mx-auto mb-1" />
            <p className="text-xl font-bold font-mono text-foreground">
              {stats.totalKcalAdj > 0 ? "+" : ""}{stats.totalKcalAdj}
            </p>
            <p className="text-[9px] font-mono text-muted-foreground">kcal ajustado</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-3 text-center">
            <Droplets className="w-4 h-4 text-cyan mx-auto mb-1" />
            <p className="text-xl font-bold font-mono text-foreground">{stats.avgHydration.toFixed(1)}L</p>
            <p className="text-[9px] font-mono text-muted-foreground">Água/dia média</p>
          </div>
        </motion.div>

        {/* Weekly consistency grid */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border border-border bg-card p-4 mb-5"
        >
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4 text-primary" />
            <h2 className="text-xs font-mono font-bold text-foreground uppercase tracking-widest">Consistência Semanal</h2>
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {weekData.map((d, i) => {
              const isToday = d.date === new Date().toISOString().split("T")[0];
              return (
                <motion.div
                  key={d.date}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.25 + i * 0.04 }}
                  className={`rounded-lg p-2 text-center border transition-all ${
                    isToday
                      ? "border-primary/40 bg-primary/10"
                      : d.completed
                      ? "border-primary/20 bg-primary/5"
                      : d.planned && d.isPast
                      ? "border-destructive/20 bg-destructive/5"
                      : "border-border bg-background/50"
                  }`}
                >
                  <p className="text-[9px] font-mono text-muted-foreground">{d.day}</p>
                  <span className="text-lg block">{d.emoji}</span>
                  {d.planned ? (
                    d.completed ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary mx-auto mt-0.5" />
                    ) : d.isPast ? (
                      <XCircle className="w-3.5 h-3.5 text-destructive mx-auto mt-0.5" />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border border-muted-foreground/30 mx-auto mt-0.5" />
                    )
                  ) : (
                    <span className="text-[8px] font-mono text-muted-foreground block mt-0.5">off</span>
                  )}
                  <p className="text-[8px] font-mono text-muted-foreground mt-0.5 truncate">{d.label}</p>
                </motion.div>
              );
            })}
          </div>
          <div className="flex items-center justify-center gap-4 mt-3 text-[9px] font-mono text-muted-foreground">
            <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-primary" /> Concluído</span>
            <span className="flex items-center gap-1"><XCircle className="w-3 h-3 text-destructive" /> Perdido</span>
            <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full border border-muted-foreground/30" /> Futuro</span>
          </div>
        </motion.div>

        {/* Kcal adjustment chart */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-border bg-card p-4 mb-5"
        >
          <div className="flex items-center gap-2 mb-3">
            <Flame className="w-4 h-4 text-primary" />
            <h2 className="text-xs font-mono font-bold text-foreground uppercase tracking-widest">Calorias: Base vs Ajustado</h2>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={kcalChartData} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis
                  tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
                  domain={["dataMin - 100", "dataMax + 100"]}
                  width={40}
                />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                    fontSize: 11,
                    fontFamily: "monospace",
                  }}
                  formatter={(value: number, name: string) => [
                    `${value} kcal`,
                    name === "base" ? "Base" : "NutriSync",
                  ]}
                />
                <Bar dataKey="base" fill="hsl(var(--muted-foreground))" radius={[3, 3, 0, 0]} opacity={0.4} />
                <Bar dataKey="ajustado" radius={[3, 3, 0, 0]}>
                  {kcalChartData.map((entry, idx) => (
                    <Cell
                      key={idx}
                      fill={entry.ajustado > entry.base ? "hsl(var(--primary))" : "hsl(var(--accent))"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-4 mt-2 text-[9px] font-mono text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm bg-muted-foreground/40" /> Base
            </span>
            <span className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm bg-primary" /> Ajustado (+)
            </span>
            <span className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm bg-accent" /> Ajustado (−)
            </span>
          </div>
        </motion.div>

        {/* Protein & Hydration targets per day */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="rounded-xl border border-border bg-card p-4 mb-5"
        >
          <div className="flex items-center gap-2 mb-3">
            <Dumbbell className="w-4 h-4 text-primary" />
            <h2 className="text-xs font-mono font-bold text-foreground uppercase tracking-widest">Proteína & Hidratação</h2>
          </div>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weekData.map(d => ({ day: d.day, proteína: d.protein, "água (×100ml)": Math.round(d.hydration * 10) / 10 }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} width={35} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                    fontSize: 11,
                    fontFamily: "monospace",
                  }}
                />
                <Line type="monotone" dataKey="proteína" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} unit="g" />
                <Line type="monotone" dataKey="água (×100ml)" stroke="hsl(200 80% 50%)" strokeWidth={2} dot={{ r: 3 }} unit="L" />
                <Legend wrapperStyle={{ fontSize: 10, fontFamily: "monospace" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Daily detail list */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-2 mb-4"
        >
          <h2 className="text-xs font-mono font-bold text-foreground uppercase tracking-widest mb-2">Detalhes por Dia</h2>
          {weekData.map((d, i) => {
            const isToday = d.date === new Date().toISOString().split("T")[0];
            return (
              <motion.div
                key={d.date}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.42 + i * 0.03 }}
                className={`rounded-lg border p-3 flex items-center gap-3 ${
                  isToday ? "border-primary/30 bg-primary/5" : "border-border bg-card"
                }`}
              >
                <span className="text-xl">{d.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-mono font-bold text-foreground">{d.day}</span>
                    {isToday && <span className="text-[8px] font-mono text-primary px-1.5 py-0.5 bg-primary/10 rounded-full">HOJE</span>}
                    <span className="text-[9px] font-mono text-muted-foreground">· {d.label}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[9px] font-mono text-muted-foreground">
                      {d.adjustedKcal} kcal
                      {d.kcalDiff !== 0 && (
                        <span className={d.kcalDiff > 0 ? "text-primary" : "text-accent"}>
                          {" "}({d.kcalDiff > 0 ? "+" : ""}{d.kcalDiff})
                        </span>
                      )}
                    </span>
                    <span className="text-[9px] font-mono text-muted-foreground">· {d.protein}g prot</span>
                    <span className="text-[9px] font-mono text-muted-foreground">· {d.hydration}L</span>
                  </div>
                </div>
                {d.planned && (
                  d.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                  ) : d.isPast ? (
                    <XCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30 flex-shrink-0" />
                  )
                )}
              </motion.div>
            );
          })}
        </motion.div>
      </div>
      <BottomNav />
    </div>
  );
};

export default WorkoutHistoryPage;
