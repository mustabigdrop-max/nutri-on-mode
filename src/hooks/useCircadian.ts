import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface CircadianProfile {
  id: string;
  user_id: string;
  wake_time: string;
  sleep_time: string;
  chronotype: "matutino" | "intermediario" | "vespertino";
  peak_energy: "morning" | "midday" | "afternoon" | "night";
  meal_frequency: number;
  created_at: string;
  updated_at: string;
}

export interface CircadianMeal {
  time: string;
  label: string;
  context_tag: string;
  carbs_g: number;
  protein_g: number;
  fat_g: number;
  foods: string[];
  tip?: string;
}

export interface CircadianPlan {
  id: string;
  user_id: string;
  generated_date: string;
  meals: CircadianMeal[];
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  chronotype_applied: string;
  workout_integrated: boolean;
  ai_message: string | null;
}

export const CHRONOTYPES = [
  { key: "matutino", label: "Matutino", emoji: "🌅", desc: "Acorda cedo, energia pela manhã", shift: 0 },
  { key: "intermediario", label: "Intermediário", emoji: "☀️", desc: "Equilíbrio entre manhã e noite", shift: 1 },
  { key: "vespertino", label: "Vespertino", emoji: "🌙", desc: "Noturno, energia à noite", shift: 2.5 },
] as const;

export const PEAK_OPTIONS = [
  { key: "morning", label: "Manhã", emoji: "🌅" },
  { key: "midday", label: "Meio-dia", emoji: "☀️" },
  { key: "afternoon", label: "Tarde", emoji: "🌇" },
  { key: "night", label: "Noite", emoji: "🌙" },
] as const;

export const useCircadian = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<CircadianProfile | null>(null);
  const [plan, setPlan] = useState<CircadianPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const fetchProfile = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("circadian_profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();
    if (data) setProfile(data as unknown as CircadianProfile);
  }, [user]);

  const fetchPlan = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("circadian_meal_plans")
      .select("*")
      .eq("user_id", user.id)
      .order("generated_date", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (data) {
      setPlan({
        ...data,
        meals: (data.meals as unknown as CircadianMeal[]) || [],
      } as unknown as CircadianPlan);
    }
  }, [user]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([fetchProfile(), fetchPlan()]);
      setLoading(false);
    };
    load();
  }, [fetchProfile, fetchPlan]);

  const saveProfile = useCallback(async (prof: Partial<CircadianProfile>) => {
    if (!user) return;
    const payload = { ...prof, user_id: user.id, updated_at: new Date().toISOString() };
    const { data, error } = await supabase
      .from("circadian_profiles")
      .upsert(payload as any, { onConflict: "user_id" })
      .select()
      .single();
    if (!error && data) setProfile(data as unknown as CircadianProfile);
    return { data, error };
  }, [user]);

  const generatePlan = useCallback(async () => {
    if (!user || !profile) return;
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-circadian-plan", {
        body: { userId: user.id },
      });
      if (error) throw error;
      if (data) {
        await fetchPlan();
      }
    } catch (e) {
      console.error("Generate circadian plan error:", e);
      throw e;
    } finally {
      setGenerating(false);
    }
  }, [user, profile, fetchPlan]);

  return { profile, plan, loading, generating, saveProfile, generatePlan, refetch: fetchPlan };
};
