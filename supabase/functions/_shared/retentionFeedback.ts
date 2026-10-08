export const FEEDBACK_LIMITS = { minVideosForPattern: 3 };
export type PredictedBlock = { id: number; tempo: string; previsto: number };
export type RealPoint = { segundo: number; audiencia: number };
export type PatternTag = { chave: string; tipo: "gancho" | "estimulo" | "loop" | "queda"; descricao: string };
export const PROFILE_FIELD: Record<PatternTag["tipo"], string> = {
  gancho: "ganchos_que_retiveram_mais", estimulo: "estimulos_que_seguraram",
  loop: "loops_que_funcionaram", queda: "o_que_derrubou_retencao",
};

export function parseRange(tempo: string): [number, number] | null {
  const m = tempo.trim().match(/^(\d+(?:\.\d+)?)\s*[-–]\s*(\d+(?:\.\d+)?)\s*s?$/);
  if (!m) return null;
  const a = Number(m[1]), b = Number(m[2]);
  return b > a ? [a, b] : null;
}

/** Linear interpolation of audience % at second t; null outside measured range. */
export function audienceAt(points: RealPoint[], t: number): number | null {
  const p = [...points].sort((x, y) => x.segundo - y.segundo);
  if (!p.length || t < p[0].segundo || t > p[p.length - 1].segundo) return null;
  for (let i = 0; i < p.length; i++) {
    if (p[i].segundo === t) return p[i].audiencia;
    if (p[i].segundo > t) {
      const a = p[i - 1], b = p[i];
      return a.audiencia + (b.audiencia - a.audiencia) * (t - a.segundo) / (b.segundo - a.segundo);
    }
  }
  return null;
}

/** Real 0-10 = share of the audience present at block start still present at block end. */
export function alignBlocks(blocks: PredictedBlock[], points: RealPoint[]) {
  return blocks.map(b => {
    const r = parseRange(b.tempo);
    const start = r ? audienceAt(points, r[0]) : null;
    const end = r ? audienceAt(points, r[1]) : null;
    const real = start && end !== null ? Math.round(Math.min(10, (end / start) * 10) * 10) / 10 : null;
    return { bloco: b.id, previsto: b.previsto, real, erro: real === null ? null : Math.round((real - b.previsto) * 10) / 10 };
  });
}

export function biggestDrop(blocks: PredictedBlock[], points: RealPoint[]) {
  const p = [...points].sort((x, y) => x.segundo - y.segundo);
  let best: { segundo: number; queda: number } | null = null;
  for (let i = 1; i < p.length; i++) {
    const span = p[i].segundo - p[i - 1].segundo;
    if (span <= 0) continue;
    const queda = p[i - 1].audiencia - p[i].audiencia;
    if (queda > 0 && (!best || queda > best.queda)) best = { segundo: p[i - 1].segundo, queda };
  }
  if (!best) return null;
  const owner = blocks.find(b => { const r = parseRange(b.tempo); return r && best!.segundo >= r[0] && best!.segundo < r[1]; });
  return { segundo: best.segundo, bloco: owner?.id ?? 0, queda_pontos: Math.round(best.queda * 10) / 10 };
}

/** Counts each key once per video; only ≥3 distinct videos become a confirmed pattern. */
export function classifyPatterns(current: PatternTag[], previousKeysPerVideo: string[][]) {
  const confirmed: (PatternTag & { videos: number })[] = [];
  const hints: (PatternTag & { videos: number })[] = [];
  const seen = new Set<string>();
  for (const tag of current) {
    if (seen.has(tag.chave)) continue;
    seen.add(tag.chave);
    const videos = 1 + previousKeysPerVideo.filter(keys => keys.includes(tag.chave)).length;
    (videos >= FEEDBACK_LIMITS.minVideosForPattern ? confirmed : hints).push({ ...tag, videos });
  }
  return { confirmed, hints };
}

export function mergeProfile(profile: Record<string, unknown>, confirmed: PatternTag[]) {
  const next = { ...profile };
  for (const tag of confirmed) {
    const field = PROFILE_FIELD[tag.tipo];
    const list = Array.isArray(next[field]) ? (next[field] as unknown[]).filter((v): v is string => typeof v === "string")
      : typeof next[field] === "string" ? [next[field] as string] : [];
    if (!list.includes(tag.descricao)) list.unshift(tag.descricao);
    next[field] = list.slice(0, 20);
  }
  return next;
}
