import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { localDateISO } from "@/lib/challenge";

export interface ChallengeParticipant {
  id: string;
  challenge_id: string;
  gym_id: string | null;
  user_id: string;
  full_name: string;
  email: string | null;
  whatsapp: string | null;
  objetivo: string;
  porte: string;
  meals_per_day: number;
  target_kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  tier: string;
  mce_score: number;
  streak: number;
  weight_start: number | null;
  weight_current: number | null;
  last_checkin_at: string | null;
  status: string;
  migrated_to_client: boolean;
}

export interface ChallengeInfo {
  id: string;
  name: string;
  slug: string | null;
  start_date: string;
  end_date: string;
  status: string;
  gym_id: string | null;
}

export interface ChallengeDailyLog {
  id: string;
  log_date: string;
  meals_done: number[];
  water_ml: number;
  mood: string | null;
  training_done: boolean;
  points: number;
}

export function useChallenge() {
  const { user, loading: authLoading } = useAuth();
  const [participant, setParticipant] = useState<ChallengeParticipant | null>(null);
  const [challenge, setChallenge] = useState<ChallengeInfo | null>(null);
  const [log, setLog] = useState<ChallengeDailyLog | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) {
      setParticipant(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data: p } = await supabase
      .from("challenge_participants")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("joined_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (p) {
      setParticipant(p as unknown as ChallengeParticipant);
      const [{ data: c }, { data: l }] = await Promise.all([
        supabase
          .from("gym_challenges")
          .select("id,name,slug,start_date,end_date,status,gym_id")
          .eq("id", p.challenge_id)
          .maybeSingle(),
        supabase
          .from("challenge_daily_logs")
          .select("id,log_date,meals_done,water_ml,mood,training_done,points")
          .eq("user_id", user.id)
          .eq("log_date", localDateISO())
          .maybeSingle(),
      ]);
      setChallenge((c as ChallengeInfo) ?? null);
      setLog((l as unknown as ChallengeDailyLog) ?? null);
    } else {
      setParticipant(null);
      setChallenge(null);
      setLog(null);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (!authLoading) load();
  }, [authLoading, load]);

  const saveLog = useCallback(
    async (patch: Partial<Omit<ChallengeDailyLog, "id" | "log_date">>) => {
      if (!user || !participant) return;
      const next = {
        user_id: user.id,
        challenge_id: participant.challenge_id,
        log_date: localDateISO(),
        meals_done: patch.meals_done ?? log?.meals_done ?? [],
        water_ml: patch.water_ml ?? log?.water_ml ?? 0,
        mood: patch.mood ?? log?.mood ?? null,
        training_done: patch.training_done ?? log?.training_done ?? false,
        points: patch.points ?? log?.points ?? 0,
      };
      const { data } = await supabase
        .from("challenge_daily_logs")
        .upsert(next, { onConflict: "user_id,log_date" })
        .select("id,log_date,meals_done,water_ml,mood,training_done,points")
        .maybeSingle();
      if (data) setLog(data as unknown as ChallengeDailyLog);
      await supabase
        .from("challenge_participants")
        .update({ last_checkin_at: new Date().toISOString() })
        .eq("id", participant.id);
    },
    [user, participant, log],
  );

  return { participant, challenge, log, loading: loading || authLoading, reload: load, saveLog };
}
