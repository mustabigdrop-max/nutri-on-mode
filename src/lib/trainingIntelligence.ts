/**
 * Inteligência do STRATUM — Fase 4
 * Detecção de platô (De-Output), cobertura stretch-loaded e validação de 48h.
 * Tudo derivado de dados reais (workout_logs + estrutura do protocolo). Nada é inventado.
 */

import type { WorkoutLogRow } from "@/lib/mesocyclePlan";

const norm = (s?: string | null) => String(s || "").trim().toLowerCase();

/* ─────────── Platô (De-Output) ─────────── */

export interface PlateauAlert {
  exerciseName: string;
  weeksStalled: number;
  bestKg: number;
  weeks: number[];
  ladder: string[];
}

export const INTERVENTION_LADDER = [
  "Trocar a variação do exercício",
  "Mudar a zona de repetições",
  "Adicionar técnica avançada",
  "Mini-descarga de uma semana",
  "Trocar a divisão de treino",
];

/**
 * Platô = 2 ou mais semanas consecutivas registradas sem aumento na melhor carga.
 * Ignora semanas de descarga informadas em `deloadWeeks`.
 */
export function detectPlateaus(logs: WorkoutLogRow[], deloadWeeks: number[] = []): PlateauAlert[] {
  const skip = new Set(deloadWeeks);
  const byExercise = new Map<string, { name: string; perWeek: Map<number, number> }>();

  for (const l of logs || []) {
    const name = String(l.exercise_name || "").trim();
    const week = Number(l.week_number);
    const kg = Number(l.top_set_kg);
    if (!name || !Number.isFinite(week) || week < 1 || !Number.isFinite(kg) || skip.has(week)) continue;
    const key = norm(name);
    if (!byExercise.has(key)) byExercise.set(key, { name, perWeek: new Map() });
    const entry = byExercise.get(key)!;
    entry.perWeek.set(week, Math.max(entry.perWeek.get(week) ?? 0, kg));
  }

  const alerts: PlateauAlert[] = [];
  byExercise.forEach(({ name, perWeek }) => {
    const weeks = Array.from(perWeek.keys()).sort((a, b) => a - b);
    if (weeks.length < 2) return;

    // conta a sequência final de semanas sem ganho de carga
    let stalledWeeks: number[] = [];
    for (let i = weeks.length - 1; i > 0; i--) {
      const cur = perWeek.get(weeks[i])!;
      const prev = perWeek.get(weeks[i - 1])!;
      if (cur <= prev) {
        if (!stalledWeeks.length) stalledWeeks = [weeks[i]];
        stalledWeeks.unshift(weeks[i - 1]);
      } else break;
    }
    // stalledWeeks inclui a semana base; 2+ semanas paradas = 3 pontos ou 2 iguais
    const weeksStalled = stalledWeeks.length ? stalledWeeks.length - 1 : 0;
    if (weeksStalled >= 2) {
      alerts.push({
        exerciseName: name,
        weeksStalled,
        bestKg: Math.max(...stalledWeeks.map((w) => perWeek.get(w)!)),
        weeks: stalledWeeks,
        ladder: INTERVENTION_LADDER,
      });
    }
  });

  return alerts.sort((a, b) => b.weeksStalled - a.weeksStalled);
}

/* ─────────── Stretch-loaded ─────────── */

const STRETCH_RE = /crucifixo inclinad|pullover|rosca inclinad|rosca (no )?banco scott|stiff|tr[íi]ceps franc[êe]s|tr[íi]ceps testa|elevação de panturrilha sentad|panturrilha sentad|cadeira flexora|mesa flexora|puxada (no )?pulley alta|desenvolvimento (com )?halter|agachamento b[úu]lgaro|leg press (profundo|amplitude)/i;

export const isStretchLoaded = (name: string) => STRETCH_RE.test(String(name || ""));

export interface StretchCoverage {
  hasStretchLoaded: boolean;
  matches: string[];
  suggestion: string | null;
}

/** Verifica se a sessão tem ao menos 1 exercício com ênfase na posição alongada. */
export function stretchCoverage(exercises: Array<{ name?: string; nome?: string }>): StretchCoverage {
  const names = (exercises || []).map((e) => String(e?.name ?? e?.nome ?? "").trim()).filter(Boolean);
  const matches = names.filter(isStretchLoaded);
  return {
    hasStretchLoaded: matches.length > 0,
    matches,
    suggestion: matches.length
      ? null
      : "Incluir 1 exercício com ênfase na posição alongada do músculo trabalhado nesta sessão.",
  };
}

/* ─────────── Validação de 48h ─────────── */

export interface RecoveryConflict {
  muscle: string;
  dayA: number;
  dayB: number;
  gapHours: number;
}

const MUSCLE_KEYS = [
  "peitoral", "dorsal", "costas", "b[íi]ceps", "tr[íi]ceps", "delt[óo]ides", "ombro",
  "quadr[íi]ceps", "posterior", "gl[úu]teo", "panturrilha", "abdome", "abd[óo]men", "trap[ée]zio",
];

const detectMuscles = (text: string): string[] => {
  const t = norm(text);
  const found = new Set<string>();
  MUSCLE_KEYS.forEach((k) => {
    if (new RegExp(k).test(t)) found.add(k.replace(/\[.*?\]/g, (m) => m[1]).replace(/[()?]/g, ""));
  });
  return Array.from(found);
};

/**
 * Checa se algum grupo muscular repete com menos de 48h entre sessões.
 * `days` seguem a ordem da semana (day_number 1..N, um treino por dia civil).
 */
export function validateRecovery48h(
  days: Array<{ day_number?: number | null; focus?: string | null; exercises?: Array<{ name?: string; nome?: string; muscle_target?: string | null }> }>
): RecoveryConflict[] {
  const map: Array<{ day: number; muscles: string[] }> = (days || []).map((d, i) => {
    const text = [
      d.focus || "",
      ...(d.exercises || []).map((e) => `${e?.name ?? e?.nome ?? ""} ${e?.muscle_target ?? ""}`),
    ].join(" ");
    return { day: Number(d.day_number) || i + 1, muscles: detectMuscles(text) };
  });

  const conflicts: RecoveryConflict[] = [];
  for (let i = 0; i < map.length; i++) {
    for (let j = i + 1; j < map.length; j++) {
      const gapDays = map[j].day - map[i].day;
      if (gapDays <= 0 || gapDays >= 2) continue; // 2 dias = 48h, ok
      map[i].muscles
        .filter((m) => map[j].muscles.includes(m))
        .forEach((muscle) => {
          conflicts.push({ muscle, dayA: map[i].day, dayB: map[j].day, gapHours: gapDays * 24 });
        });
    }
  }
  return conflicts;
}
