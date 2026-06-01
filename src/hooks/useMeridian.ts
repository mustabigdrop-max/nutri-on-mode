// MERIDIAN — Hook principal: lista competições, planos, cria competição + chama edge function.
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { MeridianCompetition, MeridianPlan } from "@/lib/meridian/types";

export function useMeridian() {
  const { user } = useAuth();
  const [competitions, setCompetitions] = useState<MeridianCompetition[]>([]);
  const [plans, setPlans] = useState<MeridianPlan[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const [{ data: comps }, { data: pls }] = await Promise.all([
      supabase
        .from("meridian_competitions" as any)
        .select("*")
        .eq("user_id", user.id)
        .order("competition_date", { ascending: true }),
      supabase
        .from("meridian_plans" as any)
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .order("created_at", { ascending: false }),
    ]);
    setCompetitions((comps ?? []) as any);
    setPlans((pls ?? []) as any);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    reload();
  }, [reload]);

  const calculatePlan = useCallback(
    async (
      competitionId: string,
      athleteParamsOverride?: Record<string, unknown>,
    ) => {
      const { data, error } = await supabase.functions.invoke("meridian-calculate-plan", {
        body: { competition_id: competitionId, athlete_params_override: athleteParamsOverride },
      });
      if (error) throw new Error(error.message);
      if ((data as any)?.error) throw new Error((data as any).error);
      await reload();
      return (data as any)?.plan as MeridianPlan;
    },
    [reload],
  );

  return { competitions, plans, loading, reload, calculatePlan };
}
