// MERIDIAN Bloco 6 — Peak Week protocol hook.
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface PeakWeekProtocol {
  id: string;
  user_id: string;
  plan_id: string;
  competition_id: string;
  start_date: string;
  water_liters: number[];
  sodium_mg: number[];
  potassium_mg: number[];
  carbs_grams: number[];
  training_focus: string[];
  posing_minutes: number[];
  tanning_schedule: string | null;
  notes: string | null;
  status: string;
}

const DEFAULT_PROTOCOL = {
  // Day 1..7 (day 7 = stage day) — clássico depleção/saturação
  water_liters: [6, 6, 7, 8, 4, 2, 0.5],
  sodium_mg: [3000, 3000, 3000, 1500, 800, 400, 2500],
  potassium_mg: [3500, 3500, 3500, 4500, 4500, 4500, 3500],
  carbs_grams: [200, 150, 100, 350, 450, 500, 400],
  training_focus: [
    "Full body depleção 15-20 reps",
    "Upper depleção 15-20 reps",
    "Lower depleção 15-20 reps",
    "Pump leve upper",
    "Pump leve lower",
    "Posing + pump",
    "Stage / pump no backstage",
  ],
  posing_minutes: [20, 20, 30, 30, 45, 60, 90],
  tanning_schedule: "Base D-3, camada D-2, retoque D-1, touch-up backstage.",
};

export function useMeridianPeakWeek(planId: string | null, competitionId: string | null, startDate?: string) {
  const { user } = useAuth();
  const [protocol, setProtocol] = useState<PeakWeekProtocol | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const reload = useCallback(async () => {
    if (!user || !planId) return;
    setLoading(true);
    const { data } = await supabase
      .from("meridian_peak_week_protocols" as any)
      .select("*")
      .eq("plan_id", planId)
      .maybeSingle();
    setProtocol((data as any) ?? null);
    setLoading(false);
  }, [user, planId]);

  useEffect(() => { reload(); }, [reload]);

  const upsert = useCallback(async (partial: Partial<PeakWeekProtocol>) => {
    if (!user || !planId || !competitionId) return;
    setSaving(true);
    const payload = {
      user_id: user.id,
      plan_id: planId,
      competition_id: competitionId,
      start_date: startDate ?? new Date().toISOString().slice(0, 10),
      ...DEFAULT_PROTOCOL,
      ...(protocol ?? {}),
      ...partial,
    };
    const { data, error } = await supabase
      .from("meridian_peak_week_protocols" as any)
      .upsert(payload, { onConflict: "plan_id" } as any)
      .select()
      .maybeSingle();
    setSaving(false);
    if (!error) setProtocol((data as any) ?? null);
    return { data, error };
  }, [user, planId, competitionId, startDate, protocol]);

  const initialize = useCallback(async () => {
    return upsert({});
  }, [upsert]);

  return { protocol, loading, saving, upsert, initialize, reload, defaults: DEFAULT_PROTOCOL };
}
