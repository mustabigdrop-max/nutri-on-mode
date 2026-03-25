import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type WorkoutType =
  | "push"
  | "pull"
  | "legs"
  | "upper"
  | "lower"
  | "full_body"
  | "chest_triceps"
  | "back_biceps"
  | "shoulders"
  | "arms"
  | "cardio_z1"
  | "cardio_z2"
  | "cardio_z3"
  | "cardio_hiit"
  | "cardio_light"
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
  cardioCalsBurned?: number;
}

export const WORKOUT_TYPES: Record<WorkoutType, { emoji: string; label: string; shortLabel: string; category: "musculacao" | "cardio" | "descanso" }> = {
  push: { emoji: "💪", label: "Push (Peito/Ombro/Tríceps)", shortLabel: "Push", category: "musculacao" },
  pull: { emoji: "💪", label: "Pull (Costas/Bíceps)", shortLabel: "Pull", category: "musculacao" },
  legs: { emoji: "🦵", label: "Legs (Pernas/Glúteo)", shortLabel: "Legs", category: "musculacao" },
  upper: { emoji: "💪", label: "Upper Body", shortLabel: "Upper", category: "musculacao" },
  lower: { emoji: "🦵", label: "Lower Body", shortLabel: "Lower", category: "musculacao" },
  full_body: { emoji: "🏋️", label: "Full Body", shortLabel: "Full Body", category: "musculacao" },
  chest_triceps: { emoji: "💪", label: "Peito/Tríceps", shortLabel: "Peito/Trí", category: "musculacao" },
  back_biceps: { emoji: "💪", label: "Costas/Bíceps", shortLabel: "Costas/Bí", category: "musculacao" },
  shoulders: { emoji: "💪", label: "Ombro/Trapézio", shortLabel: "Ombro/Trap", category: "musculacao" },
  arms: { emoji: "💪", label: "Braços", shortLabel: "Braços", category: "musculacao" },
  cardio_z1: { emoji: "🚶", label: "Cardio Z1 (Caminhada leve)", shortLabel: "Cardio Z1", category: "cardio" },
  cardio_z2: { emoji: "🏃", label: "Cardio Z2 (Moderado/AEJ)", shortLabel: "Cardio Z2", category: "cardio" },
  cardio_z3: { emoji: "🏃‍♂️", label: "Cardio Z3 (Limiar)", shortLabel: "Cardio Z3", category: "cardio" },
  cardio_hiit: { emoji: "🔥", label: "HIIT (Alta Intensidade)", shortLabel: "HIIT", category: "cardio" },
  cardio_light: { emoji: "🚴", label: "Cardio leve (bike/caminhada)", shortLabel: "Cardio leve", category: "cardio" },
  active_rest: { emoji: "🧘", label: "Descanso ativo (alongamento)", shortLabel: "Descanso ativo", category: "descanso" },
  rest: { emoji: "😴", label: "Dia de descanso total", shortLabel: "Descanso", category: "descanso" },
};

export const DAY_NAMES = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
export const DAY_NAMES_FULL = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

/** Estimated cardio calorie burn by type and duration */
function getCardioCalsBurned(type: WorkoutType, durationMin: number): number {
  const perMin: Record<string, number> = {
    cardio_z1: 5, cardio_z2: 8, cardio_z3: 10, cardio_hiit: 14, cardio_light: 5,
  };
  return Math.round((perMin[type] || 0) * durationMin);
}

