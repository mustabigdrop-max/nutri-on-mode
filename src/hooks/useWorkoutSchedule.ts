import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type WorkoutType =
  | "chest_triceps"
  | "back_biceps"
  | "legs"
  | "shoulders"
  | "cardio_light"
  | "cardio_hiit"
  | "active_rest"
  | "rest";

export type WorkoutTime = "morning" | "afternoon" | "night";

export interface WorkoutScheduleEntry {
  id?: string;
  user_id?: string;
  day_of_week: number;
  workout_type: WorkoutType;
  workout_time: WorkoutTime;
  duration_minutes: number;
  slot: number;
}

export interface NutritionAdjustment {
  kcalMultiplier: number;
  proteinPerKg: number;
  carbsMultiplier: number;
  fatMultiplier: number;
  hydrationLiters: number;
  label: string;
  tip: string;
  preMeal: string;
  postMeal: string;
}

export const WORKOUT_TYPES: Record<WorkoutType, { emoji: string; label: string; shortLabel: string }> = {
  chest_triceps: { emoji: "💪", label: "Musculação — Peito/Tríceps", shortLabel: "Peito/Trí" },
  back_biceps: { emoji: "💪", label: "Musculação — Costas/Bíceps", shortLabel: "Costas/Bí" },
  legs: { emoji: "💪", label: "Musculação — Pernas", shortLabel: "Pernas" },
  shoulders: { emoji: "💪", label: "Musculação — Ombro/Trapézio", shortLabel: "Ombro/Trap" },
  cardio_light: { emoji: "🏃", label: "Cardio leve (caminhada, bike)", shortLabel: "Cardio leve" },
  cardio_hiit: { emoji: "🔥", label: "Cardio intenso (HIIT, corrida)", shortLabel: "HIIT" },
  active_rest: { emoji: "🧘", label: "Descanso ativo (alongamento)", shortLabel: "Descanso ativo" },
  rest: { emoji: "😴", label: "Dia de descanso total", shortLabel: "Descanso" },
};

export const DAY_NAMES = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
export const DAY_NAMES_FULL = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

export function getWorkoutAdjustment(type: WorkoutType, weightKg: number): NutritionAdjustment {
  switch (type) {
    case "legs":
      return {
        kcalMultiplier: 1.15, proteinPerKg: 2.2, carbsMultiplier: 1.20, fatMultiplier: 1.0, hydrationLiters: 3.2,
        label: "Dia de Perna — Performance máxima",
        tip: "Glicogênio muscular reforçado. Carb pré e proteína rápida pós.",
        preMeal: "Carboidrato médio IG: batata doce + frango",
        postMeal: "Proteína rápida + carb simples: whey + banana",
      };
    case "chest_triceps": case "back_biceps": case "shoulders":
      return {
        kcalMultiplier: 1.10, proteinPerKg: 2.0, carbsMultiplier: 1.10, fatMultiplier: 1.0, hydrationLiters: 3.0,
        label: "Dia de Musculação — Construção muscular",
        tip: "Proteína distribuída ao longo do dia. Carb moderado pré-treino.",
        preMeal: "Refeição balanceada: arroz + frango + salada",
        postMeal: "Whey + aveia ou refeição completa",
      };
    case "cardio_hiit":
      return {
        kcalMultiplier: 1.10, proteinPerKg: 1.8, carbsMultiplier: 1.15, fatMultiplier: 0.95, hydrationLiters: 3.5,
        label: "Dia de HIIT — Queima e resistência",
        tip: "Carb pré para sustentar intensidade. Eletrólitos pós.",
        preMeal: "Banana + pasta de amendoim ou gel de carb",
        postMeal: "Eletrólitos + proteína: água de coco + whey",
      };
    case "cardio_light":
      return {
        kcalMultiplier: 1.05, proteinPerKg: 1.8, carbsMultiplier: 1.05, fatMultiplier: 1.0, hydrationLiters: 2.8,
        label: "Dia de Cardio leve — Recuperação ativa",
        tip: "Manutenção calórica com foco em micronutrientes.",
        preMeal: "Fruta + iogurte natural",
        postMeal: "Refeição leve e nutritiva",
      };
    case "active_rest":
      return {
        kcalMultiplier: 1.0, proteinPerKg: 1.8, carbsMultiplier: 0.90, fatMultiplier: 1.10, hydrationLiters: 2.5,
        label: "Descanso ativo — Mobilidade e flexibilidade",
        tip: "Reduzir carb, aumentar gordura boa para recuperação.",
        preMeal: "Snack leve: frutas + castanhas",
        postMeal: "Não necessário — refeição normal",
      };
    case "rest": default:
      return {
        kcalMultiplier: 1.0, proteinPerKg: 2.0, carbsMultiplier: 0.80, fatMultiplier: 1.15, hydrationLiters: 2.5,
        label: "Dia de descanso — Recuperação total",
        tip: "Foco em proteína para recuperação. Carb reduzido, gordura boa.",
        preMeal: "—", postMeal: "—",
      };
  }
}

