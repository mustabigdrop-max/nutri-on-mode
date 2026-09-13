/**
 * STRATUM decision core.
 * Pure, deterministic rules used before protocol generation. It never fabricates
 * athlete measurements, loads, macros or assessment scores.
 */
export type StratumPhase = "acumulacao" | "transmutacao" | "realizacao" | "deload";
export type StratumGoal = "hipertrofia" | "forca" | "outro";
export type StratumLevel = "iniciante" | "intermediario" | "avancado";

export interface StratumDecisionInput {
  phase?: string | null;
  goal?: string | null;
  level?: string | null;
  week?: number | null;
  totalWeeks?: number | null;
  frequency?: number | null;
  hasOtherSport?: boolean;
  weeksToCompetition?: number | null;
  weakPoints?: string[];
  hasBfrContraindication?: boolean;
  hasBfrSupervision?: boolean;
}

export interface StratumDecisionOutput {
  phase: StratumPhase;
  goal: StratumGoal;
  level: StratumLevel;
  split: string;
  compoundReps: string;
  isolationReps: string;
  compoundRir: string;
  isolationRir: string;
  failureRule: "bloqueada" | "controlada_isoladores";
  advancedTechniquesAllowed: boolean;
  maxAdvancedTechniques: number;
  bfrAllowed: boolean;
  bfrReason: string;
  volumeModifierPercent: number;
  apexCadence: "semanal" | "quinzenal" | "mensal" | "nenhuma";
  alerts: string[];
}

export const STRATUM_VOLUME_LANDMARKS = {
  Peitoral: { mev: 8, mav: [12, 16] as [number, number], mrv: 20 },
  Costas: { mev: 8, mav: [14, 18] as [number, number], mrv: 22 },
  Ombros: { mev: 6, mav: [10, 14] as [number, number], mrv: 18 },
  Quadriceps: { mev: 6, mav: [12, 16] as [number, number], mrv: 20 },
  Posterior: { mev: 6, mav: [10, 14] as [number, number], mrv: 18 },
  Biceps: { mev: 4, mav: [8, 12] as [number, number], mrv: 16 },
  Triceps: { mev: 4, mav: [8, 12] as [number, number], mrv: 16 },
  Panturrilha: { mev: 6, mav: [10, 14] as [number, number], mrv: 18 },
  Gluteos: { mev: 4, mav: [10, 14] as [number, number], mrv: 18 },
  Abdomen: { mev: 0, mav: [6, 10] as [number, number], mrv: 14 },
} as const;

const normalized = (value?: string | null) => String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export function normalizeStratumPhase(value?: string | null): StratumPhase {
  const v = normalized(value);
  if (/deload|descarga/.test(v)) return "deload";
  if (/realizacao|peak|pico/.test(v)) return "realizacao";
  if (/transmut|intensifica|forca/.test(v)) return "transmutacao";
  return "acumulacao";
}

export function normalizeStratumGoal(value?: string | null): StratumGoal {
  const v = normalized(value);
  if (/forca|powerlift|strength/.test(v)) return "forca";
  if (/hipertrof|bulk|massa|cut|defini|bodybuild/.test(v)) return "hipertrofia";
  return "outro";
}

export function normalizeStratumLevel(value?: string | null): StratumLevel {
  const v = normalized(value);
  if (/inici|begin/.test(v)) return "iniciante";
  if (/avanc|elite/.test(v)) return "avancado";
  return "intermediario";
}

export function selectStratumSplit(level: StratumLevel, frequency: number): string {
  if (frequency <= 3) return level === "iniciante" ? "FULL BODY" : level === "avancado" ? "UPPER / LOWER" : "FULL BODY ou UPPER / LOWER";
  if (frequency === 4) return level === "intermediario" ? "UPPER / LOWER ou PPL + UPPER" : "UPPER / LOWER";
  if (frequency === 5) return level === "avancado" ? "PPL + extras ou BRO SPLIT" : "PPL + UPPER / LOWER";
  return level === "avancado" ? "PPL ×2 ou BRO SPLIT" : "PPL ×2 (requer revisão de recuperação)";
}

