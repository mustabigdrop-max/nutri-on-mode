import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type PlanTier = "free" | "ON" | "ON +" | "ON PRO";
export type UserRole = "user" | "coach" | "aluno_coach" | "admin";

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
  const [role, setRole] = useState<UserRole>("user");
  const [coachProfileId, setCoachProfileId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setPlan("free"); setRole("user"); setCoachProfileId(null); setLoading(false); return; }

    const fetchPlan = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("plano_atual, role, coach_profile_id")
        .eq("user_id", user.id)
        .single();
      
      const currentPlan = (data?.plano_atual as PlanTier) || "free";
      const currentRole = (data?.role as UserRole) || "user";
      setPlan(currentPlan);
      setRole(currentRole);
      setCoachProfileId(data?.coach_profile_id || null);
      setLoading(false);
    };
    fetchPlan();
  }, [user]);

  const hasAccess = (requiredPlan: PlanTier) => {
    return (PLAN_HIERARCHY[plan] ?? 0) >= (PLAN_HIERARCHY[requiredPlan] ?? 0);
  };

  const isCoachStudent = role === "aluno_coach";
  const isCoach = role === "coach" || role === "admin";

  return { plan, role, loading, hasAccess, isCoachStudent, isCoach, coachProfileId };
};
