
-- MERIDIAN Bloco 1 — Fundação
-- Enums + 4 tabelas + RLS + GRANTs + seed masculino Enhanced

-- ============ ENUMS ============
CREATE TYPE public.biological_sex AS ENUM ('MALE', 'FEMALE');

CREATE TYPE public.athlete_track AS ENUM ('ENHANCED', 'NATURAL', 'LIFESTYLE');

CREATE TYPE public.bodybuilding_category AS ENUM (
  'OPEN_BODYBUILDING', 'BODYBUILDING_212', 'CLASSIC_PHYSIQUE',
  'MENS_PHYSIQUE', 'WHEELCHAIR_BODYBUILDING',
  'WOMENS_BODYBUILDING', 'WOMENS_PHYSIQUE', 'FIGURE',
  'FITNESS', 'WELLNESS', 'BIKINI'
);

CREATE TYPE public.age_group AS ENUM (
  'JUNIOR', 'OPEN',
  'MASTERS_35', 'MASTERS_40', 'MASTERS_45',
  'MASTERS_50', 'MASTERS_55', 'MASTERS_60',
  'MASTERS_65', 'MASTERS_70_PLUS'
);

CREATE TYPE public.meridian_phase AS ENUM (
  'OFF_SEASON', 'PRE_PREP', 'DIET_PRINCIPAL',
  'HARD_CUT', 'FINAL_SHARPENING', 'PEAK_WEEK',
  'POST_STAGE_RECOVERY'
);

CREATE TYPE public.menstrual_status AS ENUM (
  'REGULAR', 'IRREGULAR', 'AMENORRHEA', 'PMS_AFFECTED',
  'PILL', 'IUD_HORMONAL', 'IUD_COPPER', 'POST_MENOPAUSE',
  'NOT_APPLICABLE'
);

-- ============ TABELAS ============

-- Provas competitivas
CREATE TABLE public.meridian_competitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  federation TEXT NOT NULL,
  is_natural_federation BOOLEAN NOT NULL DEFAULT false,
  category public.bodybuilding_category NOT NULL,
  age_group public.age_group NOT NULL DEFAULT 'OPEN',
  height_class TEXT,
  weight_class TEXT,
  competition_date DATE NOT NULL,
  location TEXT,
  status TEXT NOT NULL DEFAULT 'PLANNED',
  is_primary BOOLEAN NOT NULL DEFAULT false,
  drug_test_required BOOLEAN NOT NULL DEFAULT false,
  drug_test_type TEXT[],
  drug_test_pre_contest_window_days INT,
  result_placement INT,
  result_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.meridian_competitions TO authenticated;
