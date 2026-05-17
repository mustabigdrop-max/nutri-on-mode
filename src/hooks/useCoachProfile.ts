import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface CoachProfile {
  id: string;
  user_id: string;
  professional_name: string | null;
  crn: string | null;
  specialties: string[];
  bio: string | null;
  avatar_url: string | null;
  plan: string;
  tier: string;
  max_patients: number;
  alunos_ativos: number;
  max_alunos: number;
  white_label_app_name: string | null;
  white_label_primary_color: string | null;
  white_label_secondary_color: string | null;
  white_label_logo_url: string | null;
  white_label_domain: string | null;
  alert_frequency: string;
  alert_channels: any;
  trial_ends_at: string | null;
  created_at: string;
  clinic_name: string | null;
  city: string | null;
  country: string | null;
  logo_url: string | null;
  show_on_plan: boolean | null;
  professional_type?: string | null;
  unique_code?: string | null;
}

export const useCoachProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<CoachProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setProfile(null); setLoading(false); return; }

    const fetch = async () => {
      const { data } = await supabase
        .from("coach_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      setProfile(data as CoachProfile | null);
      setLoading(false);
    };
    fetch();
  }, [user]);

  return { profile, loading };
};
