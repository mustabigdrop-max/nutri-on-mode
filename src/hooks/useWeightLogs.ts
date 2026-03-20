import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface WeightLog {
  id: string;
  weight_kg: number;
  body_fat_pct: number | null;
  muscle_mass_kg: number | null;
  logged_at: string;
}

export interface WeightTrend {
  /** kg/week — negative = losing, positive = gaining */
  weeklyRateKg: number;
  /** Actual TDEE estimated from real weight change + known calorie intake */
  estimatedTDEE: number | null;
  /** How on-track the user is relative to their target rate */
  status: "on_track" | "too_fast" | "too_slow" | "gaining_unexpected" | "insufficient_data";
  /** Suggested calorie adjustment in kcal/day (+ means eat more, - eat less) */
  adjustmentKcal: number;
  /** Days of data available */
  daysOfData: number;
}

/**
 * Adaptive TDEE algorithm — core of the MCE Real Engine.
 *
 * Takes actual weight change rate and known calorie intake to estimate
 * real TDEE, then compares to profile target rate to suggest adjustment.
 *
 * 1 kg body mass ≈ 7,700 kcal surplus/deficit.
 * Weekly rate × 7,700 / 7 = daily caloric delta implied by weight change.
 * actual_TDEE ≈ avg_daily_intake - daily_delta_from_weight_change
 */
function computeTrend(
  logs: WeightLog[],
  avgDailyKcal: number | null,
  targetWeeklyRateKg: number, // negative for cut, positive for bulk, 0 for maintain
): WeightTrend {
  if (logs.length < 3) {
    return {
      weeklyRateKg: 0,
      estimatedTDEE: null,
      status: "insufficient_data",
      adjustmentKcal: 0,
      daysOfData: logs.length,
    };
  }

  // Sort by date asc
  const sorted = [...logs].sort(
    (a, b) => new Date(a.logged_at).getTime() - new Date(b.logged_at).getTime()
  );

  const firstEntry = sorted[0];
  const lastEntry = sorted[sorted.length - 1];
  const days = Math.max(
    1,
    (new Date(lastEntry.logged_at).getTime() - new Date(firstEntry.logged_at).getTime()) / 86_400_000
  );

  const totalDelta = lastEntry.weight_kg - firstEntry.weight_kg; // negative = lost weight
  const weeklyRateKg = (totalDelta / days) * 7;

  // Estimate actual TDEE if we have calorie data
  let estimatedTDEE: number | null = null;
  if (avgDailyKcal && avgDailyKcal > 0) {
    // daily_caloric_delta = weeklyRateKg / 7 * 7700
    const dailyCaloricDelta = (weeklyRateKg / 7) * 7700;
    // TDEE = intake - what's left over (surplus = gained, deficit = lost)
    estimatedTDEE = Math.round(avgDailyKcal - dailyCaloricDelta);
  }

  // Tolerance: ±30% of target rate is "on_track"
  const tolerance = Math.abs(targetWeeklyRateKg) * 0.35 || 0.1;
  const diff = weeklyRateKg - targetWeeklyRateKg;

  let status: WeightTrend["status"];
  let adjustmentKcal = 0;

  if (targetWeeklyRateKg < 0) {
    // Cutting phase
    if (weeklyRateKg < targetWeeklyRateKg - tolerance) {
      status = "too_fast"; // losing faster than target → muscle risk
      adjustmentKcal = +100;
    } else if (weeklyRateKg > targetWeeklyRateKg + tolerance) {
      status = "too_slow"; // not losing fast enough
      adjustmentKcal = -100;
    } else {
      status = "on_track";
    }
  } else if (targetWeeklyRateKg > 0) {
    // Bulking phase
    if (weeklyRateKg > targetWeeklyRateKg + tolerance) {
      status = "too_fast"; // gaining too fast = fat
      adjustmentKcal = -100;
    } else if (weeklyRateKg < targetWeeklyRateKg - tolerance) {
      status = "too_slow"; // not gaining enough
      adjustmentKcal = +100;
    } else {
      status = "on_track";
    }
  } else {
    // Maintain
    if (Math.abs(weeklyRateKg) > 0.3) {
      status = weeklyRateKg > 0 ? "gaining_unexpected" : "too_fast";
      adjustmentKcal = weeklyRateKg > 0 ? -100 : +100;
    } else {
      status = "on_track";
    }
  }

  return {
    weeklyRateKg: Math.round(weeklyRateKg * 100) / 100,
    estimatedTDEE,
    status,
    adjustmentKcal,
    daysOfData: days,
  };
}

export function useWeightLogs(
  avgDailyKcal?: number | null,
  targetWeeklyRateKg?: number
) {
  const { user } = useAuth();
  const [logs, setLogs] = useState<WeightLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error: err } = await supabase
      .from("weight_logs")
      .select("*")
      .eq("user_id", user.id)
      .order("logged_at", { ascending: false })
      .limit(60); // last 60 entries (~2 months)
    if (err) { setError(err.message); }
    else { setLogs((data as WeightLog[]) ?? []); }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const addLog = useCallback(
    async (weightKg: number, bodyFatPct?: number, muscleMassKg?: number) => {
      if (!user) return;
      const { error: err } = await supabase.from("weight_logs").insert({
        user_id: user.id,
        weight_kg: weightKg,
        body_fat_pct: bodyFatPct ?? null,
        muscle_mass_kg: muscleMassKg ?? null,
        logged_at: new Date().toISOString(),
      });
      if (err) throw new Error(err.message);
      await fetchLogs();
    },
    [user, fetchLogs]
  );

  const deleteLog = useCallback(
    async (id: string) => {
      if (!user) return;
      await supabase.from("weight_logs").delete().eq("id", id).eq("user_id", user.id);
      await fetchLogs();
    },
    [user, fetchLogs]
  );

  const trend = computeTrend(
    logs,
    avgDailyKcal ?? null,
    targetWeeklyRateKg ?? -0.5
  );

  const latestWeight = logs[0]?.weight_kg ?? null;
  const firstWeight = logs.length > 0 ? logs[logs.length - 1].weight_kg : null;
  const totalDelta = latestWeight !== null && firstWeight !== null
    ? Math.round((latestWeight - firstWeight) * 100) / 100
    : null;

  return {
    logs,
    loading,
    error,
    addLog,
    deleteLog,
    refetch: fetchLogs,
    latestWeight,
    firstWeight,
    totalDelta,
    trend,
  };
}
