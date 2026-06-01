// MERIDIAN — Roster do COACH: agrega todos os atletas vinculados com plano ativo.
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCoachProfile } from "@/hooks/useCoachProfile";

export interface MeridianRosterRow {
  patient_user_id: string;
  full_name: string;
  email: string | null;
  sex: string | null;
  plan_id: string | null;
  competition_id: string | null;
  competition_name: string | null;
  competition_date: string | null;
  category: string | null;
  federation: string | null;
  is_natural_federation: boolean;
  viability_status: string | null;
  stage_target_weight_kg: number | null;
  stage_target_bf_percent: number | null;
  days_to_stage: number | null;
  weeks_to_stage: number | null;
  current_phase: string | null;
  last_checkpoint_date: string | null;
  last_adherence_pct: number | null;
  last_weight_kg: number | null;
  triad_severity: "GREEN" | "YELLOW" | "RED" | null;
  next_drug_test_date: string | null;
}

function daysBetween(a: string, b: string) {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000);
}

export function useMeridianCoachRoster() {
  const { profile, loading: profileLoading } = useCoachProfile();
  const [rows, setRows] = useState<MeridianRosterRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!profile) {
      setRows([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data: patients, error: pe } = await supabase
        .from("coach_patients")
        .select("patient_user_id")
        .eq("coach_id", profile.id)
        .eq("status", "active");
      if (pe) throw pe;

      const today = new Date().toISOString().slice(0, 10);
      const enriched: MeridianRosterRow[] = [];

      for (const p of patients ?? []) {
        const uid = p.patient_user_id;
        const [{ data: prof }, { data: plan }] = await Promise.all([
          supabase
            .from("profiles")
            .select("full_name,email,sex")
            .eq("user_id", uid)
            .maybeSingle(),
          supabase
            .from("meridian_plans" as any)
            .select("*")
            .eq("user_id", uid)
            .eq("is_active", true)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle(),
        ]);

        if (!plan) continue;

        const [
          { data: comp },
          { data: lastCp },
          { data: lastTriad },
          { data: nextDrug },
        ] = await Promise.all([
          supabase
            .from("meridian_competitions" as any)
            .select("*")
            .eq("id", (plan as any).competition_id)
            .maybeSingle(),
          supabase
            .from("meridian_weekly_checkpoints" as any)
            .select("checkpoint_date,adherence_pct,weight_kg,current_phase")
            .eq("plan_id", (plan as any).id)
            .order("checkpoint_date", { ascending: false })
            .limit(1)
            .maybeSingle(),
          supabase
            .from("meridian_triad_log" as any)
            .select("severity,log_date")
            .eq("user_id", uid)
            .order("log_date", { ascending: false })
            .limit(1)
            .maybeSingle(),
          supabase
            .from("meridian_drug_tests" as any)
            .select("scheduled_date")
            .eq("user_id", uid)
            .gte("scheduled_date", today)
            .order("scheduled_date", { ascending: true })
            .limit(1)
            .maybeSingle(),
        ]);

        const compDate = (comp as any)?.competition_date ?? null;
        const dts = compDate ? Math.max(daysBetween(today, compDate), 0) : null;

        enriched.push({
          patient_user_id: uid,
          full_name: (prof as any)?.full_name ?? "Atleta",
          email: (prof as any)?.email ?? null,
          sex: (prof as any)?.sex ?? null,
          plan_id: (plan as any).id,
          competition_id: (plan as any).competition_id,
          competition_name: (comp as any)?.name ?? null,
          competition_date: compDate,
          category: (comp as any)?.category ?? null,
          federation: (comp as any)?.federation ?? null,
          is_natural_federation: !!(comp as any)?.is_natural_federation,
          viability_status: (plan as any).viability_status ?? null,
          stage_target_weight_kg: (plan as any).stage_target_weight_kg ?? null,
          stage_target_bf_percent: (plan as any).stage_target_bf_percent ?? null,
          days_to_stage: dts,
          weeks_to_stage: dts != null ? Math.floor(dts / 7) : null,
          current_phase: (lastCp as any)?.current_phase ?? null,
          last_checkpoint_date: (lastCp as any)?.checkpoint_date ?? null,
          last_adherence_pct: (lastCp as any)?.adherence_pct ?? null,
          last_weight_kg: (lastCp as any)?.weight_kg ?? null,
          triad_severity: ((lastTriad as any)?.severity as any) ?? null,
          next_drug_test_date: (nextDrug as any)?.scheduled_date ?? null,
        });
      }

      enriched.sort((a, b) => {
        if (a.days_to_stage == null) return 1;
        if (b.days_to_stage == null) return -1;
        return a.days_to_stage - b.days_to_stage;
      });
      setRows(enriched);
    } catch (e: any) {
      setError(e?.message ?? "Falha ao carregar roster MERIDIAN");
    } finally {
      setLoading(false);
    }
  }, [profile]);

  useEffect(() => {
    if (!profileLoading) reload();
  }, [profileLoading, reload]);

  return { rows, loading, error, reload };
}
