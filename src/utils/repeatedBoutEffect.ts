// Repeated Bout Effect engine — tracks adaptation across mesocycle bouts
// Base: McHugh 2002, Nosaka & Clarkson 1996
import { supabase } from "@/integrations/supabase/client";

export interface RBEStatus {
  exercicio: string;
  boutNumber: number;
  domsEsperado: number;
  stimuloEsperado: number;
  alerta: boolean;
  recomendacao: string;
}

const DOMS_DECAY = [10, 7, 4, 2, 1, 1, 1];
const STIMULO_DECAY = [100, 90, 75, 60, 45, 35, 30];

export function calcRBEStatus(exerciseName: string, boutNumber: number): RBEStatus {
  const idx = Math.min(Math.max(boutNumber - 1, 0), DOMS_DECAY.length - 1);
  const doms = DOMS_DECAY[idx];
  const estim = STIMULO_DECAY[idx];
  const alerta = boutNumber >= 4;

  let recomendacao: string;
  if (boutNumber <= 2) {
    recomendacao = "DOMS esperado alto — progressão normal";
  } else if (boutNumber <= 4) {
    recomendacao = "DOMS reduzindo — monitorar progressão de carga";
  } else {
    recomendacao = "Estímulo adaptado — considerar variante do exercício";
  }

  return {
    exercicio: exerciseName,
    boutNumber,
    domsEsperado: doms,
    stimuloEsperado: estim,
    alerta,
    recomendacao,
  };
}

// Count bouts of a given exercise since mesocycle start
export async function getBoutNumber(
  athleteId: string,
  exerciseName: string,
  mesoStartDate: string
): Promise<number> {
  if (!athleteId || !exerciseName) return 1;
  try {
    const { count } = await supabase
      .from("workout_logs")
      .select("*", { count: "exact", head: true })
      .eq("athlete_id", athleteId)
      .ilike("exercise_name", `%${exerciseName}%`)
      .gte("logged_at", mesoStartDate);
    return Math.max(1, count ?? 1);
  } catch {
    return 1;
  }
}

export async function fetchRBEStatuses(
  athleteId: string,
  exercises: Array<{ name?: string; nome?: string }>,
  mesoStartDate: string
): Promise<RBEStatus[]> {
  const results: RBEStatus[] = [];
  for (const ex of exercises) {
    const name = (ex?.name || ex?.nome || "").trim();
    if (!name) continue;
    const bouts = await getBoutNumber(athleteId, name, mesoStartDate);
    results.push(calcRBEStatus(name, bouts));
  }
  return results;
}
