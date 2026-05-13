// Helpers para validar volume semanal prescrito vs realizado no protocolo do TrainingON.

const toInt = (v: any): number => {
  if (v == null) return 0;
  const m = String(v).match(/\d+/);
  return m ? parseInt(m[0], 10) : 0;
};

/** Conta as séries de TRABALHO de um exercício (top + backoff + work; ignora feeders/aquecimento). */
export function countWorkingSets(ex: any): number {
  if (!ex) return 0;
  // Atalhos legados (sets soltos)
  if (ex.sets && !ex.structure) return toInt(ex.sets);
  const s = ex.structure || {};
  let total = 0;
  if (s.top_set) total += toInt(s.top_set.sets);
  if (s.backoff_sets) total += toInt(s.backoff_sets.sets);
  if (s.work_sets) total += toInt(s.work_sets.sets);
  return total;
}

/** Normaliza nome de músculo para matching tolerante (case/acento/parênteses). */
const norm = (s: string) =>
  (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\(.*?\)/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

/**
 * Mapa de sinônimos → grupo canônico.
 * Permite que "deltoide anterior", "ombro", "deltóides posteriores" todos
 * contem para "deltoides", e que "dorsal", "latíssimo", "trapézio" contem
 * para "costas", etc.
 */
const SYNONYMS: Array<{ canon: string; tokens: string[] }> = [
  { canon: "deltoides", tokens: ["deltoide", "deltoides", "ombro", "ombros"] },
  { canon: "costas", tokens: ["costas", "dorsal", "dorsais", "latissimo", "trapezio", "trapezios", "romboide", "romboides", "lats"] },
  { canon: "biceps", tokens: ["biceps", "braquial", "braquiorradial"] },
  { canon: "triceps", tokens: ["triceps"] },
  { canon: "peito", tokens: ["peito", "peitoral", "peitorais"] },
  { canon: "quadriceps", tokens: ["quadriceps", "quadricipital", "vasto", "reto femoral"] },
  { canon: "gluteos", tokens: ["gluteo", "gluteos"] },
  { canon: "posteriordecoxa", tokens: ["posterior", "isquiotibiais", "isquios", "femoral", "biceps femoral", "hamstring", "hamstrings"] },
  { canon: "panturrilha", tokens: ["panturrilha", "panturrilhas", "gastrocnemio", "soleo"] },
  { canon: "abdomenobliquos", tokens: ["abdomen", "abdominal", "abdominais", "obliquo", "obliquos", "core"] },
  { canon: "lombar", tokens: ["lombar", "lombares", "eretor", "eretores"] },
  { canon: "antebraco", tokens: ["antebraco", "antebracos"] },
];

/** Reduz qualquer nome de grupo muscular a uma chave canônica (ou ao próprio nome se desconhecido). */
function canonicalize(raw: string): string[] {
  const n = norm(raw);
  if (!n) return [];
  const matches = new Set<string>();
  for (const { canon, tokens } of SYNONYMS) {
    if (tokens.some((t) => n.includes(t.replace(/\s+/g, "")))) matches.add(canon);
  }
  if (matches.size === 0) matches.add(n.replace(/\s+/g, ""));
  return Array.from(matches);
}

/** Soma as séries de trabalho de cada grupo muscular ao longo de toda a semana. */
export function aggregateWeeklyVolume(trainingDays: any[]): Record<string, number> {
  const out: Record<string, number> = {};
  (trainingDays || []).forEach((day) => {
    (day.exercises || []).forEach((ex: any) => {
      const targets: string[] = [];
      if (ex.muscle_target) targets.push(ex.muscle_target);
      if (ex.primaryMuscle) targets.push(ex.primaryMuscle);
      if (Array.isArray(ex.muscles)) targets.push(...ex.muscles);
      if (Array.isArray(ex.secondary_muscles)) targets.push(...ex.secondary_muscles);
      if (targets.length === 0) return;
      const sets = countWorkingSets(ex);
      if (sets <= 0) return;
      const canons = new Set<string>();
      targets.forEach((t) => canonicalize(String(t)).forEach((c) => canons.add(c)));
      canons.forEach((c) => {
        out[c] = (out[c] || 0) + sets;
      });
    });
  });
  return out;
}

export interface MuscleVolumeReport {
  muscle: string;
  prescribed: number;
  actual: number;
  status: "below" | "ok" | "above";
  /** cor pronta para uso na UI */
  color: string;
}

const COLOR_OK = "#00E676";
const COLOR_LOW = "#FFB300";
const COLOR_HIGH = "#FF3366";

export function buildVolumeReport(
  musclePriorities: Array<{ muscle: string; weekly_sets: number }>,
  trainingDays: any[],
): MuscleVolumeReport[] {
  const actuals = aggregateWeeklyVolume(trainingDays);
  return (musclePriorities || []).map((mp) => {
    const prescribed = Number(mp.weekly_sets) || 0;
    const actual = actuals[norm(mp.muscle)] || 0;
    let status: MuscleVolumeReport["status"] = "ok";
    let color = COLOR_OK;
    if (prescribed > 0) {
      if (actual > prescribed * 1.1) { status = "above"; color = COLOR_HIGH; }
      else if (actual < prescribed * 0.9) { status = "below"; color = COLOR_LOW; }
    }
    return { muscle: mp.muscle, prescribed, actual, status, color };
  });
}

/** Detecta inconsistência GVT: método com 10 séries/exercício mas volume prescrito baixo. */
export function detectGvtMismatch(
  systemId: string | undefined,
  musclePriorities: Array<{ muscle: string; weekly_sets: number }>,
): string[] {
  if (!systemId) return [];
  const isGvt = /gvt|german/i.test(systemId);
  if (!isGvt) return [];
  return (musclePriorities || [])
    .filter((mp) => Number(mp.weekly_sets) < 14)
    .map(
      (mp) =>
        `Volume de ${mp.muscle} (${mp.weekly_sets} sér/sem) pode ser insuficiente para GVT (10 sér/exercício). Considere ≥14 sér/sem ou trocar o método para este grupo.`,
    );
}
