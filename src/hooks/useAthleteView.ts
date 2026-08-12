import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface AthleteViewState {
  loading: boolean;
  /** true quando o usuário é um cliente/atleta vinculado a um coach (visão restrita) */
  isRestrictedAthlete: boolean;
  coachProfileId: string | null;
  coachName: string | null;
  coachAvatar: string | null;
  fullName: string | null;
}

const initial: AthleteViewState = {
  loading: true,
  isRestrictedAthlete: false,
  coachProfileId: null,
  coachName: null,
  coachAvatar: null,
  fullName: null,
};

/**
 * Detecta se o usuário deve ver o DASHBOARD DO ATLETA (restrito):
 * vinculado a um coach (profiles.coach_profile_id / role aluno_coach / coach_patients ativo)
 * e não sendo ele próprio coach/admin/profissional.
 */
export function useAthleteView(): AthleteViewState {
  const { user, loading: authLoading } = useAuth();
  const [state, setState] = useState<AthleteViewState>(initial);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setState({ ...initial, loading: false });
      return;
    }

    let cancelled = false;

    (async () => {
      const { data: prof } = await supabase
        .from("profiles")
        .select("role, professional_type, coach_profile_id, full_name")
        .eq("user_id", user.id)
        .maybeSingle();

      const role = (prof?.role as string) || "user";
      const isProfessional =
        role === "coach" || role === "admin" || !!(prof as any)?.professional_type;

      let coachProfileId: string | null = (prof as any)?.coach_profile_id ?? null;

      if (!isProfessional && !coachProfileId) {
        const { data: link } = await supabase
          .from("coach_patients")
          .select("coach_id")
          .eq("patient_user_id", user.id)
          .eq("status", "active")
          .maybeSingle();
        coachProfileId = link?.coach_id ?? null;
      }

      const restricted =
        !isProfessional && (!!coachProfileId || role === "aluno_coach");

      let coachName: string | null = null;
      let coachAvatar: string | null = null;
      if (restricted && coachProfileId) {
        const { data: coach } = await supabase
          .from("coach_profiles")
          .select("professional_name, avatar_url")
          .eq("id", coachProfileId)
          .maybeSingle();
        coachName = coach?.professional_name || "Coach";
        coachAvatar = coach?.avatar_url ?? null;
      }

      if (cancelled) return;
      setState({
        loading: false,
        isRestrictedAthlete: restricted,
        coachProfileId,
        coachName,
        coachAvatar,
        fullName: prof?.full_name ?? null,
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  return state;
}
