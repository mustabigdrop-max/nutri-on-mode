// MERIDIAN Bloco 5 — Multi-show optimizer hook.
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface MultiShowChain {
  id: string;
  user_id: string;
  primary_competition_id: string;
  secondary_competition_id: string;
  gap_days: number;
  strategy: "maintain" | "push_harder" | "rebound_refeed" | string;
  mini_refeed_days: number;
  intra_chain_notes: string | null;
  viability_status: "GREEN" | "YELLOW" | "RED" | string;
  warnings: string[];
}

function evaluateChain(gapDays: number, strategy: string): { viability: string; warnings: string[] } {
  const warnings: string[] = [];
  let viability = "GREEN";
  if (gapDays < 7) {
    viability = "RED";
    warnings.push(`Gap de ${gapDays}d insuficiente para qualquer estratégia segura (mínimo 7d).`);
  } else if (gapDays < 14) {
    viability = strategy === "push_harder" ? "RED" : "YELLOW";
    if (strategy === "push_harder") {
      warnings.push("Push harder em gap <14d compromete recuperação muscular e neural.");
    } else {
      warnings.push("Janela curta: priorize manutenção, mini-refeed 1-2 dias pós-show 1.");
    }
  } else if (gapDays > 42) {
    viability = "YELLOW";
    warnings.push(`Gap de ${gapDays}d longo: risco de rebound. Considere reverse parcial entre shows.`);
  }
  return { viability, warnings };
}

export function useMeridianMultiShow(primaryCompetitionId: string | null) {
  const { user } = useAuth();
  const [chains, setChains] = useState<MultiShowChain[]>([]);
  const [loading, setLoading] = useState(false);

  const reload = useCallback(async () => {
    if (!user || !primaryCompetitionId) return;
    setLoading(true);
    const { data } = await supabase
      .from("meridian_multi_show_chains" as any)
      .select("*")
      .eq("primary_competition_id", primaryCompetitionId)
      .order("gap_days", { ascending: true });
    setChains((data as any) ?? []);
    setLoading(false);
  }, [user, primaryCompetitionId]);

  useEffect(() => { reload(); }, [reload]);

  const addChain = useCallback(async (params: {
    secondary_competition_id: string;
    gap_days: number;
    strategy: string;
    mini_refeed_days?: number;
    intra_chain_notes?: string;
  }) => {
    if (!user || !primaryCompetitionId) return;
    const { viability, warnings } = evaluateChain(params.gap_days, params.strategy);
    const payload = {
      user_id: user.id,
      primary_competition_id: primaryCompetitionId,
      secondary_competition_id: params.secondary_competition_id,
      gap_days: params.gap_days,
      strategy: params.strategy,
      mini_refeed_days: params.mini_refeed_days ?? 2,
      intra_chain_notes: params.intra_chain_notes ?? null,
      viability_status: viability,
      warnings,
    };
    const { error } = await supabase
      .from("meridian_multi_show_chains" as any)
      .upsert(payload, { onConflict: "primary_competition_id,secondary_competition_id" } as any);
    if (!error) await reload();
    return { error };
  }, [user, primaryCompetitionId, reload]);

  const removeChain = useCallback(async (id: string) => {
    await supabase.from("meridian_multi_show_chains" as any).delete().eq("id", id);
    await reload();
  }, [reload]);

  return { chains, loading, reload, addChain, removeChain };
}
