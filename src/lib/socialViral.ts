/**
 * Motor de viralização do Social ON.
 * Hooks obrigatórios por gatilho, CTA certo por tipo de post, hashtags em
 * 3 camadas, score de viralização pré-post e melhor horário real.
 */

import type { PlanContentType } from "@/lib/socialContentTypes";

export type HookTipo = "POLÊMICA" | "IDENTIFICAÇÃO" | "CURIOSIDADE" | "AUTORIDADE" | "RESULTADO";

export const TIPOS_HOOK: Record<HookTipo, { descricao: string; exemplo: string; sinal: string; poder: number }> = {
  POLÊMICA: {
    descricao: "Confronta uma crença popular",
    exemplo: '"Jejum intermitente NÃO emagrece — e a ciência já provou."',
    sinal: "Gera debate nos comentários",
    poder: 5,
  },
  IDENTIFICAÇÃO: {
    descricao: "A pessoa se vê na frase",
    exemplo: '"Eu sei o que fazer, mas não consigo manter."',
    sinal: "Gera salvamentos e DMs",
    poder: 4,
  },
  CURIOSIDADE: {
    descricao: "Abre um loop que só fecha arrastando ou assistindo",
    exemplo: '"O erro que 90% comete no pós-treino — e destrói o resultado."',
    sinal: "Gera retenção e alcance",
    poder: 5,
  },
  AUTORIDADE: {
    descricao: "Mostra que você sabe algo que os outros não sabem",
    exemplo: '"Em 16 anos entre Marinha e coaching, isso é o que aprendi sobre disciplina."',
    sinal: "Traz seguidores novos",
    poder: 3,
  },
  RESULTADO: {
    descricao: "Mostra transformação ou dado concreto",
    exemplo: '"Esse protocolo mudou o shape dele em 12 semanas."',
    sinal: "Gera salvamentos e seguidores",
    poder: 4,
  },
};

export type HookOption = { tipo: HookTipo; texto: string };

export type CorteTexto = {
  segundo: string;
  texto_tela: string;
  posicao?: string;
  estilo?: string;
};

export type ViralKit = {
  hooks?: HookOption[];
  cortes?: CorteTexto[];
  self_comment?: string;
  cta_post?: string;
  cta_caption?: string;
  hashtags?: { alcance?: string[]; nicho?: string[]; micro?: string[] };
};

// ─────────────────────────────────────────────────────────────
// CTA por tipo de conteúdo
// ─────────────────────────────────────────────────────────────

export type CtaSet = { no_post: string; no_caption: string; self_comment: string };

export const CTA_POR_TIPO: Record<PlanContentType, CtaSet> = {
  CARROSSEL_MCE: {
    no_post: "Salva esse post — vai precisar reler.",
    no_caption: "Diagnóstico gratuito no link da bio.",
    self_comment: "Qual pilar te trava mais? M, C ou E? Comenta aqui.",
  },
  MITO_METODO: {
    no_post: "Concorda ou discorda? Comenta.",
    no_caption: "Manda pra quem acredita nesse mito.",
    self_comment: "Qual mito do fitness mais te surpreendeu?",
  },
  ROTEIRO_REELS: {
    no_post: 'Manda DM "ANALISA" com seu vídeo.',
    no_caption: 'Quer uma análise do SEU exercício? Manda DM "ANALISA".',
    self_comment: "Quem faz esse exercício? Olha o erro que quase todo mundo comete.",
  },
  STORY_CTA: {
    no_post: 'Manda DM "QUERO" que eu te explico.',
    no_caption: "Enquete ou caixa de perguntas no frame final.",
    self_comment: "Responde a enquete que eu te mando o próximo passo.",
  },
  STORY_BASTIDOR: {
    no_post: "Responde a enquete.",
    no_caption: "Caixa de perguntas aberta no último frame.",
    self_comment: "Manda sua dúvida na caixinha que eu respondo.",
  },
  POST_GENERICO: {
    no_post: "Salva esse post pra aplicar depois.",
    no_caption: "Diagnóstico gratuito no link da bio.",
    self_comment: "O que mais te trava hoje? Comenta aqui.",
  },
  PACK_INTERACAO: {
    no_post: "Responda todos os comentários na primeira hora.",
    no_caption: "—",
    self_comment: "—",
  },
  GESTAO_DM: {
    no_post: "Responda as DMs pendentes e mande o follow-up.",
    no_caption: "—",
    self_comment: "—",
  },
};

// ─────────────────────────────────────────────────────────────
// Hashtags em 3 camadas
// ─────────────────────────────────────────────────────────────

const CAMADA_ALCANCE = ["#fitness", "#treino", "#saude", "#emagrecimento", "#nutricao"];
const CAMADA_NICHO = ["#nutricaoesportiva", "#treinointeligente", "#coachfitness", "#habitossaudaveis", "#musculacao"];
const CAMADA_MICRO = ["#nutrion", "#metodomce", "#coachdiogomello", "#mcemindset", "#treinocomciencia"];

const slugTag = (s: string) =>
  `#${s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "")}`;

