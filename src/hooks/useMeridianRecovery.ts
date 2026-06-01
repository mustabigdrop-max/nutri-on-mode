// MERIDIAN Bloco 6 — Post-stage recovery hook.
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface PostStageRecovery {
  id: string;
  user_id: string;
  plan_id: string;
  competition_id: string;
  recovery_start_date: string;
  recovery_weeks: number;
  reverse_diet_kcal_step: number;
  weekly_kcal_targets: number[];
  refeed_days_per_week: number;
  training_deload_weeks: number;
  mental_health_check: Record<string, unknown>;
  binge_risk_level: string;
  notes: string | null;
}

export function useMeridianRecovery(planId: string | null, competitionId: string | null) {
  const { user } = useAuth();
  const [recovery, setRecovery] = useState<PostStageRecovery | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const reload = useCallback(async () => {
    if (!user || !planId) return;
    setLoading(true);
    const { data } = await supabase
      .from("meridian_post_stage_recovery" as any)
      .select("*")
      .eq("plan_id", planId)
      .maybeSingle();
    setRecovery((data as any) ?? null);
    setLoading(false);
  }, [user, planId]);

  useEffect(() => { reload(); }, [reload]);

  const upsert = useCallback(async (partial: Partial<PostStageRecovery>, baseKcal?: number) => {
    if (!user || !planId || !competitionId) return;
    setSaving(true);
    const weeks = partial.recovery_weeks ?? recovery?.recovery_weeks ?? 4;
    const step = partial.reverse_diet_kcal_step ?? recovery?.reverse_diet_kcal_step ?? 100;
    const base = baseKcal ?? 2400;
    const weekly = recovery?.weekly_kcal_targets?.length
      ? recovery.weekly_kcal_targets
      : Array.from({ length: weeks }, (_, i) => base + step * (i + 1));

    const payload = {
      user_id: user.id,
      plan_id: planId,
      competition_id: competitionId,
      recovery_start_date: recovery?.recovery_start_date ?? new Date().toISOString().slice(0, 10),
      recovery_weeks: weeks,
      reverse_diet_kcal_step: step,
      weekly_kcal_targets: partial.weekly_kcal_targets ?? weekly,
      refeed_days_per_week: partial.refeed_days_per_week ?? recovery?.refeed_days_per_week ?? 2,
      training_deload_weeks: partial.training_deload_weeks ?? recovery?.training_deload_weeks ?? 1,
      mental_health_check: partial.mental_health_check ?? recovery?.mental_health_check ?? {},
      binge_risk_level: partial.binge_risk_level ?? recovery?.binge_risk_level ?? "medium",
      notes: partial.notes ?? recovery?.notes ?? null,
    };
    const { data, error } = await supabase
      .from("meridian_post_stage_recovery" as any)
      .upsert(payload, { onConflict: "plan_id" } as any)
      .select()
      .maybeSingle();
    setSaving(false);
    if (!error) setRecovery((data as any) ?? null);
    return { data, error };
  }, [user, planId, competitionId, recovery]);

  return { recovery, loading, saving, upsert, reload };
}
