import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  sex: string | null;
  weight_kg: number | null;
  height_cm: number | null;
  date_of_birth: string | null;
  activity_level: string | null;
  goal: string | null;
  training_frequency: number | null;
  sport: string | null;
  dietary_restrictions: string[] | null;
  health_conditions: string[] | null;
  uses_glp1: boolean | null;
  onboarding_completed: boolean | null;
  geb_kcal: number | null;
  get_kcal: number | null;
  vet_kcal: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  active_protocol: string | null;
  xp: number | null;
  level: number | null;
  streak_days: number | null;
  last_streak_date: string | null;
  objetivo_principal: string | null;
  perfil_comportamental: string | null;
  meta_peso: number | null;
  nivel_treino: string | null;
  orcamento_semanal: number | null;
  prefere_refeicoes: string | null;
  trial_ends_at: string | null;
  first_meal_registered: boolean | null;
  activation_completed: boolean | null;
}

export const useProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    if (!user) { setProfile(null); setLoading(false); return; }
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();
    setProfile(data as Profile | null);
    setLoading(false);
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return;
    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("user_id", user.id);
    if (!error) await fetchProfile();
    return error;
  };

  return { profile, loading, updateProfile, refetch: fetchProfile };
};
