// STRATUM TRAINING GENERATOR
// Recebe o diagnóstico do APEX Assessment Pipeline e monta, de forma
// determinística, as camadas do plano: divisão, aquecimento obrigatório,
// volume por deficit, técnicas, feeders/homework, periodização do mesociclo,
// flags do NutriPlan e critérios de reavaliação.
//
// Regras: nenhum exercício, carga ou valor nutricional é inventado aqui —
// os exercícios vêm dos protocolos APEX já registrados (prescreverApex) e os
// ajustes nutricionais são sempre sugestão para revisão profissional.

import type {
  DeficitTipo,
  DiagnosticoCompleto,
  GrupoDiagnostico,
  Severidade,
} from "@/lib/apexDeficitDiagnose";
import { ORDEM_TRATAMENTO } from "@/lib/apexDeficitDiagnose";
import { ATIVACAO_REGRA, prescreverApex, type PrescricaoApex } from "@/lib/apexPrescription";
import type { StratumLevelKey } from "@/lib/stratumEngine";
import { exerciciosDoGrupo } from "@/lib/kinesisAtlas";
import { substituirPorUnilateral } from "@/lib/kinesisAsymmetry";
import type { ExercicioKinesis } from "@/lib/kinesisTypes";

export type Mesociclo = "acumulacao" | "intensificacao" | "transmutacao" | "realizacao" | "deload";

export const MAX_GRUPOS_PRIORITARIOS = 3;
export const MIN_SERIES_SEMANA = 6;
export const MAX_SERIES_SEMANA = 25;
export const MAX_SERIES_SESSAO = 10;
export const MAX_SERIES_SEMANA_TOTAL = 100;

export interface StratumGeneratorInput {
  nivel: StratumLevelKey;
  frequencia: number;
  mesociclo: Mesociclo;
  semanaNoMeso: number;
  semanasTotaisMeso: number;
  diagnostico: DiagnosticoCompleto | null;
  /** Volume semanal atual por grupo (séries), quando houver histórico real. */
  volumeAtualPorGrupo?: Record<string, number>;
}

export interface DivisaoStratum {
  nome: string;
  sessoes: string[];
  justificativa: string;
}

export interface GrupoPrioritario {
  grupo: string;
  grupo_key: string;
  tipo: DeficitTipo;
  severidade: Severidade;
  fase_recomendada: string;
  assimetria: boolean;
  visual_score: number | null;
}

export interface BlocoAquecimento {
  grupo: string;
  tag: "[CORRECT]" | "[ACTIVATE]";
  descricao: string;
  tempo_extra: string;
}

export interface VolumePrescrito {
  grupo: string;
  tipo: DeficitTipo | "MANUTENCAO";
  series_semana: number;
  series_por_sessao_max: number;
  regra: string;
}

export interface TecnicaStratum {
  grupo: string;
  tipo: DeficitTipo | "MANUTENCAO";
  itens: string[];
}

export interface SessaoExtra {
  grupo: string;
  tag: "[FEEDER]" | "[HOMEWORK]";
  formato: string;
  detalhe: string;
}

export interface PeriodizacaoStratum {
  mesociclo: Mesociclo;
  volume_pct: number;
  rpe_alvo: string;
  tecnicas_avancadas: string;
  nota: string;
}

export interface FlagNutriPlan {
  grupo: string;
  deficit: DeficitTipo;
  sugestao: string;
}

export interface CriterioProgressao {
  grupo: string;
  criterio: string;
}

export interface PlanoStratum {
  divisao: DivisaoStratum;
  prioritarios: GrupoPrioritario[];
  manutencao: string[];
  aquecimento: BlocoAquecimento[];
  volume: VolumePrescrito[];
  volume_total_semana: number;
  tecnicas: TecnicaStratum[];
  extras: SessaoExtra[];
  periodizacao: PeriodizacaoStratum;
  nutriplan: FlagNutriPlan[];
  reavaliacao: {
    checklist_semanas: number | null;
    visual_semanas: number | null;
    criterios: CriterioProgressao[];
  };
  encaminhamentos: string[];
  resumo_ajustes: string[];
  prescricao_apex: PrescricaoApex | null;
}

