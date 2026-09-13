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
  bodyContext: ApexBodyContext | null;
}

export interface ApexBodyContext {
  analysisId: string;
  athleteId: string;
  estimatedBodyFat: number | null;
  targetBodyFat: number | null;
  category: string | null;
  priorities: string[];
  assessedAt: string;
  photoViews: number;
  isCurrent: boolean;
}

const EMPTY: ApexTrainingBridgeResult = {
  corretivos: [],
  contraindicados: [],
  musculosAlvo: [],
  achadosAtivos: [],
  bodyContext: null,
};

const MAX_CONTEXT_AGE_DAYS = 90;

function toFiniteNumber(value: unknown): number | null {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function mapBodyContext(analysis: Record<string, unknown>): ApexBodyContext | null {
  const analysisId = typeof analysis.id === "string" ? analysis.id : "";
  const athleteId = typeof analysis.athlete_id === "string" ? analysis.athlete_id : "";
  const assessedAt = typeof analysis.created_at === "string" ? analysis.created_at : "";
  if (!analysisId || !athleteId || !assessedAt) return null;

  const priorities = [analysis.priority_1, analysis.priority_2, analysis.priority_3]
    .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
    .map((value) => value.trim().slice(0, 180));
  const photoViews = [analysis.photo_front_url, analysis.photo_back_url, analysis.photo_side_url]
    .filter((value) => typeof value === "string" && value.length > 0).length;
  const ageMs = Date.now() - new Date(assessedAt).getTime();
  const isCurrent = Number.isFinite(ageMs) && ageMs >= 0 && ageMs <= MAX_CONTEXT_AGE_DAYS * 86_400_000;

  return {
    analysisId,
    athleteId,
    estimatedBodyFat: toFiniteNumber(analysis.bf_estimated),
    targetBodyFat: toFiniteNumber(analysis.bf_target),
    category: typeof analysis.category_label === "string" ? analysis.category_label : null,
    priorities,
    assessedAt,
    photoViews,
    isCurrent,
  };
}

/**
 * Resolve o registro competitivo pelo usuário e retorna somente o contexto
 * corporal APEX persistido. Estimativas antigas ficam visíveis, mas não devem
 * orientar automaticamente uma nova prescrição.
 */
export async function getLatestApexBodyContext(
  patientUserId: string,
): Promise<ApexBodyContext | null> {
  try {
    if (!patientUserId) return null;
    const { data: athlete } = await supabase
      .from("competition_athletes")
      .select("id")
      .eq("patient_user_id", patientUserId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!athlete?.id) return null;

    const { data: analysis } = await supabase
      .from("apex_analyses")
      .select("id, athlete_id, bf_estimated, bf_target, category_label, priority_1, priority_2, priority_3, photo_front_url, photo_back_url, photo_side_url, created_at")
      .eq("athlete_id", athlete.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    return analysis ? mapBodyContext(analysis as Record<string, unknown>) : null;
  } catch (err) {
    console.warn("[apexTrainingBridge] contexto corporal indisponível:", err);
    return null;
  }
}

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
      .select("id, athlete_id, scores, bf_estimated, bf_target, category_label, priority_1, priority_2, priority_3, photo_front_url, photo_back_url, photo_side_url, created_at")
      .eq("athlete_id", athleteId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!analysis) return EMPTY;

    const bodyContext = mapBodyContext(analysis as Record<string, unknown>);
    if (!analysis.scores) return { ...EMPTY, bodyContext };

    const scores = analysis.scores as Record<string, unknown>;
    const achadosAtivos: AchadoAtivo[] = Object.entries(scores)
      .filter(([, grau]) => typeof grau === "number" && (grau as number) > 0)
      .map(([key, grau]) => ({ key, label: key, graus: grau as number }));

    if (!achadosAtivos.length) return { ...EMPTY, achadosAtivos: [], bodyContext };

    const { data: rules } = await supabase
      .from("apex_training_rules" as any)
      .select("*")
      .in(
        "achado_key",
        achadosAtivos.map((a) => a.key)
      )
      .eq("ativo", true);

    if (!rules?.length) return { ...EMPTY, achadosAtivos, bodyContext };

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
      bodyContext,
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
