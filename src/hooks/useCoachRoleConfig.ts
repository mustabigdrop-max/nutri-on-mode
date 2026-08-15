import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  PROFESSIONAL_ROLES,
  resolveProfessionalRole,
  type ProfessionalRoleConfig,
} from "@/lib/professionalProfile";

/**
 * Categoria profissional do coach responsável pelo atleta.
 * Define o formato padrão de exibição e a nomenclatura do plano.
 */
export function useCoachRoleConfig(athleteId?: string) {
  const { user } = useAuth();
  const userId = athleteId || user?.id || null;
  const [config, setConfig] = useState<ProfessionalRoleConfig>(PROFESSIONAL_ROLES.nutrition_coach);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    if (!userId) {
      setLoading(false);
      return;
    }
    (async () => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("coach_profile_id")
        .eq("user_id", userId)
        .maybeSingle();

      if (!profile?.coach_profile_id) {
        if (active) setLoading(false);
        return;
      }

      const { data: coach } = await supabase
        .from("coach_profiles")
        .select("professional_role, professional_type")
        .eq("id", profile.coach_profile_id)
        .maybeSingle();

      if (active) {
        const c = coach as { professional_role?: string | null; professional_type?: string | null } | null;
        setConfig(resolveProfessionalRole(c?.professional_role, c?.professional_type));
        setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [userId]);

  return { config, loading };
}
