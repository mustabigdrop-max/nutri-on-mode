/**
 * Distribuição de fadiga em escala de trabalho (3x1, 4x2, 6x1, custom).
 * Classifica cada dia de treino (PESADO/MODERADO/LEVE) pela carga sistêmica,
 * impede dois PESADOS seguidos no mesmo bloco e reduz o volume da véspera da folga.
 * Também monta o conteúdo do dia de folga conforme o tipo escolhido pelo coach.
 */
import type { CycleDay } from "./trainingCycle";

export type FatigueLevel = "PESADO" | "MODERADO" | "LEVE";
export type RestType = "total" | "recuperacao_ativa" | "sessao_leve";
export type NivelCliente = "iniciante" | "intermediario" | "avancado";
export type ObjetivoCliente = "hipertrofia" | "grupo_prioritario" | "forca_hipertrofia" | "definicao";

export const REST_TYPE_LABEL: Record<RestType, string> = {
  total: "Folga total",
  recuperacao_ativa: "Recuperação ativa",
  sessao_leve: "Sessão leve complementar",
};

export type FatigueExercise = { name: string; muscle?: string; sets: number };
export type FatigueWorkout = { title: string; muscleTags: string[]; exercises: FatigueExercise[] };

const norm = (s: string) => (s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
const LARGE = ["costa", "dorsal", "remada", "puxada", "perna", "quadr", "posterior", "glute", "agach", "leg press", "stiff", "terra", "peit", "supino"];
const SMALL = ["bicep", "rosca", "tricep", "panturr", "abdom", "core", "antebra", "elevacao lateral"];

/** Peso sistêmico do exercício: grupo grande 1.5, pequeno 0.7, demais 1. */
export function muscleWeight(text: string): number {
  const t = norm(text);
  if (SMALL.some((k) => t.includes(k))) return 0.7;
  if (LARGE.some((k) => t.includes(k))) return 1.5;
  return 1;
}

export function fatigueScore(w: FatigueWorkout): number {
  return w.exercises.reduce((acc, e) => acc + Math.max(0, e.sets) * muscleWeight(`${e.muscle || ""} ${e.name}`), 0);
}

export function classifyWorkout(w: FatigueWorkout): FatigueLevel {
  const s = fatigueScore(w);
  if (s >= 22) return "PESADO";
  if (s >= 13) return "MODERADO";
  return "LEVE";
}

export function normalizeNivel(v?: string | null): NivelCliente {
  const t = norm(v || "");
  if (t.includes("avan") || t.includes("atleta")) return "avancado";
  if (t.includes("inic")) return "iniciante";
  return "intermediario";
}

export function normalizeObjetivo(v?: string | null): ObjetivoCliente {
  const t = norm(v || "");
  if (t.includes("forca")) return "forca_hipertrofia";
  if (t.includes("defin") || t.includes("cut") || t.includes("emagre")) return "definicao";
  if (t.includes("priorit")) return "grupo_prioritario";
  return "hipertrofia";
}

/** Redução de volume (%) na véspera da folga, por nível e objetivo. */
export function eveReduction(nivel: NivelCliente, objetivo: ObjetivoCliente): number {
  const base = nivel === "avancado" ? 20 : nivel === "intermediario" ? 10 : 0;
  if (base === 0) return 0;
  if (objetivo === "forca_hipertrofia") return Math.max(10, base - 5); // preserva intensidade
  if (objetivo === "definicao") return Math.min(20, base + 5);
  return base;
}

export type DayFatiguePlan = {
  date: string;
  workoutIndex: number;
  level: FatigueLevel;
  originalLevel: FatigueLevel;
  volumeReduction: number; // %
  reasons: string[];
};

const ANTI_STACK_REDUCTION = 15;

/** Aplica as regras de fadiga a cada bloco de dias de treino consecutivos. */
export function planFatigue(opts: {
  days: CycleDay[];
  workouts: FatigueWorkout[];
  nivel: NivelCliente;
  objetivo: ObjetivoCliente;
}): Record<string, DayFatiguePlan> {
  const out: Record<string, DayFatiguePlan> = {};
  const eve = eveReduction(opts.nivel, opts.objetivo);
  let prev: FatigueLevel | null = null;
  opts.days.forEach((d, i) => {
    if (!d.isTraining || d.workoutIndex == null) { prev = null; return; }
    const w = opts.workouts[d.workoutIndex];
    const original = w ? classifyWorkout(w) : "MODERADO";
    let level = original;
    let red = 0;
    const reasons: string[] = [];
    if (prev === "PESADO" && level === "PESADO") {
      level = "MODERADO";
      red = ANTI_STACK_REDUCTION;
      reasons.push(`-${ANTI_STACK_REDUCTION}% para evitar dois dias pesados seguidos`);
    }
    const nextDay = opts.days[i + 1];
    const isEve = !nextDay || !nextDay.isTraining;
    if (isEve && nextDay && eve > 0) {
      red = Math.max(red, eve);
      reasons.push(`-${eve}% na véspera da folga`);
    }
    out[d.date] = { date: d.date, workoutIndex: d.workoutIndex, level, originalLevel: original, volumeReduction: red, reasons };
    prev = level;
  });
  return out;
}

export const reduceSets = (sets: number, pct: number) => (pct > 0 ? Math.max(1, Math.round(sets * (1 - pct / 100))) : sets);

export type RestContent =
  | { type: "total"; title: string }
  | { type: "recuperacao_ativa"; title: string; items: string[] }
  | { type: "sessao_leve"; title: string; note: string; exercises: { name: string; sets: number; rpe: string }[] };

/** Conteúdo do dia de folga. A sessão leve usa só exercícios já cadastrados no plano para o grupo prioritário. */
export function restDayContent(type: RestType, workouts: FatigueWorkout[], priorityGroup?: string | null): RestContent {
  if (type === "recuperacao_ativa")
    return { type, title: "Recuperação ativa", items: ["Caminhada 20-30 min", "Mobilidade articular", "Alongamento 10-15 min"] };
  if (type === "sessao_leve") {
    const g = norm(priorityGroup || "");
    const seen = new Set<string>();
    const picks = workouts.flatMap((w) => w.exercises).filter((e) => {
      const hit = g && norm(`${e.muscle || ""} ${e.name}`).includes(g);
      if (!hit || seen.has(norm(e.name))) return false;
      seen.add(norm(e.name));
      return true;
    }).slice(0, 4);
    return {
      type,
      title: `Sessão leve complementar${priorityGroup ? ` · ${priorityGroup}` : ""}`,
      note: picks.length
        ? "Opcional e de baixa intensidade — não é um treino completo."
        : "Nenhum exercício do plano encontrado para o grupo prioritário. Defina o grupo ou faça folga.",
      exercises: picks.map((e) => ({ name: e.name, sets: 2, rpe: "5-6" })),
    };
  }
  return { type: "total", title: "Descanso" };
}
