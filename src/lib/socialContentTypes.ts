/**
 * Detecção do tipo de conteúdo de cada item do plano do dia (Social ON).
 * Cada tipo gera um output diferente: carrossel MCE, pack de respostas,
 * stories, scripts de DM ou roteiro de Reels.
 */

export type PlanContentType =
  | "CARROSSEL_MCE"
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

export function detectarTipoConteudo(item: { title?: string; detail?: string }): PlanContentType {
  const titulo = norm(item.title);
  const descricao = norm(item.detail);
  const all = `${titulo} ${descricao}`;

  // O briefing já retornou este nome com espaço, underscore, hífen e até
  // prefixos como "Post". Normalizar separadores evita que qualquer variação
  // de MCE Drop caia no carrossel genérico antigo.
  const tituloCompacto = titulo.replace(/[^a-z0-9]+/g, " ").trim();
  if (/\bmce\s+drop\b/.test(tituloCompacto)) return "CARROSSEL_MCE";
  if (titulo.includes("interacao") && all.includes("post")) return "PACK_INTERACAO";
  if (all.includes("bastidor")) return "STORY_BASTIDOR";
  if (titulo.includes("story cta") || (titulo.includes("story") && descricao.includes("venda"))) return "STORY_CTA";
  if (titulo.includes("revisar dm") || /\bdms?\b/.test(titulo)) return "GESTAO_DM";
  if (titulo.includes("mito") || titulo.includes("metodo")) return "CARROSSEL_MCE";
  if (titulo.includes("react")) return "ROTEIRO_REELS";
  if (titulo.includes("desafio")) return "CARROSSEL_MCE";
  return "POST_GENERICO";
}

export const CONTENT_TYPE_LABEL: Record<PlanContentType, string> = {
  CARROSSEL_MCE: "✦ GERAR CARROSSEL",
  PACK_INTERACAO: "✦ GERAR RESPOSTAS",
  STORY_BASTIDOR: "✦ GERAR ROTEIRO",
  GESTAO_DM: "✦ GERAR SCRIPTS DM",
  STORY_CTA: "✦ GERAR STORIES",
  ROTEIRO_REELS: "✦ GERAR ROTEIRO",
  POST_GENERICO: "✦ GERAR SEM FOTO",
};

/** Itens de texto/ação não precisam dos botões de foto/vídeo. */
export const usesMedia = (t: PlanContentType) =>
  t !== "CARROSSEL_MCE" && t !== "PACK_INTERACAO" && t !== "GESTAO_DM";

/** Tipos que produzem post/carrossel — servem de contexto pro pack de interação. */
export const isPostType = (t: PlanContentType) =>
  t === "CARROSSEL_MCE" || t === "POST_GENERICO" || t === "ROTEIRO_REELS";
