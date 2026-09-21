import { APEX_CHECKLIST_BY_KEY } from "@/data/apexFunctionalChecklists";
import {
  addWeeksISO,
  type ChecklistEntrada,
  type DeficitTipo,
  type DiagnosticoCompleto,
  type GrupoDiagnostico,
  type Severidade,
} from "@/lib/apexDeficitDiagnose";
import { diagnosticarAtletaCruzado, type DiagnosticoCruzado, type EntradaCruzada, type GrupoCruzado } from "@/lib/apexCrossDiagnose";
import { prescreverIntegrado } from "@/lib/apexIntegratedPrescription";
import { avaliarAchievements } from "@/lib/apexAchievements";
import { detectRankChange, mensagemPromocao, rankForScore, statusDoDelta } from "@/lib/apexRanks";
import { gerarPlanoStratum, type Mesociclo, type PlanoStratum } from "@/lib/stratumTrainingGenerator";
import { ZONE_META, weightedScore, type ApexZonesAnalysis, type ZoneKey } from "@/lib/apexVisualZones";

export type OrchestratorStatus = "waiting_checklist" | "partial_ready" | "ready_for_approval" | "approved" | "published" | "error";
export type ChecklistMode = "pending" | "fresh" | "reused" | "skipped";
export type TriggerSource = "fotos_uploaded" | "coach_reassessment" | "adaptive_reassessment";

export interface OrchestratorLogEntry {
  etapa: string;
  status: "complete" | "pending" | "partial" | "fallback" | "error";
  timestamp: string;
  input?: string[];
  output?: string | string[] | Record<string, unknown>;
  note?: string;
}

export interface BuildOrchestratorInput {
  triggerSource: TriggerSource;
  athleteId: string;
  athleteName: string;
  patientUserId?: string | null;
  coachUserId?: string | null;
  coachProfileId?: string | null;
  visualAssessmentId?: string | null;
  visualAnalysis: ApexZonesAnalysis;
  previousVisualAnalysis?: ApexZonesAnalysis | null;
  checklistEntradas?: ChecklistEntrada[];
  checklistMode?: ChecklistMode;
  training?: {
    nivel?: "iniciante" | "intermediario" | "avancado";
    frequencia?: number;
    mesociclo?: Mesociclo;
    semanaNoMeso?: number;
    semanasTotaisMeso?: number;
    volumeAtualPorGrupo?: Record<string, number>;
  };
}

export interface OrchestrationResult {
  status: OrchestratorStatus;
  flagged_groups: string[];
  checklist_mode: ChecklistMode;
  checklist_results: Record<string, unknown>[];
  visual_report: Record<string, unknown>;
  diagnostico: Record<string, unknown>;
  protocolos_ativos: Record<string, unknown>[];
  plano_treino: Record<string, unknown>;
  nutriplan_sync: Record<string, unknown>[];
  evolution_snapshot: Record<string, unknown>;
  gamification_updates: Record<string, unknown>;
  praxis_messages: Record<string, unknown>[];
  coach_report: Record<string, unknown>;
  execution_log: OrchestratorLogEntry[];
}

const VALID_CHECKLIST_KEYS = new Set(Object.keys(APEX_CHECKLIST_BY_KEY));

const ZONE_TO_CHECKLIST: Partial<Record<ZoneKey, string[]>> = {
  abdomen: ["core"],
  deltoides_ombros: ["deltoides"],
  bracos: ["biceps", "triceps"],
  pernas: ["quadriceps", "posterior_coxa"],
  gluteos_lombar: ["gluteos", "dorsal"],
};

const GROUP_TO_ZONE: Partial<Record<string, ZoneKey>> = {
  core: "abdomen",
  deltoides: "deltoides_ombros",
  biceps: "bracos",
  triceps: "bracos",
  quadriceps: "pernas",
  posterior_coxa: "pernas",
  gluteos: "gluteos_lombar",
  dorsal: "gluteos_lombar",
};

