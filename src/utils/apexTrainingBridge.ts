import { supabase } from "@/integrations/supabase/client";

export interface AchadoAtivo {
  key: string;
  label: string;
  graus: number;
}

export interface ExercicioCorretivo {
  nome: string;
  series: number;
  reps: string;
  tempo: string;
  foco: string;
  origem: string;
}

export interface ExercicioContraindicado {
  padrao: string;
  motivo: string;
  origem: string;
}

export interface ApexTrainingBridgeResult {
  corretivos: ExercicioCorretivo[];
  contraindicados: ExercicioContraindicado[];
  musculosAlvo: string[];
  achadosAtivos: AchadoAtivo[];
}

const EMPTY: ApexTrainingBridgeResult = {
  corretivos: [],
  contraindicados: [],
  musculosAlvo: [],
  achadosAtivos: [],
};

/**
 * Lê a última análise APEX do atleta e cruza com a tabela
 * apex_training_rules para retornar corretivos, contraindicados
 * e músculos alvo. Falha silenciosa: nunca quebra o TrainingON.
 */
export async function getApexTrainingRules(
  athleteId: string
): Promise<ApexTrainingBridgeResult> {
  try {
    if (!athleteId) return EMPTY;

    const { data: analysis } = await supabase
      .from("apex_analyses")
      .select("scores, created_at")
      .eq("athlete_id", athleteId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!analysis?.scores) return EMPTY;

    const scores = analysis.scores as Record<string, unknown>;
    const achadosAtivos: AchadoAtivo[] = Object.entries(scores)
      .filter(([, grau]) => typeof grau === "number" && (grau as number) > 0)
      .map(([key, grau]) => ({ key, label: key, graus: grau as number }));

    if (!achadosAtivos.length) return { ...EMPTY, achadosAtivos: [] };

    const { data: rules } = await supabase
      .from("apex_training_rules" as any)
      .select("*")
      .in(
        "achado_key",
        achadosAtivos.map((a) => a.key)
      )
      .eq("ativo", true);

    if (!rules?.length) return { ...EMPTY, achadosAtivos };

    const corretivos: ExercicioCorretivo[] = [];
    const contraindicados: ExercicioContraindicado[] = [];
    const musculosSet = new Set<string>();

    for (const rule of rules as any[]) {
      const achado = achadosAtivos.find((a) => a.key === rule.achado_key);
      if (!achado) continue;
      if (achado.graus < (rule.severidade_min ?? 0)) continue;

      // hidrata label a partir da regra
      achado.label = rule.achado_label || achado.label;

      (rule.corretivos as ExercicioCorretivo[]).forEach((c) =>
        corretivos.push({ ...c, origem: rule.achado_label })
      );
      (rule.contraindicados as ExercicioContraindicado[]).forEach((c) =>
        contraindicados.push({ ...c, origem: rule.achado_label })
      );
      ((rule.ativacao_alvo as string[]) || []).forEach((m) =>
        musculosSet.add(m)
      );
    }

    const corretivosUnicos = corretivos.filter(
      (c, i, arr) => arr.findIndex((x) => x.nome === c.nome) === i
    );

    return {
      corretivos: corretivosUnicos,
      contraindicados,
      musculosAlvo: Array.from(musculosSet),
      achadosAtivos,
    };
  } catch (err) {
    console.warn("[apexTrainingBridge] erro silencioso:", err);
    return EMPTY;
  }
}

/**
 * Verifica se um exercício bate com algum padrão contraindicado.
 */
export function isContraindicado(
  exerciseName: string,
  contraindicados: ExercicioContraindicado[]
): ExercicioContraindicado | null {
  if (!exerciseName || !contraindicados?.length) return null;
  const nameLower = exerciseName.toLowerCase();
  return (
    contraindicados.find((c) => nameLower.includes(c.padrao.toLowerCase())) ??
    null
  );
}
