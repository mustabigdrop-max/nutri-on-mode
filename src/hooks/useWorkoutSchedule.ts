import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type WorkoutType =
  | "chest_triceps"
  | "back_biceps"
  | "legs"
  | "shoulders"
  | "push"
  | "pull"
  | "full_body"
  | "upper"
  | "lower"
  | "arms"
  | "cardio_light"
  | "cardio_hiit"
  | "mma"
  | "running"
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
  intraMeal?: string;
  electrolytes?: string;
  volumeScore: number;
  muscleGroups: string[];
  recoveryHours: number;
}

export const WORKOUT_TYPES: Record<
  WorkoutType,
  { emoji: string; label: string; shortLabel: string; muscleGroups: string[]; volumeScore: number }
> = {
  // ── Classic bodybuilding splits ────────────────────────────────
  chest_triceps: {
    emoji: "🏋️",
    label: "Musculação — Peito/Tríceps",
    shortLabel: "Peito/Trí",
    muscleGroups: ["Peito", "Tríceps"],
    volumeScore: 3,
  },
  back_biceps: {
    emoji: "💪",
    label: "Musculação — Costas/Bíceps",
    shortLabel: "Costas/Bí",
    muscleGroups: ["Costas", "Bíceps"],
    volumeScore: 3,
  },
  legs: {
    emoji: "🦵",
    label: "Musculação — Pernas",
    shortLabel: "Pernas",
    muscleGroups: ["Quadríceps", "Posterior", "Glúteos", "Panturrilha"],
    volumeScore: 5,
  },
  shoulders: {
    emoji: "🎯",
    label: "Musculação — Ombros/Trapézio",
    shortLabel: "Ombro/Trap",
    muscleGroups: ["Ombros", "Trapézio"],
    volumeScore: 2,
  },
  arms: {
    emoji: "⚡",
    label: "Arms — Bíceps/Tríceps/Antebraço",
    shortLabel: "Braços",
    muscleGroups: ["Bíceps", "Tríceps", "Antebraço"],
    volumeScore: 2,
  },
  // ── PPL split ─────────────────────────────────────────────────
  push: {
    emoji: "📤",
    label: "Push — Peito/Ombro/Tríceps (PPL)",
    shortLabel: "Push PPL",
    muscleGroups: ["Peito", "Ombros", "Tríceps"],
    volumeScore: 4,
  },
  pull: {
    emoji: "📥",
    label: "Pull — Costas/Bíceps/Antebraço (PPL)",
    shortLabel: "Pull PPL",
    muscleGroups: ["Costas", "Bíceps", "Antebraço"],
    volumeScore: 4,
  },
  // ── Upper/Lower split ─────────────────────────────────────────
  upper: {
    emoji: "🔼",
    label: "Upper Body — Superior completo",
    shortLabel: "Upper",
    muscleGroups: ["Peito", "Costas", "Ombros", "Bíceps", "Tríceps"],
    volumeScore: 4,
  },
  lower: {
    emoji: "🔽",
    label: "Lower Body — Inferior completo",
    shortLabel: "Lower",
    muscleGroups: ["Quadríceps", "Posterior", "Glúteos", "Panturrilha"],
    volumeScore: 4,
  },
  // ── Full body / functional ─────────────────────────────────────
  full_body: {
    emoji: "🌀",
    label: "Full Body / Funcional",
    shortLabel: "Full Body",
    muscleGroups: ["Peito", "Costas", "Ombros", "Quadríceps", "Posterior", "Glúteos"],
    volumeScore: 4,
  },
  // ── Cardio ────────────────────────────────────────────────────
  cardio_light: {
    emoji: "🚶",
    label: "Cardio leve (caminhada, bike, natação leve)",
    shortLabel: "Cardio leve",
    muscleGroups: [],
    volumeScore: 1,
  },
  cardio_hiit: {
    emoji: "🔥",
    label: "Cardio intenso (HIIT, sprint, metcon)",
    shortLabel: "HIIT",
    muscleGroups: [],
    volumeScore: 3,
  },
  // ── Esportes ──────────────────────────────────────────────────
  mma: {
    emoji: "🥊",
    label: "MMA / Artes Marciais / Boxe",
    shortLabel: "MMA",
    muscleGroups: ["Peito", "Costas", "Ombros", "Quadríceps", "Posterior"],
    volumeScore: 4,
  },
  running: {
    emoji: "🏃",
    label: "Corrida / Endurance (>5km)",
    shortLabel: "Corrida",
    muscleGroups: ["Posterior", "Panturrilha", "Glúteos"],
    volumeScore: 3,
  },
  // ── Recuperação ───────────────────────────────────────────────
  active_rest: {
    emoji: "🧘",
    label: "Descanso ativo (mobilidade, alongamento)",
    shortLabel: "Mobilidade",
    muscleGroups: [],
    volumeScore: 0,
  },
  rest: {
    emoji: "😴",
    label: "Dia de descanso total",
    shortLabel: "Descanso",
    muscleGroups: [],
    volumeScore: 0,
  },
};