const WEAK_POINT_PATTERNS: { key: string; pattern: RegExp }[] = [
  { key: "dorsal", pattern: /dors|costas|lat[íi]ssimo|lombar|trap[eé]zio|romboide/i },
  { key: "peitoral", pattern: /peit|peitoral|chest/i },
  { key: "deltoides", pattern: /ombro|delt|shoulder/i },
  { key: "gluteos", pattern: /gl[uú]te|glute/i },
  { key: "posterior_coxa", pattern: /posterior|isquio|hamstring/i },
  { key: "quadriceps", pattern: /quadr[ií]ceps|quad|perna|coxa/i },
  { key: "biceps", pattern: /b[ií]ceps|bra[çc]o/i },
  { key: "triceps", pattern: /tr[ií]ceps|bra[çc]o/i },
  { key: "panturrilha", pattern: /panturrilha|calf|gastro/i },
  { key: "core", pattern: /abd[oô]men|core|cintura|obl[ií]quo/i },
];

function scoreTo100(score: number | null | undefined): number | null {
  if (typeof score !== "number" || Number.isNaN(score)) return null;
  const scaled = score <= 10 ? score * 10 : score;
  return Math.max(0, Math.min(100, Math.round(scaled)));
}

function scoreForZone(analysis: ApexZonesAnalysis, zone: ZoneKey | undefined): number | null {
  if (!zone) return null;
  return scoreTo100(analysis.zones?.[zone]?.score ?? null);
}

function pushUnique(list: string[], key: string) {
  if (VALID_CHECKLIST_KEYS.has(key) && !list.includes(key)) list.push(key);
}

function groupKeysFromText(text: string): string[] {
  const out: string[] = [];
  for (const item of WEAK_POINT_PATTERNS) {
    if (item.pattern.test(text)) pushUnique(out, item.key);
  }
  return out;
}

export function flaggedGroupsFromVisual(analysis: ApexZonesAnalysis): string[] {
  const flagged: string[] = [];
  for (const { key } of ZONE_META) {
    const score = scoreForZone(analysis, key);
    if (score !== null && score < 60) {
      for (const group of ZONE_TO_CHECKLIST[key] || []) pushUnique(flagged, group);
    }
  }

  for (const wp of analysis.weak_points || []) {
    const raw = `${wp.group || ""} ${wp.description || ""} ${wp.recommendation || ""}`;
    for (const group of groupKeysFromText(raw)) pushUnique(flagged, group);
  }

  for (const item of analysis.protocol?.training_adjustments || []) {
    for (const group of groupKeysFromText(item)) pushUnique(flagged, group);
  }

  return flagged;
}

export function visualScoreMapFromAnalysis(analysis: ApexZonesAnalysis, groups: string[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const group of groups) {
    const score = scoreForZone(analysis, GROUP_TO_ZONE[group]);
    if (score !== null) out[group] = String(score);
  }
  return out;
}

export function visualOnlyEntries(analysis: ApexZonesAnalysis, groups: string[]): EntradaCruzada[] {
  return groups.map((grupo_key) => ({
    grupo_key,
    respostas: {},
    visual_score: scoreForZone(analysis, GROUP_TO_ZONE[grupo_key]),
    assimetria_pct: null,
  }));
}

export function checklistRowsToEntries(rows: Array<{ grupo_key: string; respostas: unknown; visual_score?: number | null }>, groups: string[]): ChecklistEntrada[] {
  const allowed = new Set(groups);
  return rows
    .filter((row) => allowed.has(row.grupo_key))
    .map((row) => ({
      grupo_key: row.grupo_key,
      respostas: typeof row.respostas === "object" && row.respostas !== null ? (row.respostas as Record<string, string>) : {},
      visual_score: typeof row.visual_score === "number" ? row.visual_score : null,
    }))
    .filter((entry) => Object.keys(entry.respostas).length > 0 || entry.visual_score !== null);
}

function log(etapa: string, status: OrchestratorLogEntry["status"], input?: string[], output?: OrchestratorLogEntry["output"], note?: string): OrchestratorLogEntry {
  return { etapa, status, timestamp: new Date().toISOString(), input, output, note };
}

