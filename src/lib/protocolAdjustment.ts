import { supabase } from "@/integrations/supabase/client";

/* ═══════════════════════════════════════════════════════════
   MOTOR DE AUTO-AJUSTE DE PROTOCOLO — nutriON
   Analisa dados contínuos do atleta e gera sugestões de ajuste
   com raciocínio clínico para o profissional aprovar.
   ═══════════════════════════════════════════════════════════ */

export type Severity = "info" | "attention" | "urgent";
export type RuleCategory =
  | "weight"
  | "performance"
  | "adherence"
  | "recovery"
  | "metabolic"
  | "timeline";
export type Confidence = "alta" | "média" | "baixa";
export type Phase = "cutting" | "bulk" | "maintenance" | "recomp" | "reverse";

export interface AdjustmentChanges {
  calories?: number;
  carbs?: number;
  protein?: number;
  fat?: number;
  source?: "carbs" | "fat";
  addCardio?: { sessions: number; duration: number; type: string };
  removeCardio?: number;
  dietBreak?: number;
  refeed?: number;
  carbMultiplier?: number;
  deload?: boolean;
  trainingFrequency?: number;
  meals?: number;
  addFreeMeal?: boolean;
  macroFlexibility?: number;
  addSupplement?: string;
  lastMealCarbs?: boolean;
  mode?: string;
  weeklyIncrease?: number;
}

export interface AdjustmentOption {
  label: string;
  detail: string;
  changes: AdjustmentChanges;
  confidence: Confidence;
}

export interface AdjustmentSuggestion {
  ruleId: string;
  severity: Severity;
  category: RuleCategory;
  title: string;
  analysis: string;
  options: AdjustmentOption[];
  reasoning: string;
}

export interface TrendWindow {
  change: number;
  ratePerWeek: number;
  dataPoints: number;
}

export interface AthleteAnalysis {
  name: string;
  athleteId: string;

  phase: Phase;
  currentCalories: number;
  currentProtein: number;
  currentCarbs: number;
  currentFat: number;
  currentWeek: number;
  totalWeeks: number;
  weeksInDeficit: number;

  currentWeight: number;
  weightTrend: {
    last7days: TrendWindow;
    last14days: TrendWindow;
    last30days: TrendWindow;
  };

  strengthTrend: {
    percentChange: number;
    worstExercises: string[];
    dataPoints: number;
    weeksTracked: number;
  };

  trainingAdherence: {
    last7days: number;
    completedSessions: number;
    plannedSessions: number;
  };

  adherenceAvg: number;
  checkinsLast14days: number;

  avgEnergy: number;
  avgSleep: number;
  avgHunger: number;
  stressLevel: string;

  lastRefeed?: { date: string; wasThisWeek: boolean };
}

interface AdjustmentRule {
  id: string;
  name: string;
  category: RuleCategory;
  severity: Severity;
  condition: (d: AthleteAnalysis) => boolean;
  suggestion: (d: AthleteAnalysis) => Omit<AdjustmentSuggestion, "ruleId" | "severity" | "category">;
}

const r1 = (n: number) => Math.round(n * 10) / 10;

/* ═══════════════════════════════════════════════════════════
   REGRAS DE DETECÇÃO
   ═══════════════════════════════════════════════════════════ */

