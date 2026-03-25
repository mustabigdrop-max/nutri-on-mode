import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface BehavioralProfile {
  id: string;
  perfil_primario: string | null;
  perfil_secundario: string | null;
  estagio_mudanca: string | null;
  mindset_score: number | null;
  declaracao_identidade: string | null;
  votos_identidade: number;
  streak_atual: number;
  streak_maximo: number;
  taxa_aderencia_geral: number;
  risco_abandono: number;
  horarios_criticos: string[] | null;
  dias_criticos: string[] | null;
  situacoes_risco: string[] | null;
  crencas_limitantes: string[] | null;
  gatilhos_mapeados: any;
  loops_negativos: any;
  loops_positivos: any;
}

export interface BehavioralDiaryEntry {
  id: string;
  emocao_primaria: string | null;
  emocao_intensidade: number | null;
  fome_antes: number | null;
  saciedade_depois: number | null;
  fome_real: boolean | null;
  decisao_tomada: string | null;
  o_que_aconteceu: string | null;
  o_que_aprendi: string | null;
  proxima_vez: string | null;
  created_at: string;
}

export interface BehavioralLoop {
  id: string;
  tipo: string | null;
  gatilho: string | null;
  rotina_antiga: string | null;
  rotina_nova: string | null;
  recompensa: string | null;
  ativo: boolean;
  vezes_ativado: number;
  vezes_sucesso: number;
}

export function useBehavioral() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<BehavioralProfile | null>(null);
  const [diary, setDiary] = useState<BehavioralDiaryEntry[]>([]);
  const [loops, setLoops] = useState<BehavioralLoop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) loadAll();
  }, [user]);

  const loadAll = async () => {
    if (!user) return;
    setLoading(true);
    
    const [profileRes, diaryRes, loopsRes] = await Promise.all([
      supabase.from("behavioral_profiles").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("behavioral_diary").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(50),
      supabase.from("behavioral_loops").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    ]);

    if (profileRes.data) setProfile(profileRes.data as any);
    if (diaryRes.data) setDiary(diaryRes.data as any);
    if (loopsRes.data) setLoops(loopsRes.data as any);
    setLoading(false);
  };

  const saveProfile = async (data: Partial<BehavioralProfile>) => {
    if (!user) return;
    const { error } = profile
      ? await supabase.from("behavioral_profiles").update({ ...data, updated_at: new Date().toISOString() }).eq("user_id", user.id)
      : await supabase.from("behavioral_profiles").insert({ user_id: user.id, ...data } as any);
    if (error) {
      toast({ title: "Erro ao salvar perfil", variant: "destructive" });
    } else {
      toast({ title: "Perfil salvo!" });
      loadAll();
    }
  };

  const addDiaryEntry = async (entry: Partial<BehavioralDiaryEntry>) => {
    if (!user) return;
    const { error } = await supabase.from("behavioral_diary").insert({ user_id: user.id, ...entry } as any);
    if (error) {
      toast({ title: "Erro ao salvar diário", variant: "destructive" });
    } else {
      toast({ title: "Registro salvo!" });
      loadAll();
    }
  };

  const addLoop = async (loop: Partial<BehavioralLoop>) => {
    if (!user) return;
    const { error } = await supabase.from("behavioral_loops").insert({ user_id: user.id, ...loop } as any);
    if (error) {
      toast({ title: "Erro ao salvar loop", variant: "destructive" });
    } else {
      toast({ title: "Loop salvo!" });
      loadAll();
    }
  };

  const addEmotionLog = async (data: { emocao: string; intensidade: number; tecnica_usada: string; duracao_segundos: number; eficacia: number; decisao_pos: string }) => {
    if (!user) return;
    const { error } = await supabase.from("emotion_regulation_log").insert({ user_id: user.id, ...data } as any);
    if (error) {
      toast({ title: "Erro ao salvar", variant: "destructive" });
    } else {
      toast({ title: "Regulação registrada!" });
    }
  };

  const incrementVoto = async () => {
    if (!user || !profile) return;
    await supabase.from("behavioral_profiles").update({
      votos_identidade: (profile.votos_identidade || 0) + 1,
      updated_at: new Date().toISOString(),
    }).eq("user_id", user.id);
    loadAll();
  };

  return { profile, diary, loops, loading, saveProfile, addDiaryEntry, addLoop, addEmotionLog, incrementVoto, reload: loadAll };
}
