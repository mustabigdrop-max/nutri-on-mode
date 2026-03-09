import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";

export interface SupplementItem {
  name: string;
  dose: string;
  timing: string;
  timingIcon: "morning" | "afternoon" | "night" | "anytime";
  reason: string;
  evidence: string;
  priority: "essential" | "recommended" | "optional";
  warnings?: string;
  costPerMonth?: number;
}

export interface SupplementStack {
  id: string;
  user_id: string;
  goal: string | null;
  budget_tier: string | null;
  supplements: SupplementItem[];
  current_supplements: string[];
  health_conditions: string[];
  dietary_restrictions: string[];
  ai_summary: string | null;
  ai_generated: boolean;
  active: boolean;
  monthly_cost: number;
  created_at: string;
}

export interface SupplementLog {
  id: string;
  supplement_name: string;
  log_date: string;
  taken_at: string | null;
  skipped: boolean;
}

export const useSupplements = () => {
  const { user } = useAuth();
  const [stack, setStack] = useState<SupplementStack | null>(null);
  const [todayLogs, setTodayLogs] = useState<SupplementLog[]>([]);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  const today = format(new Date(), "yyyy-MM-dd");

  const fetchStack = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("supplement_stacks")
      .select("*")
      .eq("user_id", user.id)
      .eq("active", true)
      .order("created_at", { ascending: false })
      .limit(1);

    if (data && data.length > 0) {
      const raw = data[0] as any;
      setStack({
        ...raw,
        supplements: (raw.supplements || []) as SupplementItem[],
        current_supplements: raw.current_supplements || [],
        health_conditions: raw.health_conditions || [],
        dietary_restrictions: raw.dietary_restrictions || [],
      });
    }
    setLoading(false);
  }, [user]);

  const fetchTodayLogs = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("supplement_logs")
      .select("*")
      .eq("user_id", user.id)
      .eq("log_date", today);
    setTodayLogs((data || []) as SupplementLog[]);
  }, [user, today]);

  const calculateStreak = useCallback(async () => {
    if (!user || !stack) return;
    const { data } = await supabase
      .from("supplement_logs")
      .select("log_date")
      .eq("user_id", user.id)
      .eq("skipped", false)
      .order("log_date", { ascending: false })
      .limit(60);

    if (!data || data.length === 0) { setStreak(0); return; }

    const dates = [...new Set(data.map((d: any) => d.log_date))].sort().reverse();
    let count = 0;
    const d = new Date();
    for (const date of dates) {
      const expected = format(d, "yyyy-MM-dd");
      if (date === expected) { count++; d.setDate(d.getDate() - 1); }
      else break;
    }
    setStreak(count);
  }, [user, stack]);

  useEffect(() => {
    fetchStack();
    fetchTodayLogs();
  }, [fetchStack, fetchTodayLogs]);

  useEffect(() => {
    if (stack) calculateStreak();
  }, [stack, calculateStreak]);

  const logSupplement = async (supplementName: string, skipped = false) => {
    if (!user) return;
    const existing = todayLogs.find(l => l.supplement_name === supplementName);
    if (existing) {
      await supabase.from("supplement_logs").delete().eq("id", existing.id);
    } else {
      await supabase.from("supplement_logs").insert({
        user_id: user.id,
        supplement_name: supplementName,
        log_date: today,
        skipped,
      });
    }
    await fetchTodayLogs();
  };

  const saveStack = async (
    supplements: SupplementItem[],
    goal: string,
    budgetTier: string,
    currentSupplements: string[],
    healthConditions: string[],
    dietaryRestrictions: string[],
    aiSummary: string,
    monthlyCost: number
  ) => {
    if (!user) return;
    // Deactivate old stacks
    await supabase
      .from("supplement_stacks")
      .update({ active: false } as any)
      .eq("user_id", user.id)
      .eq("active", true);

    await supabase.from("supplement_stacks").insert({
      user_id: user.id,
      goal,
      budget_tier: budgetTier,
      supplements: supplements as any,
      current_supplements: currentSupplements,
      health_conditions: healthConditions,
      dietary_restrictions: dietaryRestrictions,
      ai_summary: aiSummary,
      ai_generated: true,
      active: true,
      monthly_cost: monthlyCost,
    });

    await fetchStack();
  };

  return {
    stack,
    todayLogs,
    streak,
    loading,
    logSupplement,
    saveStack,
    refetch: () => { fetchStack(); fetchTodayLogs(); },
  };
};