export const ADJUSTMENT_RULES: AdjustmentRule[] = [
  /* ───────── PESO ───────── */
  {
    id: "weight_stalled_cutting",
    name: "Peso estagnado em cutting",
    category: "weight",
    severity: "attention",
    condition: (d) =>
      d.phase === "cutting" &&
      d.weightTrend.last14days.change <= 0.2 &&
      d.weightTrend.last14days.change >= -0.2 &&
      d.weightTrend.last14days.dataPoints >= 4,
    suggestion: (d) => ({
      title: "Peso estagnado há 14+ dias em cutting",
      analysis: `${d.name} pesa ${d.currentWeight}kg há 2 semanas sem variação significativa (Δ ${r1(d.weightTrend.last14days.change)}kg). Está na semana ${d.currentWeek}/${d.totalWeeks} do protocolo.`,
      options: [
        {
          label: "Reduzir 150 kcal/dia",
          detail: `Reduzir CHO em ~37g. Meta calórica: ${d.currentCalories - 150} kcal. Manter PTN e LIP.`,
          changes: { calories: -150, carbs: -37, source: "carbs" },
          confidence: "alta",
        },
        {
          label: "Adicionar 2 sessões de cardio LISS",
          detail: "2 × 30min de caminhada/bike em dias de descanso. Gasto extra: ~200 kcal/sessão.",
          changes: { addCardio: { sessions: 2, duration: 30, type: "LISS" } },
          confidence: "alta",
        },
        ...(d.weeksInDeficit >= 6
          ? [
              {
                label: "Diet break de 7 dias",
                detail: "Subir calorias para manutenção por 7 dias. Reset de leptina e cortisol. Retomar déficit após.",
                changes: { dietBreak: 7 },
                confidence: "média" as Confidence,
              },
            ]
          : []),
      ],
      reasoning:
        "Estagnação em cutting por mais de 14 dias indica adaptação metabólica. As opções são: aumentar gasto (cardio), reduzir ingestão (kcal), ou resetar (diet break). Se aderência <85%, investigar compliance antes de ajustar.",
    }),
  },
  {
    id: "weight_losing_too_fast",
    name: "Perda de peso muito rápida",
    category: "weight",
    severity: "urgent",
    condition: (d) =>
      d.phase === "cutting" &&
      d.weightTrend.last7days.dataPoints >= 2 &&
      d.weightTrend.last7days.ratePerWeek < -1.2,
    suggestion: (d) => ({
      title: "Perda de peso acima de 1.2 kg/semana",
      analysis: `${d.name} perdeu ${Math.abs(d.weightTrend.last7days.change).toFixed(1)}kg na última semana (taxa: ${Math.abs(d.weightTrend.last7days.ratePerWeek).toFixed(1)}kg/sem). Risco de perda muscular.`,
      options: [
        {
          label: "Aumentar 200 kcal/dia",
          detail: "Adicionar CHO (+50g). Reduzir taxa de perda para 0.5-0.8 kg/semana.",
          changes: { calories: 200, carbs: 50, source: "carbs" },
          confidence: "alta",
        },
        {
          label: "Reduzir cardio",
          detail: "Remover 1-2 sessões de cardio por semana se houver.",
          changes: { removeCardio: 2 },
          confidence: "alta",
        },
      ],
      reasoning:
        "Perda acima de 1% do peso corporal por semana em atletas treinados indica catabolismo muscular. Proteína mantida alta, mas o déficit precisa ser reduzido para preservar massa magra. Exceção: primeiras 2 semanas (perda de água/glicogênio é normal).",
    }),
  },
  {
    id: "weight_gaining_in_cutting",
    name: "Ganhando peso em cutting",
    category: "weight",
    severity: "attention",
    condition: (d) =>
      d.phase === "cutting" &&
      d.weightTrend.last14days.dataPoints >= 3 &&
      d.weightTrend.last14days.change > 0.5,
    suggestion: (d) => ({
      title: "Ganho de peso em fase de cutting",
      analysis: `${d.name} ganhou ${d.weightTrend.last14days.change.toFixed(1)}kg nas últimas 2 semanas, mas está em protocolo de cutting.`,
      options: [
        {
          label: "Verificar aderência com o cliente",
          detail: `Aderência reportada: ${d.adherenceAvg}%. Se <85%, o problema é compliance, não o plano.`,
          changes: {},
          confidence: "alta",
        },
        {
          label: "Reduzir 250 kcal/dia",
          detail: "Ajuste mais agressivo. CHO -62g. Se já houve 2+ semanas de ganho, o TDEE pode estar superestimado.",
          changes: { calories: -250, carbs: -62, source: "carbs" },
          confidence: "média",
        },
        {
          label: "Investigar retenção hídrica",
          detail: "Ganho pode ser água (estresse, sódio, ciclo menstrual, novo medicamento). Verificar com o cliente.",
          changes: {},
          confidence: "média",
        },
      ],
      reasoning:
        "Ganho de peso em cutting indica: 1) aderência ruim ao plano, 2) TDEE superestimado, ou 3) retenção hídrica. Investigar antes de ajustar calorias.",
    }),
  },
  {
    id: "bulk_too_fast",
    name: "Ganho de peso muito rápido em bulk",
    category: "weight",
    severity: "attention",
    condition: (d) =>
      d.phase === "bulk" &&
      d.weightTrend.last14days.dataPoints >= 3 &&
      d.weightTrend.last14days.ratePerWeek > 0.5,
    suggestion: (d) => ({
      title: "Ganho acima de 0.5 kg/semana em bulk",
      analysis: `${d.name} está ganhando ${d.weightTrend.last14days.ratePerWeek.toFixed(1)}kg/semana. Em bulk controlado, o ideal é 0.2-0.4kg/semana para minimizar ganho de gordura.`,
      options: [
        {
          label: "Reduzir superávit em 200 kcal",
          detail: "CHO -50g. Manter bulk mais limpo.",
          changes: { calories: -200, carbs: -50, source: "carbs" },
          confidence: "alta",
        },
      ],
      reasoning:
        "Ganho acima de 0.5kg/semana em atleta treinado é predominantemente gordura. Reduzir superávit mantém ganho de massa magra com menos gordura acumulada.",
    }),
  },

  /* ───────── PERFORMANCE ───────── */
  {
    id: "strength_dropping",
    name: "Força caindo no treino",
    category: "performance",
    severity: "urgent",
    condition: (d) =>
      d.phase === "cutting" && d.strengthTrend.percentChange < -10 && d.strengthTrend.dataPoints >= 3,
    suggestion: (d) => ({
      title: "Queda de força superior a 10%",
      analysis: `${d.name} está perdendo força nos treinos (${d.strengthTrend.percentChange.toFixed(0)}% em ${d.strengthTrend.weeksTracked} semanas). Exercícios mais afetados: ${d.strengthTrend.worstExercises.join(", ") || "—"}.`,
      options: [
        {
          label: "Refeed de 3 dias",
          detail: "Aumentar CHO para manutenção por 3 dias. Manter PTN alta. Reavaliar força após.",
          changes: { refeed: 3, carbMultiplier: 1.5 },
          confidence: "alta",
        },
        {
          label: "Reduzir déficit em 10%",
          detail: `Déficit atual muito agressivo. Subir ${Math.round(d.currentCalories * 0.1)} kcal/dia via CHO.`,
          changes: { calories: Math.round(d.currentCalories * 0.1), source: "carbs" },
          confidence: "alta",
        },
        {
          label: "Semana de deload",
          detail: "Reduzir volume em 40%, manter intensidade. Recuperação neuromuscular.",
          changes: { deload: true },
          confidence: "média",
        },
      ],
      reasoning:
        "Queda de força >10% em cutting indica déficit excessivo, fadiga acumulada ou recuperação insuficiente. Se acompanhada de sono ruim e energia baixa, é overreaching. Refeed ou redução de déficit são as primeiras linhas de intervenção.",
    }),
  },
  {
    id: "missed_workouts",
    name: "Treinos perdidos",
    category: "performance",
    severity: "attention",
    condition: (d) =>
      d.trainingAdherence.plannedSessions > 0 && d.trainingAdherence.last7days < 60,
    suggestion: (d) => ({
      title: "Aderência ao treino abaixo de 60%",
      analysis: `${d.name} completou apenas ${d.trainingAdherence.last7days}% dos treinos programados na última semana (${d.trainingAdherence.completedSessions}/${d.trainingAdherence.plannedSessions} sessões).`,
      options: [
        {
          label: "Enviar mensagem motivacional",
          detail: "Verificar o que está acontecendo. Pode ser agenda, motivação, lesão ou overtraining.",
          changes: {},
          confidence: "alta",
        },
        {
          label: "Reduzir frequência para 4x/semana",
          detail: "Se o volume atual é insustentável, reduzir para manter consistência.",
          changes: { trainingFrequency: 4 },
          confidence: "média",
        },
      ],
      reasoning:
        "Treinos perdidos impactam resultados mais que qualquer ajuste nutricional. Prioridade é entender a causa antes de mudar o plano.",
    }),
  },

  /* ───────── ADERÊNCIA ───────── */
  {
    id: "low_adherence",
    name: "Aderência alimentar baixa",
    category: "adherence",
    severity: "attention",
    condition: (d) => d.adherenceAvg < 70 && d.checkinsLast14days >= 3,
    suggestion: (d) => ({
      title: "Aderência ao plano alimentar abaixo de 70%",
      analysis: `${d.name} reportou aderência média de ${d.adherenceAvg}% nos últimos check-ins. O plano pode estar difícil de seguir.`,
      options: [
        {
          label: "Simplificar o plano",
          detail: "Reduzir para 4 refeições. Usar alimentos mais práticos. Incluir 1 refeição livre semanal.",
          changes: { meals: 4, addFreeMeal: true },
          confidence: "alta",
        },
        {
          label: "Adicionar flexibilidade calórica",
          detail: "Dar range de macros (±10%) em vez de valores fixos. Foco em PTN mínima + kcal total.",
          changes: { macroFlexibility: 10 },
          confidence: "alta",
        },
        {
          label: "Conversar com o cliente",
          detail: "Identificar barreiras: rotina, custo, palatabilidade, praticidade.",
          changes: {},
          confidence: "alta",
        },
      ],
      reasoning:
        "Plano com aderência abaixo de 70% não gera resultados consistentes. A melhor dieta é a que o cliente consegue seguir. Simplificar e flexibilizar aumentam compliance sem comprometer resultados.",
    }),
  },

  /* ───────── RECUPERAÇÃO ───────── */
  {
    id: "poor_recovery",
    name: "Recuperação comprometida",
    category: "recovery",
    severity: "urgent",
    condition: (d) => d.avgEnergy < 5 && d.avgSleep < 6 && d.checkinsLast14days >= 3,
    suggestion: (d) => ({
      title: "Sinais de recuperação comprometida",
      analysis: `${d.name} reporta energia média ${d.avgEnergy}/10 e sono médio ${d.avgSleep}h nas últimas 2 semanas. Possível overreaching ou estresse excessivo.`,
      options: [
        {
          label: "Reduzir déficit + deload",
          detail: "Subir calorias para manutenção por 7 dias + semana de deload no treino.",
          changes: { dietBreak: 7, deload: true },
          confidence: "alta",
        },
        {
          label: "Adicionar suporte de sono",
          detail: "Magnésio 400mg + carboidrato na última refeição (200kcal CHO). Restringir cafeína após 14h.",
          changes: { addSupplement: "magnesio_400mg_noite", lastMealCarbs: true },
          confidence: "alta",
        },
        {
          label: "Investigar estresse externo",
          detail: "Energia e sono ruins podem ser estresse do trabalho/vida, não do treino. Conversar com o cliente.",
          changes: {},
          confidence: "média",
        },
      ],
      reasoning:
        "Energia <5/10 + sono <6h por 2+ semanas é sinal de overreaching ou estresse crônico. O corpo não recupera, cortisol sobe, resultados caem. Prioridade: recuperação antes de intensidade.",
    }),
  },

  /* ───────── METABÓLICO ───────── */
  {
    id: "refeed_due",
    name: "Refeed programado",
    category: "metabolic",
    severity: "info",
    condition: (d) =>
      d.phase === "cutting" &&
      d.weeksInDeficit > 0 &&
      d.weeksInDeficit % 4 === 0 &&
      !d.lastRefeed?.wasThisWeek,
    suggestion: (d) => ({
      title: `Refeed programado — Semana ${d.weeksInDeficit}`,
      analysis: `${d.name} está em déficit há ${d.weeksInDeficit} semanas sem refeed. Leptina, T3 e metabolismo se beneficiam de 2-3 dias em manutenção calórica.`,
      options: [
        {
          label: "Refeed de 2 dias (sexta-sábado)",
          detail: "Subir CHO em 80-100%. PTN mantida. LIP mantida ou reduzida levemente. Kcal = manutenção.",
          changes: { refeed: 2, carbMultiplier: 1.8 },
          confidence: "alta",
        },
        {
          label: "Pular este refeed",
          detail: "Se o cliente está progredindo bem, pode esperar mais 2 semanas.",
          changes: {},
          confidence: "baixa",
        },
      ],
      reasoning:
        "Refeed a cada 3-4 semanas em cutting previne adaptação metabólica (queda de leptina e T3), melhora humor e aderência, e pode até acelerar a perda de gordura na semana seguinte.",
    }),
  },
  {
    id: "suggest_reverse_diet",
    name: "Sugerir reverse diet",
    category: "metabolic",
    severity: "attention",
    condition: (d) =>
      d.phase === "cutting" &&
      d.weeksInDeficit >= 16 &&
      d.weightTrend.last14days.ratePerWeek > -0.2,
    suggestion: (d) => ({
      title: "Considerar Reverse Diet",
      analysis: `${d.name} está em déficit há ${d.weeksInDeficit} semanas com progresso estagnando. Metabolismo provavelmente adaptado.`,
      options: [
        {
          label: "Iniciar Reverse Diet",
          detail: "Aumentar +100 kcal/semana via CHO. Duração: 8-12 semanas até manutenção real.",
          changes: { mode: "reverse_diet", weeklyIncrease: 100 },
          confidence: "alta",
        },
        {
          label: "Diet break de 2 semanas primeiro",
          detail: "Manutenção por 14 dias, depois decidir se retoma cutting ou inicia reverse.",
          changes: { dietBreak: 14 },
          confidence: "alta",
        },
      ],
      reasoning:
        "Após 16+ semanas de déficit contínuo, a taxa metabólica cai 10-15% além do esperado pela perda de peso (adaptive thermogenesis). Reverse diet recupera o metabolismo gradualmente sem ganho de gordura significativo.",
    }),
  },

  /* ───────── TIMELINE ───────── */
  {
    id: "goal_on_track",
    name: "Progresso on track",
    category: "timeline",
    severity: "info",
    condition: (d) =>
      d.phase === "cutting" &&
      d.weightTrend.last14days.dataPoints >= 3 &&
      d.weightTrend.last14days.ratePerWeek >= -0.8 &&
      d.weightTrend.last14days.ratePerWeek <= -0.3 &&
      d.adherenceAvg >= 80,
    suggestion: (d) => ({
      title: "Progresso dentro do esperado ✅",
      analysis: `${d.name} está perdendo ${Math.abs(d.weightTrend.last14days.ratePerWeek).toFixed(1)}kg/semana com ${d.adherenceAvg}% de aderência. Tudo no caminho certo.`,
      options: [
        {
          label: "Manter protocolo atual",
          detail: "Nenhum ajuste necessário. Próxima avaliação em 14 dias.",
          changes: {},
          confidence: "alta",
        },
      ],
      reasoning:
        "Taxa de perda entre 0.3-0.8kg/semana com aderência >80% é o cenário ideal em cutting. Não mexer no que está funcionando.",
    }),
  },
];