/** Combine multiple workout adjustments into one aggregated adjustment */
export function combineAdjustments(workouts: WorkoutScheduleEntry[], weightKg: number): NutritionAdjustment {
  if (workouts.length === 0) return getWorkoutAdjustment("rest", weightKg);
  if (workouts.length === 1) return getWorkoutAdjustment(workouts[0].workout_type as WorkoutType, weightKg);

  const adjustments = workouts.map(w => getWorkoutAdjustment(w.workout_type as WorkoutType, weightKg));

  // Stack caloric multipliers additively: base 1.0 + sum of extras
  const totalKcalExtra = adjustments.reduce((sum, a) => sum + (a.kcalMultiplier - 1.0), 0);
  const maxProteinPerKg = Math.max(...adjustments.map(a => a.proteinPerKg));
  const totalCarbsExtra = adjustments.reduce((sum, a) => sum + (a.carbsMultiplier - 1.0), 0);
  const totalFatExtra = adjustments.reduce((sum, a) => sum + (a.fatMultiplier - 1.0), 0);
  const maxHydration = Math.max(...adjustments.map(a => a.hydrationLiters)) + (workouts.length > 1 ? 0.3 : 0);

  const labels = workouts.map(w => WORKOUT_TYPES[w.workout_type as WorkoutType]?.shortLabel).join(" + ");
  const tips = adjustments.map(a => a.tip);

  return {
    kcalMultiplier: 1.0 + totalKcalExtra,
    proteinPerKg: maxProteinPerKg,
    carbsMultiplier: 1.0 + totalCarbsExtra,
    fatMultiplier: 1.0 + totalFatExtra,
    hydrationLiters: Math.round(maxHydration * 10) / 10,
    label: `Duplo treino — ${labels}`,
    tip: tips.join(" | "),
    preMeal: adjustments[0].preMeal,
    postMeal: adjustments[adjustments.length - 1].postMeal,
  };
}

