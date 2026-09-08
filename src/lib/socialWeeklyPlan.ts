/**
 * Calendário semanal do Social ON — rotaciona as 6 séries do Growth Engine
 * ao longo da semana, em vez de repetir sempre MCE Drop + Bastidor.
 * O plano do dia é montado a partir daqui (série principal + stories + extra).
 */

import type { PlanContentType } from "@/lib/socialContentTypes";

export type SerieId =
  | "MCE_BREAKDOWN"
  | "MCE_DO_DIA"
  | "DESAFIO_MCE"
  | "REACT_COACH"
  | "MITO_OU_METODO"
  | "BASTIDOR_NUTRION"
  | "BASTIDOR"
  | "MCE_DROP"
  | "STORY_CTA"
  | "INTERACAO"
  | "REVISAO_DMS";

export type Serie = {
  icon: string;
  nome: string;
  formato: string;
  detalhe: string;
  minutos: number;
  urgencia: "alta" | "média" | "baixa";
  kind: PlanContentType;
};

export const SERIES: Record<SerieId, Serie> = {
  MCE_BREAKDOWN: {
    icon: "📊",
    nome: "MCE Breakdown",
    formato: "Reels análise de exercício",
    detalhe: "Analise um exercício quadro a quadro: erro comum, ajuste técnico e o princípio MCE por trás.",
    minutos: 30,
    urgencia: "alta",
    kind: "ROTEIRO_REELS",
  },
  MITO_OU_METODO: {
    icon: "💀",
    nome: "Mito ou Método",
    formato: "Carrossel polêmico",
    detalhe: "Pega a crença popular e classifica como MITO ou MÉTODO com evidência. Formato rei do salvamento.",
    minutos: 20,
    urgencia: "alta",
    kind: "MITO_METODO",
  },
  REACT_COACH: {
    icon: "🎯",
    nome: "React Coach",
    formato: "Reels reagindo a vídeo",
    detalhe: "Reaja a um vídeo de exercício que está circulando e mostre o que ninguém avaliou antes de prescrever.",
    minutos: 30,
    urgencia: "alta",
    kind: "ROTEIRO_REELS",
  },
  MCE_DROP: {
    icon: "📤",
    nome: "MCE Drop",
    formato: "Carrossel educativo",
    detalhe: "Carrossel oficial de 7 slides: dor, pilares M / C / E, integração e chamada final.",
    minutos: 20,
    urgencia: "alta",
    kind: "CARROSSEL_MCE",
  },
  DESAFIO_MCE: {
    icon: "🏁",
    nome: "Desafio MCE",
    formato: "Carrossel mensal",
    detalhe: "Lance o desafio do mês com regra clara, prazo e critério de vitória.",
    minutos: 20,
    urgencia: "média",
    kind: "CARROSSEL_MCE",
  },
  MCE_DO_DIA: {
    icon: "⚡",
    nome: "MCE do Dia (Stories)",
    formato: "Stories com enquete",
    detalhe: "Enquete → revelação → caixa de perguntas → chamada final.",
    minutos: 5,
    urgencia: "alta",
    kind: "STORY_BASTIDOR",
  },
  BASTIDOR_NUTRION: {
    icon: "🔧",
    nome: "Por trás do sistema (Stories)",
    formato: "Stories bastidor",
    detalhe: "Mostre a plataforma rodando de verdade: tela, análise ou plano sendo montado.",
    minutos: 5,
    urgencia: "média",
    kind: "STORY_BASTIDOR",
  },
  BASTIDOR: {
    icon: "🔧",
    nome: "Bastidor",
    formato: "Stories bastidor",
    detalhe: "Filme 15s da sua rotina real e conecte com um princípio do método.",
    minutos: 5,
    urgencia: "média",
    kind: "STORY_BASTIDOR",
  },
  STORY_CTA: {
    icon: "💰",
    nome: "Story CTA",
    formato: "Stories de venda suave",
    detalhe: "Três frames: gancho, valor e convite direto pro diagnóstico.",
    minutos: 5,
    urgencia: "média",
    kind: "STORY_CTA",
  },
  INTERACAO: {
    icon: "💬",
    nome: "Interagir nos comentários",
    formato: "Ação de engajamento",
    detalhe: "Responda os 10 primeiros comentários do post de hoje.",
    minutos: 15,
    urgencia: "alta",
    kind: "PACK_INTERACAO",
  },
  REVISAO_DMS: {
    icon: "📥",
    nome: "Revisar DMs",
    formato: "Ação de conversão",
    detalhe: "Responda as mensagens pendentes e mande o follow-up de quem ficou no vácuo.",
    minutos: 15,
    urgencia: "alta",
    kind: "GESTAO_DM",
  },
};