export const DAY_NAMES = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
export const DAY_NAMES_FULL = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

export function getWorkoutAdjustment(type: WorkoutType, weightKg: number): NutritionAdjustment {
  const muscleGroups = WORKOUT_TYPES[type]?.muscleGroups ?? [];
  const volumeScore = WORKOUT_TYPES[type]?.volumeScore ?? 0;

  switch (type) {
    // ── Leg day — maior demanda energética ──────────────────────
    case "legs":
    case "lower":
      return {
        kcalMultiplier: 1.18,
        proteinPerKg: 2.4,
        carbsMultiplier: 1.30,
        fatMultiplier: 0.95,
        hydrationLiters: 3.5,
        label: "Dia de Perna — Demanda máxima",
        tip: "Maior músculo = maior demanda de glicogênio. Carb pré obrigatório. Pós-treino: janela anabólica real de 60min.",
        preMeal: "60–90min antes: batata-doce 150g + frango 150g + legumes. Carb de alto IG 30min antes: banana.",
        postMeal: "Imediato: whey 40g + maltodextrina 60g ou dextrose 40g. 1h depois: refeição completa.",
        intraMeal: "Se >75min: gel de carbo ou banana a cada 45min de trabalho pesado.",
        electrolytes: "Sódio + potássio. Água de coco ou isotônico natural após treino.",
        muscleGroups,
        volumeScore,
        recoveryHours: 72,
      };

    // ── Push/Pull/PPL — alta densidade ──────────────────────────
    case "push":
    case "upper":
      return {
        kcalMultiplier: 1.12,
        proteinPerKg: 2.2,
        carbsMultiplier: 1.18,
        fatMultiplier: 1.0,
        hydrationLiters: 3.2,
        label: "Push / Upper — Força de empurrão",
        tip: "Sessão de alto volume muscular. Carb moderado pré para manter performance em compostos.",
        preMeal: "90min antes: arroz + frango + salada. 30min antes: banana + 5g creatina.",
        postMeal: "30min pós: whey 35g + aveia 50g. 1h depois: refeição sólida com proteína completa.",
        intraMeal: "Se >90min: aminoácido EAA intra (10g) + carb simples a cada 60min.",
        muscleGroups,
        volumeScore,
        recoveryHours: 48,
      };

    case "pull":
      return {
        kcalMultiplier: 1.12,
        proteinPerKg: 2.2,
        carbsMultiplier: 1.15,
        fatMultiplier: 1.0,
        hydrationLiters: 3.0,
        label: "Pull — Costas e força de tração",
        tip: "Costas são músculos grandes — distribuir proteína ao longo do dia maximiza síntese proteica.",
        preMeal: "90min antes: refeição completa. 20min antes: cafeína 200mg se habitual.",
        postMeal: "Whey 35g + carb complexo (aveia/arroz). Leucina eleva mTOR — garanta 3g de leucina total.",
        intraMeal: "Se >90min: EAA 10g ou BCAA intra-workout.",
        muscleGroups,
        volumeScore,
        recoveryHours: 48,
      };

    // ── Classic splits ───────────────────────────────────────────
    case "chest_triceps":
    case "back_biceps":
    case "shoulders":
    case "arms":
    case "full_body":
      return {
        kcalMultiplier: 1.10,
        proteinPerKg: 2.0,
        carbsMultiplier: 1.12,
        fatMultiplier: 1.0,
        hydrationLiters: 3.0,
        label: "Musculação — Hipertrofia e força",
        tip: "Proteína distribuída (3–4 refeições + pré/pós). Carb moderado pré-treino. Mínimo 8h sono para GH.",
        preMeal: "1–2h antes: refeição balanceada carb+proteína. 20min antes: opção rápida se necessário.",
        postMeal: "Janela anabólica: 30–60min pós. Whey + carb ou refeição sólida completa.",
        intraMeal: type === "full_body" ? "Se >90min: EAA 10g + carb intra (gel ou banana)." : undefined,
        muscleGroups,
        volumeScore,
        recoveryHours: 48,
      };

    // ── HIIT ────────────────────────────────────────────────────
    case "cardio_hiit":
      return {
        kcalMultiplier: 1.10,
        proteinPerKg: 1.8,
        carbsMultiplier: 1.20,
        fatMultiplier: 0.90,
        hydrationLiters: 3.8,
        label: "HIIT — Queima intensa + condicionamento",
        tip: "Carb pré é essencial para sustentar sprints. Eletrólitos pós são críticos — sudorese remove sódio, potássio, magnésio.",
        preMeal: "45min antes: banana + mel ou gel de carb. Evite gordura (retarda esvaziamento gástrico).",
        postMeal: "Imediato: eletrólitos + proteína. Água de coco + whey 30g.",
        intraMeal: undefined,
        electrolytes: "CRÍTICO: reposição de sódio (300–500mg), potássio (200–400mg), magnésio (100–200mg) pós-HIIT.",
        muscleGroups,
        volumeScore,
        recoveryHours: 24,
      };

    // ── MMA ─────────────────────────────────────────────────────
    case "mma":
      return {
        kcalMultiplier: 1.15,
        proteinPerKg: 2.2,
        carbsMultiplier: 1.25,
        fatMultiplier: 0.95,
        hydrationLiters: 4.0,
        label: "MMA / Artes Marciais — Demanda total",
        tip: "MMA usa todos os sistemas energéticos. Alta exigência de ATP-CP (explosão) + glicólise (rounds). Hidratação crítica.",
        preMeal: "2h antes: refeição completa carb+proteína. 30min antes: carb simples de rápida absorção.",
        postMeal: "Imediato pós: proteína 40g + carb rápido 60g. 1–2h depois: refeição anti-inflamatória (cúrcuma, ômega-3).",
        intraMeal: "Se treino >90min: carb intra a cada 45–60min (gel, banana, isotônico).",
        electrolytes: "Alto: reposição completa de sódio, potássio, magnésio. Considere sal rosa ou sal do himalaia.",
        muscleGroups,
        volumeScore,
        recoveryHours: 48,
      };

    // ── Running ─────────────────────────────────────────────────
    case "running":
      return {
        kcalMultiplier: 1.12,
        proteinPerKg: 1.8,
        carbsMultiplier: 1.30,
        fatMultiplier: 0.95,
        hydrationLiters: 3.5,
        label: "Corrida / Endurance — Carb loading ativo",
        tip: "Carb é o combustível principal da corrida. Protocolo de carb-loading nas 24h anteriores a provas longas. Cafeína melhora performance em 3–5%.",
        preMeal: "2h antes: arroz/macarrão/batata + proteína magra. 30–45min antes: gel ou banana.",
        postMeal: "Imediato: carb rápido + proteína. 1h depois: refeição anti-inflamatória com proteína completa.",
        intraMeal: "Se >60min correndo: 30–45g carb por hora (gel, isotônico, tâmara).",
        electrolytes: "Corrida >60min: reposição de sódio obrigatória. Cãibra = deficit de sódio+magnésio.",
        muscleGroups,
        volumeScore,
        recoveryHours: 36,
      };

    // ── Cardio leve ─────────────────────────────────────────────
    case "cardio_light":
      return {
        kcalMultiplier: 1.05,
        proteinPerKg: 1.8,
        carbsMultiplier: 1.05,
        fatMultiplier: 1.0,
        hydrationLiters: 2.8,
        label: "Cardio leve — Recuperação ativa + lipólise",
        tip: "Zona 2 (60–70% FC máx.) maximiza oxidação de gordura sem cortisol elevado. Ideal em cutting.",
        preMeal: "Pode treinar em jejum se protocolo de IF ativo. Se não: fruta leve.",
        postMeal: "Refeição leve e nutritiva. Foco em micronutrientes.",
        muscleGroups,
        volumeScore,
        recoveryHours: 12,
      };

    // ── Active rest / Full rest ─────────────────────────────────
    case "active_rest":
      return {
        kcalMultiplier: 1.0,
        proteinPerKg: 1.8,
        carbsMultiplier: 0.88,
        fatMultiplier: 1.12,
        hydrationLiters: 2.5,
        label: "Mobilidade — Recuperação e prevenção",
        tip: "Reduzir carboidrato, aumentar gordura boa. Colágeno hidrolisado + vitamina C potencializam recuperação de tecido conjuntivo.",
        preMeal: "Colágeno 10g + vitamina C na parte da manhã.",
        postMeal: "Não necessário — refeição normal com foco em micronutrientes.",
        electrolytes: "Magnésio 300mg à noite potencializa recuperação e qualidade do sono.",
        muscleGroups,
        volumeScore,
        recoveryHours: 0,
      };

    case "rest":
    default:
      return {
        kcalMultiplier: 1.0,
        proteinPerKg: 2.0,
        carbsMultiplier: 0.80,
        fatMultiplier: 1.15,
        hydrationLiters: 2.5,
        label: "Descanso — Supercompensação ocorre agora",
        tip: "Músculo cresce no descanso, não no treino. Foco: proteína distribuída, carboidrato reduzido, gordura boa, 8h+ de sono.",
        preMeal: "—",
        postMeal: "—",
        electrolytes: "Magnésio 300mg + zinco à noite para recuperação e testosterona endógena.",
        muscleGroups,
        volumeScore,
        recoveryHours: 0,
      };
  }
}