export function getWorkoutAdjustment(type: WorkoutType, weightKg: number, durationMin = 60): NutritionAdjustment {
  switch (type) {
    case "legs": case "lower":
      return {
        kcalMultiplier: 1.20, proteinPerKg: 2.4, carbsMultiplier: 1.30, fatMultiplier: 1.0, hydrationLiters: 3.2,
        label: "Dia de Perna — Performance máxima",
        tip: "🦵 LEG DAY! Maior carb da semana. Beterraba 2-3h antes. Intra: 50-60g carb.",
        preMeal: "Carb alto: batata doce + frango + suco de beterraba",
        postMeal: "Whey 40g + Dextrose 60-80g + Creatina 5g",
      };
    case "push": case "chest_triceps":
      return {
        kcalMultiplier: 1.12, proteinPerKg: 2.2, carbsMultiplier: 1.15, fatMultiplier: 1.0, hydrationLiters: 3.0,
        label: "Push Day — Peito/Ombro/Tríceps",
        tip: "Carb moderado no pré-treino para séries pesadas de supino.",
        preMeal: "Arroz + frango + salada (2-3h antes)",
        postMeal: "Whey 40g + banana + creatina 5g",
      };
    case "pull": case "back_biceps":
      return {
        kcalMultiplier: 1.12, proteinPerKg: 2.2, carbsMultiplier: 1.15, fatMultiplier: 1.0, hydrationLiters: 3.0,
        label: "Pull Day — Costas/Bíceps",
        tip: "Costas = grupo grande. Proteína pós mínimo 45g para síntese ótima.",
        preMeal: "Refeição balanceada: arroz + proteína + salada",
        postMeal: "Whey 40g + aveia ou refeição completa",
      };
    case "upper":
      return {
        kcalMultiplier: 1.15, proteinPerKg: 2.2, carbsMultiplier: 1.15, fatMultiplier: 1.0, hydrationLiters: 3.0,
        label: "Upper Day — Tronco completo",
        tip: "Carb moderado. Proteína distribuída ao longo do dia.",
        preMeal: "Refeição completa 2-3h antes", postMeal: "Whey + carb moderado",
      };
    case "full_body":
      return {
        kcalMultiplier: 1.18, proteinPerKg: 2.4, carbsMultiplier: 1.20, fatMultiplier: 1.0, hydrationLiters: 3.2,
        label: "Full Body — Todos os grupos",
        tip: "Volume grande. Proteína máxima + carb intra-treino recomendado.",
        preMeal: "Carb complexo + proteína (refeição grande)", postMeal: "Whey 40g + carb 60g",
      };
    case "shoulders":
      return {
        kcalMultiplier: 1.10, proteinPerKg: 2.0, carbsMultiplier: 1.10, fatMultiplier: 1.0, hydrationLiters: 3.0,
        label: "Ombros — Volume e definição",
        tip: "Grupo menor. Carb moderado. Face pull preventivo.",
        preMeal: "Refeição leve-moderada", postMeal: "Whey + refeição normal",
      };
    case "arms":
      return {
        kcalMultiplier: 1.08, proteinPerKg: 2.0, carbsMultiplier: 1.05, fatMultiplier: 1.0, hydrationLiters: 2.8,
        label: "Braços — Bíceps/Tríceps",
        tip: "Menor demanda energética. Carb reduzido vs dias de compostos.",
        preMeal: "Lanche leve: fruta + whey", postMeal: "Whey + refeição normal",
      };
    case "cardio_z1":
      return {
        kcalMultiplier: 1.05, proteinPerKg: 1.8, carbsMultiplier: 1.0, fatMultiplier: 1.0, hydrationLiters: 2.8,
        label: "Cardio Z1 — Caminhada leve",
        tip: "Sem ajuste significativo. Manutenção normal.",
        preMeal: "Opcional: AEJ ou fruta leve", postMeal: "Refeição normal",
        cardioCalsBurned: getCardioCalsBurned("cardio_z1", durationMin),
      };
    case "cardio_z2":
      return {
        kcalMultiplier: 1.10, proteinPerKg: 1.8, carbsMultiplier: 1.05, fatMultiplier: 1.0, hydrationLiters: 3.0,
        label: "Cardio Z2 — Aeróbio moderado/AEJ",
        tip: "Fat adaptation. Repor carb pós. EAA se > 45min.",
        preMeal: "AEJ: água + cafeína 200mg + eletrólitos. Ou 10g EAA se > 45min",
        postMeal: "Refeição completa: proteína 50g + carb 80g",
        cardioCalsBurned: getCardioCalsBurned("cardio_z2", durationMin),
      };
    case "cardio_z3":
      return {
        kcalMultiplier: 1.12, proteinPerKg: 1.8, carbsMultiplier: 1.15, fatMultiplier: 0.95, hydrationLiters: 3.2,
        label: "Cardio Z3 — Limiar",
        tip: "Carb pré obrigatório. Maior depleção de glicogênio.",
        preMeal: "Carb + proteína: banana + whey (30min antes)",
        postMeal: "Whey + carb simples + eletrólitos",
        cardioCalsBurned: getCardioCalsBurned("cardio_z3", durationMin),
      };
    case "cardio_hiit":
      return {
        kcalMultiplier: 1.12, proteinPerKg: 1.8, carbsMultiplier: 1.15, fatMultiplier: 0.95, hydrationLiters: 3.5,
        label: "HIIT — Queima e resistência",
        tip: "Carb pré para sustentar intensidade. EPOC +100-200kcal pós.",
        preMeal: "Banana + whey ou gel de carb (30min antes)",
        postMeal: "Eletrólitos + whey + carb rápido",
        cardioCalsBurned: getCardioCalsBurned("cardio_hiit", durationMin),
      };
    case "cardio_light":
      return {
        kcalMultiplier: 1.05, proteinPerKg: 1.8, carbsMultiplier: 1.05, fatMultiplier: 1.0, hydrationLiters: 2.8,
        label: "Cardio leve — Recuperação ativa",
        tip: "Manutenção calórica com foco em micronutrientes.",
        preMeal: "Fruta + iogurte natural", postMeal: "Refeição leve e nutritiva",
        cardioCalsBurned: getCardioCalsBurned("cardio_light", durationMin),
      };
    case "active_rest":
      return {
        kcalMultiplier: 1.0, proteinPerKg: 1.8, carbsMultiplier: 0.90, fatMultiplier: 1.10, hydrationLiters: 2.5,
        label: "Descanso ativo — Mobilidade e flexibilidade",
        tip: "Reduzir carb, aumentar gordura boa para recuperação.",
        preMeal: "Snack leve: frutas + castanhas", postMeal: "Refeição normal",
      };
    case "rest": default:
      return {
        kcalMultiplier: 0.90, proteinPerKg: 2.0, carbsMultiplier: 0.80, fatMultiplier: 1.15, hydrationLiters: 2.5,
        label: "Dia de descanso — Recuperação total",
        tip: "Carb reduzido. Gordura aumentada. Proteína alta para síntese 24-48h.",
        preMeal: "—", postMeal: "—",
      };
  }
}

