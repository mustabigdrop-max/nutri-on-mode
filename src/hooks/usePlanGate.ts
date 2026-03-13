import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type PlanTier = "free" | "ON" | "ON +" | "ON PRO";

const PLAN_HIERARCHY: Record<string, number> = {
  free: 0,
  ON: 1,
  on: 1,
  "ON +": 2,
  "on_plus": 2,
  "full": 2,
  "ON PRO": 3,
  "on_pro": 3,
  "max": 3,
};

export const usePlanGate = () => {
  const { user } = useAuth();
  const [plan, setPlan] = useState<PlanTier>("free");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setPlan("free"); setLoading(false); return; }

    const fetchPlan = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("plano_atual")
        .eq("user_id", user.id)
        .single();
      
      const currentPlan = (data?.plano_atual as PlanTier) || "free";
      setPlan(currentPlan);
      setLoading(false);
    };
    fetchPlan();
  }, [user]);

  const hasAccess = (requiredPlan: PlanTier) => {
    return (PLAN_HIERARCHY[plan] ?? 0) >= (PLAN_HIERARCHY[requiredPlan] ?? 0);
  };

  return { plan, loading, hasAccess };
};
