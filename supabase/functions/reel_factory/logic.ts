// Pure rules for the Reel Factory (tested in logic_test.ts).

export const EXPLORE_SHARE = 0.2;

/** Formula slots for a batch: 80% weighted by measured 3s retention, 20% exploring untested (or least-used) formulas. */
export function allocateFormulas(n: number, allIds: number[], stats: { formula_id: number; usos: number; retencao_3s_media: number | null }[]): number[] {
  const measured = stats.filter(s => s.usos > 0 && s.retencao_3s_media != null && allIds.includes(s.formula_id));
  if (!measured.length) return Array.from({ length: n }, (_, i) => allIds[i % allIds.length]);
  const untested = allIds.filter(id => !measured.some(m => m.formula_id === id));
  const explorePool = untested.length ? untested : [...measured].sort((a, b) => a.usos - b.usos).slice(0, 3).map(m => m.formula_id);
  const nExplore = Math.round(n * EXPLORE_SHARE);
  const nExploit = n - nExplore;
  const total = measured.reduce((s, m) => s + Number(m.retencao_3s_media), 0) || 1;
  const exploit: number[] = [];
  const ranked = [...measured].sort((a, b) => Number(b.retencao_3s_media) - Number(a.retencao_3s_media));
  for (const m of ranked) {
    const k = Math.round((Number(m.retencao_3s_media) / total) * nExploit);
    for (let i = 0; i < k && exploit.length < nExploit; i++) exploit.push(m.formula_id);
  }
  while (exploit.length < nExploit) exploit.push(ranked[exploit.length % ranked.length].formula_id);
  const explore = Array.from({ length: nExplore }, (_, i) => explorePool[i % explorePool.length]);
  // interleave so every chunk mixes exploration
  const out: number[] = [];
  const step = nExplore ? Math.max(1, Math.floor(n / nExplore)) : n + 1;
  let e = 0, x = 0;
  for (let i = 0; i < n; i++) out.push((i + 1) % step === 0 && e < explore.length ? explore[e++] : exploit[x++] ?? explore[e++]);
  return out;
}

export const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
const words = (s: string) => new Set(norm(s).split(" ").filter(w => w.length > 2));
export function jaccard(a: string, b: string) {
  const A = words(a), B = words(b);
  if (!A.size || !B.size) return 0;
  let i = 0; for (const w of A) if (B.has(w)) i++;
  return i / (A.size + B.size - i);
}

const GREETING = /^(oi|ola|fala pessoal|fala galera|fala ai|e ai|bom dia|boa tarde|boa noite|hoje eu vou|nesse video|neste video|voce sabia)\b/;
/** Pre-filter before the Critic. Returns the discard reason or null. */
export function preFilter(firstLine: string, loops: unknown): string | null {
  if (GREETING.test(norm(firstLine))) return "Abertura com saudação ou aquecimento.";
  if (!Array.isArray(loops) || !loops.filter(l => typeof l === "string" ? l.trim() : l).length) return "Nenhum loop aberto na estrutura.";
  return null;
}

export type Prior = { tema: string; abertura: string; formula_id: number | null; funcoes: string };
export const OPENING_SIMILAR = 0.6;
/** Originality filter against this batch and the last 30 days. Returns the discard reason or null. */
export function originality(cand: Prior, priors: Prior[]): string | null {
  for (const p of priors) {
    if (cand.abertura && p.abertura && jaccard(cand.abertura, p.abertura) >= OPENING_SIMILAR) return `Abertura parecida com "${p.tema}".`;
    if (cand.formula_id != null && cand.formula_id === p.formula_id && cand.funcoes && cand.funcoes === p.funcoes) return `Estrutura igual a "${p.tema}".`;
  }
  return null;
}

/** Theme dedup: returns the indexes to keep. */
export function dedupThemes(temas: string[], previous: string[]): { keep: boolean; motivo?: string }[] {
  const seen = previous.map(norm);
  return temas.map(t => {
    const n = norm(t);
    if (!n) return { keep: false, motivo: "Tema vazio." };
    const dup = seen.find(s => s === n || jaccard(s, n) >= 0.75);
    if (dup) return { keep: false, motivo: "Tema repetido." };
    seen.push(n);
    return { keep: true };
  });
}

/** Request-count estimate shown before running: ideation + Architect + Writer per idea + Critic (+1 rewrite & re-critic for ~half). */
export const estimateCalls = (n: number) => 1 + n * 2 + Math.ceil(n * 0.8) + Math.ceil(n * 0.8 * 0.5) * 2;

