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

/**
 * Modo de contagem de volume:
 * - "primary": apenas o músculo primário soma 1.0 série por set (recomendado, padrão científico).
 * - "synergy": primário soma 1.0 e cada secundário soma `synergyFactor` (default 0.5).
 */
export type VolumeCountMode = "primary" | "synergy";

export interface VolumeOptions {
  mode?: VolumeCountMode;
  synergyFactor?: number; // usado apenas em "synergy"
}

/** Soma as séries de trabalho de cada grupo muscular ao longo de toda a semana. */
export function aggregateWeeklyVolume(
  trainingDays: any[],
  options: VolumeOptions = {},
): Record<string, number> {
  const mode: VolumeCountMode = options.mode ?? "primary";
  const synergyFactor = options.synergyFactor ?? 0.5;
  const out: Record<string, number> = {};

  (trainingDays || []).forEach((day) => {
    (day.exercises || []).forEach((ex: any) => {
      const sets = countWorkingSets(ex);
      if (sets <= 0) return;

      // Primário
      const primaryRaw =
        ex.muscle_target ||
        ex.primaryMuscle ||
        (Array.isArray(ex.muscles) && ex.muscles.length ? ex.muscles[0] : null);
      if (!primaryRaw) return;
      const primaryCanons = new Set<string>();
      canonicalize(String(primaryRaw)).forEach((c) => primaryCanons.add(c));
      primaryCanons.forEach((c) => {
        out[c] = (out[c] || 0) + sets;
      });

      // Secundários (apenas em modo synergy)
      if (mode === "synergy") {
        const secondaryRaw: string[] = [];
        if (Array.isArray(ex.secondary_muscles)) secondaryRaw.push(...ex.secondary_muscles);
        if (Array.isArray(ex.muscles) && ex.muscles.length > 1) secondaryRaw.push(...ex.muscles.slice(1));
        const secCanons = new Set<string>();
        secondaryRaw.forEach((t) => canonicalize(String(t)).forEach((c) => secCanons.add(c)));
        // não dobra contagem se já estiver no primário
        primaryCanons.forEach((c) => secCanons.delete(c));
        secCanons.forEach((c) => {
          out[c] = (out[c] || 0) + sets * synergyFactor;
        });
      }
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
  options: VolumeOptions = {},
): MuscleVolumeReport[] {
  const actuals = aggregateWeeklyVolume(trainingDays, options);
  return (musclePriorities || []).map((mp) => {
    const prescribed = Number(mp.weekly_sets) || 0;
    const canons = canonicalize(mp.muscle);
    const rawActual = canons.reduce((sum, c) => sum + (actuals[c] || 0), 0);
    // arredondamento amigável (1 casa) para não exibir 7.5 como 7
    const actual = Math.round(rawActual * 10) / 10;
    // Tolerância ampliada: ok dentro de ±25% do prescrito.
    // Acima disso só vira "above" (vermelho) se ultrapassar +40%; entre +25% e +40% mostra amarelo (mild).
    let status: MuscleVolumeReport["status"] = "ok";
    let color = COLOR_OK;
    if (prescribed > 0) {
      if (actual > prescribed * 1.4) { status = "above"; color = COLOR_HIGH; }
      else if (actual > prescribed * 1.25) { status = "ok"; color = COLOR_LOW; }
      else if (actual < prescribed * 0.75) { status = "below"; color = COLOR_LOW; }
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