GRANT ALL ON public.meridian_competitions TO service_role;
ALTER TABLE public.meridian_competitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "meridian_competitions_select_own" ON public.meridian_competitions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "meridian_competitions_insert_own" ON public.meridian_competitions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "meridian_competitions_update_own" ON public.meridian_competitions
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "meridian_competitions_delete_own" ON public.meridian_competitions
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Perfil do atleta MERIDIAN
CREATE TABLE public.meridian_athlete_parameters (
  user_id UUID PRIMARY KEY,
  biological_sex public.biological_sex NOT NULL,
  date_of_birth DATE,
  height_cm DECIMAL(5,2) NOT NULL,
  athlete_track public.athlete_track NOT NULL DEFAULT 'LIFESTYLE',
  years_in_track INT,
  current_weight_kg DECIMAL(5,2) NOT NULL,
  current_bf_percent DECIMAL(4,2) NOT NULL,
  bf_measurement_method TEXT,
  current_lean_mass_kg DECIMAL(5,2),
  total_preps_completed INT DEFAULT 0,
  best_stage_weight_kg DECIMAL(5,2),
  best_stage_bf_percent DECIMAL(4,2),
  last_prep_duration_weeks INT,
  last_prep_satisfaction_score INT,
  last_competition_date DATE,
  resting_hr INT,
  hrv_baseline INT,
  tsh_value DECIMAL(5,2),
  t3_value DECIMAL(5,2),
  t4_value DECIMAL(5,2),
  cortisol_morning DECIMAL(6,2),
  total_testosterone DECIMAL(7,2),
  free_testosterone DECIMAL(6,2),
  estradiol_male DECIMAL(5,2),
  shbg DECIMAL(5,2),
  estradiol_female DECIMAL(6,2),
  progesterone DECIMAL(5,2),
  lh DECIMAL(5,2),
  fsh DECIMAL(5,2),
  prolactin DECIMAL(5,2),
  ferritin DECIMAL(6,2),
  vitamin_d DECIMAL(5,2),
  deficit_tolerance TEXT,
  adherence_pattern TEXT,
  emotional_eating_risk TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.meridian_athlete_parameters TO authenticated;
GRANT ALL ON public.meridian_athlete_parameters TO service_role;
ALTER TABLE public.meridian_athlete_parameters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "meridian_athlete_parameters_select_own" ON public.meridian_athlete_parameters
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "meridian_athlete_parameters_insert_own" ON public.meridian_athlete_parameters
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "meridian_athlete_parameters_update_own" ON public.meridian_athlete_parameters
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "meridian_athlete_parameters_delete_own" ON public.meridian_athlete_parameters
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Default parameters (matriz sex × track × category × ageGroup)
CREATE TABLE public.meridian_default_parameters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  biological_sex public.biological_sex NOT NULL,
  athlete_track public.athlete_track NOT NULL,
  category public.bodybuilding_category NOT NULL,
  age_group public.age_group NOT NULL DEFAULT 'OPEN',
  stage_bf_min DECIMAL(4,2) NOT NULL,
  stage_bf_max DECIMAL(4,2) NOT NULL,
  has_weight_cap BOOLEAN NOT NULL DEFAULT false,
  weight_cap_table JSONB,
  diet_phase_loss_min DECIMAL(3,2) NOT NULL,
  diet_phase_loss_max DECIMAL(3,2) NOT NULL,
  hard_cut_loss_min DECIMAL(3,2) NOT NULL,
  hard_cut_loss_max DECIMAL(3,2) NOT NULL,
  pre_prep_weeks_default INT NOT NULL DEFAULT 4,
  buffer_weeks_min INT NOT NULL DEFAULT 2,
  buffer_weeks_recommended INT NOT NULL DEFAULT 3,
  final_sharpening_weeks_default INT NOT NULL DEFAULT 3,
  reverse_diet_weeks_min INT NOT NULL,
  reverse_diet_weeks_recommended INT NOT NULL,
  min_weeks_between_peaks INT NOT NULL,
  recovery_multiplier DECIMAL(3,2) DEFAULT 1.0,
  required_health_markers TEXT[],
  red_flag_thresholds JSONB,
  cycle_sync_recommended BOOLEAN DEFAULT false,
  amenorrhea_is_red_flag BOOLEAN DEFAULT false,
  glute_specialization_required BOOLEAN DEFAULT false,
  routine_practice_required BOOLEAN DEFAULT false,
  routine_practice_weeks_before_stage INT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (biological_sex, athlete_track, category, age_group)
);

GRANT SELECT ON public.meridian_default_parameters TO authenticated;
GRANT ALL ON public.meridian_default_parameters TO service_role;
ALTER TABLE public.meridian_default_parameters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "meridian_default_parameters_select_all" ON public.meridian_default_parameters
  FOR SELECT TO authenticated USING (true);

-- Planos MERIDIAN
CREATE TABLE public.meridian_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  competition_id UUID NOT NULL REFERENCES public.meridian_competitions(id) ON DELETE CASCADE,
  version INT NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  stage_target_weight_kg DECIMAL(5,2) NOT NULL,
  stage_target_bf_percent DECIMAL(4,2) NOT NULL,
  total_weeks_to_stage INT NOT NULL,
  off_season_end_date DATE NOT NULL,
  pre_prep_start_date DATE NOT NULL,
  diet_phase_start_date DATE NOT NULL,
  hard_cut_start_date DATE NOT NULL,
  final_sharpening_start_date DATE NOT NULL,
  peak_week_start_date DATE NOT NULL,
  post_stage_recovery_end_date DATE NOT NULL,
  buffer_weeks INT NOT NULL DEFAULT 3,
  generated_by TEXT,
  calculation_inputs JSONB,
  viability_status TEXT,
  warnings TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.meridian_plans TO authenticated;
GRANT ALL ON public.meridian_plans TO service_role;
ALTER TABLE public.meridian_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "meridian_plans_select_own" ON public.meridian_plans
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "meridian_plans_insert_own" ON public.meridian_plans
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "meridian_plans_update_own" ON public.meridian_plans
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "meridian_plans_delete_own" ON public.meridian_plans
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Triggers para updated_at
CREATE TRIGGER trg_meridian_competitions_updated
  BEFORE UPDATE ON public.meridian_competitions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_meridian_athlete_parameters_updated
  BEFORE UPDATE ON public.meridian_athlete_parameters
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ SEED — Masculino Enhanced ============

