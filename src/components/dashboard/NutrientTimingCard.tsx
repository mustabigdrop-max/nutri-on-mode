import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import { useWorkoutSchedule, type WorkoutTime } from "@/hooks/useWorkoutSchedule";

interface TimingWindow {
  label: string;
  emoji: string;
  color: string;
  bg: string;
  foods: string;
  protein: number;
  carbs: number;
  fat: number;
  offsetMinutes: number; // relative to workout start
}

function getTimingWindows(workoutTime: WorkoutTime): TimingWindow[] {
  const isHeavy = true; // default assumption for training days
  return [
    {
      label: "Pré-treino",
      emoji: "⏰",
      color: "text-amber-400",
      bg: "border-amber-500/30 bg-amber-500/10",
      foods: workoutTime === "morning" ? "Banana + whey ou pão + ovo" : "Batata doce + frango ou arroz + carne",
      protein: 25,
      carbs: 40,
      fat: 8,
      offsetMinutes: -120,
    },
    {
      label: "Durante",
      emoji: "💧",
      color: "text-cyan-400",
      bg: "border-cyan-500/30 bg-cyan-500/10",
      foods: "Água + eletrólitos. BCAA opcional.",
      protein: 0,
      carbs: 15,
      fat: 0,
      offsetMinutes: 0,
    },
    {
      label: "Pós-treino",
      emoji: "🥤",
      color: "text-emerald-400",
      bg: "border-emerald-500/30 bg-emerald-500/10",
      foods: "Whey + banana ou refeição completa",
      protein: 30,
      carbs: 45,
      fat: 5,
      offsetMinutes: 45,
    },
  ];
}

function workoutTimeToHour(wt: WorkoutTime): number {
  switch (wt) {
    case "morning": return 7;
    case "afternoon": return 15;
    case "night": return 19;
    default: return 15;
  }
}

function formatCountdown(diffMs: number): string {
  if (diffMs <= 0) return "Agora";
  const totalMin = Math.floor(diffMs / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h > 0) return `${h}h${m > 0 ? ` ${m}min` : ""}`;
  return `${m}min`;
}

const NutrientTimingCard = () => {
  const { getTodayWorkout } = useWorkoutSchedule();
  const todayWorkout = getTodayWorkout();
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(interval);
  }, []);

  if (!todayWorkout || todayWorkout.workout_type === "rest" || todayWorkout.workout_type === "active_rest") {
    return null;
  }

  const wt = todayWorkout.workout_time as WorkoutTime;
  const workoutHour = workoutTimeToHour(wt);
  const windows = getTimingWindows(wt);

  const today = new Date();
  const workoutStart = new Date(today.getFullYear(), today.getMonth(), today.getDate(), workoutHour, 0, 0);

  // Find next active window
  const windowTimes = windows.map((w) => {
    const t = new Date(workoutStart.getTime() + w.offsetMinutes * 60000);
    return { ...w, time: t, diff: t.getTime() - now };
  });

  const nextWindow = windowTimes.find((w) => w.diff > 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border bg-card p-4"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          <h3 className="text-xs font-mono font-bold text-foreground uppercase tracking-wider">Nutrient Timing</h3>
        </div>
        {nextWindow && (
          <span className="text-[10px] font-mono text-primary bg-primary/10 px-2 py-0.5 rounded-full">
            ⏳ {nextWindow.label} em {formatCountdown(nextWindow.diff)}
          </span>
        )}
      </div>

      <div className="space-y-2">
        {windowTimes.map((w, i) => {
          const isPast = w.diff < 0;
          const timeStr = `${w.time.getHours().toString().padStart(2, "0")}:${w.time.getMinutes().toString().padStart(2, "0")}`;

          return (
            <motion.div
              key={w.label}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * i }}
              className={`rounded-lg border p-3 ${w.bg} ${isPast ? "opacity-50" : ""}`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">{w.emoji}</span>
                  <span className={`text-xs font-mono font-bold ${w.color}`}>{w.label}</span>
                </div>
                <span className="text-[10px] font-mono text-muted-foreground">{timeStr}</span>
              </div>
              <p className="text-[11px] text-foreground font-mono mb-1">{w.foods}</p>
              <div className="flex gap-3">
                <span className="text-[9px] font-mono text-muted-foreground">P: {w.protein}g</span>
                <span className="text-[9px] font-mono text-muted-foreground">C: {w.carbs}g</span>
                <span className="text-[9px] font-mono text-muted-foreground">G: {w.fat}g</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default NutrientTimingCard;
