import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type PlanTier = "free" | "ON" | "ON +" | "ON PRO";

const PLAN_HIERARCHY: Record<string, number> = {
  free: 0,
  ON: 1,
  "ON +": 2,
  "ON PRO": 3,
};

export const usePlanGate = () => {
  const { user } = useAuth();
  const [plan, setPlan] = useState<PlanTier>("free");
  const [trialEndsAt, setTrialEndsAt] = useState<string | null>(null);
  const [isTrialActive, setIsTrialActive] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setPlan("free"); setLoading(false); return; }

    const fetchPlan = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("plano_atual, trial_ends_at")
        .eq("user_id", user.id)
        .single();
      
      const currentPlan = (data?.plano_atual as PlanTier) || "free";
      const trialEnd = data?.trial_ends_at || null;
      
      setPlan(currentPlan);
      setTrialEndsAt(trialEnd);
      
      // Trial is active if trial_ends_at is in the future and plan is free
      if (trialEnd && currentPlan === "free") {
        const isActive = new Date(trialEnd) > new Date();
        setIsTrialActive(isActive);
      } else {
        setIsTrialActive(false);
      }
      
      setLoading(false);
    };
    fetchPlan();
  }, [user]);

  const hasAccess = (requiredPlan: PlanTier) => {
    // During trial, grant ON access (basic features)
    if (isTrialActive && requiredPlan === "ON") return true;
    return (PLAN_HIERARCHY[plan] ?? 0) >= (PLAN_HIERARCHY[requiredPlan] ?? 0);
  };

  const trialDaysLeft = trialEndsAt
    ? Math.max(0, Math.ceil((new Date(trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  return { plan, loading, hasAccess, isTrialActive, trialEndsAt, trialDaysLeft };
};
