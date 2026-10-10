// PROMPT Q2 — Revalidar Banco: cost estimate and reference-reel counts (pure).
/** Per reel: Verificador (code) + Crítico 1 + Crítico 2 = 3 calls; each Revisor round adds 1 + 2 critics (+1 if inflation). Max 2 rounds. */
export const POR_REEL_MIN = 2 + 1, POR_REEL_MAX = 3 + 2 * 4;
export const custoRevalidacao = (n: number) => ({ min: n * POR_REEL_MIN, max: n * POR_REEL_MAX, porReelMax: POR_REEL_MAX });

export function contarPilares(rows: { slug?: string | null }[]) {
  const p1 = new Set(rows.map(r => r.slug ?? "").filter(s => /^p1-/.test(s)));
  const p2 = new Set(rows.map(r => r.slug ?? "").filter(s => /^p2-/.test(s)));
  return { p1: p1.size, p2: p2.size, p1Slugs: [...p1] };
}
