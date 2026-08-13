import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type RiskLevel = "ok" | "attention" | "risk";

export interface CoachAthlete {
  id: string; // coach_patients row id
  userId: string;
  name: string;
  avatarUrl?: string | null;
  sex?: string | null;
  objetivo: string;
  fase: string;
  pesoAtual?: number | null;
  bf?: number | null;
  semanaAtual?: number | null;
  semanasTotal?: number | null;
  startedAt: string;
  lastCheckin?: string | null;
  diasDesdeCheckin: number;
  streak: number;
  lastWeightLog?: string | null;
  hasActiveMealPlan: boolean;
  mealPlanSentAt?: string | null;
  hasActiveTrainingPlan: boolean;
  trainingPlanSentAt?: string | null;
  score: number;
  riskLevel: RiskLevel;
  /** "pendente" = conta criada mas atleta ainda nao acessou/usou o app */
  accessStatus: "pendente" | "ativo";
}

export const daysSince = (iso?: string | null): number => {
  if (!iso) return 9999;
  return Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86400000));
};

export function calcAthleteScore(a: {
  diasDesdeCheckin: number;
  hasActiveMealPlan: boolean;
  hasActiveTrainingPlan: boolean;
  streak: number;
  lastWeightLog?: string | null;
}): number {
  let score = 0;
  if (a.diasDesdeCheckin <= 2) score += 30;
  else if (a.diasDesdeCheckin <= 7) score += 20;
  else if (a.diasDesdeCheckin <= 14) score += 10;

  if (a.hasActiveMealPlan) score += 25;
  if (a.hasActiveTrainingPlan) score += 25;

  if (a.streak >= 14) score += 10;
  else if (a.streak >= 7) score += 7;
  else if (a.streak >= 3) score += 4;

  if (a.lastWeightLog && daysSince(a.lastWeightLog) <= 7) score += 10;

  return Math.min(score, 100);
}

export function getRiskLevel(score: number, diasDesdeCheckin: number): RiskLevel {
  if (diasDesdeCheckin > 30 || score < 20) return "risk";
  if (diasDesdeCheckin > 14 || score < 50) return "attention";
  return "ok";
}

export function useCoachAthletes(coachProfileId?: string | null, coachUserId?: string | null) {
  const [athletes, setAthletes] = useState<CoachAthlete[]>([]);
  const [loading, setLoading] = useState(true);
  const [plansThisMonth, setPlansThisMonth] = useState(0);

  const load = useCallback(async () => {
    if (!coachProfileId) {
      setLoading(false);
      return;
    }
    setLoading(true);

    const { data: links } = await supabase
      .from("coach_patients")
      .select("id, patient_user_id, status, started_at, created_at")
      .eq("coach_id", coachProfileId)
      .eq("status", "active");

    const rows = (links || []).filter((l) => !!l.patient_user_id);
    const ids = rows.map((l) => l.patient_user_id as string);

    if (ids.length === 0) {
      setAthletes([]);
      setLoading(false);
    }

    const [{ data: profs }, { data: checkins }, { data: mealPlans }, { data: trainings }, { data: sent }] =
      await Promise.all([
        supabase
          .from("profiles")
          .select("user_id, full_name, avatar_url, sex, weight_kg, goal, objetivo_principal, active_protocol, streak_days, updated_at, onboarding_completed, activation_completed, first_meal_registered")
          .in("user_id", ids.length ? ids : ["00000000-0000-0000-0000-000000000000"]),
        supabase
          .from("weekly_checkins")
          .select("user_id, created_at, weight_kg, week_start")
          .in("user_id", ids.length ? ids : ["00000000-0000-0000-0000-000000000000"])
          .order("created_at", { ascending: false }),
        supabase
          .from("coach_meal_plans")
          .select("patient_user_id, sent_at, created_at, status, objetivo")
          .eq("coach_id", coachProfileId)
          .order("created_at", { ascending: false }),
        supabase
          .from("training_protocols")
          .select("patient_user_id, created_at, phase, weeks")
          .in("patient_user_id", ids.length ? ids : ["00000000-0000-0000-0000-000000000000"])
          .order("created_at", { ascending: false }),
        supabase
          .from("sent_plans")
          .select("athlete_id, type, status, created_at")
          .eq("status", "active")
          .order("created_at", { ascending: false }),
      ]);

    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    setPlansThisMonth(
      (mealPlans || []).filter((m) => new Date(m.created_at).getTime() >= monthStart.getTime()).length +
        (trainings || []).filter((t) => t.created_at && new Date(t.created_at).getTime() >= monthStart.getTime()).length
    );

    const list: CoachAthlete[] = rows.map((l) => {
      const uid = l.patient_user_id as string;
      const prof = (profs || []).find((p) => p.user_id === uid) as any;
      const ck = (checkins || []).find((c) => c.user_id === uid) as any;
      const meal = (mealPlans || []).find((m) => m.patient_user_id === uid) as any;
      const train = (trainings || []).find((t) => t.patient_user_id === uid) as any;
      const sentMeal = (sent || []).find((s) => s.athlete_id === uid && s.type === "meal_plan") as any;
      const sentTrain = (sent || []).find((s) => s.athlete_id === uid && s.type === "training_plan") as any;

      const lastCheckin = ck?.created_at || null;
      const dias = daysSince(lastCheckin);
      const hasMeal = !!(meal || sentMeal);
      const hasTrain = !!(train || sentTrain);
      const streak = prof?.streak_days || 0;
      const lastWeightLog = ck?.created_at || null;

      const score = calcAthleteScore({
        diasDesdeCheckin: dias,
        hasActiveMealPlan: hasMeal,
        hasActiveTrainingPlan: hasTrain,
        streak,
        lastWeightLog,
      });

      const weeksTotal = train?.weeks ? parseInt(String(train.weeks), 10) || null : null;
      const startedAt = l.started_at || l.created_at;
      const semanaAtual = weeksTotal && train?.created_at
        ? Math.min(weeksTotal, Math.max(1, Math.ceil((daysSince(train.created_at) + 1) / 7)))
        : null;

      return {
        id: l.id,
        userId: uid,
        name: prof?.full_name || "Atleta",
        avatarUrl: prof?.avatar_url || null,
        sex: prof?.sex || null,
        objetivo: prof?.objetivo_principal || prof?.goal || meal?.objetivo || "Sem objetivo definido",
        fase: train?.phase || prof?.active_protocol || "—",
        pesoAtual: ck?.weight_kg ?? prof?.weight_kg ?? null,
        bf: null,
        semanaAtual,
        semanasTotal: weeksTotal,
        startedAt,
        lastCheckin,
        diasDesdeCheckin: dias,
        streak,
        lastWeightLog,
        hasActiveMealPlan: hasMeal,
        mealPlanSentAt: sentMeal?.created_at || meal?.sent_at || meal?.created_at || null,
        hasActiveTrainingPlan: hasTrain,
        trainingPlanSentAt: sentTrain?.created_at || train?.created_at || null,
        score,
        riskLevel: getRiskLevel(score, dias),
        accessStatus:
          prof?.onboarding_completed ||
          prof?.activation_completed ||
          prof?.first_meal_registered ||
          streak > 0 ||
          !!lastCheckin
            ? "ativo"
            : "pendente",
      };
    });

    setAthletes(list);
    setLoading(false);
  }, [coachProfileId, coachUserId]);

  useEffect(() => {
    load();
  }, [load]);

  return { athletes, loading, plansThisMonth, refetch: load };
}
