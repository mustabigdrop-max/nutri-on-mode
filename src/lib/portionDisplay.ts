import { safeString } from "@/lib/utils";

export interface PortionInput {
  quantidade?: unknown;
  quantidade_g?: unknown;
}

export interface PortionParts {
  /** Texto principal exibido ao atleta (medida caseira quando existir). */
  primary: string;
  /** Referência técnica secundária (gramatura), quando fizer sentido exibir. */
  secondary: string | null;
}

/** true quando o texto é apenas uma gramatura/volume (ex.: "120 g", "200ml"). */
export const isGramsOnly = (value: unknown): boolean =>
  /^\d+(?:[.,]\d+)?\s*(g|gr|gramas|ml|kg|l)$/i.test(safeString(value).trim());

/**
 * Medida caseira é sempre o texto principal.
 * A gramatura técnica só aparece como referência secundária e nunca substitui
 * a medida caseira quando esta existir.
 */
export const portionParts = (a: PortionInput): PortionParts => {
  const caseira = safeString(a?.quantidade).trim();
  const gramas = safeString(a?.quantidade_g).trim();

  if (caseira && !isGramsOnly(caseira)) {
    const secondary = gramas && gramas.toLowerCase() !== caseira.toLowerCase() ? gramas : null;
    return { primary: caseira, secondary };
  }

  // Sem medida caseira real: a gramatura vira o principal (sem duplicar embaixo).
  return { primary: caseira || gramas, secondary: null };
};

/** Compatibilidade: apenas o texto principal. */
export const portionOf = (a: PortionInput): string => portionParts(a).primary;
