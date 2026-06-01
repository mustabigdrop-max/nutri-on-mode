-- MERIDIAN Bloco 2 — Feminino Enhanced

-- ============ ATHLETE PARAMETERS — coluna menstrual ============
ALTER TABLE public.meridian_athlete_parameters
  ADD COLUMN IF NOT EXISTS menstrual_status public.menstrual_status,
  ADD COLUMN IF NOT EXISTS last_menstruation_date DATE,
  ADD COLUMN IF NOT EXISTS avg_cycle_length_days INT;

-- ============ MENSTRUAL CYCLE LOG ============
CREATE TABLE public.meridian_menstrual_cycle (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  cycle_start_date DATE NOT NULL,
  cycle_length_days INT,
  menstruation_duration_days INT,
  current_phase TEXT,
  symptoms TEXT[],
  flow_intensity TEXT,
  pms_severity INT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.meridian_menstrual_cycle TO authenticated;
GRANT ALL ON public.meridian_menstrual_cycle TO service_role;
ALTER TABLE public.meridian_menstrual_cycle ENABLE ROW LEVEL SECURITY;

CREATE POLICY "meridian_menstrual_cycle_select_own" ON public.meridian_menstrual_cycle
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "meridian_menstrual_cycle_insert_own" ON public.meridian_menstrual_cycle
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "meridian_menstrual_cycle_update_own" ON public.meridian_menstrual_cycle
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "meridian_menstrual_cycle_delete_own" ON public.meridian_menstrual_cycle
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER trg_meridian_menstrual_cycle_updated
  BEFORE UPDATE ON public.meridian_menstrual_cycle
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_meridian_menstrual_cycle_user_date
  ON public.meridian_menstrual_cycle(user_id, cycle_start_date DESC);

-- ============ TRIAD LOG (Female Athlete Triad) ============
CREATE TABLE public.meridian_triad_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  competition_id UUID REFERENCES public.meridian_competitions(id) ON DELETE SET NULL,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  menstrual_status public.menstrual_status,
  months_since_menstruation INT,
  weight_loss_rate_pct_per_week DECIMAL(4,2),
  energy_availability_kcal_per_kg_lbm DECIMAL(5,2),
  resting_hr INT,
  body_temp_morning DECIMAL(3,1),
  estradiol DECIMAL(6,2),
  ferritin DECIMAL(6,2),
  tsh DECIMAL(5,2),
  bone_density_z_score DECIMAL(3,1),
  severity TEXT NOT NULL DEFAULT 'GREEN',
  flags TEXT[],
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.meridian_triad_log TO authenticated;
GRANT ALL ON public.meridian_triad_log TO service_role;
ALTER TABLE public.meridian_triad_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "meridian_triad_log_select_own" ON public.meridian_triad_log
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "meridian_triad_log_insert_own" ON public.meridian_triad_log
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "meridian_triad_log_update_own" ON public.meridian_triad_log
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "meridian_triad_log_delete_own" ON public.meridian_triad_log
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX idx_meridian_triad_log_user_date
  ON public.meridian_triad_log(user_id, log_date DESC);

-- ============ SEED — Feminino Enhanced ============

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
  cycle_sync_recommended,
  amenorrhea_is_red_flag,
  glute_specialization_required,
  routine_practice_required,
  routine_practice_weeks_before_stage,
  notes
) VALUES
-- Women's Bodybuilding (BF mais baixo, mais agressivo)
('FEMALE','ENHANCED','WOMENS_BODYBUILDING','OPEN',
 6.0, 9.0, false, NULL,
 0.4, 0.7, 0.6, 0.9,
 4, 3, 4, 3, 8, 12, 8,
 ARRAY['tsh','t3','t4','estradiol_female','progesterone','lh','fsh','ferritin','vitamin_d','cortisol_morning'],
 '{"estradiol_female":{"min":20},"ferritin":{"min":30},"tsh":{"max":4.0}}'::jsonb,
 true, true, false, false, NULL,
 'Women''s Bodybuilding Enhanced — BF de palco extremo, monitoramento hormonal obrigatório.'),

-- Women's Physique
('FEMALE','ENHANCED','WOMENS_PHYSIQUE','OPEN',
 7.0, 10.0, false, NULL,
 0.4, 0.7, 0.6, 0.9,
 4, 3, 4, 3, 8, 12, 8,
 ARRAY['tsh','t3','t4','estradiol_female','progesterone','lh','fsh','ferritin','vitamin_d','cortisol_morning'],
 '{"estradiol_female":{"min":20},"ferritin":{"min":30},"tsh":{"max":4.0}}'::jsonb,
 true, true, false, false, NULL,
 'Women''s Physique — composição muscular completa, BF de palco baixo.'),

-- Figure
('FEMALE','ENHANCED','FIGURE','OPEN',
 8.0, 11.0, false, NULL,
 0.4, 0.7, 0.5, 0.8,
 4, 3, 4, 3, 8, 12, 8,
 ARRAY['tsh','t3','t4','estradiol_female','progesterone','ferritin','vitamin_d','cortisol_morning'],
 '{"estradiol_female":{"min":25},"ferritin":{"min":30},"tsh":{"max":4.0}}'::jsonb,
 true, true, false, false, NULL,
 'Figure — V-taper feminino, hipertrofia visível e BF baixo controlado.'),

-- Fitness (rotina obrigatória)
('FEMALE','ENHANCED','FITNESS','OPEN',
 9.0, 12.0, false, NULL,
 0.4, 0.7, 0.5, 0.8,
 4, 3, 4, 3, 8, 12, 8,
 ARRAY['tsh','t3','t4','estradiol_female','progesterone','ferritin','vitamin_d','cortisol_morning'],
 '{"estradiol_female":{"min":25},"ferritin":{"min":30},"tsh":{"max":4.0}}'::jsonb,
 true, true, false, true, 12,
 'Fitness — rotina coreografada obrigatória, prática de 12 semanas pré-palco.'),

-- Wellness (foco glúteo/posterior)
('FEMALE','ENHANCED','WELLNESS','OPEN',
 9.0, 13.0, false, NULL,
 0.4, 0.7, 0.5, 0.8,
 4, 3, 4, 3, 8, 12, 8,
 ARRAY['tsh','t3','t4','estradiol_female','progesterone','ferritin','vitamin_d','cortisol_morning'],
 '{"estradiol_female":{"min":25},"ferritin":{"min":30},"tsh":{"max":4.0}}'::jsonb,
 true, true, true, false, NULL,
 'Wellness — ênfase em glúteos/posterior, especialização de glúteo obrigatória.'),

-- Bikini
('FEMALE','ENHANCED','BIKINI','OPEN',
 8.0, 12.0, false, NULL,
 0.4, 0.7, 0.5, 0.8,
 4, 3, 4, 3, 8, 12, 8,
 ARRAY['tsh','t3','t4','estradiol_female','progesterone','ferritin','vitamin_d','cortisol_morning'],
 '{"estradiol_female":{"min":25},"ferritin":{"min":30},"tsh":{"max":4.0}}'::jsonb,
 true, true, true, false, NULL,
 'Bikini — estética suave, glúteo destacado, BF de palco moderado.');
