// MERIDIAN — Atletas vinculados ao coach SEM plano MERIDIAN ativo.
// Usado no roster para CTA "Iniciar operação".
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCoachProfile } from "@/hooks/useCoachProfile";

export interface PendingAthlete {
  patient_user_id: string;
  full_name: string;
  email: string | null;
  sex: string | null;
}

export function useMeridianPendingAthletes(activeUserIds: string[]) {
  const { profile, loading: profileLoading } = useCoachProfile();
  const [items, setItems] = useState<PendingAthlete[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!profile) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data: patients } = await supabase
      .from("coach_patients")
      .select("patient_user_id")
      .eq("coach_id", profile.id)
      .eq("status", "active");

    const ids = (patients ?? [])
      .map((p) => p.patient_user_id)
      .filter((id) => !activeUserIds.includes(id));

    if (ids.length === 0) {
      setItems([]);
      setLoading(false);
      return;
    }

    const { data: profs } = await supabase
      .from("profiles")
      .select("user_id,full_name,email,sex")
      .in("user_id", ids);

    setItems(
      (profs ?? []).map((p: any) => ({
        patient_user_id: p.user_id,
        full_name: p.full_name ?? "Atleta",
        email: p.email ?? null,
        sex: p.sex ?? null,
      })),
    );
    setLoading(false);
  }, [profile, activeUserIds.join("|")]);

  useEffect(() => {
    if (!profileLoading) reload();
  }, [profileLoading, reload]);

  return { items, loading, reload };
}