/** Combine multiple workout adjustments into one aggregated adjustment */
export function combineAdjustments(workouts: WorkoutScheduleEntry[], weightKg: number): NutritionAdjustment {
  if (workouts.length === 0) return getWorkoutAdjustment("rest", weightKg);
  if (workouts.length === 1) return getWorkoutAdjustment(workouts[0].workout_type as WorkoutType, weightKg, workouts[0].duration_minutes);

  const adjustments = workouts.map(w => getWorkoutAdjustment(w.workout_type as WorkoutType, weightKg, w.duration_minutes));

  const totalKcalExtra = adjustments.reduce((sum, a) => sum + (a.kcalMultiplier - 1.0), 0);
  const maxProteinPerKg = Math.max(...adjustments.map(a => a.proteinPerKg));
  const totalCarbsExtra = adjustments.reduce((sum, a) => sum + (a.carbsMultiplier - 1.0), 0);
  const totalFatExtra = adjustments.reduce((sum, a) => sum + (a.fatMultiplier - 1.0), 0);
  const maxHydration = Math.max(...adjustments.map(a => a.hydrationLiters)) + (workouts.length > 1 ? 0.3 : 0);
  const totalCardioCals = adjustments.reduce((sum, a) => sum + (a.cardioCalsBurned || 0), 0);

  const labels = workouts.map(w => WORKOUT_TYPES[w.workout_type as WorkoutType]?.shortLabel).join(" + ");
  const tips = adjustments.map(a => a.tip);

  const hasCardio = workouts.some(w => WORKOUT_TYPES[w.workout_type as WorkoutType]?.category === "cardio");
  const hasMusculacao = workouts.some(w => WORKOUT_TYPES[w.workout_type as WorkoutType]?.category === "musculacao");
  const isDoubleDay = hasCardio && hasMusculacao;

  return {
    kcalMultiplier: 1.0 + totalKcalExtra,
    proteinPerKg: maxProteinPerKg,
    carbsMultiplier: 1.0 + totalCarbsExtra,
    fatMultiplier: 1.0 + totalFatExtra,
    hydrationLiters: Math.round(maxHydration * 10) / 10,
    label: isDoubleDay ? `Duplo Treino — ${labels}` : `${labels}`,
    tip: isDoubleDay
      ? `🔄 DUPLO TREINO ATIVO! Cardio (~${totalCardioCals}kcal) + Musculação. Carb focado no peri-treino da tarde.`
      : tips.join(" | "),
    preMeal: adjustments[0].preMeal,
    postMeal: adjustments[adjustments.length - 1].postMeal,
    cardioCalsBurned: totalCardioCals,
  };
}