/* ═══════════════════════════════════════════════════════════
   CÁLCULO DE TENDÊNCIAS
   ═══════════════════════════════════════════════════════════ */

interface WeightPoint {
  date: number;
  weight: number;
}

const windowTrend = (points: WeightPoint[], days: number): TrendWindow => {
  const cutoff = Date.now() - days * 86400000;
  const inWindow = points.filter((p) => p.date >= cutoff);
  if (inWindow.length < 2) {
    return { change: 0, ratePerWeek: 0, dataPoints: inWindow.length };
  }
  const first = inWindow[0];
  const last = inWindow[inWindow.length - 1];
  const change = last.weight - first.weight;
  const spanDays = Math.max((last.date - first.date) / 86400000, 1);
  return {
    change: r1(change),
    ratePerWeek: Math.round((change / spanDays) * 7 * 100) / 100,
    dataPoints: inWindow.length,
  };
};

export const calculateWeightTrend = (points: WeightPoint[]) => ({
  last7days: windowTrend(points, 7),
  last14days: windowTrend(points, 14),
  last30days: windowTrend(points, 30),
});

interface SetLog {
  session_date: string;
  exercise_id: string | null;
  load_done: number | null;
  reps_done: number | null;
  completed: boolean | null;
}

const calculateStrengthTrend = (logs: SetLog[]) => {
  const valid = logs.filter((l) => (l.load_done ?? 0) > 0 && (l.reps_done ?? 0) > 0);
  if (valid.length < 3) {
    return { percentChange: 0, worstExercises: [], dataPoints: valid.length, weeksTracked: 0 };
  }
  // e1RM Epley por exercício, comparando primeira metade vs segunda metade do período
  const byExercise = new Map<string, { early: number[]; late: number[] }>();
  const dates = valid.map((l) => new Date(l.session_date).getTime()).sort((a, b) => a - b);
  const mid = dates[Math.floor(dates.length / 2)];

  for (const l of valid) {
    const key = l.exercise_id || "exercicio";
    const e1rm = (l.load_done as number) * (1 + (l.reps_done as number) / 30);
    const bucket = byExercise.get(key) ?? { early: [], late: [] };
    if (new Date(l.session_date).getTime() <= mid) bucket.early.push(e1rm);
    else bucket.late.push(e1rm);
    byExercise.set(key, bucket);
  }

  const deltas: { name: string; pct: number }[] = [];
  byExercise.forEach((v, name) => {
    if (!v.early.length || !v.late.length) return;
    const avg = (a: number[]) => a.reduce((s, x) => s + x, 0) / a.length;
    const e = avg(v.early);
    const l = avg(v.late);
    if (e > 0) deltas.push({ name, pct: ((l - e) / e) * 100 });
  });

  if (!deltas.length) {
    return { percentChange: 0, worstExercises: [], dataPoints: valid.length, weeksTracked: 0 };
  }

  const percentChange = deltas.reduce((s, d) => s + d.pct, 0) / deltas.length;
  const worstExercises = deltas
    .filter((d) => d.pct < 0)
    .sort((a, b) => a.pct - b.pct)
    .slice(0, 3)
    .map((d) => d.name);

  const spanDays = (dates[dates.length - 1] - dates[0]) / 86400000;

  return {
    percentChange: Math.round(percentChange * 10) / 10,
    worstExercises,
    dataPoints: deltas.length,
    weeksTracked: Math.max(1, Math.round(spanDays / 7)),
  };
};

