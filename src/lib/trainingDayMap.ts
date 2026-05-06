// Maps workout_schedule rows into per-day training metadata used by the meal plan UI.

export interface WorkoutRow {
  day_of_week: number; // 0=Sun..6=Sat (Postgres convention used in workout_schedule)
  workout_type?: string | null;
  workout_time?: string | null; // "HH:MM" or "HH:MM:SS"
  duration_minutes?: number | null;
  slot?: string | null;
}

export interface TrainingDayInfo {
  isTraining: boolean;
  muscleGroup?: string;
  workoutTime?: string | null; // "HH:MM"
}

const DEFAULT_MEAL_HOUR: Record<string, number> = {
  cafe_manha: 7,
  lanche_manha: 10,
  almoco: 12.5,
  lanche_tarde: 16,
  jantar: 19.5,
  ceia: 22,
};

// Convert Sunday=0..Saturday=6 → Monday=0..Sunday=6 (matches DAY_LABELS used in the UI).
export function dowToMondayIdx(dow: number): number {
  return dow === 0 ? 6 : dow - 1;
}

export function buildTrainingDayMap(workouts: WorkoutRow[] | null | undefined): Record<number, TrainingDayInfo> {
  const map: Record<number, TrainingDayInfo> = {};
  for (let d = 0; d < 7; d++) map[d] = { isTraining: false };
  (workouts || []).forEach((w) => {
    const idx = dowToMondayIdx(w.day_of_week);
    map[idx] = {
      isTraining: true,
      muscleGroup: (w.workout_type || "").toUpperCase() || map[idx].muscleGroup,
      workoutTime: (w.workout_time || "").slice(0, 5) || map[idx].workoutTime,
    };
  });
  return map;
}

// Returns "pre" | "post" | null for a given meal on a training day.
// Pre = nearest meal within 3h before workout. Post = nearest meal within 3h after.
export function classifyMealVsWorkout(
  mealType: string,
  workoutTime?: string | null,
): "pre" | "post" | null {
  if (!workoutTime) return null;
  const [h, m] = workoutTime.split(":").map(Number);
  const wHour = (isFinite(h) ? h : 0) + (isFinite(m) ? m / 60 : 0);
  const mHour = DEFAULT_MEAL_HOUR[mealType];
  if (mHour == null) return null;
  const diff = mHour - wHour; // negative = before workout, positive = after
  if (diff < 0 && diff >= -3) return "pre";
  if (diff > 0 && diff <= 3) return "post";
  return null;
}

export interface WeeklyAvg {
  kcal: number;
  p: number;
  c: number;
  g: number;
  count: number;
}

export function splitWeeklyAverages(
  dayTotals: Record<number, { kcal: number; p: number; c: number; g: number }>,
  trainingMap: Record<number, TrainingDayInfo>,
): { training: WeeklyAvg; rest: WeeklyAvg; carbDeltaPct: number } {
  const t: WeeklyAvg = { kcal: 0, p: 0, c: 0, g: 0, count: 0 };
  const r: WeeklyAvg = { kcal: 0, p: 0, c: 0, g: 0, count: 0 };
  for (let d = 0; d < 7; d++) {
    const tot = dayTotals[d] || { kcal: 0, p: 0, c: 0, g: 0 };
    if (tot.kcal === 0 && tot.p === 0 && tot.c === 0 && tot.g === 0) continue;
    const bucket = trainingMap[d]?.isTraining ? t : r;
    bucket.kcal += tot.kcal;
    bucket.p += tot.p;
    bucket.c += tot.c;
    bucket.g += tot.g;
    bucket.count += 1;
  }
  const avg = (b: WeeklyAvg) =>
    b.count > 0 ? { ...b, kcal: b.kcal / b.count, p: b.p / b.count, c: b.c / b.count, g: b.g / b.count } : b;
  const ta = avg(t);
  const ra = avg(r);
  const carbDeltaPct = ra.c > 0 ? Math.round(((ta.c - ra.c) / ra.c) * 100) : 0;
  return { training: ta, rest: ra, carbDeltaPct };
}
