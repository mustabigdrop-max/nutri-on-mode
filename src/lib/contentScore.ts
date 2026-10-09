// PROMPT Q1 Parte 6/7 — Content Score real a partir de retention_results (sem modelo, sem amostra inventada).
export type Comp = "gancho" | "retencao" | "acao" | "seguidor";
export const COMP_LABEL: Record<Comp, string> = { gancho: "Gancho", retencao: "Retenção", acao: "Ação", seguidor: "Seguidor" };
export const PESOS_PADRAO: Record<Comp, number> = { gancho: 30, retencao: 35, acao: 20, seguidor: 15 };
export const MIN_REELS = 5, JANELA = 20, MIN_CORRELACAO = 8;

const n = (v: unknown) => { const x = Number(v); return v == null || v === "" || !Number.isFinite(x) ? null : x; };

/** Parses "Gancho 30\nRetenção 35..." from Instruções do Motor; missing lines keep the default. */
export function parsePesos(txt?: string | null): Record<Comp, number> {
  const out = { ...PESOS_PADRAO };
  const map: Record<string, Comp> = { gancho: "gancho", retencao: "retencao", acao: "acao", seguidor: "seguidor" };
  for (const line of String(txt ?? "").split("\n")) {
    const m = line.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").match(/^\s*(gancho|retencao|acao|seguidor)\D*(\d+(?:[.,]\d+)?)/);
    if (m) out[map[m[1]]] = Number(m[2].replace(",", "."));
  }
  return out;
}

/** Raw component values of one result row; null when a field is empty. */
export function valores(r: any): Record<Comp, number | null> {
  const views = n(r?.views);
  const shares = n(r?.shares), saves = n(r?.salvamentos), seg = n(r?.novos_seguidores);
  return {
    gancho: n(r?.pct_3s),
    retencao: n(r?.ret_media_pct),
    acao: views && views > 0 && (shares != null || saves != null) ? ((shares ?? 0) + (saves ?? 0)) / views : null,
    seguidor: views && views > 0 && seg != null ? (seg / views) * 1000 : null,
  };
}

/** Percentile (0-100) of x within values, mid-rank for ties. */
export function percentil(x: number, values: number[]): number {
  if (!values.length) return 0;
  const below = values.filter(v => v < x).length, eq = values.filter(v => v === x).length;
  return Math.round(((below + eq / 2) / values.length) * 100);
}

export type ScoreReel = { id: string; script_id: string; score: number | null; usados: Comp[]; pct: Record<Comp, number | null>; val: Record<Comp, number | null> };

/** Scores the last 20 posted results; needs at least 5. Weights renormalize over the components present. */
export function contentScores(results: any[], pesos: Record<Comp, number> = PESOS_PADRAO) {
  const lanc = results.filter(r => (r.status ?? "lancado") === "lancado")
    .sort((a, b) => +new Date(b.postado_em ?? b.created_at) - +new Date(a.postado_em ?? a.created_at)).slice(0, JANELA);
  const rows = lanc.map(r => ({ r, v: valores(r) }));
  const comps: Comp[] = ["gancho", "retencao", "acao", "seguidor"];
  const pool = Object.fromEntries(comps.map(c => [c, rows.map(x => x.v[c]).filter((v): v is number => v != null)])) as Record<Comp, number[]>;
  const reels: ScoreReel[] = rows.map(({ r, v }) => {
    const pct = Object.fromEntries(comps.map(c => [c, v[c] == null ? null : percentil(v[c]!, pool[c])])) as Record<Comp, number | null>;
    const usados = comps.filter(c => pct[c] != null && pesos[c] > 0);
    const w = usados.reduce((s, c) => s + pesos[c], 0);
    const score = w > 0 ? Math.round(usados.reduce((s, c) => s + pct[c]! * pesos[c], 0) / w) : null;
    return { id: r.id, script_id: r.script_id, score, usados, pct, val: v };
  });
  const comResultado = reels.filter(x => x.score != null);
  const pronto = comResultado.length >= MIN_REELS;
  const ultimo = pronto ? comResultado[0] : null;
  const ord = comResultado.map(x => x.score!).sort((a, b) => a - b);
  const mediana = ord.length ? (ord.length % 2 ? ord[(ord.length - 1) / 2] : Math.round((ord[ord.length / 2 - 1] + ord[ord.length / 2]) / 2)) : null;
  const fraco = ultimo ? ([...ultimo.usados].sort((a, b) => ultimo.pct[a]! - ultimo.pct[b]!)[0] ?? null) : null;
  return { pronto, n: comResultado.length, ultimo, mediana, delta: ultimo && mediana != null ? ultimo.score! - mediana : null, fraco, reels };
}

export const corScore = (s: number | null) => s == null ? null : s < 40 ? "vermelho" : s < 70 ? "ambar" : "ciano";

/** Spearman rank correlation with average ranks for ties. */
export function spearman(pairs: [number, number][]): number | null {
  if (pairs.length < 2) return null;
  const rank = (a: number[]) => { const idx = a.map((v, i) => [v, i]).sort((x, y) => x[0] - y[0]); const r = new Array(a.length);
    for (let i = 0; i < idx.length;) { let j = i; while (j + 1 < idx.length && idx[j + 1][0] === idx[i][0]) j++; for (let k = i; k <= j; k++) r[idx[k][1]] = (i + j) / 2 + 1; i = j + 1; } return r as number[]; };
  const rx = rank(pairs.map(p => p[0])), ry = rank(pairs.map(p => p[1]));
  const mx = rx.reduce((a, b) => a + b, 0) / rx.length, my = ry.reduce((a, b) => a + b, 0) / ry.length;
  let num = 0, dx = 0, dy = 0;
  for (let i = 0; i < rx.length; i++) { num += (rx[i] - mx) * (ry[i] - my); dx += (rx[i] - mx) ** 2; dy += (ry[i] - my) ** 2; }
  return dx && dy ? Math.round((num / Math.sqrt(dx * dy)) * 100) / 100 : null;
}

/** Ready-to-record: gate passed (aprovado/elite), not recorded, and with verified source when it states a finding. */
export const prontoParaGravar = (s: any) => (s.status_qualidade === "aprovado" || s.status_qualidade === "elite") && !s.gravado_em
  && (s.tipo_afirmacao !== "achado_cientifico" || s.fonte_status === "verificada");
export const ehRascunho = (s: any) => s.status_qualidade === "rascunho" || s.status_qualidade === "precisa_revisao";