/** Monta as 3 camadas de hashtags (alcance, nicho e micro) a partir do tema. */
export const gerarHashtags = (tema = "", extras: string[] = []) => {
  const doTema = tema
    .split(/\s+/)
    .filter((w) => w.length > 4)
    .slice(0, 2)
    .map(slugTag);
  const uniq = (arr: string[]) => [...new Set(arr.filter(Boolean))].slice(0, 5);
  return {
    alcance: uniq([...CAMADA_ALCANCE, ...extras]),
    nicho: uniq([...doTema, ...CAMADA_NICHO]),
    micro: uniq(CAMADA_MICRO),
  };
};

export const achatarHashtags = (h?: { alcance?: string[]; nicho?: string[]; micro?: string[] }) =>
  [...(h?.alcance || []), ...(h?.nicho || []), ...(h?.micro || [])].join(" ");

// ─────────────────────────────────────────────────────────────
// Score de viralização pré-post
// ─────────────────────────────────────────────────────────────

export type ViralCheck = { ok: boolean; label: string; pontos: number };
export type ViralAnalise = {
  score: number;
  nivel: "VIRAL" | "BOM" | "FRACO";
  checks: ViralCheck[];
  melhorias: string[];
};

const has = (t: string, termos: string[]) => termos.some((x) => t.includes(x));

/** Analisa a legenda/roteiro e devolve score 0-100 com melhorias objetivas. */
export function analisarViralidade(
  conteudo: string,
  opts: { formato?: "reels" | "carousel" | "feed" | "stories"; slides?: number; segundos?: number; temTextoTela?: boolean } = {},
): ViralAnalise {
  const t = (conteudo || "").toLowerCase();
  const primeirasLinhas = t.split("\n").slice(0, 2).join(" ");
  const formato = opts.formato || "feed";

  const polemica = has(primeirasLinhas, ["não ", "nao ", "mito", "errado", "para de", "esquece", "mentira"]);
  const curiosidade = has(primeirasLinhas, ["o erro", "ninguém", "ninguem", "90%", "o que", "por que", "segredo", "sem você"]);

  const checks: ViralCheck[] = [
    { ok: primeirasLinhas.trim().length > 15, label: "Hook logo na primeira linha", pontos: 15 },
    { ok: polemica || curiosidade, label: "Hook de polêmica ou curiosidade", pontos: 15 },
    { ok: has(t, ["salva", "salve esse", "guarda esse"]), label: "CTA de salvamento", pontos: 10 },
    { ok: has(t, ["comenta", "comente", "responde aqui"]), label: "CTA de comentário", pontos: 5 },
    { ok: has(t, ["manda pra", "compartilha", "marca alguém", "marca alguem", "tag "]), label: "CTA de compartilhamento", pontos: 10 },
    {
      ok: formato === "carousel" ? (opts.slides || 0) >= 7 && (opts.slides || 0) <= 10 : true,
      label: "Carrossel entre 7 e 10 slides",
      pontos: 10,
    },
    {
      ok: formato === "reels" ? (opts.segundos || 30) >= 15 && (opts.segundos || 30) <= 45 : true,
      label: "Reels entre 15 e 45 segundos",
      pontos: 10,
    },
    { ok: formato === "reels" ? !!opts.temTextoTela : true, label: "Texto na tela", pontos: 5 },
    { ok: has(t, ["link na bio", "diagnóstico", "diagnostico", "dm ", "whatsapp"]), label: "Caminho de conversão claro", pontos: 10 },
    { ok: t.includes("?"), label: "Pergunta aberta na legenda", pontos: 5 },
    { ok: (conteudo.match(/#/g) || []).length >= 10, label: "Hashtags em camadas (10+)", pontos: 5 },
  ];

  const score = Math.min(100, checks.reduce((n, c) => n + (c.ok ? c.pontos : 0), 0));
  const melhorias = checks.filter((c) => !c.ok).map((c) => `Adicione: ${c.label.toLowerCase()}`);

  return {
    score,
    nivel: score >= 80 ? "VIRAL" : score >= 60 ? "BOM" : "FRACO",
    checks,
    melhorias,
  };
}

// ─────────────────────────────────────────────────────────────
// Melhor horário real
// ─────────────────────────────────────────────────────────────

/** Melhor horário por tipo de conteúdo e dia da semana. */
export function melhorHorario(kind: PlanContentType, date = new Date()): { hora: string; motivo: string } {
  const dia = date.getDay();
  const fimDeSemana = dia === 0 || dia === 6;
  const nomeDia = date.toLocaleDateString("pt-BR", { weekday: "long" });

  if (kind === "STORY_BASTIDOR" || kind === "STORY_CTA")
    return { hora: fimDeSemana ? "11:00" : "19:30", motivo: `melhor janela de Stories (${nomeDia})` };
  if (kind === "PACK_INTERACAO") return { hora: fimDeSemana ? "11:30" : "13:30", motivo: "logo após o pico do post" };
  if (kind === "GESTAO_DM") return { hora: "20:00", motivo: "quando as pessoas respondem DM" };
  if (kind === "ROTEIRO_REELS")
    return { hora: fimDeSemana ? "10:30" : "18:30", motivo: `melhor horário para Reels (${nomeDia})` };
  return { hora: fimDeSemana ? "10:30" : "12:30", motivo: `melhor horário para carrossel (${nomeDia})` };
}
