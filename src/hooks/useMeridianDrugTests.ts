// MERIDIAN — Hook para drug test calendar (Track Natural — Bloco 4).
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface MeridianDrugTest {
  id: string;
  user_id: string;
  competition_id: string | null;
  plan_id: string | null;
  federation: string;
  test_type: string;
  scheduled_date: string;
  status: string;
  result: string | null;
  is_mandatory: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export function useMeridianDrugTests(competitionId?: string | null) {
  const { user } = useAuth();
  const [tests, setTests] = useState<MeridianDrugTest[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const q = supabase
      .from("meridian_drug_tests" as any)
      .select("*")
      .eq("user_id", user.id)
      .order("scheduled_date", { ascending: true });
    if (competitionId) q.eq("competition_id", competitionId);
    const { data } = await q;
    setTests((data ?? []) as any);
    setLoading(false);
  }, [user, competitionId]);

  useEffect(() => {
    reload();
  }, [reload]);

  const create = useCallback(
    async (payload: Partial<MeridianDrugTest>) => {
      if (!user) throw new Error("Não autenticado");
      const { error } = await supabase
        .from("meridian_drug_tests" as any)
        .insert({ ...payload, user_id: user.id });
      if (error) throw error;
      await reload();
    },
    [user, reload],
  );

  const update = useCallback(
    async (id: string, patch: Partial<MeridianDrugTest>) => {
      const { error } = await supabase
        .from("meridian_drug_tests" as any)
        .update(patch)
        .eq("id", id);
      if (error) throw error;
      await reload();
    },
    [reload],
  );

  const remove = useCallback(
    async (id: string) => {
      const { error } = await supabase
        .from("meridian_drug_tests" as any)
        .delete()
        .eq("id", id);
      if (error) throw error;
      await reload();
    },
    [reload],
  );

  return { tests, loading, reload, create, update, remove };
}