// ── PASSO 1: divisão ────────────────────────────────────────────────────────

export function definirDivisao(
  frequencia: number,
  prioritarios: GrupoPrioritario[],
  temAtivacao: boolean,
): DivisaoStratum {
  const f = Math.max(1, Math.round(frequencia));
  const p = prioritarios.map((g) => g.grupo);
  if (f >= 6) {
    return {
      nome: "Push / Pull / Legs ×2",
      sessoes: ["Push A", "Pull A", "Legs A", "Push B", "Pull B", "Legs B"],
      justificativa: "6 sessões permitem cada grupo 2x/semana — melhor cenário para deficit de VOLUME.",
    };
  }
  if (f === 5) {
    return {
      nome: "ABCDE com dias estratégicos",
      sessoes: [
        `A — ${p[0] || "grupo prioritário 1"} + sinergista`,
        `B — ${p[1] || "grupo prioritário 2"} + sinergista`,
        "C — Upper body complementar",
        `D — ${p[2] || "grupo prioritário 3"} + complementar`,
        "E — Pontos fracos / volume extra",
      ],
      justificativa: "Cada dia abre com um grupo prioritário; o dia E concentra volume extra dos pontos fracos.",
    };
  }
  if (f === 4) {
    return {
      nome: "Upper / Lower ×2",
      sessoes: ["Upper A", "Lower A", "Upper B", "Lower B"],
      justificativa: "4 sessões mantêm frequência 2x/semana por grupo com agrupamento por deficit.",
    };
  }
  if (f === 3) {
    return temAtivacao
      ? {
          nome: "Full Body ×3",
          sessoes: ["Full Body A", "Full Body B", "Full Body C"],
          justificativa: "Deficit de ATIVAÇÃO se beneficia de maior frequência neuromuscular — full body 3x.",
        }
      : {
          nome: "Push / Pull / Legs",
          sessoes: ["Push", "Pull", "Legs"],
          justificativa: "Sem deficit de ativação, PPL distribui melhor o volume em 3 sessões.",
        };
  }
  return {
    nome: "Full Body ×2",
    sessoes: ["Full Body A", "Full Body B"],
    justificativa: "Frequência baixa: compostos + ativação dos grupos deficitários em todas as sessões.",
  };
}

// ── PASSO 4: volume ─────────────────────────────────────────────────────────

const BASE_VOLUME: Record<StratumLevelKey, [number, number]> = {
  iniciante: [10, 12],
  intermediario: [12, 16],
  avancado: [16, 20],
};

export function volumeDoGrupo(
  nivel: StratumLevelKey,
  tipo: DeficitTipo | "MANUTENCAO",
  prioritario: boolean,
): { series: number; regra: string } {
  const [min, max] = BASE_VOLUME[nivel];
  const base = prioritario ? max : Math.round((min + max) / 2);
  let series = base;
  let regra = prioritario ? "topo da faixa do nível (grupo prioritário)" : "meio da faixa do nível (manutenção)";

  if (tipo === "VOLUME") {
    series = base + 4;
    regra = "+4 séries sobre a base do nível (deficit de VOLUME)";
  } else if (tipo === "BIOMECANICO") {
    series = Math.round(base * 0.7);
    regra = "-30% do volume normal (deficit BIOMECÂNICO: qualidade antes de quantidade)";
  } else if (tipo === "ATIVACAO") {
    regra = "volume normal com técnica especial (pausa isométrica e tempo controlado)";
  } else if (tipo === "ESTETICO") {
    regra = "topo da faixa com ênfase redistribuída para o subgrupo em atraso";
  }

  series = Math.min(MAX_SERIES_SEMANA, Math.max(MIN_SERIES_SEMANA, series));
  return { series, regra };
}

// ── PASSO 5: técnicas ───────────────────────────────────────────────────────

