// MERIDIAN — Hook para gerenciar handoffs cross-módulo.
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { HandoffModule, ModuleHandoffPayload } from "@/lib/meridian/handoffs";

export interface MeridianHandoffRow {
  id: string;
  user_id: string;
  plan_id: string;
  competition_id: string;
  target_module: HandoffModule;
  phase: string;
  payload: ModuleHandoffPayload;
  status: "pending" | "applied" | "discarded";
  applied_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export function useMeridianHandoffs(planId: string | null) {
  const [rows, setRows] = useState<MeridianHandoffRow[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRows = useCallback(async () => {
    if (!planId) return;
    setLoading(true);
    const { data } = await supabase
      .from("meridian_handoffs" as any)
      .select("*")
      .eq("plan_id", planId)
      .order("created_at", { ascending: false });
    setRows((data as any[]) || []);
    setLoading(false);
  }, [planId]);

  useEffect(() => {
    fetchRows();
  }, [fetchRows]);

  const createHandoff = useCallback(
    async (params: {
      plan_id: string;
      competition_id: string;
      target_module: HandoffModule;
      phase: string;
      payload: ModuleHandoffPayload;
    }) => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return null;
      const { data, error } = await supabase
        .from("meridian_handoffs" as any)
        .insert({
          user_id: auth.user.id,
          plan_id: params.plan_id,
          competition_id: params.competition_id,
          target_module: params.target_module,
          phase: params.phase,
          payload: params.payload as any,
          status: "pending",
        })
        .select()
        .single();
      if (error) {
        console.error("createHandoff error:", error);
        return null;
      }
      await fetchRows();
      return data;
    },
    [fetchRows],
  );

  const updateStatus = useCallback(
    async (id: string, status: "applied" | "discarded", notes?: string) => {
      const patch: any = { status, notes };
      if (status === "applied") patch.applied_at = new Date().toISOString();
      await supabase.from("meridian_handoffs" as any).update(patch).eq("id", id);
      await fetchRows();
    },
    [fetchRows],
  );

  return { rows, loading, createHandoff, updateStatus, refresh: fetchRows };
}