export function getMealSuggestionsByTime(workoutTime: WorkoutTime, workoutType: WorkoutType) {
  if (workoutType === "rest" || workoutType === "active_rest") {
    return [
      { time: "08h", meal: "Café: ovos + aveia + frutas", type: "cafe_da_manha" },
      { time: "12h", meal: "Almoço: proteína + arroz + salada", type: "almoco" },
      { time: "16h", meal: "Lanche: iogurte + castanhas", type: "lanche" },
      { time: "20h", meal: "Jantar: proteína + legumes + gordura boa", type: "jantar" },
    ];
  }
  if (workoutTime === "night") {
    return [
      { time: "08h", meal: "Café reforçado: ovos + pão integral + fruta", type: "cafe_da_manha" },
      { time: "12h", meal: "Almoço reforçado com carboidrato complexo", type: "almoco" },
      { time: "17h", meal: "Pré-treino: banana + whey ou frango + batata doce", type: "lanche", highlight: true },
      { time: "20h30", meal: "Pós-treino: whey + maltodextrina ou refeição completa", type: "jantar", highlight: true },
      { time: "22h", meal: "Ceia proteica: caseína ou ovo + cottage", type: "ceia" },
    ];
  }
  if (workoutTime === "morning") {
    return [
      { time: "06h", meal: "Pré-treino leve: fruta + whey", type: "cafe_da_manha", highlight: true },
      { time: "09h", meal: "Pós-treino: refeição completa carb + proteína", type: "almoco", highlight: true },
      { time: "12h", meal: "Almoço: distribuição normal", type: "almoco" },
      { time: "16h", meal: "Lanche: proteína + fruta", type: "lanche" },
      { time: "20h", meal: "Jantar: proteína + legumes", type: "jantar" },
    ];
  }
  return [
    { time: "08h", meal: "Café: ovos + aveia + frutas", type: "cafe_da_manha" },
    { time: "12h", meal: "Almoço: carb complexo + proteína (pré-treino)", type: "almoco", highlight: true },
    { time: "16h30", meal: "Pós-treino: whey + banana ou refeição rápida", type: "lanche", highlight: true },
    { time: "20h", meal: "Jantar: proteína + salada + gordura boa", type: "jantar" },
  ];
}

/** Merge meal suggestions for multiple workouts at different times */
export function getMealSuggestionsMultiWorkout(workouts: WorkoutScheduleEntry[]) {
  if (workouts.length === 0) return getMealSuggestionsByTime("morning", "rest");
  if (workouts.length === 1) return getMealSuggestionsByTime(workouts[0].workout_time as WorkoutTime, workouts[0].workout_type as WorkoutType);

  // Sort by time: morning < afternoon < night
  const timeOrder: Record<WorkoutTime, number> = { morning: 0, afternoon: 1, night: 2 };
  const sorted = [...workouts].sort((a, b) => timeOrder[a.workout_time as WorkoutTime] - timeOrder[b.workout_time as WorkoutTime]);

  const first = sorted[0];
  const second = sorted[1];
  const ft = WORKOUT_TYPES[first.workout_type as WorkoutType];
  const st = WORKOUT_TYPES[second.workout_type as WorkoutType];

  const WORKOUT_TIME_HOURS: Record<WorkoutTime, string> = { morning: "07h", afternoon: "14h", night: "19h" };

  const meals: { time: string; meal: string; type: string; highlight?: boolean }[] = [];

  // Morning workout scenario
  if (first.workout_time === "morning") {
    meals.push({ time: "06h", meal: `Pré-treino 1 (${ft.shortLabel}): fruta + whey`, type: "cafe_da_manha", highlight: true });
    meals.push({ time: "08h30", meal: `Pós-treino 1: refeição completa carb + proteína`, type: "pos_treino_1", highlight: true });
  }

  meals.push({ time: "12h", meal: "Almoço reforçado: arroz + proteína + salada", type: "almoco" });

  if (second.workout_time === "afternoon") {
    meals.push({ time: "13h30", meal: `Pré-treino 2 (${st.shortLabel}): carb + proteína`, type: "pre_treino_2", highlight: true });
    meals.push({ time: "16h", meal: `Pós-treino 2: whey + banana ou refeição rápida`, type: "pos_treino_2", highlight: true });
  } else if (second.workout_time === "night") {
    meals.push({ time: "16h", meal: "Lanche: iogurte + castanhas + fruta", type: "lanche" });
    meals.push({ time: "18h", meal: `Pré-treino 2 (${st.shortLabel}): banana + pasta de amendoim`, type: "pre_treino_2", highlight: true });
    meals.push({ time: "20h30", meal: `Pós-treino 2: whey + carb simples`, type: "pos_treino_2", highlight: true });
  }

  if (first.workout_time === "afternoon" && second.workout_time === "night") {
    meals.length = 0;
    meals.push({ time: "08h", meal: "Café reforçado: ovos + aveia + frutas", type: "cafe_da_manha" });
    meals.push({ time: "12h", meal: `Pré-treino 1 (${ft.shortLabel}): carb complexo + proteína`, type: "almoco", highlight: true });
    meals.push({ time: "15h", meal: `Pós-treino 1: whey + banana`, type: "pos_treino_1", highlight: true });
    meals.push({ time: "18h", meal: `Pré-treino 2 (${st.shortLabel}): banana + whey`, type: "pre_treino_2", highlight: true });
    meals.push({ time: "20h30", meal: `Pós-treino 2: refeição completa`, type: "pos_treino_2", highlight: true });
  }

  meals.push({ time: "22h", meal: "Ceia proteica: caseína ou cottage (dupla recuperação)", type: "ceia" });

  return meals;
}

