import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type StratumProfile = {
  id?: string;
  nivel?: string;
  modulo_recomendado?: string;
  split_ideal?: string;
  pca_perfil?: string;
  diagnostico_completo?: string;
};

export type ReadinessCheck = {
  id?: string;
  check_date: string;
  sono?: number;
  energia?: number;
  dor?: string;
  estresse?: string;
  score?: number;
  zona?: string;
  recomendacao?: string;
};

export type StratumReport = {
  id?: string;
  semana_inicio: string;
  semana_fim: string;
  aderencia_pct: number;
  volume_total: number;
  rpe_medio: number;
  prontidao_media: number;
  volume_por_grupo: Record<string, number>;
  ratio_empurrar_puxar: string;
  prs: any[];
  alertas: string[];
  analise_pca: string;
  proxima_semana: any;
  fase_proxima: string;
};

function calcReadinessScore(input: { sono?: number; energia?: number; dor?: string; estresse?: string }) {
  const { sono = 5, energia = 5, dor = "nenhuma", estresse = "medio" } = input;
  let score = 0;
  if (sono >= 9) score += 35; else if (sono >= 7) score += 28; else if (sono >= 5) score += 18; else score += 8;
  if (energia >= 8) score += 25; else if (energia >= 6) score += 18; else if (energia >= 4) score += 10; else score += 4;
  if (dor === "nenhuma") score += 20; else if (dor === "leve") score += 14; else if (dor === "moderada") score += 8; else score += 2;
  if (estresse === "baixo") score += 20; else if (estresse === "medio") score += 12; else score += 5;
  return score;
}

function zonaFromScore(s: number): { zona: string; recomendacao: string } {
  if (s >= 85) return { zona: "verde", recomendacao: "Prontidão máxima. Protocolo de alta intensidade ativado." };
  if (s >= 65) return { zona: "amarelo", recomendacao: "Prontidão adequada. Protocolo padrão mantido." };
  if (s >= 45) return { zona: "laranja", recomendacao: "Prontidão reduzida. Volume -20%. RPE máx 8." };
  return { zona: "vermelho", recomendacao: "Sessão de recuperação ativa hoje: mobilidade + core leve + caminhada." };
}

export function useStratum() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<StratumProfile | null>(null);
  const [todayReadiness, setTodayReadiness] = useState<ReadinessCheck | null>(null);
  const [recentReports, setRecentReports] = useState<StratumReport[]>([]);
  const [adaptations, setAdaptations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    const today = new Date().toISOString().slice(0, 10);
    const [{ data: p }, { data: r }, { data: reps }, { data: adps }] = await Promise.all([
      supabase.from("stratum_profiles").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("stratum_readiness").select("*").eq("user_id", user.id).eq("check_date", today).maybeSingle(),
      supabase.from("stratum_reports").select("*").eq("user_id", user.id).order("semana_inicio", { ascending: false }).limit(4),
      supabase.from("stratum_adaptations").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10),
    ]);
    setProfile(p as any);
    setTodayReadiness(r as any);
    setRecentReports((reps as any) || []);
    setAdaptations(adps || []);
    setLoading(false);
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  const submitReadiness = async (input: { sono: number; energia: number; dor: string; dor_local?: string; estresse: string }) => {
    if (!user) return null;
    const score = calcReadinessScore(input);
    const { zona, recomendacao } = zonaFromScore(score);
    const today = new Date().toISOString().slice(0, 10);
    const { data, error } = await supabase
      .from("stratum_readiness")
      .upsert({ user_id: user.id, check_date: today, ...input, score, zona, recomendacao }, { onConflict: "user_id,check_date" })
      .select()
      .maybeSingle();
    if (!error) setTodayReadiness(data as any);
    return data;
  };

  const callIntake = async (messages: any[], finalize = false) => {
    const { data, error } = await supabase.functions.invoke("stratum-analyze", { body: { messages, finalize } });
    if (error) throw error;
    if (finalize && data?.finalized) await refresh();
    return data;
  };

  const runAdapt = async () => {
    const { data, error } = await supabase.functions.invoke("stratum-adapt", { body: {} });
    if (error) throw error;
    await refresh();
    return data;
  };

  const generateWeekly = async () => {
    const { data, error } = await supabase.functions.invoke("stratum-weekly", { body: {} });
    if (error) throw error;
    await refresh();
    return data;
  };

  const syncNutrion = async (session_id: string) => {
    const { data, error } = await supabase.functions.invoke("stratum-sync", { body: { session_id } });
    if (error) throw error;
    return data;
  };

  const suggestNexus = async (context: { volume?: number; tipo?: string; lesao?: string; sono_score?: number }) => {
    const { data, error } = await supabase.functions.invoke("stratum-nexus", { body: { context } });
    if (error) throw error;
    return data;
  };

  const logSession = async (session: {
    modulo?: string; tipo_treino?: string; grupo_principal?: string;
    volume_total?: number; rpe_medio?: number; duracao_minutos?: number;
    fadiga_reportada?: number; observacoes?: string;
    exercicios?: { exercicio: string; sets?: number; reps_target?: string; reps_realizadas?: number[]; carga?: number; rpe?: number; rir?: number; pr?: boolean }[];
  }) => {
    if (!user) return null;
    const { data: sess, error } = await supabase
      .from("stratum_sessions")
      .insert({
        user_id: user.id,
        modulo: session.modulo,
        tipo_treino: session.tipo_treino,
        grupo_principal: session.grupo_principal,
        volume_total: session.volume_total,
        rpe_medio: session.rpe_medio,
        duracao_minutos: session.duracao_minutos,
        fadiga_reportada: session.fadiga_reportada,
        observacoes: session.observacoes,
      })
      .select()
      .maybeSingle();
    if (error || !sess) return null;
    if (session.exercicios?.length) {
      await supabase.from("stratum_exercises").insert(
        session.exercicios.map((e, i) => ({
          session_id: sess.id,
          user_id: user.id,
          exercicio: e.exercicio,
          sets: e.sets,
          reps_target: e.reps_target,
          reps_realizadas: e.reps_realizadas,
          carga: e.carga,
          rpe: e.rpe,
          rir: e.rir,
          pr: e.pr || false,
          ordem: i,
        }))
      );
    }
    // Trigger sync nutriON em background
    supabase.functions.invoke("stratum-sync", { body: { session_id: sess.id } }).catch(() => {});
    await refresh();
    return sess;
  };

  return {
    profile, todayReadiness, recentReports, adaptations, loading,
    refresh, submitReadiness, callIntake, runAdapt, generateWeekly,
    syncNutrion, suggestNexus, logSession,
  };
}
