import { useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCoachProfile } from "./useCoachProfile";

const ADMIN_UID = "70e51469-1acf-4df6-afe6-f094d21db122";
const COACH_FREE_LIMIT = 3;
const COACH_PRO_LIMIT = 9999;

export type CoachTier = "coach_free" | "coach_pro";

export const useCoachTier = () => {
  const { user } = useAuth();
  const { profile, loading } = useCoachProfile();

  return useMemo(() => {
    const isAdmin = user?.id === ADMIN_UID;
    const planRaw = (profile?.plan || "coach_free").toLowerCase();
    const tier: CoachTier =
      isAdmin || planRaw === "coach_pro" || planRaw === "pro" || planRaw === "elite"
        ? "coach_pro"
        : "coach_free";

    const maxClients = isAdmin
      ? COACH_PRO_LIMIT
      : tier === "coach_pro"
      ? COACH_PRO_LIMIT
      : COACH_FREE_LIMIT;

    const currentClients = profile?.alunos_ativos ?? 0;
    const canAddMore = isAdmin || currentClients < maxClients;
    const remaining = Math.max(0, maxClients - currentClients);

    return {
      loading,
      tier,
      isCoachPro: tier === "coach_pro",
      isCoachFree: tier === "coach_free",
      isAdmin,
      currentClients,
      maxClients,
      remaining,
      canAddMore,
    };
  }, [user, profile, loading]);
};
