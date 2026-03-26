import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { format, subDays } from "date-fns";
import { getLocalDateStr } from "@/lib/utils";

export interface ActivityLog {
  id: string;
  user_id: string;
  log_date: string;
  steps: number;
  calories_burned: number;
  sleep_hours: number;
  heart_rate_avg: number | null;
  heart_rate_max: number | null;
  notes: string | null;
  created_at: string;
}

export const useActivityLogs = () => {
  const { user } = useAuth();
  const { profile, updateProfile } = useProfile();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [todayLog, setTodayLog] = useState<ActivityLog | null>(null);
  const [loading, setLoading] = useState(true);

  const today = getLocalDateStr();

  const fetchLogs = async () => {
    if (!user) return;
    setLoading(true);
    const since = format(subDays(new Date(), 30), "yyyy-MM-dd");
    const { data } = await supabase
      .from("activity_logs")
      .select("*")
      .eq("user_id", user.id)
      .gte("log_date", since)
      .order("log_date", { ascending: false });

    const typed = (data ?? []) as ActivityLog[];
    setLogs(typed);
    setTodayLog(typed.find((l) => l.log_date === today) ?? null);
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, [user]);

  const upsertLog = async (values: Partial<ActivityLog>) => {
    if (!user) return;
    const logDate = values.log_date ?? today;

    const { data, error } = await supabase
      .from("activity_logs")
      .upsert(
        { ...values, user_id: user.id, log_date: logDate },
        { onConflict: "user_id,log_date" }
      )
      .select()
      .single();

    if (!error && data) {
      await fetchLogs();
      // Auto-adjust daily kcal target based on activity
      await adjustCalorieTarget(data as ActivityLog);
    }
    return { data, error };
  };

  // NOTE: Removed permanent vet_kcal modification.
  // The NutriSync system already adjusts daily targets based on workout type.
  // Permanently changing vet_kcal from activity logs caused stale/incorrect daily targets.
  const adjustCalorieTarget = async (_log: ActivityLog) => {
    // No-op: daily adjustments are handled by NutriSync workout multipliers
  };

  const weekAvg = (field: keyof Pick<ActivityLog, "steps" | "calories_burned" | "sleep_hours">) => {
    const last7 = logs.filter(
      (l) => new Date(l.log_date) >= subDays(new Date(), 7)
    );
    if (last7.length === 0) return 0;
    return Math.round(
      last7.reduce((sum, l) => sum + (Number(l[field]) || 0), 0) / last7.length
    );
  };

  return { logs, todayLog, loading, upsertLog, fetchLogs, weekAvg };
};
