import { supabase } from "@/integrations/supabase/client";
import {
  CyclePhase,
  FeminineCategory,
  getCycleDayCount,
  getCyclePhase,
  isFeminine,
  mapCyclePhaseToFaseCiclo,
  normalizeFeminineCategory,
  FEMININE_CATEGORIES,
} from "@/lib/feminine";

export interface FeminineContext {
  isF: boolean;
  sex: "F" | "M" | null;
  cyclePhase: CyclePhase | null;
  cycleDay: number | null;
  fase_ciclo: "menstrual" | "folicular" | "ovulatoria" | "lutea" | null;
  feminineCategory: FeminineCategory | null;
  feminineCategoryLabel: string | null;
}

const EMPTY: FeminineContext = {
  isF: false,
  sex: null,
  cyclePhase: null,
  cycleDay: null,
  fase_ciclo: null,
  feminineCategory: null,
  feminineCategoryLabel: null,
};

/**
 * Build the feminine context (sex, cycle phase/day, category) for a patient user.
 * Returns an empty context for non-female users so callers can spread it safely.
 */
export async function buildFeminineContext(
  patientUserId: string | null | undefined,
  sexHint?: string | null,
  categoryHint?: string | null,
): Promise<FeminineContext> {
  const sexValue = sexHint ?? null;
  const isF = isFeminine({ sex: sexValue });
  if (!isF || !patientUserId) {
    return {
      ...EMPTY,
      sex: sexValue ? (isF ? "F" : "M") : null,
    };
  }
  const { data } = await supabase
    .from("feminine_profiles" as any)
    .select("ultima_menstruacao,duracao_ciclo,fase_ciclo")
    .eq("user_id", patientUserId)
    .maybeSingle();
  const fp = (data as any) || null;
  const cyclePhase: CyclePhase | null = fp?.ultima_menstruacao
    ? getCyclePhase(fp.ultima_menstruacao, fp.duracao_ciclo || 28)
    : ((fp?.fase_ciclo as CyclePhase | null) ?? null);
  const cycleDay = fp?.ultima_menstruacao
    ? getCycleDayCount(fp.ultima_menstruacao, fp.duracao_ciclo || 28)
    : null;
  const femCategory = normalizeFeminineCategory(categoryHint ?? null);
  return {
    isF: true,
    sex: "F",
    cyclePhase,
    cycleDay,
    fase_ciclo: mapCyclePhaseToFaseCiclo(cyclePhase),
    feminineCategory: femCategory,
    feminineCategoryLabel: femCategory ? FEMININE_CATEGORIES[femCategory].label : (categoryHint ?? null),
  };
}
