// MERIDIAN — Hook para checkpoints semanais e ajustes de plano (Bloco 3).
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface MeridianCheckpoint {
  id: string;
  user_id: string;
  plan_id: string | null;
  competition_id: string | null;
  checkpoint_date: string;
  week_number: number | null;
  current_phase: string | null;
  weight_kg: number | null;
  bf_percent: number | null;
  waist_cm: number | null;
  energy_level: number | null;
  hunger_level: number | null;
  sleep_quality: number | null;
  training_performance: number | null;
  mood: number | null;
  adherence_pct: number | null;
  photo_front_url: string | null;
  photo_side_url: string | null;
  photo_back_url: string | null;
  notes: string | null;
  ai_assessment: any;
  created_at: string;
}

export interface MeridianAdjustment {
  id: string;
  user_id: string;
  plan_id: string;
  checkpoint_id: string | null;
  adjustment_date: string;
  adjustment_type: string;
  kcal_delta: number;
  cardio_delta_min: number;
  protein_delta_g: number;
  carbs_delta_g: number;
  fat_delta_g: number;
  reason: string | null;
  ai_rationale: string | null;
  applied_by: string;
  created_at: string;
}

export function useMeridianCheckpoints(planId?: string | null) {
  const { user } = useAuth();
  const [checkpoints, setCheckpoints] = useState<MeridianCheckpoint[]>([]);
  const [adjustments, setAdjustments] = useState<MeridianAdjustment[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const cpQuery = supabase
      .from("meridian_weekly_checkpoints" as any)
      .select("*")
      .eq("user_id", user.id)
      .order("checkpoint_date", { ascending: false });
    const adjQuery = supabase
      .from("meridian_plan_adjustments" as any)
      .select("*")
      .eq("user_id", user.id)
      .order("adjustment_date", { ascending: false });
    if (planId) {
      cpQuery.eq("plan_id", planId);
      adjQuery.eq("plan_id", planId);
    }
    const [{ data: cps }, { data: adjs }] = await Promise.all([cpQuery, adjQuery]);
    setCheckpoints((cps ?? []) as any);
    setAdjustments((adjs ?? []) as any);
    setLoading(false);
  }, [user, planId]);

  useEffect(() => {
    reload();
  }, [reload]);

  const submitCheckpoint = useCallback(
    async (payload: Partial<MeridianCheckpoint>) => {
      if (!user) throw new Error("Não autenticado");
      const { data, error } = await supabase
        .from("meridian_weekly_checkpoints" as any)
        .insert({ ...payload, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      await reload();
      return data as unknown as MeridianCheckpoint;
    },
    [user, reload],
  );

  const recalibrate = useCallback(
    async (checkpointId: string) => {
      const { data, error } = await supabase.functions.invoke("meridian-recalibrate", {
        body: { checkpoint_id: checkpointId },
      });
      if (error) throw new Error(error.message);
      if ((data as any)?.error) throw new Error((data as any).error);
      await reload();
      return (data as any)?.adjustment as MeridianAdjustment;
    },
    [reload],
  );

  return { checkpoints, adjustments, loading, reload, submitCheckpoint, recalibrate };
}