/** Detect if today is a double-training day (cardio + musculação) */
export function isDuploTreino(workouts: WorkoutScheduleEntry[]): boolean {
  const hasCardio = workouts.some(w => WORKOUT_TYPES[w.workout_type as WorkoutType]?.category === "cardio");
  const hasMusculacao = workouts.some(w => WORKOUT_TYPES[w.workout_type as WorkoutType]?.category === "musculacao");
  return hasCardio && hasMusculacao;
}

/** Generate full day timeline with meals, supplements, and training windows */
export function generateDayTimeline(
  workouts: WorkoutScheduleEntry[],
  weightKg: number,
  objetivo: "bulking" | "cutting" | "manutencao" = "manutencao",
  baseTDEE: number = 2500
) {
  const adjustment = combineAdjustments(workouts, weightKg);
  const goalMult = objetivo === "bulking" ? 1.12 : objetivo === "cutting" ? 0.88 : 1.0;
  const totalKcal = Math.round(baseTDEE * adjustment.kcalMultiplier * goalMult);
  const protein = Math.round(weightKg * adjustment.proteinPerKg);
  const fatPct = objetivo === "cutting" ? 0.20 : 0.25;
  const fat = Math.round((totalKcal * fatPct) / 9);
  const carbs = Math.round((totalKcal - protein * 4 - fat * 9) / 4);

  const isDouble = isDuploTreino(workouts);
  const cardioWorkout = workouts.find(w => WORKOUT_TYPES[w.workout_type as WorkoutType]?.category === "cardio");
  const muscWorkout = workouts.find(w => WORKOUT_TYPES[w.workout_type as WorkoutType]?.category === "musculacao");

  const timelineItems: {
    time: string;
    title: string;
    description: string;
    type: "meal" | "training" | "supplement" | "alert";
    emoji: string;
    highlight?: boolean;
    macros?: { kcal: number; protein: number; carbs: number; fat: number };
  }[] = [];

  if (isDouble && cardioWorkout && muscWorkout) {
    // Duplo treino: cardio manhã + musculação tarde
    const cardioType = WORKOUT_TYPES[cardioWorkout.workout_type as WorkoutType];
    const muscType = WORKOUT_TYPES[muscWorkout.workout_type as WorkoutType];
    const isAEJ = cardioWorkout.workout_type === "cardio_z1" || cardioWorkout.workout_type === "cardio_z2";
    const cardioLong = (cardioWorkout.duration_minutes || 45) > 45;

    timelineItems.push({
      time: "05:30", title: "Acordar", emoji: "⏰", type: "alert",
      description: `Hoje: ${cardioType.shortLabel} manhã + ${muscType.shortLabel} tarde`,
    });

    if (isAEJ && !cardioLong) {
      timelineItems.push({
        time: "06:00", title: "Pré-Cardio (AEJ)", emoji: "☕", type: "supplement",
        description: "Água 500ml + eletrólitos + cafeína 200mg + L-Carnitina 1g",
      });
    } else if (isAEJ && cardioLong) {
      timelineItems.push({
        time: "06:00", title: "Pré-Cardio (> 45min)", emoji: "🥤", type: "supplement",
        description: "10g EAA ou 20g whey isolado + cafeína 200mg + eletrólitos",
      });
    } else {
      timelineItems.push({
        time: "06:00", title: "Pré-Cardio (intenso)", emoji: "🍌", type: "meal", highlight: true,
        description: "Banana + 20g whey (30min antes)",
        macros: { kcal: 180, protein: 20, carbs: 27, fat: 2 },
      });
    }

    timelineItems.push({
      time: "06:30", title: `Cardio — ${cardioType.shortLabel}`, emoji: cardioType.emoji, type: "training", highlight: true,
      description: `${cardioWorkout.duration_minutes}min · ~${adjustment.cardioCalsBurned || 380}kcal`,
    });

    const r1Kcal = Math.round(totalKcal * 0.28);
    timelineItems.push({
      time: "07:30", title: "Café da Manhã (Pós-Cardio)", emoji: "🍳", type: "meal", highlight: true,
      description: objetivo === "bulking" ? "Ovos + aveia + leite + banana + whey" : "Claras + ovos + aveia + fruta + whey",
      macros: { kcal: r1Kcal, protein: Math.round(protein * 0.25), carbs: Math.round(carbs * 0.25), fat: Math.round(fat * 0.2) },
    });

    timelineItems.push({
      time: "07:30", title: "Suplementação Manhã", emoji: "💊", type: "supplement",
      description: "Vit D3 5000UI + Ômega-3 3g + Zinco 30mg + Magnésio 200mg",
    });

    const r2Kcal = Math.round(totalKcal * 0.15);
    timelineItems.push({
      time: "10:00", title: "Lanche da Manhã", emoji: "🥜", type: "meal",
      description: "Iogurte grego + granola + fruta + whey",
      macros: { kcal: r2Kcal, protein: Math.round(protein * 0.15), carbs: Math.round(carbs * 0.15), fat: Math.round(fat * 0.15) },
    });

    const r3Kcal = Math.round(totalKcal * 0.28);
    timelineItems.push({
      time: "12:30", title: "Almoço (Pré-Treino Principal)", emoji: "🍗", type: "meal", highlight: true,
      description: `⚠️ Musculação em ~2h — carb alto! ${muscType.shortLabel === "Legs" ? "🦵 Beterraba pré!" : ""}`,
      macros: { kcal: r3Kcal, protein: Math.round(protein * 0.28), carbs: Math.round(carbs * 0.30), fat: Math.round(fat * 0.25) },
    });

    timelineItems.push({
      time: "14:30", title: "Pré-Treino Musculação", emoji: "⚡", type: "supplement", highlight: true,
      description: "Banana + 30g whey + Citrulina 6-8g + Cafeína 100mg + Creatina 5g",
    });

    timelineItems.push({
      time: "15:00", title: `Musculação — ${muscType.shortLabel}`, emoji: muscType.emoji, type: "training", highlight: true,
      description: `${muscWorkout.duration_minutes}min`,
    });

    if ((muscWorkout.duration_minutes || 60) > 60) {
      timelineItems.push({
        time: "15:30", title: "Intra-Treino", emoji: "🧃", type: "supplement",
        description: `EAA 10-12g + Carb ${muscType.shortLabel === "Legs" ? "50-60g" : "30-40g"} + Taurina 3g`,
      });
    }

    const postKcal = Math.round(totalKcal * 0.10);
    timelineItems.push({
      time: "17:00", title: "Pós-Treino Imediato", emoji: "🚀", type: "meal", highlight: true,
      description: `JANELA ANABÓLICA! Whey 40g + ${objetivo === "bulking" ? "Dextrose 60-80g" : "Carb 30-40g"} + Creatina 5g`,
      macros: { kcal: postKcal, protein: 40, carbs: objetivo === "bulking" ? 70 : 40, fat: 0 },
    });

    const jantarKcal = Math.round(totalKcal * 0.15);
    timelineItems.push({
      time: "19:00", title: "Jantar", emoji: "🥩", type: "meal",
      description: "Proteína + arroz/batata + vegetais + azeite/abacate",
      macros: { kcal: jantarKcal, protein: Math.round(protein * 0.25), carbs: Math.round(carbs * 0.15), fat: Math.round(fat * 0.30) },
    });

    timelineItems.push({
      time: "21:00", title: "Suplementação Noturna", emoji: "🌙", type: "supplement",
      description: "Magnésio Glicinato 400mg + Ashwagandha 250mg + L-Teanina 200mg + Glicina 3g",
    });

    timelineItems.push({
      time: "21:30", title: "Ceia (se déficit proteico)", emoji: "🥛", type: "meal",
      description: "Caseína 40g + gordura boa (sem carb simples — GH noturno)",
      macros: { kcal: 200, protein: 35, carbs: 5, fat: 8 },
    });

  } else if (workouts.length > 0 && workouts[0].workout_type !== "rest" && workouts[0].workout_type !== "active_rest") {
    // Single training day
    const w = workouts[0];
    const wt = WORKOUT_TYPES[w.workout_type as WorkoutType];
    const isCardio = wt.category === "cardio";
    const isLegs = w.workout_type === "legs" || w.workout_type === "lower";

    const timeMap: Record<WorkoutTime, { pre: string; train: string; post: string }> = {
      morning: { pre: "06:00", train: "06:30", post: "08:00" },
      afternoon: { pre: "14:00", train: "15:00", post: "17:00" },
      night: { pre: "18:00", train: "19:00", post: "21:00" },
    };
    const times = timeMap[w.workout_time as WorkoutTime] || timeMap.afternoon;

    timelineItems.push({
      time: "07:30", title: "Café da Manhã", emoji: "🍳", type: "meal",
      description: w.workout_time === "morning" ? "Pré-treino: fruta + whey" : "Ovos + aveia + frutas",
      macros: { kcal: Math.round(totalKcal * 0.28), protein: Math.round(protein * 0.25), carbs: Math.round(carbs * 0.25), fat: Math.round(fat * 0.2) },
      highlight: w.workout_time === "morning",
    });

    timelineItems.push({
      time: times.pre, title: `Pré-Treino`, emoji: "⚡", type: "supplement", highlight: true,
      description: isCardio
        ? "Cafeína 200mg + eletrólitos + L-Carnitina 1g"
        : `Banana + whey + Citrulina 6-8g + Creatina 5g${isLegs ? " + beterraba" : ""}`,
    });

    timelineItems.push({
      time: times.train, title: `${wt.label}`, emoji: wt.emoji, type: "training", highlight: true,
      description: `${w.duration_minutes}min`,
    });

    timelineItems.push({
      time: times.post, title: "Pós-Treino", emoji: "🚀", type: "meal", highlight: true,
      description: isCardio ? "Refeição completa: proteína + carb" : `Whey 40g + ${objetivo === "bulking" ? "Dextrose 60g" : "Carb 30g"}`,
      macros: { kcal: Math.round(totalKcal * 0.15), protein: 40, carbs: 50, fat: 5 },
    });

    timelineItems.push({
      time: "12:30", title: "Almoço", emoji: "🍗", type: "meal",
      description: "Proteína + carb complexo + salada",
      macros: { kcal: Math.round(totalKcal * 0.28), protein: Math.round(protein * 0.28), carbs: Math.round(carbs * 0.30), fat: Math.round(fat * 0.25) },
    });

    timelineItems.push({
      time: "19:00", title: "Jantar", emoji: "🥩", type: "meal",
      description: "Proteína + vegetais + gordura boa",
      macros: { kcal: Math.round(totalKcal * 0.20), protein: Math.round(protein * 0.25), carbs: Math.round(carbs * 0.15), fat: Math.round(fat * 0.30) },
    });

  } else {
    // Rest day
    timelineItems.push(
      { time: "08:00", title: "Café da Manhã", emoji: "🍳", type: "meal", description: "Ovos + aveia + frutas", macros: { kcal: Math.round(totalKcal * 0.28), protein: Math.round(protein * 0.25), carbs: Math.round(carbs * 0.25), fat: Math.round(fat * 0.20) } },
      { time: "12:00", title: "Almoço", emoji: "🍗", type: "meal", description: "Proteína + arroz + salada", macros: { kcal: Math.round(totalKcal * 0.30), protein: Math.round(protein * 0.30), carbs: Math.round(carbs * 0.30), fat: Math.round(fat * 0.25) } },
      { time: "16:00", title: "Lanche", emoji: "🥜", type: "meal", description: "Iogurte + castanhas", macros: { kcal: Math.round(totalKcal * 0.15), protein: Math.round(protein * 0.15), carbs: Math.round(carbs * 0.15), fat: Math.round(fat * 0.25) } },
      { time: "20:00", title: "Jantar", emoji: "🥩", type: "meal", description: "Proteína + legumes + gordura boa", macros: { kcal: Math.round(totalKcal * 0.22), protein: Math.round(protein * 0.25), carbs: Math.round(carbs * 0.20), fat: Math.round(fat * 0.30) } },
      { time: "21:00", title: "Suplementação Noturna", emoji: "🌙", type: "supplement", description: "Magnésio 400mg + ZMA" },
    );
  }

  // Sort by time
  timelineItems.sort((a, b) => a.time.localeCompare(b.time));

  return {
    items: timelineItems,
    macros: { kcal: totalKcal, protein, carbs, fat },
    adjustment,
    isDoubleDay: isDouble,
    dayType: isDouble ? "duplo_treino" : workouts.length === 0 ? "descanso" : workouts[0].workout_type,
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

export function getMealSuggestionsMultiWorkout(workouts: WorkoutScheduleEntry[]) {
  if (workouts.length === 0) return getMealSuggestionsByTime("morning", "rest");
  if (workouts.length === 1) return getMealSuggestionsByTime(workouts[0].workout_time as WorkoutTime, workouts[0].workout_type as WorkoutType);

  const timeOrder: Record<WorkoutTime, number> = { morning: 0, afternoon: 1, night: 2 };
  const sorted = [...workouts].sort((a, b) => timeOrder[a.workout_time as WorkoutTime] - timeOrder[b.workout_time as WorkoutTime]);

  const first = sorted[0];
  const second = sorted[1];
  const ft = WORKOUT_TYPES[first.workout_type as WorkoutType];
  const st = WORKOUT_TYPES[second.workout_type as WorkoutType];

  const meals: { time: string; meal: string; type: string; highlight?: boolean }[] = [];

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

  const getTodayWorkout = () => {
    const list = getTodayWorkouts();
    return list.length > 0 ? list[0] : null;
  };

  const getWorkoutsForDay = (dow: number): WorkoutScheduleEntry[] => {
    return schedule.filter(s => s.day_of_week === dow);
  };

  return { schedule, todayLog, loading, saveDay, removeSlot, completeWorkout, getTodayWorkout, getTodayWorkouts, getWorkoutsForDay, refetch: fetchSchedule };
};