function primaryToDeficit(g: GrupoCruzado): DeficitTipo | null {
  if (["BIOMECANICO", "ATIVACAO", "VOLUME", "ESTETICO"].includes(g.tipo_primario)) return g.tipo_primario as DeficitTipo;
  if (g.tipo_primario === "ASSIMETRIA") return "ATIVACAO";
  if (["BIOMECANICO", "ATIVACAO", "VOLUME", "ESTETICO"].includes(String(g.tipo_secundario))) return g.tipo_secundario as DeficitTipo;
  if (g.apex_visual.score !== null && g.apex_visual.score < 75) return "ESTETICO";
  return null;
}

function toGrupoDiagnostico(g: GrupoCruzado): GrupoDiagnostico {
  const tipo = primaryToDeficit(g);
  const deficits: GrupoDiagnostico["deficits"] = [];
  if (tipo && g.severidade) {
    deficits.push({
      tipo,
      severidade: g.severidade as Severidade,
      evidencias: [...g.evidencias_visuais, ...g.evidencias_funcionais].filter(Boolean),
    });
  }
  if (
    g.tipo_secundario &&
    ["BIOMECANICO", "ATIVACAO", "VOLUME", "ESTETICO"].includes(g.tipo_secundario) &&
    g.tipo_secundario !== tipo &&
    g.severidade
  ) {
    deficits.push({
      tipo: g.tipo_secundario as DeficitTipo,
      severidade: g.severidade as Severidade,
      evidencias: [`Deficit secundário identificado no cruzamento visual × funcional: ${g.tipo_secundario}`],
    });
  }

  const prioridade = ["BIOMECANICO", "ATIVACAO", "VOLUME", "ESTETICO"].filter((t) =>
    deficits.some((d) => d.tipo === t),
  ) as DeficitTipo[];

  return {
    grupo_key: g.grupo_key,
    grupo: g.grupo,
    apex_visual_score: g.apex_visual.score,
    respondidas: g.evidencias_funcionais.length,
    total_perguntas: APEX_CHECKLIST_BY_KEY[g.grupo_key]?.perguntas.length ?? 0,
    deficits,
    assimetria: g.apex_visual.assimetria_flag || g.tipo_secundario === "ASSIMETRIA" || g.tipo_primario === "ASSIMETRIA",
    assimetria_evidencias: g.apex_visual.assimetria_pct !== null ? [`Assimetria visual ${g.apex_visual.assimetria_pct}%`] : [],
    encaminhamento: g.encaminhamentos,
    prioridade_tratamento: prioridade,
    fase_recomendada: g.fase,
    reavaliacao_semanas: prioridade.includes("BIOMECANICO") || prioridade.includes("ATIVACAO") ? 4 : deficits.length ? 8 : null,
  };
}

function diagnosticoCompletoFromCruzado(cruzado: DiagnosticoCruzado): DiagnosticoCompleto {
  const grupos = cruzado.grupos.map(toGrupoDiagnostico);
  const prioridades = grupos
    .flatMap((g) => g.deficits.map((d) => ({ grupo: g.grupo, grupo_key: g.grupo_key, tipo: d.tipo, severidade: d.severidade })))
    .slice(0, 12);
  return {
    grupos,
    prioridades,
    encaminhamentos: cruzado.encaminhamentos,
    proxima_reavaliacao: {
      checklist_semanas: grupos.some((g) => g.prioridade_tratamento.includes("BIOMECANICO") || g.prioridade_tratamento.includes("ATIVACAO")) ? 4 : null,
      visual_semanas: grupos.some((g) => g.prioridade_tratamento.includes("VOLUME") || g.prioridade_tratamento.includes("ESTETICO")) ? 8 : null,
    },
  };
}

