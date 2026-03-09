import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Timer, Utensils, Zap, X } from "lucide-react";
import { useState } from "react";
import type { WorkoutType } from "@/hooks/useWorkoutSchedule";
import { getWorkoutAdjustment, WORKOUT_TYPES } from "@/hooks/useWorkoutSchedule";

interface WorkoutTimeAlert {
  type: "pre" | "post";
  icon: typeof Timer;
  title: string;
  message: string;
  meal: string;
  urgency: "now" | "soon" | "info";
}

interface Props {
  workoutType: WorkoutType;
  workoutTime: string; // "morning" | "afternoon" | "night"
}

const WORKOUT_HOURS: Record<string, number> = {
  morning: 7,
  afternoon: 14,
  night: 19,
};

const WorkoutAlerts = ({ workoutType, workoutTime }: Props) => {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const alerts = useMemo(() => {
    if (workoutType === "rest" || workoutType === "active_rest") return [];

    const now = new Date();
    const hour = now.getHours();
    const minutes = now.getMinutes();
    const currentMinutes = hour * 60 + minutes;

    const workoutHour = WORKOUT_HOURS[workoutTime] || 14;
    const workoutStartMinutes = workoutHour * 60;
    const workoutEndMinutes = workoutStartMinutes + 60; // assume 1h workout

    const preWindowStart = workoutStartMinutes - 90;
    const postWindowEnd = workoutEndMinutes + 30;

    const adj = getWorkoutAdjustment(workoutType, 70);
    const wInfo = WORKOUT_TYPES[workoutType];
    const result: WorkoutTimeAlert[] = [];

    // Pre-workout alert: 90min before workout
    if (currentMinutes >= preWindowStart && currentMinutes < workoutStartMinutes) {
      const minsUntil = workoutStartMinutes - currentMinutes;
      result.push({
        type: "pre",
        icon: Timer,
        title: `Pré-treino em ${minsUntil}min`,
        message: `${wInfo.emoji} ${wInfo.shortLabel} às ${workoutHour}h — hora de preparar a refeição pré-treino`,
        meal: adj.preMeal,
        urgency: minsUntil <= 30 ? "now" : "soon",
      });
    }

    // Post-workout (anabolic window): up to 30min after workout ends
    if (currentMinutes >= workoutEndMinutes && currentMinutes <= postWindowEnd) {
      const minsSince = currentMinutes - workoutEndMinutes;
      result.push({
        type: "post",
        icon: Utensils,
        title: `Janela anabólica — ${30 - minsSince}min restantes`,
        message: `Treino finalizado! Aproveite a janela de absorção para maximizar resultados`,
        meal: adj.postMeal,
        urgency: minsSince >= 20 ? "now" : "soon",
      });
    }

    // If outside both windows, show a static info alert about today's plan
    if (result.length === 0) {
      if (currentMinutes < preWindowStart) {
        const hoursUntil = Math.floor((preWindowStart - currentMinutes) / 60);
        const minsUntil = (preWindowStart - currentMinutes) % 60;
        result.push({
          type: "pre",
          icon: Zap,
          title: `${wInfo.emoji} ${wInfo.shortLabel} hoje às ${workoutHour}h`,
          message: `Alerta pré-treino em ${hoursUntil > 0 ? `${hoursUntil}h${minsUntil > 0 ? minsUntil + "min" : ""}` : `${minsUntil}min`}`,
          meal: adj.preMeal,
          urgency: "info",
        });
      } else {
        result.push({
          type: "post",
          icon: Zap,
          title: `${wInfo.emoji} ${wInfo.shortLabel} — concluído`,
          message: adj.tip,
          meal: adj.postMeal,
          urgency: "info",
        });
      }
    }

    return result;
  }, [workoutType, workoutTime]);

  const visibleAlerts = alerts.filter((a) => !dismissed.has(a.type));
  if (visibleAlerts.length === 0) return null;

  return (
    <div className="space-y-2 mb-4">
      <AnimatePresence>
        {visibleAlerts.map((alert) => (
          <motion.div
            key={alert.type}
            initial={{ opacity: 0, x: -20, height: 0 }}
            animate={{ opacity: 1, x: 0, height: "auto" }}
            exit={{ opacity: 0, x: 20, height: 0 }}
            transition={{ duration: 0.3 }}
            className={`relative rounded-xl border p-3 overflow-hidden ${
              alert.urgency === "now"
                ? "border-primary/40 bg-primary/10"
                : alert.urgency === "soon"
                ? "border-accent/30 bg-accent/5"
                : "border-border bg-card"
            }`}
          >
            {/* Pulse effect for urgent alerts */}
            {alert.urgency === "now" && (
              <motion.div
                className="absolute inset-0 bg-primary/5"
                animate={{ opacity: [0, 0.3, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}

            <div className="relative z-10 flex items-start gap-3">
              <div
                className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                  alert.urgency === "now"
                    ? "bg-primary/20"
                    : alert.urgency === "soon"
                    ? "bg-accent/20"
                    : "bg-muted"
                }`}
              >
                <alert.icon
                  className={`w-4 h-4 ${
                    alert.urgency === "now"
                      ? "text-primary"
                      : alert.urgency === "soon"
                      ? "text-accent"
                      : "text-muted-foreground"
                  }`}
                />
              </div>

              <div className="flex-1 min-w-0">
                <p
                  className={`text-xs font-mono font-bold ${
                    alert.urgency === "now"
                      ? "text-primary"
                      : alert.urgency === "soon"
                      ? "text-accent"
                      : "text-foreground"
                  }`}
                >
                  {alert.title}
                </p>
                <p className="text-[10px] font-mono text-muted-foreground mt-0.5 leading-relaxed">
                  {alert.message}
                </p>
                {alert.meal && alert.meal !== "—" && (
                  <div className="mt-1.5 flex items-center gap-1.5 px-2 py-1 rounded-md bg-background/50 border border-border w-fit">
                    <Utensils className="w-3 h-3 text-primary" />
                    <span className="text-[9px] font-mono text-foreground">
                      {alert.type === "pre" ? "Pré" : "Pós"}: {alert.meal}
                    </span>
                  </div>
                )}
              </div>

              <button
                onClick={() => setDismissed((s) => new Set(s).add(alert.type))}
                className="flex-shrink-0 p-1 rounded-md hover:bg-muted transition-colors"
              >
                <X className="w-3 h-3 text-muted-foreground" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default WorkoutAlerts;
