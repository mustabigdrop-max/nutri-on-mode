import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface FeminineProfile {
  id: string;
  user_id: string;
  fase_ciclo: string;
  duracao_ciclo: number;
  anticoncepcional: string;
  menopausa: string;
  tpm_severa: boolean;
  triada_suspeita: boolean;
  ultima_menstruacao: string | null;
}

export function useFeminineProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<FeminineProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("feminine_profiles" as any)
      .select("*")
      .eq("user_id", user.id)
      .single();
    setProfile(data as any);
    setLoading(false);
  };

  const saveProfile = async (updates: Partial<FeminineProfile>) => {
    if (!user) return;
    const payload = { ...updates, user_id: user.id, updated_at: new Date().toISOString() };
    const { data, error } = await supabase
      .from("feminine_profiles" as any)
      .upsert(payload as any, { onConflict: "user_id" })
      .select()
      .single();
    if (!error && data) setProfile(data as any);
    return { data, error };
  };

  return { profile, loading, saveProfile, reload: loadProfile };
}
