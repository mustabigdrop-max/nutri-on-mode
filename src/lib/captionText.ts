/**
 * Converte qualquer valor vindo da geração em texto seguro para exibir.
 * Objetos como { script_hook, caption_body, caption_cta } viram texto em ordem
 * (gancho → corpo → CTA) em vez de quebrar a tela.
 */
const ORDER = ["script_hook", "hook", "gancho", "caption_body", "body", "corpo", "texto", "caption_cta", "cta"];
export const toText = (v: unknown): string => {
  if (v == null) return "";
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  if (Array.isArray(v)) return v.map(toText).filter(Boolean).join("\n");
  if (typeof v === "object") {
    const o = v as Record<string, unknown>;
    const keys = [...ORDER.filter((k) => k in o), ...Object.keys(o).filter((k) => !ORDER.includes(k))];
    return keys.map((k) => toText(o[k])).filter(Boolean).join("\n\n");
  }
  return "";
};

/**
 * Limpa marcação markdown das legendas geradas, para que o texto exibido e
 * copiado vá limpo para o Instagram (sem **, ##, listas com - ou *).
 */
export const cleanCaption = (text?: unknown): string =>
  toText(text)
    .replace(/\*\*(.*?)\*\*/gs, "$1")
    .replace(/__(.*?)__/gs, "$1")
    .replace(/(^|\s)\*(\S[^*]*?)\*(?=\s|$|[.,!?])/g, "$1$2")
    .replace(/^\s{0,3}#{1,6}\s*/gm, "")
    .replace(/^\s{0,3}[-*]\s+/gm, "• ")
    .replace(/`{1,3}/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
