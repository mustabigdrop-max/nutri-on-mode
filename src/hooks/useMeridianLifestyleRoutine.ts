// MERIDIAN — Hook para lifestyle routine (Track Lifestyle — Bloco 5).
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface MeridianLifestyleRoutine {
  id: string;
  user_id: string;
  plan_id: string | null;
  target_bf_min: number;
  target_bf_max: number;
  training_days_per_week: number;
  cardio_minutes_per_week: number;
  step_target_daily: number;
  current_phase: string;
  next_event_name: string | null;
  next_event_date: string | null;
  sustainability_score: number | null;
  notes: string | null;
}

export function useMeridianLifestyleRoutine() {
  const { user } = useAuth();
  const [routine, setRoutine] = useState<MeridianLifestyleRoutine | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("meridian_lifestyle_routines" as any)
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();
    setRoutine((data ?? null) as any);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    reload();
  }, [reload]);

  const upsert = useCallback(
    async (payload: Partial<MeridianLifestyleRoutine>) => {
      if (!user) throw new Error("Não autenticado");
      const { error } = await supabase
        .from("meridian_lifestyle_routines" as any)
        .upsert({ ...payload, user_id: user.id }, { onConflict: "user_id" });
      if (error) throw error;
      await reload();
    },
    [user, reload],
  );

  return { routine, loading, reload, upsert };
}
