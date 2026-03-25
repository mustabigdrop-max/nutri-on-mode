import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import { Dumbbell, Moon, ChevronDown, ChevronUp, Droplets, Clock } from "lucide-react";
import {
  getWorkoutAdjustment,
  combineAdjustments,
  WORKOUT_TYPES,
  DAY_NAMES,
  type WorkoutType,
  type WorkoutScheduleEntry,
} from "@/hooks/useWorkoutSchedule";

interface Props {
  baseKcal: number;
  baseCarbs: number;
  baseFat: number;
  weightKg: number;
  todayWorkouts: WorkoutScheduleEntry[];
  nextRestDow: number;
  restDayWorkouts: WorkoutScheduleEntry[];
}

const NutriSyncComparisonCard = ({ baseKcal, baseCarbs, baseFat, weightKg, todayWorkouts, nextRestDow, restDayWorkouts }: Props) => {
  const [open, setOpen] = useState(false);

  const todayAdj = useMemo(() => combineAdjustments(todayWorkouts, weightKg), [todayWorkouts, weightKg]);
  const restAdj = useMemo(() => combineAdjustments(restDayWorkouts, weightKg), [restDayWorkouts, weightKg]);

  const todayDow = new Date().getDay();
  const todayType = todayWorkouts.length > 0 ? WORKOUT_TYPES[todayWorkouts[0].workout_type as WorkoutType] : null;
  const todayLabel = todayType ? todayType.shortLabel : "Descanso";
  const todayEmoji = todayType ? todayType.emoji : "😴";

  // Anabolic window: estimate post-workout optimal time
  const workoutEndTime = useMemo(() => {
    if (todayWorkouts.length === 0) return null;
    const muscW = todayWorkouts.find(w => WORKOUT_TYPES[w.workout_type as WorkoutType]?.category === "musculacao");
    const w = muscW || todayWorkouts[0];
    const timeMap: Record<string, number> = { morning: 7, afternoon: 14, night: 18 };
    const startH = timeMap[w.workout_time] || 14;
    const durH = (w.duration_minutes || 60) / 60;
    return startH + durH;
  }, [todayWorkouts]);

  const anabolicWindowEnd = workoutEndTime ? workoutEndTime + 2 : null;

  const formatHour = (h: number) => {
    const hour = Math.floor(h);
    const min = Math.round((h - hour) * 60);
    return `${hour.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`;
  };

  const scenarios = [
    {
      label: `Hoje (${todayLabel})`,
      emoji: todayEmoji,
      icon: Dumbbell,
      adj: todayAdj,
      kcal: Math.round(baseKcal * todayAdj.kcalMultiplier),
      protein: Math.round(todayAdj.proteinPerKg * weightKg),
      carbs: Math.round(baseCarbs * todayAdj.carbsMultiplier),
      fat: Math.round(baseFat * todayAdj.fatMultiplier),
    },
    {
      label: `${DAY_NAMES[nextRestDow]} (Descanso)`,
      emoji: "😴",
      icon: Moon,
      adj: restAdj,
      kcal: Math.round(baseKcal * restAdj.kcalMultiplier),
      protein: Math.round(restAdj.proteinPerKg * weightKg),
      carbs: Math.round(baseCarbs * restAdj.carbsMultiplier),
      fat: Math.round(baseFat * restAdj.fatMultiplier),
    },
  ];

  const diff = {
    kcal: scenarios[0].kcal - scenarios[1].kcal,
    protein: scenarios[0].protein - scenarios[1].protein,
    carbs: scenarios[0].carbs - scenarios[1].carbs,
    fat: scenarios[0].fat - scenarios[1].fat,
    water: todayAdj.hydrationLiters - restAdj.hydrationLiters,
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mb-4">
      <button onClick={() => setOpen(!open)} className="w-full rounded-xl border border-border bg-card p-3 text-left hover:border-primary/20 transition-all">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm">{todayEmoji}</span>
            <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
              Comparativo NutriSync
            </span>
            <span className="text-sm">😴</span>
          </div>
          {open ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
        </div>
        {!open && (
          <p className="text-[10px] font-mono text-primary mt-1">
            {todayLabel}: {scenarios[0].kcal} kcal vs Descanso: {scenarios[1].kcal} kcal ({diff.kcal > 0 ? "+" : ""}{diff.kcal})
          </p>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
            <div className="rounded-b-xl border border-t-0 border-border bg-card/50 p-4 space-y-4">
              {/* Side-by-side */}
              <div className="grid grid-cols-2 gap-3">
                {scenarios.map((s) => (
                  <div key={s.label} className="rounded-lg border border-border bg-background/50 p-3 space-y-2">
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="text-lg">{s.emoji}</span>
                      <span className="text-[10px] font-mono font-bold text-foreground leading-tight">{s.label}</span>
                    </div>
                    <MacroRow label="Kcal" value={s.kcal} unit="" highlight />
                    <MacroRow label="Proteína" value={s.protein} unit="g" />
                    <MacroRow label="Carbs" value={s.carbs} unit="g" />
                    <MacroRow label="Gordura" value={s.fat} unit="g" />
                    <MacroRow label="Água" value={s.adj.hydrationLiters} unit="L" isDecimal />
                  </div>
                ))}
              </div>

              {/* Diff */}
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                <p className="text-[10px] font-mono text-primary uppercase tracking-widest mb-2">
                  Diferença Hoje → Descanso
                </p>
                <div className="grid grid-cols-5 gap-1 text-center">
                  {[
                    { label: "Kcal", val: diff.kcal },
                    { label: "Prot", val: diff.protein },
                    { label: "Carb", val: diff.carbs },
                    { label: "Gord", val: diff.fat },
                    { label: "Água", val: diff.water, suffix: "L", isDecimal: true },
                  ].map((d) => (
                    <div key={d.label}>
                      <p className="text-[9px] font-mono text-muted-foreground">{d.label}</p>
                      <p className={`text-xs font-bold font-mono ${d.val > 0 ? "text-primary" : d.val < 0 ? "text-destructive" : "text-muted-foreground"}`}>
                        {d.val > 0 ? "+" : ""}{d.isDecimal ? d.val.toFixed(1) : d.val}{d.suffix || ""}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Anabolic Window */}
              {workoutEndTime && anabolicWindowEnd && (
                <div className="rounded-lg border border-accent/20 bg-accent/5 p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-3.5 h-3.5 text-accent" />
                    <p className="text-[10px] font-mono text-accent uppercase tracking-widest font-bold">Janela Anabólica</p>
                  </div>
                  <p className="text-xs font-mono text-foreground">
                    Pós-treino: <strong>{formatHour(workoutEndTime)}</strong> — Janela ideal até <strong>{formatHour(anabolicWindowEnd)}</strong>
                  </p>
                  <p className="text-[10px] font-mono text-muted-foreground mt-1">
                    Priorize proteína + carb rápido dentro desta janela de 2h
                  </p>
                </div>
              )}

              {/* Tips */}
              <div className="space-y-1.5">
                <p className="text-[9px] font-mono text-primary">💡 {todayAdj.tip}</p>
                <p className="text-[9px] font-mono text-muted-foreground">😴 {restAdj.tip}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const MacroRow = ({ label, value, unit, highlight, isDecimal }: { label: string; value: number; unit: string; highlight?: boolean; isDecimal?: boolean }) => (
  <div className="flex items-center justify-between">
    <span className="text-[9px] font-mono text-muted-foreground">{label}</span>
    <span className={`text-xs font-mono font-bold ${highlight ? "text-primary" : "text-foreground"}`}>
      {isDecimal ? value.toFixed(1) : value}<span className="text-muted-foreground font-normal text-[9px]">{unit}</span>
    </span>
  </div>
);

export default NutriSyncComparisonCard;
