// MERIDIAN — Hook principal: lista competições, planos, cria competição + chama edge function.
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { MeridianCompetition, MeridianPlan } from "@/lib/meridian/types";
import {
  invokeMeridianCalculatePlan,
  type MeridianInvokeError,
} from "@/lib/meridian/invokeCalculatePlan";

export class MeridianCalculationError extends Error {
  payload: MeridianInvokeError;
  constructor(payload: MeridianInvokeError) {
    super(payload.message || payload.error || "Falha no cálculo MERIDIAN");
    this.payload = payload;
    this.name = "MeridianCalculationError";
  }
}

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
      const res = await invokeMeridianCalculatePlan({
        competition_id: competitionId,
        athlete_params_override: athleteParamsOverride,
      });
      if (!res.ok) throw new MeridianCalculationError(res.payload);
      await reload();
      return res.plan as MeridianPlan;
    },
    [reload],
  );

  return { competitions, plans, loading, reload, calculatePlan };
}