function visualReport(input: BuildOrchestratorInput, flaggedGroups: string[]): Record<string, unknown> {
  const currentScore = scoreTo100(input.visualAnalysis.weighted_score ?? weightedScore(input.visualAnalysis.zones));
  const previousScore = scoreTo100(input.previousVisualAnalysis?.weighted_score ?? (input.previousVisualAnalysis ? weightedScore(input.previousVisualAnalysis.zones) : null));
  return {
    analysis: input.visualAnalysis,
    assessment_id: input.visualAssessmentId ?? null,
    score_geral: currentScore,
    score_anterior: previousScore,
    delta_score: currentScore !== null && previousScore !== null ? currentScore - previousScore : null,
    bf_range: input.visualAnalysis.bf_range_calibrated || input.visualAnalysis.bf_range || null,
    zonas: input.visualAnalysis.zones,
    weak_points: input.visualAnalysis.weak_points || [],
    postural_flags: input.visualAnalysis.alerts || [],
    fotos_com_overlay: input.visualAnalysis.photos_analyzed || [],
    grupos_flagados: flaggedGroups,
    resumo: input.visualAnalysis.summary || null,
  };
}

function buildEvolution(input: BuildOrchestratorInput, diagnostico: DiagnosticoCompleto, plano: PlanoStratum | null): Record<string, unknown> {
  const currentScore = scoreTo100(input.visualAnalysis.weighted_score ?? weightedScore(input.visualAnalysis.zones));
  const previousScore = scoreTo100(input.previousVisualAnalysis?.weighted_score ?? (input.previousVisualAnalysis ? weightedScore(input.previousVisualAnalysis.zones) : null));
  const currentZones = Object.entries(input.visualAnalysis.zones || {}).map(([key, z]) => ({
    key,
    score: scoreTo100(z?.score),
  }));
  const previousZones = input.previousVisualAnalysis
    ? Object.entries(input.previousVisualAnalysis.zones || {}).map(([key, z]) => ({ key, score: scoreTo100(z?.score) }))
    : [];
  const previousMap = new Map(previousZones.map((z) => [z.key, z.score]));
  const deltas = currentZones.map((z) => ({
    ...z,
    anterior: previousMap.get(z.key) ?? null,
    delta: z.score !== null && previousMap.get(z.key) !== null && previousMap.get(z.key) !== undefined ? z.score - Number(previousMap.get(z.key)) : null,
  }));
  return {
    assessment_id: input.visualAssessmentId ?? null,
    score_atual: currentScore,
    score_anterior: previousScore,
    delta_score: currentScore !== null && previousScore !== null ? currentScore - previousScore : null,
    mapa_muscular: deltas,
    timeline_event: `${input.athleteName}: avaliação APEX sincronizada com ${diagnostico.prioridades.length} prioridade(s)`,
    proxima_reavaliacao: {
      checklist: diagnostico.proxima_reavaliacao.checklist_semanas ? addWeeksISO(diagnostico.proxima_reavaliacao.checklist_semanas) : null,
      visual: diagnostico.proxima_reavaliacao.visual_semanas ? addWeeksISO(diagnostico.proxima_reavaliacao.visual_semanas) : null,
      stratum: plano?.reavaliacao || null,
    },
  };
}

