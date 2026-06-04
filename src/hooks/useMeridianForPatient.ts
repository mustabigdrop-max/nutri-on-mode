// MERIDIAN — Hook do COACH: opera sobre dados de um paciente vinculado.
// RLS garante o vínculo; edge function valida no servidor.
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { MeridianCompetition, MeridianPlan } from "@/lib/meridian/types";
import { invokeMeridianCalculatePlan } from "@/lib/meridian/invokeCalculatePlan";
import { MeridianCalculationError } from "@/hooks/useMeridian";

export function useMeridianForPatient(patientUserId: string | null) {
  const [competitions, setCompetitions] = useState<MeridianCompetition[]>([]);
  const [plans, setPlans] = useState<MeridianPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!patientUserId) return;
    setLoading(true);
    setError(null);
    const [{ data: comps, error: ce }, { data: pls, error: pe }] = await Promise.all([
      supabase
        .from("meridian_competitions" as any)
        .select("*")
        .eq("user_id", patientUserId)
        .order("competition_date", { ascending: true }),
      supabase
        .from("meridian_plans" as any)
        .select("*")
        .eq("user_id", patientUserId)
        .eq("is_active", true)
        .order("created_at", { ascending: false }),
    ]);
    if (ce || pe) setError(ce?.message || pe?.message || "Erro ao carregar");
    setCompetitions((comps ?? []) as any);
    setPlans((pls ?? []) as any);
    setLoading(false);
  }, [patientUserId]);

  useEffect(() => {
    reload();
  }, [reload]);

  const calculatePlan = useCallback(
    async (competitionId: string, override?: Record<string, unknown>) => {
      if (!patientUserId) throw new Error("patient_user_id ausente");
      const res = await invokeMeridianCalculatePlan({
        competition_id: competitionId,
        athlete_params_override: override,
        patient_user_id: patientUserId,
      });
      if (res.ok === false) throw new MeridianCalculationError(res.payload);
      await reload();
      return res.plan as MeridianPlan;
    },
    [patientUserId, reload],
  );

  const createCompetition = useCallback(
    async (payload: Partial<MeridianCompetition>) => {
      if (!patientUserId) return null;
      const { data, error } = await supabase
        .from("meridian_competitions" as any)
        .insert({ ...payload, user_id: patientUserId } as any)
        .select()
        .single();
      if (error) {
        setError(error.message);
        return null;
      }
      await reload();
      return data as any;
    },
    [patientUserId, reload],
  );

  return { competitions, plans, loading, error, reload, calculatePlan, createCompetition };
}
