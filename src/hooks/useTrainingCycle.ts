import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { parseProtocolToDays } from "@/lib/parseProtocolMarkdown";
import {
  type AdjustKind,
  type CyclePattern,
  patternSequence,
  todaySaoPaulo,
  upcomingDays,
} from "@/lib/trainingCycle";

export type CycleConfig = {
  pattern: CyclePattern;
  custom_sequence: string[] | null;
  start_date: string;
};
export type CycleAdjustment = {
  id: string;
  adjust_date: string;
  kind: AdjustKind;
  note: string | null;
  created_by: string;
  created_at: string;
};

/** Carrega padrão, ajustes e dias do plano mais recente do aluno. */
export function useTrainingCycle(athleteUserId?: string | null) {
  const [config, setConfig] = useState<CycleConfig | null>(null);
  const [adjustments, setAdjustments] = useState<CycleAdjustment[]>([]);
  const [days, setDays] = useState<{ day_number: number; session_title: string }[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!athleteUserId) { setLoading(false); return; }
    setLoading(true);
    const [{ data: cfg }, { data: adj }, { data: prot }] = await Promise.all([
      supabase.from("training_cycle_configs").select("pattern, custom_sequence, start_date").eq("athlete_user_id", athleteUserId).maybeSingle(),
      supabase.from("training_cycle_adjustments").select("*").eq("athlete_user_id", athleteUserId).order("adjust_date", { ascending: false }),
      supabase.from("training_protocols").select("protocol_text").or(`patient_user_id.eq.${athleteUserId},user_id.eq.${athleteUserId}`).order("created_at", { ascending: false }).limit(1).maybeSingle(),
    ]);
    setConfig((cfg as CycleConfig) || null);
    setAdjustments((adj as CycleAdjustment[]) || []);
    const parsed = prot?.protocol_text ? parseProtocolToDays(prot.protocol_text as unknown) : null;
    setDays((parsed?.days || []).map((d) => ({ day_number: d.day_number, session_title: d.session_title })));
    setLoading(false);
  }, [athleteUserId]);

  useEffect(() => { load(); }, [load]);

  const saveConfig = async (c: CycleConfig | null) => {
    if (!athleteUserId) return;
    const { data: auth } = await supabase.auth.getUser();
    if (!c || c.pattern === "semana") {
      await supabase.from("training_cycle_configs").delete().eq("athlete_user_id", athleteUserId);
    } else {
      await supabase.from("training_cycle_configs").upsert(
        { athlete_user_id: athleteUserId, ...c, updated_by: auth?.user?.id },
        { onConflict: "athlete_user_id" },
      );
    }
    await load();
  };

  const addAdjustment = async (date: string, kind: AdjustKind, note?: string) => {
    if (!athleteUserId) return;
    await supabase.from("training_cycle_adjustments").upsert(
      { athlete_user_id: athleteUserId, adjust_date: date, kind, note: note || null },
      { onConflict: "athlete_user_id,adjust_date" },
    );
    await load();
  };
  const removeAdjustment = async (id: string) => {
    await supabase.from("training_cycle_adjustments").delete().eq("id", id);
    await load();
  };

  const sequence = useMemo(() => (config ? patternSequence(config.pattern, config.custom_sequence) : null), [config]);
  const adjMap = useMemo(
    () => Object.fromEntries(adjustments.map((a) => [a.adjust_date, a.kind])) as Record<string, AdjustKind>,
    [adjustments],
  );
  const next7 = useMemo(() => {
    if (!sequence || !config) return null;
    return upcomingDays({ sequence, startDate: config.start_date, from: todaySaoPaulo(), n: 7, workoutCount: days.length || 1, adjustments: adjMap });
  }, [sequence, config, days.length, adjMap]);

  const dayLabel = (idx?: number) => {
    if (idx == null) return "";
    const d = days[idx];
    return d ? `D${d.day_number} ${d.session_title}` : `D${idx + 1}`;
  };

  return { loading, config, adjustments, days, next7, dayLabel, saveConfig, addAdjustment, removeAdjustment, reload: load };
}
