import { safeString } from "@/lib/utils";

/**
 * Sanitiza qualquer texto que será exibido para o CLIENTE (rotas /my-*).
 * Remove jargão técnico e qualquer referência a "IA / AI / inteligência artificial".
 * Uso interno (coach, logs, console) não deve usar este helper.
 */
const REPLACEMENTS: Array<[RegExp, string]> = [
  [/plano seguro gerado com c[áa]lculo determin[íi]stico ap[óo]s indisponibilidade tempor[áa]ria da IA\.?/gi, "Plano gerado e validado pelo NUTRION ENGINE."],
  [/gerado com c[áa]lculo determin[íi]stico ap[óo]s indisponibilidade tempor[áa]ria da IA/gi, "gerado pelo sistema"],
  [/indisponibilidade tempor[áa]ria da IA/gi, "indisponibilidade temporária do sistema"],
  [/c[áa]lculo determin[íi]stico/gi, "motor de cálculo"],
  [/intelig[êe]ncia artificial/gi, "sistema inteligente"],
  [/artificial intelligence/gi, "smart system"],
  [/\bgerado por IA\b/gi, "gerado pelo NUTRION ENGINE"],
  [/\bIA\b/g, "o sistema"],
  [/\bA\.?I\.?\b/g, "o sistema"],
];

export function sanitizeClientText(input: unknown): string {
  let text = safeString(input);
  if (!text) return "";
  for (const [re, to] of REPLACEMENTS) text = text.replace(re, to);
  return text.replace(/\s{2,}/g, " ").trim();
}

/** Retorna null quando o texto não traz orientação real do coach. */
export function coachGuidanceText(input: unknown): string | null {
  const text = sanitizeClientText(input);
  if (!text) return null;
  const generic = /^plano gerado e validado pelo nutrion engine\.?$/i;
  if (generic.test(text)) return null;
  return text;
}
