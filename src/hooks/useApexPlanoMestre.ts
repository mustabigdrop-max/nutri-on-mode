import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface PlanoExercicio {
  nome: string;
  fase_corretiva?: number;
  series?: string;
  reps_ou_tempo?: string;
  cue_principal?: string;
  progressao_semana_seguinte?: string;
}
export interface PlanoSemana {
  semana: number;
  titulo?: string;
  foco?: string;
  sessoes_por_semana?: number;
  duracao_sessao_minutos?: number;
  exercicios_prioritarios?: PlanoExercicio[];
  o_que_evitar_essa_semana?: string[];
  marcador_de_progresso?: string;
  sinal_verde_para_avancar?: string;
}
export interface PlanoFase {
  numero: number;
  nome: string;
  semanas?: string;
  duracao_semanas?: number;
  foco_principal?: string;
  descricao?: string;
  objetivo_da_fase?: string;
  criterio_de_avanco?: string;
  semanas_detalhadas?: PlanoSemana[];
  integracao_treino_principal?: {
    quando_iniciar?: string;
    como_integrar?: string;
    exercicios_liberados?: string[];
    exercicios_ainda_contraindicados?: string[];
  };
  metricas_de_sucesso?: Array<{
    metrica: string;
    baseline?: string;
    meta_da_fase?: string;
    como_medir?: string;
  }>;
}
export interface PlanoMestre {
  titulo: string;
  duracao_total_semanas: number;
  objetivo_principal?: string;
  objetivos_secundarios?: string[];
  premissa?: string;
  fases: PlanoFase[];
  cronograma_visual?: Record<string, string>;
  regras_globais?: string[];
  sinais_de_alarme?: Array<{ sinal: string; acao: string; urgencia: "baixa" | "media" | "alta" }>;
  recheck_apex?: { quando?: string; o_que_avaliar?: string[]; expectativa_de_melhora?: string };
}

export interface UseApexPlanoMestrePayload {
  dysfunctions?: any;
  muscleMap?: any;
  fcsScore?: number | null;
  athleteProfile?: any;
  goal?: string;
  analysisRaw?: string;
  kineticChains?: any[];
}

export function useApexPlanoMestre(sessionId?: string | null) {
  const [plano, setPlano] = useState<PlanoMestre | null>(null);
  const [semanaAtual, setSemanaAtual] = useState(1);
  const [faseAtual, setFaseAtual] = useState(1);
  const [metricasAtingidas, setMetricasAtingidas] = useState<string[]>([]);
  const [progresso, setProgresso] = useState<Array<{ semana: number; fase: number; exercicio: string; concluido: boolean }>>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!sessionId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("apex_guided_sessions")
        .select("plano_mestre, plano_semana_atual, plano_fase_atual, metricas_atingidas")
        .eq("id", sessionId)
        .maybeSingle();
      if (error) throw error;
      const pm = (data as any)?.plano_mestre;
      if (pm) setPlano(pm.plano_mestre ? pm.plano_mestre : pm);
      setSemanaAtual((data as any)?.plano_semana_atual || 1);
      setFaseAtual((data as any)?.plano_fase_atual || 1);
      setMetricasAtingidas(((data as any)?.metricas_atingidas as string[]) || []);

      const { data: prog } = await supabase
        .from("apex_plano_progresso")
        .select("semana, fase, exercicio, concluido")
        .eq("session_id", sessionId);
      setProgresso((prog as any) || []);
    } catch (e: any) {
      setError(e?.message || "Erro ao carregar plano");
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => { load(); }, [load]);

  const generate = useCallback(async (payload: UseApexPlanoMestrePayload) => {
    setGenerating(true);
    setError(null);
    try {
      const { data, error } = await supabase.functions.invoke("apex-plano-mestre", { body: payload });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      const pm: PlanoMestre = (data as any)?.plano_mestre || (data as any);
      setPlano(pm);
      if (sessionId) {
        await supabase
          .from("apex_guided_sessions")
          .update({ plano_mestre: { plano_mestre: pm } as any, plano_semana_atual: 1, plano_fase_atual: 1 })
          .eq("id", sessionId);
      }
      return pm;
    } catch (e: any) {
      setError(e?.message || "Erro ao gerar plano");
      throw e;
    } finally {
      setGenerating(false);
    }
  }, [sessionId]);

  const toggleExercicio = useCallback(async (semana: number, fase: number, exercicio: string, concluido: boolean) => {
    if (!sessionId) return;
    const { data: userResp } = await supabase.auth.getUser();
    const coachId = userResp?.user?.id;
    if (!coachId) return;

    // upsert manual
    const { data: existing } = await supabase
      .from("apex_plano_progresso")
      .select("id")
      .eq("session_id", sessionId).eq("semana", semana).eq("fase", fase).eq("exercicio", exercicio).maybeSingle();

    if (existing?.id) {
      await supabase.from("apex_plano_progresso").update({ concluido, registrado_em: new Date().toISOString() }).eq("id", existing.id);
    } else {
      await supabase.from("apex_plano_progresso").insert({
        session_id: sessionId, coach_id: coachId, semana, fase, exercicio, concluido,
      });
    }

    setProgresso((prev) => {
      const idx = prev.findIndex(p => p.semana === semana && p.fase === fase && p.exercicio === exercicio);
      if (idx >= 0) { const next = [...prev]; next[idx] = { ...next[idx], concluido }; return next; }
      return [...prev, { semana, fase, exercicio, concluido }];
    });
  }, [sessionId]);

  const avancarSemana = useCallback(async () => {
    if (!sessionId) return;
    const nova = semanaAtual + 1;
    setSemanaAtual(nova);
    await supabase.from("apex_guided_sessions").update({ plano_semana_atual: nova }).eq("id", sessionId);
  }, [sessionId, semanaAtual]);

  const avancarFase = useCallback(async () => {
    if (!sessionId) return;
    const nova = faseAtual + 1;
    setFaseAtual(nova);
    await supabase.from("apex_guided_sessions").update({ plano_fase_atual: nova }).eq("id", sessionId);
  }, [sessionId, faseAtual]);

  const marcarMetrica = useCallback(async (key: string, atingida: boolean) => {
    setMetricasAtingidas(prev => {
      const next = atingida ? Array.from(new Set([...prev, key])) : prev.filter(k => k !== key);
      if (sessionId) {
        supabase.from("apex_guided_sessions").update({ metricas_atingidas: next }).eq("id", sessionId);
      }
      return next;
    });
  }, [sessionId]);

  return {
    plano, semanaAtual, faseAtual, metricasAtingidas, progresso,
    loading, generating, error,
    load, generate, toggleExercicio, avancarSemana, avancarFase, marcarMetrica,
    setPlano,
  };
}
