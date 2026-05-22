// APEX — Constantes anatômicas corretas da coluna vertebral humana.
// A coluna humana vai de C1 a L5. NÃO existe L6/L7 e o processo
// espinhoso proeminente na base do pescoço é SEMPRE C7 (não C5).

export const SPINE_SEGMENTS = {
  CERVICAL: { inicio: "C1", fim: "C7", total: 7 },
  TORACICA: { inicio: "T1", fim: "T12", total: 12 },
  LOMBAR:   { inicio: "L1", fim: "L5", total: 5 },
  SACRAL:   { inicio: "S1", fim: "S5", total: 5 },
} as const;

// Landmarks vertebrais válidos do APEX Visual.
export const VALID_SPINE_LANDMARKS = ["C7", "L5"] as const;

/**
 * Valida referência anatômica. Retorna false e loga erro se o
 * código tentar usar C5/L6/L7/L8 (referências incorretas).
 */
export function validateSpineReference(ref: string): boolean {
  const invalid = ["C5", "L6", "L7", "L8"];
  if (invalid.includes(ref)) {
    // eslint-disable-next-line no-console
    console.error(
      `APEX: Referência anatômica inválida "${ref}". ` +
        `A coluna humana vai de C1 a L5. ` +
        `Use C7 (base do pescoço) ou L5 (lombossacra).`,
    );
    return false;
  }
  return true;
}