type DayPlan = { principal: SerieId | null; stories: SerieId | null; extra: SerieId | null; horarios?: string[] };

export const CALENDARIO_SEMANAL: Record<number, DayPlan> = {
  1: { principal: "MCE_BREAKDOWN", stories: "MCE_DO_DIA", extra: "INTERACAO" },
  2: { principal: "MITO_OU_METODO", stories: "MCE_DO_DIA", extra: "INTERACAO" },
  3: { principal: "REACT_COACH", stories: "BASTIDOR_NUTRION", extra: "INTERACAO" },
  4: { principal: "MCE_DROP", stories: "MCE_DO_DIA", extra: "INTERACAO" },
  5: { principal: "MCE_BREAKDOWN", stories: "MCE_DO_DIA", extra: "REVISAO_DMS" },
  6: { principal: "BASTIDOR", stories: "STORY_CTA", extra: null },
  0: { principal: null, stories: "STORY_CTA", extra: null },
};

/** Crenças que entram no Mito ou Método — rotacionam por semana do ano. */
export const CRENCAS_MITO_METODO = [
  "Jejum intermitente queima mais gordura",
  "Agachar passando do joelho estraga a articulação",
  "Comer à noite engorda",
  "Aeróbio em jejum acelera o emagrecimento",
  "Treino de mulher tem que ser leve e com muita repetição",
  "Carboidrato à noite vira gordura",
  "Precisa sentir dor no dia seguinte pra ter treinado bem",
  "Suplemento é o que decide o resultado",
];

export type PlanoItem = {
  serie: SerieId;
  icon: string;
  title: string;
  detail: string;
  time: string;
  minutes: number;
  urgency: "alta" | "média" | "baixa";
  kind: PlanContentType;
  topico?: string;
};

const HORARIOS = { principal: "10:00", stories: "12:00", extra: "14:00", fecho: "18:00" };

const semanaDoAno = (d: Date) => {
  const inicio = new Date(d.getFullYear(), 0, 1);
  return Math.floor((d.getTime() - inicio.getTime()) / (7 * 86400000));
};

/** Monta o plano do dia com base no calendário semanal por série. */
export function montarPlanoDeHoje(date = new Date()): PlanoItem[] {
  const dia = CALENDARIO_SEMANAL[date.getDay()];
  const crenca = CRENCAS_MITO_METODO[semanaDoAno(date) % CRENCAS_MITO_METODO.length];
  const itens: PlanoItem[] = [];

  const push = (id: SerieId | null, time: string, topico?: string) => {
    if (!id) return;
    const s = SERIES[id];
    itens.push({
      serie: id,
      icon: s.icon,
      title: topico ? `${s.nome}: ${topico}` : s.nome,
      detail: s.detalhe,
      time,
      minutes: s.minutos,
      urgency: s.urgencia,
      kind: s.kind,
      topico,
    });
  };

  push(dia.principal, HORARIOS.principal, dia.principal === "MITO_OU_METODO" ? crenca : undefined);
  push(dia.stories, HORARIOS.stories);
  push(dia.extra, HORARIOS.extra);
  if (dia.principal && dia.principal !== "BASTIDOR") push("BASTIDOR", HORARIOS.fecho);

  return itens;
}

export const totalMinutos = (itens: { minutes: number }[]) => itens.reduce((n, i) => n + i.minutes, 0);

/** Ícone da série de cada dia da semana (Seg → Dom) para o tracker semanal. */
export const ICONE_DO_DIA = (idxSegADom: number) => {
  const map = [1, 2, 3, 4, 5, 6, 0];
  const id = CALENDARIO_SEMANAL[map[idxSegADom]]?.principal;
  return id ? SERIES[id].icon : "·";
};

export const LEGENDA_SERIES = (["MITO_OU_METODO", "MCE_DROP", "REACT_COACH", "BASTIDOR", "MCE_BREAKDOWN", "MCE_DO_DIA"] as SerieId[]).map(
  (id) => ({ id, icon: SERIES[id].icon, nome: SERIES[id].nome }),
);
