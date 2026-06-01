// MERIDIAN — Tipos compartilhados (Bloco 1).
export type BiologicalSex = "MALE" | "FEMALE";
export type AthleteTrack = "ENHANCED" | "NATURAL" | "LIFESTYLE";
export type BodybuildingCategory =
  | "OPEN_BODYBUILDING"
  | "BODYBUILDING_212"
  | "CLASSIC_PHYSIQUE"
  | "MENS_PHYSIQUE"
  | "WHEELCHAIR_BODYBUILDING"
  | "WOMENS_BODYBUILDING"
  | "WOMENS_PHYSIQUE"
  | "FIGURE"
  | "FITNESS"
  | "WELLNESS"
  | "BIKINI";

export type AgeGroup =
  | "JUNIOR"
  | "OPEN"
  | "MASTERS_35"
  | "MASTERS_40"
  | "MASTERS_45"
  | "MASTERS_50"
  | "MASTERS_55"
  | "MASTERS_60"
  | "MASTERS_65"
  | "MASTERS_70_PLUS";

export type MeridianPhase =
  | "OFF_SEASON"
  | "PRE_PREP"
  | "DIET_PRINCIPAL"
  | "HARD_CUT"
  | "FINAL_SHARPENING"
  | "PEAK_WEEK"
  | "POST_STAGE_RECOVERY";

export interface MeridianCompetition {
  id: string;
  user_id: string;
  name: string;
  federation: string;
  is_natural_federation: boolean;
  category: BodybuildingCategory;
  age_group: AgeGroup;
  height_class?: string | null;
  weight_class?: string | null;
  competition_date: string;
  location?: string | null;
  status: string;
  is_primary: boolean;
}

export interface MeridianAthleteParameters {
  user_id: string;
  biological_sex: BiologicalSex;
  height_cm: number;
  athlete_track: AthleteTrack;
  current_weight_kg: number;
  current_bf_percent: number;
  bf_measurement_method?: string | null;
}

export interface MeridianPlan {
  id: string;
  user_id: string;
  competition_id: string;
  version: number;
  is_active: boolean;
  stage_target_weight_kg: number;
  stage_target_bf_percent: number;
  total_weeks_to_stage: number;
  off_season_end_date: string;
  pre_prep_start_date: string;
  diet_phase_start_date: string;
  hard_cut_start_date: string;
  final_sharpening_start_date: string;
  peak_week_start_date: string;
  post_stage_recovery_end_date: string;
  buffer_weeks: number;
  viability_status: "GREEN" | "YELLOW" | "RED" | string;
  warnings: string[];
  calculation_inputs?: any;
}

export const CATEGORY_LABELS: Record<BodybuildingCategory, string> = {
  OPEN_BODYBUILDING: "Open Bodybuilding",
  BODYBUILDING_212: "212 Bodybuilding",
  CLASSIC_PHYSIQUE: "Classic Physique",
  MENS_PHYSIQUE: "Men's Physique",
  WHEELCHAIR_BODYBUILDING: "Wheelchair Bodybuilding",
  WOMENS_BODYBUILDING: "Women's Bodybuilding",
  WOMENS_PHYSIQUE: "Women's Physique",
  FIGURE: "Figure",
  FITNESS: "Fitness",
  WELLNESS: "Wellness",
  BIKINI: "Bikini",
};

export const PHASE_LABELS: Record<MeridianPhase, string> = {
  OFF_SEASON: "Off-Season",
  PRE_PREP: "Pre-Prep",
  DIET_PRINCIPAL: "Diet Principal",
  HARD_CUT: "Hard Cut",
  FINAL_SHARPENING: "Final Sharpening",
  PEAK_WEEK: "Peak Week",
  POST_STAGE_RECOVERY: "Recovery Pós-Palco",
};