function buildGamification(input: BuildOrchestratorInput, diagnostico: DiagnosticoCompleto): Record<string, unknown> {
  const scoreAtual = scoreTo100(input.visualAnalysis.weighted_score ?? weightedScore(input.visualAnalysis.zones));
  const scoreAnterior = scoreTo100(input.previousVisualAnalysis?.weighted_score ?? (input.previousVisualAnalysis ? weightedScore(input.previousVisualAnalysis.zones) : null));
  const rankAtual = rankForScore(scoreAtual);
  const rankAnterior = rankForScore(scoreAnterior);
  const rankChange = detectRankChange(scoreAnterior, scoreAtual);
  const zonasAtuais = Object.entries(input.visualAnalysis.zones || {})
    .map(([grupo, z]) => ({ grupo, score: scoreTo100(z?.score) }))
    .filter((z): z is { grupo: string; score: number } => z.score !== null);
  const zonasAnteriores = input.previousVisualAnalysis
    ? Object.entries(input.previousVisualAnalysis.zones || {})
        .map(([grupo, z]) => ({ grupo, score: scoreTo100(z?.score) }))
        .filter((z): z is { grupo: string; score: number } => z.score !== null)
    : [];
  const anteriorMap = new Map(zonasAnteriores.map((z) => [z.grupo, z.score]));
  const deltas = zonasAtuais.map((z) => ({
    grupo: z.grupo,
    atual: z.score,
    anterior: anteriorMap.get(z.grupo) ?? null,
    delta: anteriorMap.has(z.grupo) ? Math.round(z.score - Number(anteriorMap.get(z.grupo))) : 0,
  }));
  const deficitsAtuais = diagnostico.grupos.filter((g) => g.deficits.length > 0).map((g) => g.grupo);
  const destaques = deltas
    .sort((a, b) => b.delta - a.delta)
    .slice(0, 3)
    .map((d) => ({ grupo: d.grupo, delta: d.delta, status: statusDoDelta(d.delta, deficitsAtuais.includes(d.grupo)) }));
  const achievements = avaliarAchievements({
    zonasAtuais,
    deltas,
    assimetriasAtuais: [],
    assimetriasAnteriores: [],
    deficitsAnteriores: [],
    deficitsAtuais,
    totalTreinos: 0,
    bfPercent: null,
    scoreAtual,
    scoreAnterior,
    rankAtual,
    jaFoiPromovido: Boolean(rankChange?.direction === "promotion"),
    semanaPerfeita: false,
    voltaPorCima: false,
  });

  return {
    rank_atual: rankAtual,
    rank_anterior: rankAnterior,
    promocao: rankChange?.direction === "promotion" ? { de: rankChange.from, para: rankChange.to } : null,
    ajuste_rank: rankChange?.direction === "demotion" ? { de: rankChange.from, para: rankChange.to } : null,
    achievements_novos: achievements,
    physique_card: {
      status: scoreAtual !== null && rankAtual ? "ready" : "insufficient_data",
      score: scoreAtual,
      rank: rankAtual,
      formato: ["4:5", "9:16"],
    },
    destaques,
  };
}

function buildPraxisMessages(input: BuildOrchestratorInput, plano: PlanoStratum | null, gamification: Record<string, unknown>, evolution: Record<string, unknown>, diagnostico: DiagnosticoCompleto): Record<string, unknown>[] {
  const score = evolution.score_atual;
  const delta = evolution.delta_score;
  const rank = (gamification.rank_atual as { nome?: string } | null)?.nome || "sem rank";
  const fortes = (input.visualAnalysis.weak_points || []).length
    ? []
    : Object.entries(input.visualAnalysis.zones || [])
        .filter(([, z]) => (scoreTo100(z?.score) ?? 0) >= 75)
        .map(([key]) => key)
        .slice(0, 3);
  const focos = diagnostico.prioridades.slice(0, 3).map((p) => p.grupo);
  const deltaText = typeof delta === "number" ? `${delta >= 0 ? "▲" : "▼"} ${Math.abs(delta)}` : "sem comparação anterior";
  const messages: Record<string, unknown>[] = [
    {
      type: "resultado_avaliacao",
      title: "Avaliação atualizada",
      send_on_approval: true,
      body: [
        "Sua avaliação foi atualizada!",
        `📊 APEX Score: ${typeof score === "number" ? score : "—"} (${deltaText})`,
        `🎖️ Rank: ${rank}`,
        `💪 Pontos fortes: ${fortes.length ? fortes.join(", ") : "em consolidação"}`,
        `🎯 Foco de melhoria: ${focos.length ? focos.join(", ") : "manter execução"}`,
        "Physique Card atualizado no seu painel.",
      ].join("\n"),
    },
  ];
  if (plano && plano.resumo_ajustes.length) {
    messages.push({
      type: "novo_treino",
      title: "Treino ajustado",
      send_on_approval: true,
      body: [
        "Seu treino foi ajustado:",
        ...plano.resumo_ajustes.slice(0, 5).map((r) => `• ${r}`),
        "⚠️ NÃO pule os exercícios de aquecimento — cada um tem um propósito.",
      ].join("\n"),
    });
  }
  const promocao = gamification.promocao as { de?: { nome?: string }; para?: { nome?: string } } | null;
  if (promocao?.de?.nome && promocao?.para?.nome) {
    messages.push({
      type: "promocao",
      title: `Promoção: ${promocao.para.nome}`,
      send_on_approval: true,
      body: mensagemPromocao({
        nome: input.athleteName,
        de: promocao.de as never,
        para: promocao.para as never,
        scoreAnterior: Number((evolution.score_anterior as number | null) ?? 0),
        scoreAtual: Number((evolution.score_atual as number | null) ?? 0),
        destaques: (gamification.destaques as never[]) || [],
      }),
    });
  }
  for (const achievement of ((gamification.achievements_novos as Record<string, unknown>[] | undefined) || []).slice(0, 3)) {
    messages.push({
      type: "achievement",
      title: `Conquista: ${achievement.titulo || "nova marca"}`,
      send_on_approval: true,
      body: `🏆 CONQUISTA: ${achievement.titulo || "nova marca"}!\n${achievement.mensagem || "Sistema registrado."}`,
    });
  }
  const homework = plano?.extras.filter((e) => e.tag === "[HOMEWORK]") || [];
  if (homework.length) {
    messages.push({
      type: "homework",
      title: "Homework PRAXIS",
      send_on_approval: true,
      body: ["Nos dias de descanso, faça esses exercícios (10min):", ...homework.map((h) => `• ${h.grupo}: ${h.detalhe}`)].join("\n"),
    });
  }
  return messages;
}

