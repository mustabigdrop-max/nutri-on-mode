/**
 * Limpa marcação markdown das legendas geradas, para que o texto exibido e
 * copiado vá limpo para o Instagram (sem **, ##, listas com - ou *).
 */
export const cleanCaption = (text?: string | null): string =>
  (text || "")
    .replace(/\*\*(.*?)\*\*/gs, "$1")
    .replace(/__(.*?)__/gs, "$1")
    .replace(/(^|\s)\*(\S[^*]*?)\*(?=\s|$|[.,!?])/g, "$1$2")
    .replace(/^\s{0,3}#{1,6}\s*/gm, "")
    .replace(/^\s{0,3}[-*]\s+/gm, "• ")
    .replace(/`{1,3}/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