const calculateTrainingAdherence = (logs: SetLog[], plannedPerWeek: number) => {
  const cutoff = Date.now() - 7 * 86400000;
  const days = new Set(
    logs
      .filter((l) => new Date(l.session_date).getTime() >= cutoff && l.completed)
      .map((l) => l.session_date)
  );
  const completedSessions = days.size;
  const plannedSessions = plannedPerWeek;
  return {
    completedSessions,
    plannedSessions,
    last7days: plannedSessions > 0 ? Math.round((completedSessions / plannedSessions) * 100) : 100,
  };
};

/* ═══════════════════════════════════════════════════════════
   CONSTRUÇÃO DA ANÁLISE
   ═══════════════════════════════════════════════════════════ */

const normalizePhase = (raw: unknown): Phase => {
  const v = String(raw ?? "").toLowerCase();
  if (v.includes("reverse")) return "reverse";
  if (v.includes("recomp")) return "recomp";
  if (v.includes("bulk") || v.includes("superávit") || v.includes("superavit") || v.includes("ganho"))
    return "bulk";
  if (v.includes("cut") || v.includes("déficit") || v.includes("deficit") || v.includes("emagrec"))
    return "cutting";
  if (v.includes("manut") || v.includes("maint")) return "maintenance";
  return "maintenance";
};

