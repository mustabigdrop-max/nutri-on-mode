// Mesociclo genérico — gera o plano semanal para QUALQUER protocolo do TrainingON.
// Fase 1 do roadmap: progressão visível (semanas, RIR por fase, deload, aderência, delta de carga).
// Regras: RIR desce dentro de cada bloco (3 → 2 → 1), deload a cada 5ª semana com RIR alto.

import { WEEK_PLAN, WeekPhase, PhaseId } from "@/lib/weekProgression";

const COLORS: Record<PhaseId, { color: string; bg: string }> = {
  MEV: { color: "#60a5fa", bg: "rgba(96,165,250,0.12)" },
  "MEV+2": { color: "#60a5fa", bg: "rgba(96,165,250,0.12)" },
  MAV: { color: "#4ade80", bg: "rgba(74,222,128,0.12)" },
  "MAV+2": { color: "#4ade80", bg: "rgba(74,222,128,0.12)" },
  MRV: { color: "#fb923c", bg: "rgba(251,146,60,0.12)" },
  "MRV+2": { color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
  DELOAD: { color: "#94a3b8", bg: "rgba(148,163,184,0.12)" },
  TRANSICAO: { color: "#a78bfa", bg: "rgba(167,139,250,0.12)" },
};

/** Semanas de deload: a cada 5ª semana; blocos curtos (<5) não têm deload interno. */
export function deloadWeeks(totalWeeks: number): number[] {
  const out: number[] = [];
  for (let w = 5; w <= totalWeeks; w += 5) out.push(w);
  return out;
}

const RAMP: { phase: PhaseId; rpe: number; rir: number; setsAdd: number }[] = [
  { phase: "MEV", rpe: 7, rir: 3, setsAdd: 0 },
  { phase: "MEV+2", rpe: 7.5, rir: 2.5, setsAdd: 1 },
  { phase: "MAV", rpe: 8, rir: 2, setsAdd: 2 },
  { phase: "MAV+2", rpe: 8.5, rir: 1.5, setsAdd: 3 },
  { phase: "MRV", rpe: 9, rir: 1, setsAdd: 4 },
];

/**
 * Plano semanal genérico. Se o protocolo for o Mello Bulking de 16 semanas,
 * mantém o plano oficial já existente (WEEK_PLAN).
 */
export function buildWeekPlan(totalWeeksRaw: number | string | undefined, phaseLabel?: string): WeekPhase[] {
  const totalWeeks = Math.min(52, Math.max(1, parseInt(String(totalWeeksRaw ?? 8)) || 8));
  const isMello16 = totalWeeks === 16 && String(phaseLabel || "").toLowerCase().includes("bulk");
  if (isMello16) return WEEK_PLAN;

  const deloads = new Set(deloadWeeks(totalWeeks));
  const plan: WeekPhase[] = [];
  let rampIndex = 0;

  for (let week = 1; week <= totalWeeks; week++) {
    if (deloads.has(week)) {
      plan.push({
        week,
        phase: "DELOAD",
        label: "DELOAD",
        rpe: 6,
        rir: null,
        setsAdd: 0,
        isDeload: true,
        ...COLORS.DELOAD,
        note: "Volume reduzido, sem falha. Foco em técnica, mobilidade e recuperação.",
      });
      rampIndex = 0;
      continue;
    }
    const isLast = week === totalWeeks;
    const step = RAMP[Math.min(rampIndex, RAMP.length - 1)];
    rampIndex++;
    plan.push({
      week,
      phase: isLast && totalWeeks > 4 ? "TRANSICAO" : step.phase,
      label: isLast && totalWeeks > 4 ? `TRANSIÇÃO | RPE ${step.rpe}` : `${step.phase} | RPE ${step.rpe}`,
      rpe: step.rpe,
      rir: step.rir,
      setsAdd: step.setsAdd,
      isDeload: false,
      isTransition: isLast && totalWeeks > 4,
      ...(isLast && totalWeeks > 4 ? COLORS.TRANSICAO : COLORS[step.phase]),
      note: isLast && totalWeeks > 4 ? "Última semana — avaliar adaptações e planejar o próximo mesociclo." : undefined,
    });
  }
  return plan;
}

/** Blocos visuais (mesociclos) delimitados pelos deloads. */
export function mesocycleBlocks(plan: WeekPhase[]): { label: string; weeks: number[] }[] {
  const blocks: { label: string; weeks: number[] }[] = [];
  let current: number[] = [];
  plan.forEach((wp) => {
    current.push(wp.week);
    if (wp.isDeload) {
      blocks.push({ label: `Mesociclo ${blocks.length + 1}`, weeks: current });
      current = [];
    }
  });
  if (current.length) blocks.push({ label: `Mesociclo ${blocks.length + 1}`, weeks: current });
  return blocks;
}

/* ───────────────── Progressão real (workout_logs) ───────────────── */

export interface WorkoutLogRow {
  week_number?: number | null;
  day_number?: number | null;
  exercise_name?: string | null;
  top_set_kg?: number | null;
  rpe_felt?: number | null;
}

export interface WeekStats {
  week: number;
  logs: number;
  avgTop: number | null;
  avgRpe: number | null;
  days: number;
}

const norm = (s?: string | null) => String(s || "").trim().toLowerCase();

export function weekStats(logs: WorkoutLogRow[]): Record<number, WeekStats> {
  const acc: Record<number, { tops: number[]; rpes: number[]; logs: number; days: Set<number> }> = {};
  for (const l of logs || []) {
    const w = Number(l.week_number);
    if (!Number.isFinite(w) || w < 1) continue;
    acc[w] = acc[w] || { tops: [], rpes: [], logs: 0, days: new Set<number>() };
    acc[w].logs++;
    if (typeof l.top_set_kg === "number") acc[w].tops.push(l.top_set_kg);
    if (typeof l.rpe_felt === "number") acc[w].rpes.push(l.rpe_felt);
    const d = Number(l.day_number);
    if (Number.isFinite(d) && d > 0) acc[w].days.add(d);
  }
  const avg = (arr: number[]) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null);
  const out: Record<number, WeekStats> = {};
  Object.entries(acc).forEach(([w, v]) => {
    out[Number(w)] = { week: Number(w), logs: v.logs, avgTop: avg(v.tops), avgRpe: avg(v.rpes), days: v.days.size };
  });
  return out;
}

