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
  weeklyRateKg: number;
  estimatedTDEE: number | null;
  status: "on_track" | "too_fast" | "too_slow" | "gaining_unexpected" | "insufficient_data";
  adjustmentKcal: number;
  daysOfData: number;
}

function computeTrend(logs: WeightLog[], avgDailyKcal: number | null, targetWeeklyRateKg: number): WeightTrend {
  if (logs.length < 3) return { weeklyRateKg: 0, estimatedTDEE: null, status: "insufficient_data", adjustmentKcal: 0, daysOfData: logs.length };
  const sorted = [...logs].sort((a, b) => new Date(a.logged_at).getTime() - new Date(b.logged_at).getTime());
  const days = Math.max(1, (new Date(sorted[sorted.length - 1].logged_at).getTime() - new Date(sorted[0].logged_at).getTime()) / 86400000);
  const weeklyRateKg = Math.round(((sorted[sorted.length - 1].weight_kg - sorted[0].weight_kg) / days * 7) * 100) / 100;
  const estimatedTDEE = avgDailyKcal ? Math.round(avgDailyKcal - (weeklyRateKg / 7 * 7700)) : null;
  const tolerance = Math.abs(targetWeeklyRateKg) * 0.35 || 0.1;
  let status: WeightTrend["status"] = "on_track";
  let adjustmentKcal = 0;
  if (targetWeeklyRateKg < 0) {
    if (weeklyRateKg < targetWeeklyRateKg - tolerance) { status = "too_fast"; adjustmentKcal = 100; }
    else if (weeklyRateKg > targetWeeklyRateKg + tolerance) { status = "too_slow"; adjustmentKcal = -100; }
  } else if (targetWeeklyRateKg > 0) {
    if (weeklyRateKg > targetWeeklyRateKg + tolerance) { status = "too_fast"; adjustmentKcal = -100; }
    else if (weeklyRateKg < targetWeeklyRateKg - tolerance) { status = "too_slow"; adjustmentKcal = 100; }
  } else {
    if (Math.abs(weeklyRateKg) > 0.3) { status = weeklyRateKg > 0 ? "gaining_unexpected" : "too_fast"; adjustmentKcal = weeklyRateKg > 0 ? -100 : 100; }
  }
  return { weeklyRateKg, estimatedTDEE, status, adjustmentKcal, daysOfData: days };
}

export function useWeightLogs(avgDailyKcal?: number | null, targetWeeklyRateKg = -0.5, overrideUserId?: string) {
  const { user: authUser } = useAuth();
  const user = overrideUserId ? ({ id: overrideUserId } as { id: string }) : authUser;
  const [logs, setLogs] = useState<WeightLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("weight_logs" as any)
      .select("*")
      .eq("user_id", user.id)
      .order("logged_at", { ascending: false })
      .limit(60);
    setLogs((data as unknown as WeightLog[]) ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const addLog = useCallback(async (weightKg: number, bodyFatPct?: number) => {
    if (!user) return;
    await supabase
      .from("weight_logs" as any)
      .insert({ user_id: user.id, weight_kg: weightKg, body_fat_pct: bodyFatPct ?? null, logged_at: new Date().toISOString() } as any);
    await fetchLogs();
  }, [user, fetchLogs]);

  const deleteLog = useCallback(async (id: string) => {
    if (!user) return;
    await supabase
      .from("weight_logs" as any)
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);
    await fetchLogs();
  }, [user, fetchLogs]);

  const latestWeight = logs[0]?.weight_kg ?? null;
  const firstWeight = logs.length > 0 ? logs[logs.length - 1].weight_kg : null;
  const totalDelta = latestWeight !== null && firstWeight !== null ? Math.round((latestWeight - firstWeight) * 100) / 100 : null;

  return {
    logs, loading, addLog, deleteLog, refetch: fetchLogs,
    latestWeight, firstWeight, totalDelta,
    trend: computeTrend(logs, avgDailyKcal ?? null, targetWeeklyRateKg),
  };
}
