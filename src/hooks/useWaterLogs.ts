import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { getLocalDateStr } from "@/lib/utils";

export interface WaterLog {
  id: string;
  user_id: string;
  log_date: string;
  ml_total: number;
  created_at: string;
}

export const useWaterLogs = (overrideUserId?: string) => {
  const { user: authUser } = useAuth();
  const userId = overrideUserId || authUser?.id || null;
  const [todayLog, setTodayLog] = useState<WaterLog | null>(null);
  const [loading, setLoading] = useState(true);
  const today = getLocalDateStr();

  const fetchToday = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const { data } = await supabase
      .from("water_logs")
      .select("*")
      .eq("user_id", userId)
      .eq("log_date", today)
      .maybeSingle();
    setTodayLog(data as WaterLog | null);
    setLoading(false);
  }, [userId, today]);

  useEffect(() => {
    fetchToday();
  }, [fetchToday]);

  const addWater = useCallback(async (ml: number) => {
    if (!userId) return;
    const newTotal = (todayLog?.ml_total ?? 0) + ml;
    const { data, error } = await supabase
      .from("water_logs")
      .upsert(
        { user_id: userId, log_date: today, ml_total: newTotal },
        { onConflict: "user_id,log_date" }
      )
      .select()
      .single();
    if (!error && data) setTodayLog(data as WaterLog);
    return { data, error };
  }, [userId, today, todayLog]);

  const setWater = useCallback(async (ml: number) => {
    if (!userId) return;
    const { data, error } = await supabase
      .from("water_logs")
      .upsert(
        { user_id: userId, log_date: today, ml_total: ml },
        { onConflict: "user_id,log_date" }
      )
      .select()
      .single();
    if (!error && data) setTodayLog(data as WaterLog);
    return { data, error };
  }, [userId, today]);

  return { todayLog, loading, addWater, setWater, refetch: fetchToday };
};
