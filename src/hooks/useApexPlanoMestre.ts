import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { APEX_CORRECTIVE_LIBRARY, type Exercise, type Phase } from "@/data/apexCorrectiveLibrary";

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

export type StageKey = "fase1" | "fase23" | "fase4";
export type StageStatus = "pending" | "in_progress" | "done" | "warning";
export interface StageState { key: StageKey; label: string; status: StageStatus; warning?: string; }

const INITIAL_STAGES: StageState[] = [
  { key: "fase1", label: "Fase 1 — Inibição", status: "pending" },
  { key: "fase23", label: "Fases 2 e 3 — Elongação & Ativação", status: "pending" },
  { key: "fase4", label: "Fase 4 — Integração & finalização", status: "pending" },
];

function buildFallbackPlano(payload: UseApexPlanoMestrePayload): PlanoMestre {
  const mk = (numero: number, nome: string, semanas: string, foco: string): PlanoFase => ({
    numero, nome, semanas, duracao_semanas: 2,
    foco_principal: foco, descricao: foco, objetivo_da_fase: foco,
    criterio_de_avanco: "Conclusão dos exercícios-chave da fase",
    semanas_detalhadas: [{
      semana: numero * 2 - 1, titulo: `${nome} — Semana inicial`, foco,
      sessoes_por_semana: 3, duracao_sessao_minutos: 30,
      exercicios_prioritarios: [
        { nome: "Exercício-chave A", fase_corretiva: numero, series: "2-3", reps_ou_tempo: "30-45s", cue_principal: "Foco em controle", progressao_semana_seguinte: "Adicionar tempo sob tensão" },
        { nome: "Exercício-chave B", fase_corretiva: numero, series: "2-3", reps_ou_tempo: "30-45s", cue_principal: "Respiração diafragmática", progressao_semana_seguinte: "Aumentar amplitude" },
        { nome: "Exercício-chave C", fase_corretiva: numero, series: "2", reps_ou_tempo: "10 reps", cue_principal: "Qualidade > quantidade", progressao_semana_seguinte: "+1 série" },
      ],
      o_que_evitar_essa_semana: [], marcador_de_progresso: "Conclusão das sessões previstas", sinal_verde_para_avancar: "Sem dor e execução limpa",
    }],
  });
  return {
    titulo: "Plano Corretivo — Versão Simplificada",
    duracao_total_semanas: 8,
    objetivo_principal: payload.goal || "Corrigir desequilíbrios posturais",
    objetivos_secundarios: [],
    premissa: "Plano gerado em modo simplificado por tempo de resposta excedido.",
    fases: [
      mk(1, "Inibição", "1-2", "Liberar dominantes"),
      mk(2, "Elongação", "3-4", "Ganhar amplitude"),
      mk(3, "Ativação", "5-6", "Ativar inibidos"),
      mk(4, "Integração", "7-8", "Integrar ao treino"),
    ],
    regras_globais: ["Plano simplificado — regenere para versão completa."],
  };
}

async function invokeStep(payload: any, step: 1 | 2 | 3, prev: any, simplified: boolean, timeoutMs = 25000): Promise<any> {
  const promise = supabase.functions.invoke("apex-plano-mestre", { body: { ...payload, step, prev, simplified } });
  const timeout = new Promise<never>((_, reject) => setTimeout(() => reject(new Error(`Timeout etapa ${step}`)), timeoutMs));
  const res: any = await Promise.race([promise, timeout]);
  if (res?.error) throw new Error(res.error?.message || `Erro etapa ${step}`);
  if (res?.data?.error) throw new Error(res.data.error);
  return res?.data?.data ?? res?.data;
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
  const [stages, setStages] = useState<StageState[]>(INITIAL_STAGES);

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

  const persist = useCallback(async (pm: PlanoMestre) => {
    if (!sessionId) return;
    await supabase
      .from("apex_guided_sessions")
      .update({ plano_mestre: { plano_mestre: pm } as any, plano_semana_atual: 1, plano_fase_atual: 1 })
      .eq("id", sessionId);
  }, [sessionId]);

  const updateStage = (key: StageKey, patch: Partial<StageState>) =>
    setStages(prev => prev.map(s => s.key === key ? { ...s, ...patch } : s));

  const generate = useCallback(async (payload: UseApexPlanoMestrePayload) => {
    setGenerating(true);
    setError(null);
    setStages(INITIAL_STAGES.map(s => ({ ...s })));
    const collected: any = { fases: [] as PlanoFase[] };

    const runStep = async (key: StageKey, step: 1 | 2 | 3): Promise<any> => {
      updateStage(key, { status: "in_progress" });
      try {
        return await invokeStep(payload, step, collected, false);
      } catch {
        try {
          const r = await invokeStep(payload, step, collected, true);
          updateStage(key, { warning: "Gerado em modo resumido" });
          return r;
        } catch {
          updateStage(key, { status: "warning", warning: "Falhou — usando fallback" });
          return null;
        }
      }
    };

    try {
      const s1 = await runStep("fase1", 1);
      if (!s1) throw new Error("fallback");
      collected.titulo = s1.titulo;
      collected.duracao_total_semanas = s1.duracao_total_semanas;
      collected.objetivo_principal = s1.objetivo_principal;
      collected.objetivos_secundarios = s1.objetivos_secundarios;
      collected.premissa = s1.premissa;
      if (s1.fase1) collected.fases.push(s1.fase1);
      setPlano({ ...collected });
      updateStage("fase1", { status: "done" });

      const s2 = await runStep("fase23", 2);
      if (s2) {
        if (s2.fase2) collected.fases.push(s2.fase2);
        if (s2.fase3) collected.fases.push(s2.fase3);
        setPlano({ ...collected });
        updateStage("fase23", { status: "done" });
      }

      const s3 = await runStep("fase4", 3);
      if (s3) {
        if (s3.fase4) collected.fases.push(s3.fase4);
        collected.cronograma_visual = s3.cronograma_visual;
        collected.regras_globais = s3.regras_globais;
        collected.sinais_de_alarme = s3.sinais_de_alarme;
        collected.recheck_apex = s3.recheck_apex;
        updateStage("fase4", { status: "done" });
      }

      collected.fases = (collected.fases as PlanoFase[]).filter(Boolean).sort((a, b) => (a.numero || 0) - (b.numero || 0));
      const finalPlano: PlanoMestre = collected;
      setPlano(finalPlano);
      await persist(finalPlano);
      return finalPlano;
    } catch {
      const fb = buildFallbackPlano(payload);
      setPlano(fb);
      await persist(fb);
      setError("Plano gerado em modo simplificado por tempo de resposta excedido.");
      return fb;
    } finally {
      setGenerating(false);
    }
  }, [persist]);

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
    loading, generating, error, stages,
    load, generate, toggleExercicio, avancarSemana, avancarFase, marcarMetrica,
    setPlano,
  };
}
