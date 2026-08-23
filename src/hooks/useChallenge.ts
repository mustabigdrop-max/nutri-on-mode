import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { accessStatus, localDateISO, type AccessStatus } from "@/lib/challenge";
import { dayPoints } from "@/lib/challengeReminders";

const LOG_COLS = "id,log_date,meals_done,water_ml,mood,training_done,points,day_completed,checkin_at";


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
  joined_at: string | null;
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
  day_completed: boolean;
  checkin_at: string | null;
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
          .select(LOG_COLS)
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
      if (!user || !participant) return null;
      const merged = {
        meals_done: patch.meals_done ?? log?.meals_done ?? [],
        water_ml: patch.water_ml ?? log?.water_ml ?? 0,
        mood: patch.mood ?? log?.mood ?? null,
        training_done: patch.training_done ?? log?.training_done ?? false,
        day_completed: patch.day_completed ?? log?.day_completed ?? false,
      };
      const next = {
        user_id: user.id,
        challenge_id: participant.challenge_id,
        log_date: localDateISO(),
        ...merged,
        points:
          patch.points ??
          dayPoints(merged, participant.meals_per_day, {
            basic: accessStatus(participant.joined_at, participant.tier).basic,
          }),
        checkin_at: patch.checkin_at ?? log?.checkin_at ?? new Date().toISOString(),
      };
      const { data } = await supabase
        .from("challenge_daily_logs")
        .upsert(next, { onConflict: "user_id,log_date" })
        .select(LOG_COLS)
        .maybeSingle();
      if (data) setLog(data as unknown as ChallengeDailyLog);
      await supabase
        .from("challenge_participants")
        .update({ last_checkin_at: new Date().toISOString() })
        .eq("id", participant.id);
      return (data as unknown as ChallengeDailyLog) ?? null;
    },
    [user, participant, log],
  );

  /**
   * Conclui o dia: grava humor/treino, calcula pontos, atualiza streak e MCE Score
   * (média dos pontos dos últimos 7 dias) em tempo real.
   */
  const completeDay = useCallback(async () => {
    if (!user || !participant) return null;
    const saved = await saveLog({ day_completed: true, checkin_at: new Date().toISOString() });
    const points = saved?.points ?? 0;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yISO = new Date(yesterday.getTime() - yesterday.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 10);

    const [{ data: prev }, { data: recent }] = await Promise.all([
      supabase
        .from("challenge_daily_logs")
        .select("day_completed")
        .eq("user_id", user.id)
        .eq("log_date", yISO)
        .maybeSingle(),
      supabase
        .from("challenge_daily_logs")
        .select("points")
        .eq("user_id", user.id)
        .order("log_date", { ascending: false })
        .limit(7),
    ]);

    const alreadyCountedToday = !!log?.day_completed;
    const streak = alreadyCountedToday
      ? participant.streak
      : prev?.day_completed
        ? (participant.streak || 0) + 1
        : 1;

    const pts = (recent ?? []).map((r) => r.points ?? 0);
    const mce = pts.length ? Math.round(pts.reduce((s, v) => s + v, 0) / pts.length) : points;

    const { data: updated } = await supabase
      .from("challenge_participants")
      .update({ streak, mce_score: mce, last_checkin_at: new Date().toISOString() })
      .eq("id", participant.id)
      .select("*")
      .maybeSingle();
    if (updated) setParticipant(updated as unknown as ChallengeParticipant);

    return { points, streak, mce_score: mce };
  }, [user, participant, log, saveLog]);

  const access: AccessStatus = accessStatus(participant?.joined_at, participant?.tier);

  return {
    participant,
    challenge,
    access,
    log,
    loading: loading || authLoading,
    reload: load,
    saveLog,
    completeDay,
  };

}
