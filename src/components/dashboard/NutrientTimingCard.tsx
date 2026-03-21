import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, ChevronDown, ChevronUp, Loader2, Beaker, Zap } from "lucide-react";
import { useWorkoutSchedule, type WorkoutTime, type WorkoutType } from "@/hooks/useWorkoutSchedule";
import { supabase } from "@/integrations/supabase/client";

interface TimingWindow {
  label: string;
  emoji: string;
  color: string;
  bg: string;
  foods: string;
  protein: number;
  carbs: number;
  fat: number;
  offsetMinutes: number;
  science: string;
  mechanism: string;
}

function getAdvancedTimingWindows(workoutTime: WorkoutTime, workoutType: WorkoutType): TimingWindow[] {
  const isLegs = workoutType === "legs";
  const isHIIT = workoutType === "cardio_hiit";
  const isCardioLight = workoutType === "cardio_light";

  // Pre-workout: glycogen loading + mTOR priming
  const preCarbs = isLegs ? 55 : isHIIT ? 45 : isCardioLight ? 30 : 40;
  const preProtein = isLegs ? 30 : 25;
  const preFat = isCardioLight ? 10 : 8;

  const preFoods = workoutTime === "morning"
    ? "Banana + whey isolado + 1 col aveia + café"
    : isLegs
      ? "Batata doce (200g) + frango (150g) + creatina 5g"
      : "Arroz integral + proteína magra + salada";

  // Intra-workout: sustain performance
  const intraCarbs = isHIIT ? 25 : isLegs ? 20 : 10;
  const intraFoods = isHIIT
    ? "Maltodextrina 25g + 3g sal + 500ml água"
    : isLegs
      ? "Cluster dextrin 20g + eletrólitos + BCAA 5g"
      : "Água + eletrólitos (Na/K/Mg)";

  // Post-workout: GLUT-4 window + mTOR activation
  const postCarbs = isLegs ? 60 : isHIIT ? 50 : 40;
  const postProtein = isLegs ? 40 : 35;
  const postFat = 5; // low fat to maximize absorption speed

  const postFoods = isLegs
    ? "Whey isolado 40g + dextrose 50g + creatina 5g (GLUT-4 peak)"
    : isHIIT
      ? "Whey 30g + banana + mel + eletrólitos"
      : "Whey 30g + banana + aveia fina";

  return [
    {
      label: "Pré-treino",
      emoji: "⚡",
      color: "text-amber-400",
      bg: "border-amber-500/30 bg-amber-500/10",
      foods: preFoods,
      protein: preProtein,
      carbs: preCarbs,
      fat: preFat,
      offsetMinutes: -90,
      science: "Glicogênio muscular + hepático carregado. Leucina priming para mTOR.",
      mechanism: "↑ Glicogênio · ↑ mTOR priming · ↑ Performance",
    },
    {
      label: "Intra-treino",
      emoji: "💧",
      color: "text-cyan-400",
      bg: "border-cyan-500/30 bg-cyan-500/10",
      foods: intraFoods,
      protein: 0,
      carbs: intraCarbs,
      fat: 0,
      offsetMinutes: 0,
      science: "Manutenção de glicemia e hidratação. Previne catabolismo durante esforço.",
      mechanism: "↑ Hidratação · ↓ Cortisol · ↑ Endurance",
    },
    {
      label: "Pós-treino imediato",
      emoji: "🔥",
      color: "text-emerald-400",
      bg: "border-emerald-500/30 bg-emerald-500/10",
      foods: postFoods,
      protein: postProtein,
      carbs: postCarbs,
      fat: postFat,
      offsetMinutes: 15,
      science: "Janela GLUT-4: transportadores na membrana celular → captação máxima de glicose sem insulina. mTOR ativado por leucina + insulina.",
      mechanism: "↑↑ GLUT-4 · ↑ mTOR · ↑ Síntese proteica · ↑ Ressíntese glicogênio",
    },
    {
      label: "Pós-treino 2h",
      emoji: "🍽️",
      color: "text-violet-400",
      bg: "border-violet-500/30 bg-violet-500/10",
      foods: isLegs
        ? "Arroz branco (250g) + carne vermelha (200g) + salada + azeite"
        : "Arroz + frango (200g) + legumes + azeite de oliva",
      protein: 35,
      carbs: isLegs ? 70 : 55,
      fat: 12,
      offsetMinutes: 120,
      science: "Segunda fase de ressíntese de glicogênio. Alimento real para aminoácidos completos e micronutrientes de recuperação.",
      mechanism: "↑ Glicogênio fase 2 · ↑ Leucina sustentada · ↑ Ferro/Zinco",
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
  const [expanded, setExpanded] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(interval);
  }, []);

  const isTrainingDay = todayWorkout && todayWorkout.workout_type !== "rest" && todayWorkout.workout_type !== "active_rest";

  // Fetch Perplexity-backed insight on expand
  useEffect(() => {
    if (!expanded || aiInsight || !isTrainingDay) return;
    const fetchInsight = async () => {
      setLoadingInsight(true);
      try {
        const wType = todayWorkout!.workout_type as string;
        const wTime = todayWorkout!.workout_time as string;
        const { data, error } = await supabase.functions.invoke("perplexity-search", {
          body: {
            query: `Qual o protocolo científico mais atualizado (2024-2025) de nutrient timing para treino de ${wType.replace(/_/g, " ")} no período da ${wTime === "morning" ? "manhã" : wTime === "afternoon" ? "tarde" : "noite"}? Foque em: 1) Otimização de GLUT-4 pós-treino 2) Timing ideal de leucina para ativação mTOR 3) Ressíntese de glicogênio 4) Papel da insulina pós-treino. Cite estudos recentes de ISSN e JISSN.`,
            category: "protocol",
          },
        });
        if (!error && data?.answer) {
          // Trim to ~300 chars for card display
          const trimmed = data.answer.length > 350
            ? data.answer.substring(0, 350).replace(/\s+\S*$/, "") + "…"
            : data.answer;
          setAiInsight(trimmed);
        }
      } catch {
        // silently fail
      } finally {
        setLoadingInsight(false);
      }
    };
    fetchInsight();
  }, [expanded, aiInsight, isTrainingDay, todayWorkout]);

  if (!isTrainingDay) return null;

  const wt = todayWorkout!.workout_time as WorkoutTime;
  const wType = todayWorkout!.workout_type as WorkoutType;
  const workoutHour = workoutTimeToHour(wt);
  const windows = getAdvancedTimingWindows(wt, wType);

  const today = new Date();
  const workoutStart = new Date(today.getFullYear(), today.getMonth(), today.getDate(), workoutHour, 0, 0);

  const windowTimes = windows.map((w) => {
    const t = new Date(workoutStart.getTime() + w.offsetMinutes * 60000);
    return { ...w, time: t, diff: t.getTime() - now };
  });

  const nextWindow = windowTimes.find((w) => w.diff > 0);
  const activeWindow = windowTimes.find((w) => w.diff >= -30 * 60000 && w.diff <= 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border bg-card p-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <Beaker className="w-4 h-4 text-primary" />
          <h3 className="text-xs font-mono font-bold text-foreground uppercase tracking-wider">
            Nutrient Timing Avançado
          </h3>
        </div>
        {nextWindow && (
          <span className="text-[10px] font-mono text-primary bg-primary/10 px-2 py-0.5 rounded-full animate-pulse">
            ⏳ {nextWindow.label} em {formatCountdown(nextWindow.diff)}
          </span>
        )}
      </div>

      {/* GLUT-4 badge */}
      <div className="flex items-center gap-1.5 mb-3">
        <Zap className="w-3 h-3 text-amber-400" />
        <span className="text-[10px] font-mono text-muted-foreground">
          Protocolo GLUT-4 · mTOR · Ressíntese de glicogênio
        </span>
      </div>

      {/* Windows */}
      <div className="space-y-2">
        {windowTimes.map((w, i) => {
          const isPast = w.diff < -30 * 60000;
          const isActive = w.diff >= -30 * 60000 && w.diff <= 0;
          const timeStr = `${w.time.getHours().toString().padStart(2, "0")}:${w.time.getMinutes().toString().padStart(2, "0")}`;

          return (
            <motion.div
              key={w.label}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.08 * i }}
              className={`rounded-lg border p-3 ${w.bg} ${isPast ? "opacity-40" : ""} ${isActive ? "ring-1 ring-primary shadow-lg shadow-primary/10" : ""}`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">{w.emoji}</span>
                  <span className={`text-xs font-mono font-bold ${w.color}`}>{w.label}</span>
                  {isActive && (
                    <span className="text-[9px] font-mono bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full animate-pulse">
                      AGORA
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-mono text-muted-foreground">{timeStr}</span>
              </div>

              <p className="text-[11px] text-foreground font-mono mb-1.5">{w.foods}</p>

              {/* Macros */}
              <div className="flex gap-3 mb-1.5">
                <span className="text-[9px] font-mono text-muted-foreground">P: {w.protein}g</span>
                <span className="text-[9px] font-mono text-muted-foreground">C: {w.carbs}g</span>
                <span className="text-[9px] font-mono text-muted-foreground">G: {w.fat}g</span>
              </div>

              {/* Mechanism tag */}
              <div className="text-[9px] font-mono text-primary/70 bg-primary/5 rounded px-1.5 py-0.5 inline-block">
                {w.mechanism}
              </div>

              {/* Science note on expanded */}
              <AnimatePresence>
                {expanded && (
                  <motion.p
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="text-[10px] font-mono text-muted-foreground mt-1.5 leading-relaxed overflow-hidden"
                  >
                    📚 {w.science}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* AI Insight from Perplexity */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-3 rounded-lg border border-primary/20 bg-primary/5 p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <Beaker className="w-3 h-3 text-primary" />
                <span className="text-[10px] font-mono font-bold text-primary uppercase">
                  Pesquisa científica — ISSN/JISSN
                </span>
              </div>
              {loadingInsight ? (
                <div className="flex items-center gap-2 py-2">
                  <Loader2 className="w-3 h-3 text-primary animate-spin" />
                  <span className="text-[10px] font-mono text-muted-foreground">
                    Buscando evidências científicas...
                  </span>
                </div>
              ) : aiInsight ? (
                <p className="text-[10px] font-mono text-foreground/80 leading-relaxed">
                  {aiInsight}
                </p>
              ) : (
                <p className="text-[10px] font-mono text-muted-foreground">
                  Sem dados disponíveis no momento.
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expand toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="mt-3 w-full flex items-center justify-center gap-1 text-[10px] font-mono text-muted-foreground hover:text-foreground transition-colors"
      >
        {expanded ? (
          <>
            <ChevronUp className="w-3 h-3" /> Recolher ciência
          </>
        ) : (
          <>
            <ChevronDown className="w-3 h-3" /> Ver ciência + pesquisa IA
          </>
        )}
      </button>
    </motion.div>
  );
};

export default NutrientTimingCard;
