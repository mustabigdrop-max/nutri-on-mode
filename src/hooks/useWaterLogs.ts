import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";

export interface WaterLog {
  id: string;
  user_id: string;
  log_date: string;
  ml_total: number;
  created_at: string;
}

export const useWaterLogs = () => {
  const { user } = useAuth();
  const [todayLog, setTodayLog] = useState<WaterLog | null>(null);
  const [loading, setLoading] = useState(true);
  const today = format(new Date(), "yyyy-MM-dd");

  const fetchToday = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("water_logs")
      .select("*")
      .eq("user_id", user.id)
      .eq("log_date", today)
      .maybeSingle();
    setTodayLog(data as WaterLog | null);
    setLoading(false);
  }, [user, today]);

  useEffect(() => {
    fetchToday();
  }, [fetchToday]);

  const addWater = useCallback(async (ml: number) => {
    if (!user) return;
    const newTotal = (todayLog?.ml_total ?? 0) + ml;
    const { data, error } = await supabase
      .from("water_logs")
      .upsert(
        { user_id: user.id, log_date: today, ml_total: newTotal },
        { onConflict: "user_id,log_date" }
      )
      .select()
      .single();
    if (!error && data) setTodayLog(data as WaterLog);
    return { data, error };
  }, [user, today, todayLog]);

  const setWater = useCallback(async (ml: number) => {
    if (!user) return;
    const { data, error } = await supabase
      .from("water_logs")
      .upsert(
        { user_id: user.id, log_date: today, ml_total: ml },
        { onConflict: "user_id,log_date" }
      )
      .select()
      .single();
    if (!error && data) setTodayLog(data as WaterLog);
    return { data, error };
  }, [user, today]);

  return { todayLog, loading, addWater, setWater, refetch: fetchToday };
};