export const useWorkoutSchedule = () => {
  const { user } = useAuth();
  const [schedule, setSchedule] = useState<WorkoutScheduleEntry[]>([]);
  const [todayLog, setTodayLog] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchSchedule = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    const { data } = await supabase
      .from("workout_schedule")
      .select("*")
      .eq("user_id", user.id)
      .order("day_of_week")
      .order("slot" as any);
    setSchedule((data || []) as unknown as WorkoutScheduleEntry[]);
    setLoading(false);
  }, [user]);

  const fetchTodayLog = useCallback(async () => {
    if (!user) return;
    const today = new Date().toISOString().split("T")[0];
    const { data } = await supabase
      .from("workout_daily_logs")
      .select("*")
      .eq("user_id", user.id)
      .eq("log_date", today)
      .maybeSingle();
    setTodayLog(data);
  }, [user]);

  useEffect(() => {
    fetchSchedule();
    fetchTodayLog();
  }, [fetchSchedule, fetchTodayLog]);

  const saveDay = async (entry: WorkoutScheduleEntry) => {
    if (!user) return;
    const payload: any = {
      user_id: user.id,
      day_of_week: entry.day_of_week,
      workout_type: entry.workout_type,
      workout_time: entry.workout_time,
      duration_minutes: entry.duration_minutes,
      slot: entry.slot || 1,
    };
    const { error } = await supabase
      .from("workout_schedule")
      .upsert(payload, { onConflict: "user_id,day_of_week,slot" });
    if (!error) await fetchSchedule();
    return error;
  };

  const removeSlot = async (dayOfWeek: number, slot: number) => {
    if (!user) return;
    await (supabase
      .from("workout_schedule")
      .delete() as any)
      .eq("user_id", user.id)
      .eq("day_of_week", dayOfWeek)
      .eq("slot", slot);
    await fetchSchedule();
  };

  const completeWorkout = async () => {
    if (!user) return;
    const today = new Date().toISOString().split("T")[0];
    const dayOfWeek = new Date().getDay();
    const todayEntries = schedule.filter(s => s.day_of_week === dayOfWeek);
    if (todayEntries.length === 0) return;

    await supabase
      .from("workout_daily_logs")
      .upsert({
        user_id: user.id,
        log_date: today,
        workout_type: todayEntries[0].workout_type,
        completed: true,
      }, { onConflict: "user_id,log_date" });
    await fetchTodayLog();
  };

  const getTodayWorkouts = (): WorkoutScheduleEntry[] => {
    const dayOfWeek = new Date().getDay();
    return schedule.filter(s => s.day_of_week === dayOfWeek);
  };

  /** Legacy single-workout getter */
  const getTodayWorkout = () => {
    const list = getTodayWorkouts();
    return list.length > 0 ? list[0] : null;
  };

  const getWorkoutsForDay = (dow: number): WorkoutScheduleEntry[] => {
    return schedule.filter(s => s.day_of_week === dow);
  };

  return { schedule, todayLog, loading, saveDay, removeSlot, completeWorkout, getTodayWorkout, getTodayWorkouts, getWorkoutsForDay, refetch: fetchSchedule };
};