// ---------- Content matrix (pillars x angles) ----------
export type Pillar = { chave: string | null; nome: string; publico: string; qtd_diaria: number; objetivo: string[]; mecanismo: string; exige_caso_real: boolean; ativo: boolean };
export const REDISTRIBUTE_TO = ["comportamento", "mitos", "profissionais"];
export const ANGLE_MAX_SHARE = 0.3;
export const MIN_ANGLES = 5;

/** Largest-remainder apportionment of n slots by weight. */
function apportion(n: number, weights: number[]): number[] {
  const tot = weights.reduce((a, b) => a + b, 0);
  if (!tot || n <= 0) return weights.map(() => 0);
  const raw = weights.map(w => (w / tot) * n);
  const out = raw.map(Math.floor);
  const order = raw.map((r, i) => [r - Math.floor(r), i]).sort((a, b) => b[0] - a[0]);
  for (let k = 0; out.reduce((a, b) => a + b, 0) < n; k++) out[order[k % order.length][1]]++;
  return out;
}

/** Effective daily quantity per pillar: inactive -> 0; a pillar needing a real case with none registered gives its share to comportamento/mitos/profissionais. */
export function effectiveQuotas(pillars: Pillar[], hasRealCase: boolean): number[] {
  const q = pillars.map(p => (p.ativo ? Math.max(0, p.qtd_diaria) : 0));
  pillars.forEach((p, i) => {
    if (!p.exige_caso_real || hasRealCase || !q[i]) return;
    const targets = pillars.map((t, j) => (t.ativo && t.chave && REDISTRIBUTE_TO.includes(t.chave) ? j : -1)).filter(j => j >= 0);
    const share = apportion(q[i], targets.map(() => 1));
    targets.forEach((j, k) => (q[j] += share[k]));
    q[i] = 0;
  });
  return q;
}

/** Pillar index per slot: 80% follows quota x measured retention, 20% follows the plain quota (exploration). */
export function allocatePillars(n: number, pillars: Pillar[], hasRealCase: boolean, perf: Record<string, number | null> = {}): number[] {
  const q = effectiveQuotas(pillars, hasRealCase);
  const measured = pillars.map(p => perf[p.nome]).filter((v): v is number => v != null);
  const max = measured.length ? Math.max(...measured) || 1 : 1;
  const nExplore = measured.length ? Math.round(n * EXPLORE_SHARE) : 0;
  const exploit = apportion(n - nExplore, q.map((w, i) => (perf[pillars[i].nome] != null ? w * (0.5 + Number(perf[pillars[i].nome]) / max) : w)));
  const explore = apportion(nExplore, q);
  const counts = exploit.map((c, i) => c + explore[i]);
  const out: number[] = [];
  // interleave pillars so every chunk mixes them
  while (out.length < n && counts.some(c => c > 0)) counts.forEach((c, i) => { if (c > 0 && out.length < n) { out.push(i); counts[i]--; } });
  return out;
}

/** Angles for k slots of one pillar: >= min(5,k) distinct, none above 30% (min 1), ~20% on angles never measured for this pillar. */
export function assignAngles(k: number, angles: string[], comboPerf: Record<string, number | null> = {}): string[] {
  if (k <= 0 || !angles.length) return [];
  const cap = Math.max(1, Math.floor(k * ANGLE_MAX_SHARE));
  const untested = angles.filter(a => comboPerf[a] == null);
  const ranked = [...angles].sort((a, b) => (comboPerf[b] ?? -1) - (comboPerf[a] ?? -1));
  const used: Record<string, number> = {};
  const out: string[] = [];
  const take = (a: string) => { if ((used[a] ?? 0) >= cap) return false; used[a] = (used[a] ?? 0) + 1; out.push(a); return true; };
  const nExplore = untested.length && untested.length < angles.length ? Math.max(1, Math.round(k * EXPLORE_SHARE)) : 0;
  for (let i = 0; i < nExplore && out.length < k; i++) take(untested[i % untested.length]);
  // distinct floor first
  for (const a of ranked) { if (Object.keys(used).length >= Math.min(MIN_ANGLES, k, angles.length) || out.length >= k) break; if (!used[a]) take(a); }
  // fill by rank up to the cap
  let guard = 0;
  while (out.length < k && guard++ < k * angles.length) for (const a of ranked) { if (out.length >= k) break; take(a); }
  return out;
}