export function tecnicasDoDeficit(tipo: DeficitTipo | "MANUTENCAO", assimetria: boolean): string[] {
  const itens: string[] = [];
  switch (tipo) {
    case "ATIVACAO":
      itens.push("Pausa isométrica de 2-3s no pico em todos os exercícios do grupo");
      itens.push("Tempo 3-0-2-1 (3s excêntrico, 0 embaixo, 2s concêntrico, 1s de squeeze)");
      itens.push("Carga -20% do normal: o objetivo é sentir o grupo trabalhar");
      itens.push("Pré-exaustão: isolador antes do composto, logo após o aquecimento");
      break;
    case "VOLUME":
      itens.push("Myo-reps no último exercício do grupo (ativador 12-15 reps + mini-sets de 3-5 com 10-15s)");
      itens.push("Drop-set no penúltimo exercício (peso normal → -20% → -20%, sem descanso)");
      itens.push("Rest-pause como alternativa (série até a falha técnica, 15s, mais reps, 15s, mais reps)");
      itens.push("Exercício extra que o atleta ainda não fazia para o grupo");
      break;
    case "BIOMECANICO":
      itens.push("Excêntrico lento 4-5s para reprogramar o padrão motor");
      itens.push("Carga -30-40% do normal e máquinas/isoladores no lugar dos compostos pesados");
      itens.push("Amplitude parcial quando o ROM completo gerar dor ou compensação");
      itens.push("Sem falha muscular: parar com 2-3 RIR. ZERO técnicas de fadiga neste grupo");
      break;
    case "ESTETICO":
      itens.push("Redistribuir a ênfase para o subgrupo em atraso, sem elevar o volume total do grupo");
      break;
    default:
      itens.push("Progressão de carga padrão semana a semana, RPE 7-8 (2-3 RIR)");
      itens.push("Técnica avançada opcional, no máximo 1x a cada 2-3 semanas");
      break;
  }
  if (assimetria) {
    itens.push("Exercícios unilaterais obrigatórios no grupo, lado fraco sempre primeiro");
    itens.push("Lado fraco recebe 1-2 séries extras; sem bilateral pesado até a assimetria cair abaixo de 5%");
  }
  return itens;
}

// ── PASSO 7: periodização ───────────────────────────────────────────────────

export function periodizar(
  mesociclo: Mesociclo,
  semana: number,
  totalSemanas: number,
): PeriodizacaoStratum {
  const total = Math.max(1, totalSemanas);
  const sem = Math.min(Math.max(1, semana), total);
  if (mesociclo === "deload") {
    return {
      mesociclo,
      volume_pct: 50,
      rpe_alvo: "RPE 5-6 (máximo)",
      tecnicas_avancadas: "nenhuma",
      nota: "Cargas a 50%, manter padrão motor e frequência. ACTIVATE e CORRECT continuam normalmente (são leves por natureza). Sem avaliação APEX no deload.",
    };
  }
  if (mesociclo === "intensificacao" || mesociclo === "transmutacao") {
    return {
      mesociclo,
      volume_pct: 80,
      rpe_alvo: "RPE 8-9",
      tecnicas_avancadas: "em todos os exercícios dos grupos prioritários",
      nota: "Volume -20% em relação à acumulação, menos exercícios e mais séries pesadas por exercício.",
    };
  }
  if (mesociclo === "realizacao") {
    return {
      mesociclo,
      volume_pct: 45,
      rpe_alvo: "RPE 9-10 nas séries de pico",
      tecnicas_avancadas: "nenhuma técnica de fadiga",
      nota: "Volume 40-50% da acumulação, foco em compostos pesados e cargas de pico.",
    };
  }
  const pct = Math.round(70 + ((100 - 70) * (sem - 1)) / Math.max(1, total - 1));
  const rpe = sem <= 1 ? "RPE 6-7" : sem >= total ? "RPE 8-9" : "RPE 7-8";
  return {
    mesociclo: "acumulacao",
    volume_pct: Math.min(100, pct),
    rpe_alvo: rpe,
    tecnicas_avancadas: sem >= 3 ? "liberadas (semana 3 em diante)" : "bloqueadas até a semana 3",
    nota: `Semana ${sem} de ${total}: volume progressivo (${Math.min(100, pct)}% do alvo) com ondulação de volume e intensidade.`,
  };
}

// ── Montagem ────────────────────────────────────────────────────────────────