/** Escala 1-10 dos check-ins → horas de sono estimadas (fallback quando não há horas) */
const sleepScoreToHours = (score: number) => Math.round((4 + (score / 10) * 5) * 10) / 10;

export async function buildAthleteAnalysis(athleteId: string): Promise<AthleteAnalysis> {
  const since = new Date(Date.now() - 45 * 86400000).toISOString();
  const sinceDate = since.slice(0, 10);

  const [profileRes, planRes, checkinRes, weightRes, setsRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name, weight_kg, goal, objetivo_principal, active_protocol, vet_kcal, protein_g, carbs_g, fat_g, training_frequency")
      .eq("user_id", athleteId)
      .maybeSingle(),
    supabase
      .from("sent_plans")
      .select("plan_data, metadata, created_at")
      .eq("athlete_id", athleteId)
      .eq("type", "meal_plan")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("weekly_checkins")
      .select("*")
      .eq("user_id", athleteId)
      .gte("week_start", sinceDate)
      .order("week_start", { ascending: true }),
    supabase
      .from("weight_logs")
      .select("weight_kg, logged_at")
      .eq("user_id", athleteId)
      .gte("logged_at", since)
      .order("logged_at", { ascending: true }),
    supabase
      .from("training_set_logs")
      .select("session_date, exercise_id, load_done, reps_done, completed")
      .eq("user_id", athleteId)
      .gte("session_date", sinceDate)
      .order("session_date", { ascending: true }),
  ]);

  const profile = profileRes.data as any;
  const plan = planRes.data as any;
  const checkins = (checkinRes.data as any[]) ?? [];
  const setLogs = (setsRes.data as SetLog[]) ?? [];

  const mp = plan?.plan_data ?? {};
  const meta = plan?.metadata ?? {};

  // Série de peso: weight_logs + check-ins semanais
  const weightPoints: WeightPoint[] = [
    ...((weightRes.data as any[]) ?? [])
      .filter((w) => w.weight_kg)
      .map((w) => ({ date: new Date(w.logged_at).getTime(), weight: Number(w.weight_kg) })),
    ...checkins
      .filter((c) => c.weight_kg)
      .map((c) => ({ date: new Date(c.week_start).getTime(), weight: Number(c.weight_kg) })),
  ].sort((a, b) => a.date - b.date);

  const recent = checkins.filter(
    (c) => new Date(c.week_start).getTime() > Date.now() - 14 * 86400000
  );
  const avgOf = (arr: any[], key: string, fallback: number) => {
    const vals = arr.map((c) => c[key]).filter((v) => v !== null && v !== undefined);
    if (!vals.length) return fallback;
    return Math.round((vals.reduce((s, v) => s + Number(v), 0) / vals.length) * 10) / 10;
  };

  const adherenceScore = avgOf(recent.length ? recent : checkins, "adherence_diet", 0);
  const adherenceAvg = adherenceScore > 0 ? Math.round(adherenceScore * 10) : 100;
  const avgEnergy = avgOf(recent.length ? recent : checkins, "adherence_energy", 7);
  const sleepScore = avgOf(recent.length ? recent : checkins, "adherence_sleep", 0);
  const avgSleep = sleepScore > 0 ? sleepScoreToHours(sleepScore) : 7;
  const avgHunger = avgOf(recent.length ? recent : checkins, "adherence_hunger", 5);
  const stressScore = avgOf(recent.length ? recent : checkins, "adherence_stress", 5);

  const phase = normalizePhase(
    mp.phase ?? meta.phase ?? profile?.active_protocol ?? profile?.objetivo_principal ?? profile?.goal
  );

  const startedAt = plan?.created_at ? new Date(plan.created_at).getTime() : null;
  const weeksSinceStart = startedAt
    ? Math.max(1, Math.floor((Date.now() - startedAt) / (7 * 86400000)) + 1)
    : 1;
  const currentWeek = Number(mp.current_week ?? meta.current_week ?? weeksSinceStart);
  const totalWeeks = Number(mp.total_weeks ?? meta.total_weeks ?? 12);

  const lastRefeedRaw = mp.last_refeed ?? meta.last_refeed ?? null;
  const lastRefeed = lastRefeedRaw
    ? {
        date: String(lastRefeedRaw),
        wasThisWeek: Date.now() - new Date(String(lastRefeedRaw)).getTime() < 7 * 86400000,
      }
    : undefined;

  const plannedPerWeek = Number(
    mp.training_days ?? meta.training_days ?? profile?.training_frequency ?? 0
  );

  return {
    name: (profile?.full_name || "Atleta").split(" ")[0],
    athleteId,
    phase,
    currentCalories: Math.round(Number(mp.calories ?? mp.kcal ?? profile?.vet_kcal ?? 2500)),
    currentProtein: Math.round(Number(mp.protein ?? profile?.protein_g ?? 150)),
    currentCarbs: Math.round(Number(mp.carbs ?? profile?.carbs_g ?? 250)),
    currentFat: Math.round(Number(mp.fat ?? profile?.fat_g ?? 80)),
    currentWeek,
    totalWeeks,
    weeksInDeficit: phase === "cutting" ? currentWeek : 0,
    currentWeight: weightPoints.length
      ? r1(weightPoints[weightPoints.length - 1].weight)
      : r1(Number(profile?.weight_kg ?? 80)),
    weightTrend: calculateWeightTrend(weightPoints),
    strengthTrend: calculateStrengthTrend(setLogs),
    trainingAdherence: calculateTrainingAdherence(setLogs, plannedPerWeek),
    adherenceAvg,
    checkinsLast14days: recent.length,
    avgEnergy,
    avgSleep,
    avgHunger,
    stressLevel: stressScore >= 7 ? "high" : stressScore >= 4 ? "moderate" : "low",
    lastRefeed,
  };
}