export function buildMasterOrchestration(input: BuildOrchestratorInput): OrchestrationResult {
  const flagged = flaggedGroupsFromVisual(input.visualAnalysis);
  const checklistMode = input.checklistMode || "pending";
  const visual = visualReport(input, flagged);
  const executionLog: OrchestratorLogEntry[] = [
    log("1 — APEX Visual", "complete", ["3 fotos", "dados do atleta"], "apex_visual_report"),
  ];

  if (checklistMode === "pending" && flagged.length > 0 && !input.checklistEntradas?.length) {
    executionLog.push(log("2 — Checklist funcional", "pending", ["grupos flagados"], flagged, "Coach responde apenas os grupos sinalizados."));
    return {
      status: "waiting_checklist",
      flagged_groups: flagged,
      checklist_mode: checklistMode,
      checklist_results: [],
      visual_report: visual,
      diagnostico: {},
      protocolos_ativos: [],
      plano_treino: {},
      nutriplan_sync: [],
      evolution_snapshot: {},
      gamification_updates: {},
      praxis_messages: [],
      coach_report: { athlete_name: input.athleteName, next_step: "checklist_funcional", flagged_groups: flagged },
      execution_log: executionLog,
    };
  }

  const entries: EntradaCruzada[] = input.checklistEntradas?.length
    ? input.checklistEntradas.map((entry) => ({
        ...entry,
        visual_score: entry.visual_score ?? scoreForZone(input.visualAnalysis, GROUP_TO_ZONE[entry.grupo_key]),
        assimetria_pct: null,
      }))
    : visualOnlyEntries(input.visualAnalysis, flagged);

  executionLog.push(
    log(
      "2 — Checklist funcional",
      checklistMode === "skipped" ? "partial" : "complete",
      ["grupos flagados", "respostas do coach"],
      entries.map((e) => e.grupo_key),
      checklistMode === "skipped" ? "Avaliação parcial — checklist pendente." : undefined,
    ),
  );

  const cruzado = diagnosticarAtletaCruzado(entries);
  const diagnostico = diagnosticoCompletoFromCruzado(cruzado);
  executionLog.push(log("3 — DIAGNOSE", "complete", ["apex_visual_report", "checklist_results"], `${diagnostico.prioridades.length} prioridade(s)`));

  const plano = gerarPlanoStratum({
    nivel: input.training?.nivel || "intermediario",
    frequencia: input.training?.frequencia || 4,
    mesociclo: input.training?.mesociclo || "acumulacao",
    semanaNoMeso: input.training?.semanaNoMeso || 1,
    semanasTotaisMeso: input.training?.semanasTotaisMeso || 4,
    volumeAtualPorGrupo: input.training?.volumeAtualPorGrupo,
    diagnostico,
  });
  const integrada = prescreverIntegrado(cruzado);
  const protocolos = plano.selecao_kinesis.map((s) => ({
    grupo: s.grupo,
    fase: s.tipo === "BIOMECANICO" ? "CORRECT" : s.tipo === "ATIVACAO" ? "ACTIVATE" : "VOLUME",
    exercicio: s.exercicio,
    prescricao: s.prescricao,
    cue: s.cue,
    variacao: s.variacao,
    fallback: false,
  }));
  if (!protocolos.length && diagnostico.prioridades.length) {
    protocolos.push({
      grupo: diagnostico.prioridades[0].grupo,
      fase: "FALLBACK",
      exercicio: "Protocolo APEX corretivo registrado",
      prescricao: "Usar bloco CORRECT/ACTIVATE do APEX até selecionar exercício KINESIS compatível.",
      cue: "Executar sem dor, sem compensação e com controle total.",
      variacao: null,
      fallback: true,
    });
  }
  executionLog.push(log("4 — KINESIS", protocolos.some((p) => p.fallback) ? "fallback" : "complete", ["apex_diagnostico"], `${protocolos.length} exercício(s)/protocolo(s)`));
  executionLog.push(log("5 — STRATUM", "complete", ["diagnóstico", "protocolos KINESIS", "dados do aluno"], `${plano.divisao.nome} · ${plano.volume_total_semana} séries/semana`));

  const nutriplan = plano.nutriplan.map((n) => ({
    grupo: n.grupo,
    deficit: n.deficit,
    pre_treino: "Revisar carboidrato pré-treino nos dias do grupo prioritário.",
    pos_treino: "Garantir proteína do plano na janela pós-treino.",
    leucina: "Verificar fontes proteicas ricas em leucina dentro do plano vigente.",
    status: "review_required",
    note: n.sugestao,
  }));
  const evolution = buildEvolution(input, diagnostico, plano);
  const gamification = buildGamification(input, diagnostico);
  const praxis = buildPraxisMessages(input, plano, gamification, evolution, diagnostico);

  executionLog.push(log("6A — NutriPlan Sync", "complete", ["plano_treino.nutriplan_flags"], `${nutriplan.length} flag(s) para revisão`));
  executionLog.push(log("6B — APEX Evolution", "complete", ["visual", "diagnóstico", "histórico"], "snapshot atualizado"));
  executionLog.push(log("7 — Gamificação", "complete", ["score", "rank", "achievements"], gamification));
  executionLog.push(log("8 — PRAXIS", "pending", ["relatório aprovado pelo coach"], `${praxis.length} mensagem(ns) preparadas`, "Envio somente após aprovação."));
  executionLog.push(log("9 — Dashboard do coach", "complete", ["todas as etapas"], "relatório pronto para revisão"));

  return {
    status: checklistMode === "skipped" ? "partial_ready" : "ready_for_approval",
    flagged_groups: flagged,
    checklist_mode: checklistMode,
    checklist_results: entries.map((e) => ({ grupo: e.grupo_key, respostas: e.respostas, visual_score: e.visual_score })),
    visual_report: visual,
    diagnostico: { ...diagnostico, cruzado, integrado: integrada },
    protocolos_ativos: protocolos,
    plano_treino: plano as unknown as Record<string, unknown>,
    nutriplan_sync: nutriplan,
    evolution_snapshot: evolution,
    gamification_updates: gamification,
    praxis_messages: praxis,
    coach_report: {
      athlete_name: input.athleteName,
      generated_at: new Date().toISOString(),
      status: checklistMode === "skipped" ? "Avaliação parcial — checklist pendente" : "Pronto para aprovação do coach",
      mapa_deficits: diagnostico.grupos,
      ajustes_stratum: plano.resumo_ajustes,
      nutriplan_flags: nutriplan,
      gamification,
      proxima_reavaliacao: evolution.proxima_reavaliacao,
    },
    execution_log: executionLog,
  };
}