function deficitPrincipal(g: GrupoDiagnostico): { tipo: DeficitTipo | "MANUTENCAO"; severidade: Severidade | null } {
  for (const tipo of ORDEM_TRATAMENTO) {
    const d = g.deficits.find((x) => x.tipo === tipo);
    if (d) return { tipo, severidade: d.severidade };
  }
  return { tipo: "MANUTENCAO", severidade: null };
}

function criterioProgressao(g: GrupoPrioritario): string {
  switch (g.tipo) {
    case "BIOMECANICO":
      return "Quando as respostas biomecânicas do checklist saírem das opções de compensação, escalar CORRECT → ACTIVATE e devolver os compostos.";
    case "ATIVACAO":
      return "Quando as respostas de ativação do checklist normalizarem, remover o bloco [ACTIVATE] e manter o volume.";
    case "VOLUME":
      return "Quando o volume semanal alvo for sustentado por 4 semanas sem queda de execução, reavaliar o score visual do grupo.";
    case "ESTETICO":
      return "Nova avaliação visual: score acima de 60 reclassifica o deficit do grupo.";
    default:
      return "Manter o protocolo enquanto não houver novo achado no checklist.";
  }
}

/** Monta as camadas do plano a partir do diagnóstico real do APEX. */
export function gerarPlanoStratum(input: StratumGeneratorInput): PlanoStratum {
  const diag = input.diagnostico;
  const prescricao = diag ? prescreverApex(diag) : null;

  const comDeficit = (diag?.grupos || []).filter((g) => g.deficits.length > 0);
  const ordenados = [...comDeficit].sort((a, b) => {
    const pa = ORDEM_TRATAMENTO.indexOf(deficitPrincipal(a).tipo as DeficitTipo);
    const pb = ORDEM_TRATAMENTO.indexOf(deficitPrincipal(b).tipo as DeficitTipo);
    if (pa !== pb) return pa - pb;
    const peso: Record<Severidade, number> = { SEVERO: 3, MODERADO: 2, LEVE: 1 };
    const sa = deficitPrincipal(a).severidade;
    const sb = deficitPrincipal(b).severidade;
    return (sb ? peso[sb] : 0) - (sa ? peso[sa] : 0);
  });

  const prioritarios: GrupoPrioritario[] = ordenados.slice(0, MAX_GRUPOS_PRIORITARIOS).map((g) => {
    const dp = deficitPrincipal(g);
    return {
      grupo: g.grupo,
      grupo_key: g.grupo_key,
      tipo: (dp.tipo === "MANUTENCAO" ? "ESTETICO" : dp.tipo) as DeficitTipo,
      severidade: dp.severidade || "LEVE",
      fase_recomendada: g.fase_recomendada,
      assimetria: g.assimetria,
      visual_score: g.apex_visual_score,
    };
  });

  const manutencao = (diag?.grupos || [])
    .filter((g) => !prioritarios.some((p) => p.grupo_key === g.grupo_key))
    .map((g) => g.grupo);

  const temAtivacao = prioritarios.some((g) => g.tipo === "ATIVACAO");
  const divisao = definirDivisao(input.frequencia, prioritarios, temAtivacao);

  // PASSO 2 — aquecimento: CORRECT sempre antes de ACTIVATE, com os protocolos reais do APEX.
  const aquecimento: BlocoAquecimento[] = [];
  if (prescricao) {
    for (const bloco of prescricao.correcao) {
      if (!prioritarios.some((p) => p.grupo_key === bloco.grupo_key)) continue;
      aquecimento.push({
        grupo: bloco.grupo,
        tag: "[CORRECT]",
        descricao: `Release → Stretch → Re-Pattern → Activate: ${bloco.itens
          .map((i) => `${i.fase_nome} ${i.exercicio}${i.repsOuDuracao ? ` (${i.series || ""} ${i.repsOuDuracao})`.replace(/\s+/g, " ") : ""}`)
          .join(" · ")}`,
        tempo_extra: "+10-15 min",
      });
    }
    for (const bloco of prescricao.ativacao) {
      if (!prioritarios.some((p) => p.grupo_key === bloco.grupo_key)) continue;
      aquecimento.push({
        grupo: bloco.grupo,
        tag: "[ACTIVATE]",
        descricao: `${bloco.alvo} — ${bloco.series}, ${bloco.reps}, ${bloco.carga}. ${ATIVACAO_REGRA.aviso}`,
        tempo_extra: "+5-8 min",
      });
    }
  }

  // PASSO 4 — volume
  const volume: VolumePrescrito[] = [];
  for (const g of prioritarios) {
    const { series, regra } = volumeDoGrupo(input.nivel, g.tipo, true);
    volume.push({
      grupo: g.grupo,
      tipo: g.tipo,
      series_semana: series,
      series_por_sessao_max: MAX_SERIES_SESSAO,
      regra,
    });
  }
  for (const grupo of manutencao) {
    const { series, regra } = volumeDoGrupo(input.nivel, "MANUTENCAO", false);
    volume.push({ grupo, tipo: "MANUTENCAO", series_semana: series, series_por_sessao_max: MAX_SERIES_SESSAO, regra });
  }
  const volume_total_semana = volume.reduce((acc, v) => acc + v.series_semana, 0);

  // PASSO 5 — técnicas
  const tecnicas: TecnicaStratum[] = prioritarios.map((g) => ({
    grupo: g.grupo,
    tipo: g.tipo,
    itens: tecnicasDoDeficit(g.tipo, g.assimetria),
  }));

  // PASSO 6 — feeders e homework
  const extras: SessaoExtra[] = [];
  for (const g of prioritarios) {
    if (g.severidade === "SEVERO" && (g.tipo === "ATIVACAO" || g.tipo === "VOLUME")) {
      extras.push({
        grupo: g.grupo,
        tag: "[FEEDER]",
        formato: "1 sessão de 15-20 min em dia off",
        detalhe:
          "2-3 exercícios de ativação do protocolo APEX do grupo + 1-2 isoladores leves · 2 séries de cada · RPE 5-6 · objetivo é frequência neuromuscular, não fadiga",
      });
    } else if (g.severidade === "MODERADO" && g.tipo === "ATIVACAO") {
      extras.push({
        grupo: g.grupo,
        tag: "[HOMEWORK]",
        formato: "Tarefa de 10 min nos dias de descanso, comunicada pelo PRAXIS",
        detalhe: "Mesmos exercícios de ativação do aquecimento, sem carga adicional. Não entra como sessão no STRATUM.",
      });
    }
  }

  const periodizacao = periodizar(input.mesociclo, input.semanaNoMeso, input.semanasTotaisMeso);

  // PASSO 8 — flags do NutriPlan (sempre sugestão para revisão profissional)
  const nutriplan: FlagNutriPlan[] = prioritarios.map((g) => ({
    grupo: g.grupo,
    deficit: g.tipo,
    sugestao:
      "Sugestão para revisão profissional no NutriPlan: reforçar o carboidrato pré-treino do plano vigente e garantir a dose de proteína já prescrita na janela pós-treino nos dias em que este grupo é treinado. Nenhum valor é alterado sem validação.",
  }));

  // Resumo de ajustes — apenas o que a engine realmente decidiu
  const resumo_ajustes: string[] = [];
  resumo_ajustes.push(`Divisão definida: ${divisao.nome} (${input.frequencia}x/semana) — ${divisao.justificativa}`);
  if (prioritarios.length) {
    resumo_ajustes.push(
      `Grupos priorizados neste mesociclo (máx. ${MAX_GRUPOS_PRIORITARIOS}): ${prioritarios
        .map((g) => `${g.grupo} (${g.tipo} ${g.severidade})`)
        .join("; ")}`,
    );
  } else {
    resumo_ajustes.push(
      "Sem diagnóstico APEX aplicável: plano gerado com periodização padrão, sem camadas de CORRECT/ACTIVATE/priorização.",
    );
  }
  for (const b of aquecimento) {
    resumo_ajustes.push(`Aquecimento ${b.tag} adicionado para ${b.grupo} (${b.tempo_extra})`);
  }
  for (const v of volume) {
    if (v.tipo === "MANUTENCAO") continue;
    const atual = input.volumeAtualPorGrupo?.[v.grupo];
    resumo_ajustes.push(
      typeof atual === "number"
        ? `${v.grupo}: ${atual} → ${v.series_semana} séries/semana (${v.regra})`
        : `${v.grupo}: ${v.series_semana} séries/semana (${v.regra})`,
    );
  }
  for (const g of prioritarios) {
    if (g.assimetria) resumo_ajustes.push(`${g.grupo}: unilaterais obrigatórios, lado fraco primeiro com série extra`);
  }
  for (const e of extras) resumo_ajustes.push(`${e.tag} ${e.grupo}: ${e.formato}`);
  if (volume_total_semana > MAX_SERIES_SEMANA_TOTAL) {
    resumo_ajustes.push(
      `Volume total de ${volume_total_semana} séries/semana acima do limite de ${MAX_SERIES_SEMANA_TOTAL}: redistribuir entre os grupos de manutenção em vez de adicionar séries.`,
    );
  }
  if (nutriplan.length) {
    resumo_ajustes.push(
      `NutriPlan: flags geradas para os dias de ${nutriplan.map((n) => n.grupo).join(", ")} (sugestão, sem alterar valores)`,
    );
  }

  return {
    divisao,
    prioritarios,
    manutencao,
    aquecimento,
    volume,
    volume_total_semana,
    tecnicas,
    extras,
    periodizacao,
    nutriplan,
    reavaliacao: {
      checklist_semanas: diag?.proxima_reavaliacao.checklist_semanas ?? null,
      visual_semanas: diag?.proxima_reavaliacao.visual_semanas ?? null,
      criterios: prioritarios.map((g) => ({ grupo: g.grupo, criterio: criterioProgressao(g) })),
    },
    encaminhamentos: diag?.encaminhamentos || [],
    resumo_ajustes,
    prescricao_apex: prescricao,
  };
}

