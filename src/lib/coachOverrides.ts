// Fase 2 — Interface do Coach: ajustes (override) por exercício e por semana.
// Persistidos em training_exercise_overrides / training_week_overrides.
import { supabase } from "@/integrations/supabase/client";

export interface ExerciseOverride {
  id?: string;
  protocol_id: string;
  week_number: number;
  day_number: number;
  exercise_name: string;
  action: "edit" | "replace" | "add" | "remove";
  new_exercise_name?: string | null;
  sets?: string | null;
  reps?: string | null;
  rpe?: string | null;
  rir?: string | null;
  rest?: string | null;
  coach_note?: string | null;
}

export interface WeekOverride {
  protocol_id: string;
  week_number: number;
  forced_deload: boolean;
  coach_note?: string | null;
}

const keyOf = (week: number, day: number, name: string) =>
  `${week}|${day}|${String(name || "").trim().toLowerCase()}`;

export type OverrideMap = Record<string, ExerciseOverride>;

export function overrideKey(week: number, day: number, name: string) {
  return keyOf(week, day, name);
}

export async function loadExerciseOverrides(protocolId: string): Promise<OverrideMap> {
  if (!protocolId) return {};
  const { data } = await (supabase.from as any)("training_exercise_overrides")
    .select("*")
    .eq("protocol_id", protocolId);
  const map: OverrideMap = {};
  for (const row of (data as ExerciseOverride[]) || []) {
    map[keyOf(row.week_number, row.day_number, row.exercise_name)] = row;
  }
  return map;
}

export async function loadWeekOverrides(protocolId: string): Promise<Record<number, WeekOverride>> {
  if (!protocolId) return {};
  const { data } = await (supabase.from as any)("training_week_overrides")
    .select("*")
    .eq("protocol_id", protocolId);
  const map: Record<number, WeekOverride> = {};
  for (const row of (data as WeekOverride[]) || []) map[row.week_number] = row;
  return map;
}

/** Salva o ajuste. Com propagate, replica para todas as semanas seguintes do mesociclo. */
export async function saveExerciseOverride(
  coachId: string,
  override: ExerciseOverride,
  options: { propagate?: boolean; totalWeeks?: number } = {}
): Promise<{ error: string | null; weeks: number[] }> {
  const weeks: number[] = [override.week_number];
  if (options.propagate && options.totalWeeks) {
    for (let w = override.week_number + 1; w <= options.totalWeeks; w++) weeks.push(w);
  }
  // Preserva ajustes já salvos pelo coach: campos não informados nesta chamada
  // mantêm o valor gravado anteriormente em cada semana.
  const { data: existentes } = await (supabase.from as any)("training_exercise_overrides")
    .select("*")
    .eq("protocol_id", override.protocol_id)
    .eq("day_number", override.day_number)
    .eq("exercise_name", override.exercise_name)
    .in("week_number", weeks);

  const porSemana = new Map<number, any>(
    ((existentes || []) as any[]).map((r) => [Number(r.week_number), r])
  );

  const manter = (novo: any, antigo: any) =>
    novo === undefined || novo === null || novo === "" ? (antigo ?? null) : novo;

  const rows = weeks.map((week_number) => {
    const ant = porSemana.get(week_number) || {};
    return {
      coach_id: coachId,
      protocol_id: override.protocol_id,
      week_number,
      day_number: override.day_number,
      exercise_name: override.exercise_name,
      action: override.action,
      new_exercise_name: manter(override.new_exercise_name, ant.new_exercise_name),
      sets: manter(override.sets, ant.sets),
      reps: manter(override.reps, ant.reps),
      rpe: manter(override.rpe, ant.rpe),
      rir: manter(override.rir, ant.rir),
      rest: manter(override.rest, ant.rest),
      coach_note: manter(override.coach_note, ant.coach_note),
    };
  });
  const { error } = await (supabase.from as any)("training_exercise_overrides")
    .upsert(rows, { onConflict: "protocol_id,week_number,day_number,exercise_name" });
  return { error: error?.message || null, weeks };
}

export async function removeExerciseOverride(
  protocolId: string,
  weekNumber: number,
  dayNumber: number,
  exerciseName: string,
  options: { allWeeks?: boolean; totalWeeks?: number } = {}
): Promise<string | null> {
  let query = (supabase.from as any)("training_exercise_overrides")
    .delete()
    .eq("protocol_id", protocolId)
    .eq("day_number", dayNumber)
    .eq("exercise_name", exerciseName);
  query = options.allWeeks ? query.gte("week_number", weekNumber) : query.eq("week_number", weekNumber);
  const { error } = await query;
  return error?.message || null;
}

export async function setForcedDeload(
  coachId: string,
  protocolId: string,
  weekNumber: number,
  forced: boolean,
  note?: string
): Promise<string | null> {
  const { error } = await (supabase.from as any)("training_week_overrides").upsert(
    {
      coach_id: coachId,
      protocol_id: protocolId,
      week_number: weekNumber,
      forced_deload: forced,
      coach_note: note || null,
    },
    { onConflict: "protocol_id,week_number" }
  );
  return error?.message || null;
}

/** Aplica o ajuste do coach sobre a estrutura já periodizada do exercício. */
export function applyOverrideToStructure(struct: any, override?: ExerciseOverride | null) {
  if (!struct || !override) return struct;
  const patch = (block: any) => {
    if (!block) return block;
    const out = { ...block };
    if (override.sets) out.sets = override.sets;
    if (override.reps) out.reps = override.reps;
    if (override.rpe) out.rpe = override.rpe;
    if (override.rir) out.rir = override.rir;
    if (override.rest) out.rest = override.rest;
    if (override.coach_note) out.notes = override.coach_note;
    return out;
  };
  return {
    ...struct,
    top_set: patch(struct.top_set),
    backoff_sets: patch(struct.backoff_sets),
    work_sets: patch(struct.work_sets),
  };
}