-- Weight cap Classic Physique IFBB Pro (kg)
-- Tabela oficial: até 165cm 72.6 / 170 77.1 / 175 81.6 / 180 87.1 / 185 93.9 / 190 102.0 / >190 105.2
INSERT INTO public.meridian_default_parameters (
  biological_sex, athlete_track, category, age_group,
  stage_bf_min, stage_bf_max,
  has_weight_cap, weight_cap_table,
  diet_phase_loss_min, diet_phase_loss_max,
  hard_cut_loss_min, hard_cut_loss_max,
  pre_prep_weeks_default, buffer_weeks_min, buffer_weeks_recommended,
  final_sharpening_weeks_default,
  reverse_diet_weeks_min, reverse_diet_weeks_recommended,
  min_weeks_between_peaks,
  required_health_markers,
  red_flag_thresholds,
  notes
) VALUES
-- Open Bodybuilding (sem cap)
('MALE','ENHANCED','OPEN_BODYBUILDING','OPEN',
 3.0, 5.0, false, NULL,
 0.6, 0.9, 0.8, 1.1,
 4, 2, 3, 3, 4, 6, 6,
 ARRAY['tsh','t3','t4','cortisol_morning','lipid_panel','hematocrit','liver_enzymes'],
 '{"hematocrit":{"max":55},"tsh":{"max":4.0}}'::jsonb,
 'Open BB Enhanced — sem cap de peso, BF de palco extremo.'),

-- 212 (cap 96.2 kg)
('MALE','ENHANCED','BODYBUILDING_212','OPEN',
 3.0, 5.0, true, '{"global_cap_kg":96.2}'::jsonb,
 0.6, 0.9, 0.8, 1.1,
 4, 2, 3, 3, 4, 6, 6,
 ARRAY['tsh','t3','t4','cortisol_morning','lipid_panel','hematocrit','liver_enzymes'],
 '{"hematocrit":{"max":55},"tsh":{"max":4.0}}'::jsonb,
 '212 lbs (96.2 kg) cap absoluto.'),

-- Classic Physique (cap por altura)
('MALE','ENHANCED','CLASSIC_PHYSIQUE','OPEN',
 4.0, 6.0, true,
 '{"by_height_cm":[
    {"max":165,"cap_kg":72.6},
    {"max":170,"cap_kg":77.1},
    {"max":175,"cap_kg":81.6},
    {"max":180,"cap_kg":87.1},
    {"max":185,"cap_kg":93.9},
    {"max":190,"cap_kg":102.0},
    {"max":999,"cap_kg":105.2}
  ]}'::jsonb,
 0.6, 0.9, 0.8, 1.1,
 4, 2, 3, 3, 4, 6, 6,
 ARRAY['tsh','t3','t4','cortisol_morning','lipid_panel','hematocrit','liver_enzymes'],
 '{"hematocrit":{"max":55},"tsh":{"max":4.0}}'::jsonb,
 'Classic Physique — cap de peso por altura conforme tabela IFBB Pro.'),

-- Men's Physique (sem cap, BF mais alto)
('MALE','ENHANCED','MENS_PHYSIQUE','OPEN',
 5.0, 7.0, false, NULL,
 0.5, 0.8, 0.7, 1.0,
 4, 2, 3, 3, 4, 6, 6,
 ARRAY['tsh','t3','t4','cortisol_morning','lipid_panel','hematocrit','liver_enzymes'],
 '{"hematocrit":{"max":55},"tsh":{"max":4.0}}'::jsonb,
 'Men''s Physique — foco em V-taper, BF de palco menos extremo.'),

-- Wheelchair
('MALE','ENHANCED','WHEELCHAIR_BODYBUILDING','OPEN',
 4.0, 6.0, false, NULL,
 0.5, 0.8, 0.7, 1.0,
 4, 3, 4, 3, 5, 7, 7,
 ARRAY['tsh','t3','t4','cortisol_morning','lipid_panel','hematocrit','liver_enzymes'],
 '{"hematocrit":{"max":55},"tsh":{"max":4.0}}'::jsonb,
 'Wheelchair BB — buffer maior por restrição de cardio compensatório.');