/** Bloco determinístico para o prompt de geração do treino. */
export function buildStratumGeneratorInstruction(plano: PlanoStratum): string {
  const l: string[] = [
    "━━━ STRATUM TRAINING GENERATOR (camadas já resolvidas — obrigatório respeitar) ━━━",
    `DIVISÃO: ${plano.divisao.nome} — ${plano.divisao.justificativa}`,
    `SESSÕES: ${plano.divisao.sessoes.join(" | ")}`,
    `PERIODIZAÇÃO (${plano.periodizacao.mesociclo}): volume ${plano.periodizacao.volume_pct}% do alvo · ${plano.periodizacao.rpe_alvo} · técnicas avançadas ${plano.periodizacao.tecnicas_avancadas}. ${plano.periodizacao.nota}`,
  ];

  if (plano.prioritarios.length) {
    l.push(
      `GRUPOS PRIORIZADOS (máx. ${MAX_GRUPOS_PRIORITARIOS}, os demais em manutenção): ${plano.prioritarios
        .map(
          (g) =>
            `${g.grupo} — ${g.tipo} ${g.severidade}${g.assimetria ? " + ASSIMETRIA" : ""} · fase ${g.fase_recomendada}`,
        )
        .join(" | ")}`,
    );
  } else {
    l.push(
      "GRUPOS PRIORIZADOS: nenhum. Sem diagnóstico APEX aplicável — gerar periodização padrão, sem camadas de CORRECT/ACTIVATE/priorização.",
    );
  }
  if (plano.manutencao.length) l.push(`MANUTENÇÃO: ${plano.manutencao.join(", ")}`);

  if (plano.aquecimento.length) {
    l.push("AQUECIMENTO OBRIGATÓRIO (CORRECT sempre antes de ACTIVATE; não pode ser omitido nem resumido):");
    for (const b of plano.aquecimento) l.push(`  - ${b.tag} ${b.grupo} · ${b.tempo_extra} · ${b.descricao}`);
    l.push("  - Geral: 5 min de cardio leve ou mobilidade articular antes dos blocos acima.");
    l.push("  - Grupos sem deficit: 1-2 séries leves do primeiro exercício (40% → 60% → 80% da carga de trabalho).");
  }

  l.push("VOLUME SEMANAL (séries efetivas, máx. 10 por grupo por sessão):");
  for (const v of plano.volume) {
    l.push(`  - ${v.grupo}: ${v.series_semana} séries/semana — ${v.regra}`);
  }
  l.push(
    `  - Total prescrito: ${plano.volume_total_semana} séries/semana (limites: mínimo ${MIN_SERIES_SEMANA} e máximo ${MAX_SERIES_SEMANA} por grupo; acima de ${MAX_SERIES_SEMANA_TOTAL} no total, redistribuir em vez de somar).`,
  );

  if (plano.tecnicas.length) {
    l.push("TÉCNICAS POR DEFICIT:");
    for (const t of plano.tecnicas) l.push(`  - ${t.grupo} (${t.tipo}): ${t.itens.join("; ")}`);
  }

  if (plano.extras.length) {
    l.push("SESSÕES EXTRAS:");
    for (const e of plano.extras) l.push(`  - ${e.tag} ${e.grupo}: ${e.formato} — ${e.detalhe}`);
  }

  if (plano.nutriplan.length) {
    l.push("SINCRONIZAÇÃO NUTRIPLAN (sugestão para revisão profissional, nunca valor fechado):");
    for (const n of plano.nutriplan) l.push(`  - ${n.grupo} (${n.deficit}): ${n.sugestao}`);
  }

  if (plano.encaminhamentos.length) {
    l.push(`ENCAMINHAMENTO PENDENTE: ${plano.encaminhamentos.join("; ")}. Não progredir carga nos padrões envolvidos.`);
  }

  l.push("CRITÉRIOS DE REAVALIAÇÃO:");
  if (plano.reavaliacao.checklist_semanas) l.push(`  - Checklist funcional em ${plano.reavaliacao.checklist_semanas} semanas`);
  if (plano.reavaliacao.visual_semanas) l.push(`  - Avaliação visual em ${plano.reavaliacao.visual_semanas} semanas`);
  for (const c of plano.reavaliacao.criterios) l.push(`  - ${c.grupo}: ${c.criterio}`);

  l.push("RESUMO DE AJUSTES (reproduzir no output como lista de mudanças vs. treino anterior):");
  for (const r of plano.resumo_ajustes) l.push(`  - ${r}`);

  l.push(
    "REGRAS ABSOLUTAS: CORRECT antes de VOLUME (grupo biomecânico nunca recebe técnica de fadiga nem séries extras); todo exercício ligado a um deficit leva cue de execução e tag visual ([CORRECT], [ACTIVATE], [DEFICIT: tipo], [ASSIMETRIA], [FEEDER]); prescrever a progressão semanal de cada exercício (carga alvo + RPE) dentro do mesociclo; nunca usar os termos IA/AI/Inteligência Artificial — a engine é o STRATUM e a voz para o aluno é do Coach Diogo Mello via PRAXIS; a engine sugere, o coach decide.",
    "━━━ FIM STRATUM TRAINING GENERATOR ━━━",
  );

  return l.join("\n");
}

/** Mensagem do PRAXIS para o aluno — só com o que a engine realmente mudou. */
export function buildMensagemPraxis(plano: PlanoStratum, nome: string, dataReavaliacao?: string): string {
  const linhas: string[] = [`Olá ${nome || "atleta"}!`, "", "Seu novo treino foi montado a partir da sua última avaliação.", "", "O que mudou:"];
  for (const r of plano.resumo_ajustes.slice(0, 8)) linhas.push(`• ${r}`);
  if (plano.prioritarios.length) {
    linhas.push("", `Foco deste ciclo: ${plano.prioritarios.map((g) => g.grupo).join(", ")}.`);
  }
  if (plano.aquecimento.length) {
    linhas.push(
      "",
      "Importante: não pule os exercícios marcados com [ACTIVATE] e [CORRECT] no aquecimento. Parecem leves, mas são parte da correção.",
    );
  }
  if (dataReavaliacao) linhas.push("", `Próxima reavaliação: ${dataReavaliacao}`);
  return linhas.join("\n");
}
