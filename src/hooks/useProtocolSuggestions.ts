import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { analyzeAthlete, type AdjustmentOption, type RuleCategory, type Severity } from "@/lib/protocolAdjustment";
import { applyAdjustment } from "@/lib/protocolAdjustmentApply";

export interface ProtocolSuggestion {
  id: string;
  athlete_id: string;
  athleteName: string;
  coach_id: string | null;
  rule_id: string;
  severity: Severity;
  category: RuleCategory | null;
  title: string;
  analysis: string | null;
  options: AdjustmentOption[];
  reasoning: string | null;
  status: string;
  created_at: string;
}

const SEVERITY_ORDER: Record<Severity, number> = { urgent: 0, attention: 1, info: 2 };

/**
 * Sugestões pendentes de auto-ajuste dos atletas do profissional.
 * Roda o motor de análise (1x/dia por atleta) e devolve as ações do coach.
 */
export const useProtocolSuggestions = (athleteIds: string[], athleteNames: Record<string, string>) => {
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState<ProtocolSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const analyzedRef = useRef(false);

  const idsKey = athleteIds.slice().sort().join(",");

  const fetchSuggestions = useCallback(async () => {
    if (!idsKey) {
      setSuggestions([]);
      setLoading(false);
      return;
    }
    const ids = idsKey.split(",");
    const { data } = await supabase
      .from("protocol_suggestions")
      .select("*")
      .in("athlete_id", ids)
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    const rows = ((data as any[]) ?? []).map((r) => ({
      ...r,
      options: Array.isArray(r.options) ? (r.options as AdjustmentOption[]) : [],
      athleteName: athleteNames[r.athlete_id] ?? "Atleta",
    })) as ProtocolSuggestion[];

    rows.sort(
      (a, b) =>
        SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity] ||
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    setSuggestions(rows);
    setLoading(false);
  }, [idsKey, athleteNames]);

  // Motor de análise — roda em background ao abrir o painel
  useEffect(() => {
    if (!idsKey || !user || analyzedRef.current) return;
    analyzedRef.current = true;
    const ids = idsKey.split(",");
    (async () => {
      for (const id of ids) {
        try {
          await analyzeAthlete(id, user.id);
        } catch (e) {
          console.error("[AUTO-AJUSTE] falha ao analisar atleta", id, e);
        }
      }
      await fetchSuggestions();
    })();
  }, [idsKey, user, fetchSuggestions]);

  useEffect(() => {
    fetchSuggestions();
  }, [fetchSuggestions]);

  const approve = async (s: ProtocolSuggestion, optionIndex: number, customAction?: string) => {
    setBusyId(s.id);
    try {
      const option = s.options[optionIndex];
      if (option) {
        await applyAdjustment({
          athleteId: s.athlete_id,
          coachId: user?.id ?? null,
          option,
          suggestionTitle: s.title,
          customAction,
        });
      }
      await supabase
        .from("protocol_suggestions")
        .update({
          status: customAction ? "custom" : "approved",
          approved_option: optionIndex,
          custom_action: customAction ?? null,
          approved_at: new Date().toISOString(),
          coach_id: user?.id ?? s.coach_id,
        })
        .eq("id", s.id);
      setSuggestions((prev) => prev.filter((x) => x.id !== s.id));
    } finally {
      setBusyId(null);
    }
  };

  const dismiss = async (s: ProtocolSuggestion) => {
    setBusyId(s.id);
    try {
      await supabase
        .from("protocol_suggestions")
        .update({ status: "dismissed", coach_id: user?.id ?? s.coach_id })
        .eq("id", s.id);
      setSuggestions((prev) => prev.filter((x) => x.id !== s.id));
    } finally {
      setBusyId(null);
    }
  };

  const snooze = async (s: ProtocolSuggestion, days = 7) => {
    setBusyId(s.id);
    try {
      await supabase
        .from("protocol_suggestions")
        .update({
          status: "snoozed",
          snoozed_until: new Date(Date.now() + days * 86400000).toISOString(),
          coach_id: user?.id ?? s.coach_id,
        })
        .eq("id", s.id);
      setSuggestions((prev) => prev.filter((x) => x.id !== s.id));
    } finally {
      setBusyId(null);
    }
  };

  return { suggestions, loading, busyId, approve, dismiss, snooze, refetch: fetchSuggestions };
};

/** Roda o motor após um check-in do próprio atleta */
export const runSelfAnalysis = async (athleteId: string) => {
  try {
    await analyzeAthlete(athleteId, null);
  } catch (e) {
    console.error("[AUTO-AJUSTE] falha na análise pós check-in", e);
  }
};
