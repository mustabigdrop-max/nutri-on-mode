import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface Glp1Profile {
  id: string;
  user_id: string;
  medication: string;
  current_dose: string | null;
  duration_months: number;
  objective: string;
  profile_class: string;
  exit_week: number;
}

export interface Glp1DailyLog {
  id: string;
  log_date: string;
  protein_g: number;
  total_kcal: number;
  hydration_ml: number;
  nausea_level: number;
  energy_level: number;
  notes: string | null;
}

export interface Glp1WeeklyScore {
  id: string;
  week_start: string;
  week_end: string;
  avg_protein_g: number;
  avg_kcal: number;
  avg_hydration_ml: number;
  protocol_score: number;
  weight_kg: number | null;
  lean_mass_pct: number | null;
}

export const useGlp1 = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Glp1Profile | null>(null);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [dailyLogs, setDailyLogs] = useState<Glp1DailyLog[]>([]);
  const [weeklyScores, setWeeklyScores] = useState<Glp1WeeklyScore[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    if (!user) { setLoading(false); return; }

    const [profRes, subRes, logsRes, scoresRes] = await Promise.all([
      supabase.from("glp1_profiles").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("glp1_subscriptions").select("status").eq("user_id", user.id).eq("status", "active").maybeSingle(),
      supabase.from("glp1_daily_logs").select("*").eq("user_id", user.id).order("log_date", { ascending: false }).limit(30),
      supabase.from("glp1_weekly_scores").select("*").eq("user_id", user.id).order("week_start", { ascending: false }).limit(12),
    ]);

    if (profRes.data) setProfile(profRes.data as unknown as Glp1Profile);
    setHasSubscription(!!subRes.data);
    if (logsRes.data) setDailyLogs(logsRes.data as unknown as Glp1DailyLog[]);
    if (scoresRes.data) setWeeklyScores(scoresRes.data as unknown as Glp1WeeklyScore[]);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, [user]);

  const saveProfile = async (data: Partial<Glp1Profile>) => {
    if (!user) return;
    const profileClass = classifyProfile(data.medication || "ozempic", data.duration_months || 0, data.objective || "emagrecer");
    
    const payload = { ...data, user_id: user.id, profile_class: profileClass };
    
    const { error } = await supabase.from("glp1_profiles").upsert(payload as any, { onConflict: "user_id" });
    if (error) { toast.error("Erro ao salvar perfil GLP-1"); return; }
    toast.success("Perfil GLP-1 salvo!");
    fetchAll();
  };

  const saveDailyLog = async (data: Partial<Glp1DailyLog>) => {
    if (!user) return;
    const payload = { ...data, user_id: user.id };
    const { error } = await supabase.from("glp1_daily_logs").upsert(payload as any, { onConflict: "user_id,log_date" });
    if (error) { toast.error("Erro ao salvar registro"); return; }
    toast.success("Registro diário salvo!");
    fetchAll();
  };

  const activateSubscription = async (triggerSource: string = "manual") => {
    if (!user) return;
    const { error } = await supabase.from("glp1_subscriptions").upsert({
      user_id: user.id,
      status: "active",
      trigger_source: triggerSource,
    } as any, { onConflict: "user_id" });
    if (error) { toast.error("Erro ao ativar assinatura"); return; }
    setHasSubscription(true);
    toast.success("Protocolo GLP-1 Pro ativado!");
  };

  return { profile, hasSubscription, dailyLogs, weeklyScores, loading, saveProfile, saveDailyLog, activateSubscription, refetch: fetchAll };
};

function classifyProfile(medication: string, durationMonths: number, objective: string): string {
  if (objective === "parar") return "saida";
  if (durationMonths <= 2) return "iniciante";
  return "supressao";
}
