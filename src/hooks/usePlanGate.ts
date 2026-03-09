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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setPlan("free"); setLoading(false); return; }

    const fetch = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("plano_atual")
        .eq("user_id", user.id)
        .single();
      setPlan((data?.plano_atual as PlanTier) || "free");
      setLoading(false);
    };
    fetch();
  }, [user]);

  const hasAccess = (requiredPlan: PlanTier) => {
    return (PLAN_HIERARCHY[plan] ?? 0) >= (PLAN_HIERARCHY[requiredPlan] ?? 0);
  };

  return { plan, loading, hasAccess };
};
