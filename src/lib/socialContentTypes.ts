/**
 * Detecção do tipo de conteúdo de cada item do plano do dia (Social ON).
 * Cada tipo gera um output diferente: carrossel MCE, Mito ou Método,
 * pack de respostas, stories, scripts de DM ou roteiro de Reels.
 */

export type PlanContentType =
  | "CARROSSEL_MCE"
  | "MITO_METODO"
  | "PACK_INTERACAO"
  | "STORY_BASTIDOR"
  | "GESTAO_DM"
  | "STORY_CTA"
  | "ROTEIRO_REELS"
  | "POST_GENERICO";

const norm = (s?: string) =>
  (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

/** Itens de texto/ação: nunca mostram botões de foto/vídeo. */
export const ITENS_SEM_FOTO = [
  "interacao",
  "interagir",
  "comentarios",
  "comentario",
  "responder",
  "revisar",
  "dm",
  "dms",
  "engajamento",
];

export function detectarTipoConteudo(item: { title?: string; detail?: string }): PlanContentType {
  const titulo = norm(item.title);
  const descricao = norm(item.detail);
  const all = `${titulo} ${descricao}`;

  // O briefing já retornou este nome com espaço, underscore, hífen e até
  // prefixos como "Post". Normalizar separadores evita que qualquer variação
  // de MCE Drop caia no carrossel genérico antigo.
  const tituloCompacto = titulo.replace(/[^a-z0-9]+/g, " ").trim();
  if (/\bmito\b/.test(tituloCompacto)) return "MITO_METODO";
  if (/\bmce\s+drop\b/.test(tituloCompacto)) return "CARROSSEL_MCE";
  if (titulo.includes("interacao") && all.includes("post")) return "PACK_INTERACAO";
  if (titulo.includes("interagir") || titulo.includes("comentario")) return "PACK_INTERACAO";
  if (all.includes("bastidor") || titulo.includes("mce do dia") || titulo.includes("por tras do sistema"))
    return "STORY_BASTIDOR";
  if (titulo.includes("story cta") || (titulo.includes("story") && descricao.includes("venda"))) return "STORY_CTA";
  if (titulo.includes("revisar dm") || /\bdms?\b/.test(titulo)) return "GESTAO_DM";
  if (titulo.includes("metodo")) return "MITO_METODO";
  if (titulo.includes("breakdown") || titulo.includes("react")) return "ROTEIRO_REELS";
  if (titulo.includes("desafio")) return "CARROSSEL_MCE";
  return "POST_GENERICO";
}

export const CONTENT_TYPE_LABEL: Record<PlanContentType, string> = {
  CARROSSEL_MCE: "✦ GERAR CARROSSEL",
  MITO_METODO: "✦ GERAR CARROSSEL",
  PACK_INTERACAO: "✦ GERAR RESPOSTAS",
  STORY_BASTIDOR: "✦ GERAR ROTEIRO",
  GESTAO_DM: "✦ GERAR SCRIPTS DM",
  STORY_CTA: "✦ GERAR STORIES",
  ROTEIRO_REELS: "✦ GERAR ROTEIRO",
  POST_GENERICO: "✦ GERAR SEM FOTO",
};

/** Tempo estimado padrão por tipo, em minutos. */
export const CONTENT_TYPE_MINUTES: Record<PlanContentType, number> = {
  CARROSSEL_MCE: 20,
  MITO_METODO: 20,
  PACK_INTERACAO: 15,
  STORY_BASTIDOR: 5,
  GESTAO_DM: 15,
  STORY_CTA: 5,
  ROTEIRO_REELS: 30,
  POST_GENERICO: 20,
};

/** Itens de texto/ação não precisam dos botões de foto/vídeo. */
export const usesMedia = (t: PlanContentType, title?: string) => {
  if (t === "CARROSSEL_MCE" || t === "MITO_METODO" || t === "PACK_INTERACAO" || t === "GESTAO_DM") return false;
  const titulo = norm(title);
  if (titulo && ITENS_SEM_FOTO.some((termo) => titulo.includes(termo))) return false;
  return true;
};

/** Tipos que produzem post/carrossel — servem de contexto pro pack de interação. */
export const isPostType = (t: PlanContentType) =>
  t === "CARROSSEL_MCE" || t === "MITO_METODO" || t === "POST_GENERICO" || t === "ROTEIRO_REELS";
