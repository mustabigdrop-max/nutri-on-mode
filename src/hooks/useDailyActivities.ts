import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { getLocalDateStr } from "@/lib/utils";
import { type ClimateBand } from "@/lib/nutrySync";
import { calculateMetAdjustment, type MetCategory } from "@/lib/nutrySyncMet";

export interface DailyActivity {
  id: string;
  user_id: string;
  activity_date: string;
  activity_type: string;
  activity_label: string | null;
  duration_min: number;
  intensity: string;
  kcal_adjustment: number;
  carb_adjustment: number;
  protein_adjustment: number;
  fat_adjustment: number;
  hydration_adjustment_ml: number;
  climate_band: string | null;
  activity_category: string | null;
  met: number | null;
  gross_kcal: number | null;
  epoc_kcal: number | null;
  net_adjustment: number | null;
  created_at: string;
}

export interface AddActivityInput {
  /** Slug da atividade (ex.: "legs", "hiit", "corrida"). */
  type: string;
  label?: string;
  category: MetCategory;
  met: number;
  durationMin: number;
  weightKg: number;
  climate?: ClimateBand;
  /** Zona de corrida usada (Z1..Z4, LISS, HIIT, AEJ), quando aplicável. */
  zone?: string | null;
}

export function useDailyActivities(overrideUserId?: string) {
  const { user: authUser } = useAuth();
  const userId = overrideUserId || authUser?.id || null;
  const today = getLocalDateStr();
  const [activities, setActivities] = useState<DailyActivity[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActivities = useCallback(async () => {
    if (!userId) {
      setActivities([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from("client_daily_activities")
      .select("*")
      .eq("user_id", userId)
      .eq("activity_date", today)
      .order("created_at", { ascending: true });
    setActivities((data as DailyActivity[]) || []);
    setLoading(false);
  }, [userId, today]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const addActivity = useCallback(
    async (input: AddActivityInput) => {
      if (!userId) return { error: new Error("sem usuário") };
      const adj = calculateMetAdjustment({
        type: input.type,
        met: input.met,
        durationMin: input.durationMin,
        weightKg: input.weightKg,
      });
      const intensity = adj.met >= 8 ? "intensa" : adj.met >= 5 ? "moderada" : "leve";
      const { data, error } = await supabase
        .from("client_daily_activities")
        .insert({
          user_id: userId,
          activity_date: today,
          activity_type: input.type,
          activity_label: input.label ?? null,
          duration_min: input.durationMin,
          intensity,
          activity_category: input.category,
          met: adj.met,
          gross_kcal: adj.grossKcal,
          epoc_kcal: adj.epocKcal,
          net_adjustment: adj.netAdjustment,
          kcal_adjustment: adj.netAdjustment,
          carb_adjustment: adj.carbAdd,
          protein_adjustment: adj.proteinAdd,
          fat_adjustment: adj.fatAdd,
          hydration_adjustment_ml: adj.hydrationMl,
          climate_band: input.climate ?? null,
        })
        .select()
        .single();
      if (!error && data) setActivities((prev) => [...prev, data as DailyActivity]);
      return { data, error, adjustment: adj };
    },
    [userId, today],
  );

  const removeActivity = useCallback(async (id: string) => {
    const { error } = await supabase.from("client_daily_activities").delete().eq("id", id);
    if (!error) setActivities((prev) => prev.filter((a) => a.id !== id));
    return { error };
  }, []);

  const totals = activities.reduce(
    (acc, a) => ({
      kcal: acc.kcal + (a.kcal_adjustment || 0),
      carb: acc.carb + (a.carb_adjustment || 0),
      protein: acc.protein + (a.protein_adjustment || 0),
      fat: acc.fat + (a.fat_adjustment || 0),
      hydrationMl: acc.hydrationMl + (a.hydration_adjustment_ml || 0),
    }),
    { kcal: 0, carb: 0, protein: 0, fat: 0, hydrationMl: 0 },
  );

  return { activities, totals, loading, addActivity, removeActivity, refetch: fetchActivities };
}
