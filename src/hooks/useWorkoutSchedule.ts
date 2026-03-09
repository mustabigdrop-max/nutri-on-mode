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
  const base = { hydrationLiters: 2.5 };

  switch (type) {
    case "legs":
      return {
        kcalMultiplier: 1.15,
        proteinPerKg: 2.2,
        carbsMultiplier: 1.20,
        fatMultiplier: 1.0,
        hydrationLiters: 3.2,
        label: "Dia de Perna — Performance máxima",
        tip: "Glicogênio muscular reforçado. Carb pré e proteína rápida pós.",
        preMeal: "Carboidrato médio IG: batata doce + frango",
        postMeal: "Proteína rápida + carb simples: whey + banana",
      };
    case "chest_triceps":
    case "back_biceps":
    case "shoulders":
      return {
        kcalMultiplier: 1.10,
        proteinPerKg: 2.0,
        carbsMultiplier: 1.10,
        fatMultiplier: 1.0,
        hydrationLiters: 3.0,
        label: "Dia de Musculação — Construção muscular",
        tip: "Proteína distribuída ao longo do dia. Carb moderado pré-treino.",
        preMeal: "Refeição balanceada: arroz + frango + salada",
        postMeal: "Whey + aveia ou refeição completa",
      };
    case "cardio_hiit":
      return {
        kcalMultiplier: 1.10,
        proteinPerKg: 1.8,
        carbsMultiplier: 1.15,
        fatMultiplier: 0.95,
        hydrationLiters: 3.5,
        label: "Dia de HIIT — Queima e resistência",
        tip: "Carb pré para sustentar intensidade. Eletrólitos pós.",
        preMeal: "Banana + pasta de amendoim ou gel de carb",
        postMeal: "Eletrólitos + proteína: água de coco + whey",
      };
    case "cardio_light":
      return {
        kcalMultiplier: 1.05,
        proteinPerKg: 1.8,
        carbsMultiplier: 1.05,
        fatMultiplier: 1.0,
        hydrationLiters: 2.8,
        label: "Dia de Cardio leve — Recuperação ativa",
        tip: "Manutenção calórica com foco em micronutrientes.",
        preMeal: "Fruta + iogurte natural",
        postMeal: "Refeição leve e nutritiva",
      };
    case "active_rest":
      return {
        kcalMultiplier: 1.0,
        proteinPerKg: 1.8,
        carbsMultiplier: 0.90,
        fatMultiplier: 1.10,
        hydrationLiters: 2.5,
        label: "Descanso ativo — Mobilidade e flexibilidade",
        tip: "Reduzir carb, aumentar gordura boa para recuperação.",
        preMeal: "Snack leve: frutas + castanhas",
        postMeal: "Não necessário — refeição normal",
      };
    case "rest":
    default:
      return {
        kcalMultiplier: 1.0,
        proteinPerKg: 2.0,
        carbsMultiplier: 0.80,
        fatMultiplier: 1.15,
        hydrationLiters: 2.5,
        label: "Dia de descanso — Recuperação total",
        tip: "Foco em proteína para recuperação. Carb reduzido, gordura boa.",
        preMeal: "—",
        postMeal: "—",
      };
  }
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

  // afternoon
  return [
    { time: "08h", meal: "Café: ovos + aveia + frutas", type: "cafe_da_manha" },
    { time: "12h", meal: "Almoço: carb complexo + proteína (pré-treino)", type: "almoco", highlight: true },
    { time: "16h30", meal: "Pós-treino: whey + banana ou refeição rápida", type: "lanche", highlight: true },
    { time: "20h", meal: "Jantar: proteína + salada + gordura boa", type: "jantar" },
  ];
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
      .order("day_of_week");
    setSchedule((data || []) as WorkoutScheduleEntry[]);
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
    const { error } = await supabase
      .from("workout_schedule")
      .upsert({
        user_id: user.id,
        day_of_week: entry.day_of_week,
        workout_type: entry.workout_type,
        workout_time: entry.workout_time,
        duration_minutes: entry.duration_minutes,
      }, { onConflict: "user_id,day_of_week" });
    if (!error) await fetchSchedule();
    return error;
  };

  const completeWorkout = async () => {
    if (!user) return;
    const today = new Date().toISOString().split("T")[0];
    const dayOfWeek = new Date().getDay();
    const todaySchedule = schedule.find(s => s.day_of_week === dayOfWeek);
    if (!todaySchedule) return;

    await supabase
      .from("workout_daily_logs")
      .upsert({
        user_id: user.id,
        log_date: today,
        workout_type: todaySchedule.workout_type,
        completed: true,
      }, { onConflict: "user_id,log_date" });
    await fetchTodayLog();
  };

  const getTodayWorkout = () => {
    const dayOfWeek = new Date().getDay();
    return schedule.find(s => s.day_of_week === dayOfWeek) || null;
  };

  return { schedule, todayLog, loading, saveDay, completeWorkout, getTodayWorkout, refetch: fetchSchedule };
};