export type WeekStatus = "concluida" | "parcial" | "ativa" | "futura" | "deload";

export function weekStatus(wp: WeekPhase, stats: WeekStats | undefined, currentWeek: number, daysPerWeek: number): WeekStatus {
  const done = stats?.days || 0;
  if (done > 0 && done >= daysPerWeek) return "concluida";
  if (done > 0) return "parcial";
  if (wp.isDeload) return "deload";
  if (wp.week === currentWeek) return "ativa";
  return wp.week < currentWeek ? "parcial" : "futura";
}

/** Delta de carga do exercício entre a semana atual e a última semana registrada anterior. */
export interface LoadDelta {
  previousWeek: number;
  previousKg: number;
  currentKg: number;
  deltaKg: number;
}

export function loadDelta(logs: WorkoutLogRow[], exerciseName: string, week: number): LoadDelta | null {
  const target = norm(exerciseName);
  const rows = (logs || []).filter(
    (l) => norm(l.exercise_name) === target && typeof l.top_set_kg === "number" && Number(l.week_number) >= 1
  );
  if (!rows.length) return null;
  const bestOf = (w: number) => {
    const kgs = rows.filter((r) => Number(r.week_number) === w).map((r) => Number(r.top_set_kg));
    return kgs.length ? Math.max(...kgs) : null;
  };
  const currentKg = bestOf(week);
  if (currentKg === null) return null;
  const prevWeeks = Array.from(new Set(rows.map((r) => Number(r.week_number))))
    .filter((w) => w < week)
    .sort((a, b) => b - a);
  for (const w of prevWeeks) {
    const prev = bestOf(w);
    if (prev !== null) {
      return { previousWeek: w, previousKg: prev, currentKg, deltaKg: Math.round((currentKg - prev) * 10) / 10 };
    }
  }
  return null;
}

/** Progresso geral do mesociclo: sessões registradas / sessões programadas. */
export function mesocycleProgress(logs: WorkoutLogRow[], totalWeeks: number, daysPerWeek: number) {
  const stats = weekStats(logs);
  const planned = Math.max(1, totalWeeks * Math.max(1, daysPerWeek));
  const doneSessions = Object.values(stats).reduce((acc, s) => acc + Math.min(s.days, Math.max(1, daysPerWeek)), 0);
  const pct = Math.min(100, Math.round((doneSessions / planned) * 100));
  return { pct, doneSessions, planned, stats };
}

/** Aderência (%) de uma semana: dias registrados / dias programados. */
export function weekAdherence(stats: WeekStats | undefined, daysPerWeek: number): number {
  if (!stats || daysPerWeek <= 0) return 0;
  return Math.min(100, Math.round((stats.days / daysPerWeek) * 100));
}

/** RIR alvo por fase da semana (compostos ficam mais conservadores que isoladores). */
export function rirForWeek(wp: WeekPhase | null | undefined, kind: "composto" | "isolador" = "composto"): number {
  if (!wp) return 2;
  if (wp.isDeload) return 4;
  const base = typeof wp.rir === "number" ? wp.rir : 2;
  const value = kind === "isolador" ? base - 1 : base;
  return Math.max(0, Math.min(4, Math.round(value)));
}