export function decideStratum(input: StratumDecisionInput): StratumDecisionOutput {
  const phase = normalizeStratumPhase(input.phase);
  const goal = normalizeStratumGoal(`${input.goal || ""} ${input.phase || ""}`);
  const level = normalizeStratumLevel(input.level);
  const week = Math.max(1, Number(input.week) || 1);
  const frequency = Math.min(7, Math.max(1, Number(input.frequency) || 3));
  const alerts: string[] = [];

  let compoundReps = "6-12";
  let isolationReps = "12-20";
  if (goal === "forca" && phase === "transmutacao") compoundReps = "3-6";
  if (goal === "forca" && phase === "realizacao") compoundReps = "1-3";
  if (phase === "deload") { compoundReps = "8-12"; isolationReps = "20-30+"; }

  let compoundRir = phase === "deload" ? "4-5" : phase === "realizacao" ? "1" : phase === "transmutacao" ? "1-2" : week >= 3 ? "2-3" : "3-4";
  let isolationRir = phase === "deload" ? "4-5" : phase === "realizacao" || phase === "transmutacao" ? "2-3" : week >= 3 ? "1-2" : "2-3";
  if (level === "iniciante") { compoundRir = "3-5"; isolationRir = "3-5"; }

  const advancedTechniquesAllowed = level !== "iniciante" && phase !== "deload" && week >= 3;
  const failureRule = level === "avancado" && phase !== "deload" && week >= 3
    ? "controlada_isoladores"
    : "bloqueada";
  const bfrAllowed = !input.hasBfrContraindication && input.hasBfrSupervision === true;
  const bfrReason = bfrAllowed
    ? "Somente membros, baixa carga, finalizador/reabilitação/deload ativo e sob supervisão."
    : input.hasBfrContraindication
      ? "Bloqueado por contraindicação informada."
      : "Bloqueado até existir supervisão confirmada e triagem de contraindicações.";

  let volumeModifierPercent = input.hasOtherSport ? -25 : 0;
  if (phase === "deload") volumeModifierPercent = Math.min(volumeModifierPercent, -30);
  if (frequency >= 6 && level !== "avancado") alerts.push("Frequência alta para o nível: revisão obrigatória do coach.");
  if (input.hasOtherSport) alerts.push("Multimodalidade ativa: reduzir volume e monitorar interferência/fadiga com dados reais.");

  const competition = /cut|defini|prep|compet/.test(normalized(`${input.phase} ${input.goal}`));
  const apexCadence = phase === "deload"
    ? "nenhuma"
    : competition && Number(input.weeksToCompetition) > 0 && Number(input.weeksToCompetition) <= 4
      ? "semanal"
      : competition ? "quinzenal" : "mensal";

  return {
    phase, goal, level, split: selectStratumSplit(level, frequency), compoundReps, isolationReps,
    compoundRir, isolationRir, failureRule, advancedTechniquesAllowed,
    maxAdvancedTechniques: advancedTechniquesAllowed ? 2 : 0,
    bfrAllowed, bfrReason, volumeModifierPercent, apexCadence, alerts,
  };
}

export function buildStratumDecisionInstruction(input: StratumDecisionInput): string {
  const d = decideStratum(input);
  const landmarks = Object.entries(STRATUM_VOLUME_LANDMARKS)
    .map(([muscle, v]) => `${muscle}: MEV ${v.mev}, MAV ${v.mav[0]}-${v.mav[1]}, MRV ${v.mrv}`)
    .join(" · ");
  const weak = (input.weakPoints || []).filter(Boolean).join(", ") || "nenhum dado estruturado";

  return `━━━ STRATUM — DECISÕES DETERMINÍSTICAS (NÃO ALTERAR) ━━━
Fase: ${d.phase} | Objetivo: ${d.goal} | Nível: ${d.level} | Divisão: ${d.split}
Compostos: ${d.compoundReps} reps, RIR ${d.compoundRir}. Isoladores: ${d.isolationReps} reps, RIR ${d.isolationRir}.
Falha: ${d.failureRule}. Técnicas avançadas: ${d.advancedTechniquesAllowed ? `permitidas, máximo ${d.maxAdvancedTechniques} por sessão; priorizar REST-PAUSE em isoladores e CLUSTER apenas para força em compostos` : "bloqueadas"}.
BFR: ${d.bfrAllowed ? "permitido com supervisão" : "não prescrever"}. Motivo: ${d.bfrReason}
Volume multimodalidade/deload: ${d.volumeModifierPercent === 0 ? "sem modificador automático" : `${d.volumeModifierPercent}%`}.
Pontos fracos reais informados: ${weak}. Se existirem, adicionar somente 2-4 séries/semana sem ultrapassar MRV, priorizar no início, unilateral em assimetria e ao menos um exercício stretch-loaded. Sem dado, não inventar ponto fraco.
Landmarks oficiais: ${landmarks}.
Progressão: iniciante = linear; intermediário = dupla progressão; avançado = ondulada/volume load somente quando houver logs. Platô só existe com 2+ semanas reais sem progresso; seguir variação → zona → tempo → técnica → mini-deload → divisão.
Recuperação: validar mínimo 48h por grupo; ideal 72h para hipertrofia. Em outra modalidade, manter redução de 20-30% e sinalizar conflito.
APEX: próxima avaliação ${d.apexCadence}; não avaliar no deload. Exigir manhã, jejum mínimo 8h, pré-treino, mesma luz/roupa/distância e fotos frontal/lateral/posterior.
NutriPlan: apenas sinalizar fase e necessidade de revisão profissional. Nunca criar ou aplicar calorias/macros/suplementos ausentes. Overrides do coach têm prioridade absoluta.
${d.alerts.length ? `Alertas: ${d.alerts.join(" ")}` : ""}
━━━ FIM DAS DECISÕES STRATUM ━━━`;
}