export function getMealSuggestionsByTime(workoutTime: WorkoutTime, workoutType: WorkoutType) {
  const hasIntra = !!getWorkoutAdjustment(workoutType, 80).intraMeal;

  if (workoutType === "rest" || workoutType === "active_rest") {
    return [
      { time: "08h", meal: "Café: ovos 3 inteiros + aveia 60g + fruta", type: "cafe_da_manha" },
      { time: "12h", meal: "Almoço: proteína 200g + arroz/batata + salada + azeite", type: "almoco" },
      { time: "16h", meal: "Lanche: iogurte grego + castanhas + fruta", type: "lanche" },
      { time: "20h", meal: "Jantar: proteína 200g + legumes + gordura boa", type: "jantar" },
      { time: "22h", meal: "Ceia (opcional): cottage 150g ou ovo + queijo", type: "ceia" },
    ];
  }

  if (workoutTime === "night") {
    return [
      { time: "08h", meal: "Café reforçado: ovos + pão integral + fruta", type: "cafe_da_manha" },
      { time: "12h", meal: "Almoço carb-loaded: arroz/batata + proteína + salada", type: "almoco" },
      { time: "16h", meal: "Pré-treino: frango 150g + batata doce 150g", type: "lanche", highlight: true },
      ...(hasIntra ? [{ time: "18h30", meal: "Intra-treino: gel de carbo ou banana a cada 45min", type: "intra", highlight: true }] : []),
      { time: "20h30", meal: "Pós-treino: whey 35g + maltodextrina 50g ou refeição completa", type: "jantar", highlight: true },
      { time: "22h", meal: "Ceia proteica: caseína 30g ou cottage + ovo cozido", type: "ceia" },
    ];
  }

  if (workoutTime === "morning") {
    return [
      { time: "06h", meal: "Pré-treino: banana + whey 25g (ou em jejum se protocolo IF)", type: "cafe_da_manha", highlight: true },
      ...(hasIntra ? [{ time: "07h30", meal: "Intra-treino (se >90min): gel ou banana", type: "intra", highlight: true }] : []),
      { time: "09h", meal: "Pós-treino reforçado: whey 35g + carb + refeição sólida 1h depois", type: "almoco", highlight: true },
      { time: "12h", meal: "Almoço: proteína + arroz/batata + salada", type: "almoco" },
      { time: "16h", meal: "Lanche: proteína + fruta de baixo IG", type: "lanche" },
      { time: "20h", meal: "Jantar: proteína + legumes + gordura boa", type: "jantar" },
    ];
  }

  // afternoon
  return [
    { time: "08h", meal: "Café: ovos + aveia + frutas", type: "cafe_da_manha" },
    { time: "12h", meal: "Almoço pré-treino: carb complexo + proteína magra", type: "almoco", highlight: true },
    { time: "14h30", meal: "Pré imediato (30min antes): banana + mel (opcional)", type: "lanche", highlight: true },
    ...(hasIntra ? [{ time: "16h", meal: "Intra-treino: EAA 10g + carb simples se >90min", type: "intra", highlight: true }] : []),
    { time: "17h30", meal: "Pós-treino: whey 35g + maltodextrina 50g ou refeição rápida", type: "lanche", highlight: true },
    { time: "20h", meal: "Jantar: proteína + salada + gordura boa (ômega-3)", type: "jantar" },
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

  const completeWorkout = async (rpe?: number) => {
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
        notes: rpe !== undefined ? JSON.stringify({ rpe }) : null,
      }, { onConflict: "user_id,log_date" });
    await fetchTodayLog();
  };

  const getTodayWorkout = () => {
    const dayOfWeek = new Date().getDay();
    return schedule.find(s => s.day_of_week === dayOfWeek) || null;
  };

  return { schedule, todayLog, loading, saveDay, completeWorkout, getTodayWorkout, refetch: fetchSchedule };
};