/* ═══════════════════════════════════════════════════════════
   EXECUÇÃO DO MOTOR
   ═══════════════════════════════════════════════════════════ */

const COOLDOWN_DAYS = 14;

export function evaluateRules(analysis: AthleteAnalysis): AdjustmentSuggestion[] {
  const out: AdjustmentSuggestion[] = [];
  for (const rule of ADJUSTMENT_RULES) {
    try {
      if (!rule.condition(analysis)) continue;
      const s = rule.suggestion(analysis);
      if (!s.options.length) continue;
      out.push({ ...s, ruleId: rule.id, severity: rule.severity, category: rule.category });
    } catch (e) {
      console.error(`[AUTO-AJUSTE] regra ${rule.id} falhou para ${analysis.athleteId}:`, e);
    }
  }
  return out;
}

/**
 * Roda a análise de um atleta e persiste as sugestões novas.
 * Cooldown de 14 dias por regra e no máximo 1 execução por dia por atleta.
 */
export async function analyzeAthlete(
  athleteId: string,
  coachId?: string | null
): Promise<AdjustmentSuggestion[]> {
  const dayKey = `nutrion_autoadjust_${athleteId}_${new Date().toISOString().slice(0, 10)}`;
  try {
    if (localStorage.getItem(dayKey)) return [];
  } catch {
    /* ignore */
  }

  const analysis = await buildAthleteAnalysis(athleteId);
  const detected = evaluateRules(analysis);

  const cooldownSince = new Date(Date.now() - COOLDOWN_DAYS * 86400000).toISOString();
  const { data: recent } = await supabase
    .from("protocol_suggestions")
    .select("rule_id, status, snoozed_until, created_at")
    .eq("athlete_id", athleteId)
    .gte("created_at", cooldownSince);

  const blocked = new Set(
    ((recent as any[]) ?? [])
      .filter((r) => {
        if (r.status === "snoozed" && r.snoozed_until) {
          return new Date(r.snoozed_until).getTime() > Date.now();
        }
        return true;
      })
      .map((r) => r.rule_id)
  );

  const fresh = detected.filter((s) => !blocked.has(s.ruleId));

  if (fresh.length) {
    await supabase.from("protocol_suggestions").insert(
      fresh.map((s) => ({
        athlete_id: athleteId,
        coach_id: coachId ?? null,
        rule_id: s.ruleId,
        severity: s.severity,
        category: s.category,
        title: s.title,
        analysis: s.analysis,
        options: s.options as any,
        reasoning: s.reasoning,
        status: "pending",
      }))
    );
  }

  try {
    localStorage.setItem(dayKey, "1");
  } catch {
    /* ignore */
  }

  return fresh;
}
