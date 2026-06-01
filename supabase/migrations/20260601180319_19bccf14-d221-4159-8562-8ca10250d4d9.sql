
-- MERIDIAN Bloco 5/6 — Multi-show + Peak Week + Post-stage Recovery

-- 1. Peak Week protocols
CREATE TABLE public.meridian_peak_week_protocols (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  plan_id UUID NOT NULL,
  competition_id UUID NOT NULL,
  start_date DATE NOT NULL,
  -- 7-day schedule arrays (day 7 = competition day)
  water_liters JSONB NOT NULL DEFAULT '[]'::jsonb,
  sodium_mg JSONB NOT NULL DEFAULT '[]'::jsonb,
  potassium_mg JSONB NOT NULL DEFAULT '[]'::jsonb,
  carbs_grams JSONB NOT NULL DEFAULT '[]'::jsonb,
  training_focus JSONB NOT NULL DEFAULT '[]'::jsonb,
  posing_minutes JSONB NOT NULL DEFAULT '[]'::jsonb,
  tanning_schedule TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'planned',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.meridian_peak_week_protocols TO authenticated;
GRANT ALL ON public.meridian_peak_week_protocols TO service_role;

ALTER TABLE public.meridian_peak_week_protocols ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own peak week protocols" ON public.meridian_peak_week_protocols
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_meridian_peak_week_protocols_updated_at
  BEFORE UPDATE ON public.meridian_peak_week_protocols
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_meridian_peak_week_plan ON public.meridian_peak_week_protocols(plan_id);

-- 2. Post-stage Recovery
CREATE TABLE public.meridian_post_stage_recovery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  plan_id UUID NOT NULL,
  competition_id UUID NOT NULL,
  recovery_start_date DATE NOT NULL,
  recovery_weeks INTEGER NOT NULL DEFAULT 4,
  reverse_diet_kcal_step INTEGER NOT NULL DEFAULT 100,
  weekly_kcal_targets JSONB NOT NULL DEFAULT '[]'::jsonb,
  refeed_days_per_week INTEGER NOT NULL DEFAULT 2,
  training_deload_weeks INTEGER NOT NULL DEFAULT 1,
  mental_health_check JSONB NOT NULL DEFAULT '{}'::jsonb,
  binge_risk_level TEXT NOT NULL DEFAULT 'medium',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.meridian_post_stage_recovery TO authenticated;
GRANT ALL ON public.meridian_post_stage_recovery TO service_role;

ALTER TABLE public.meridian_post_stage_recovery ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own post-stage recovery" ON public.meridian_post_stage_recovery
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_meridian_post_stage_recovery_updated_at
  BEFORE UPDATE ON public.meridian_post_stage_recovery
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_meridian_recovery_plan ON public.meridian_post_stage_recovery(plan_id);

-- 3. Multi-show optimizer
CREATE TABLE public.meridian_multi_show_chains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  primary_competition_id UUID NOT NULL,
  secondary_competition_id UUID NOT NULL,
  gap_days INTEGER NOT NULL,
  strategy TEXT NOT NULL DEFAULT 'maintain', -- maintain | push_harder | rebound_refeed
  mini_refeed_days INTEGER NOT NULL DEFAULT 2,
  intra_chain_notes TEXT,
  viability_status TEXT NOT NULL DEFAULT 'GREEN', -- GREEN | YELLOW | RED
  warnings JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (primary_competition_id, secondary_competition_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.meridian_multi_show_chains TO authenticated;
GRANT ALL ON public.meridian_multi_show_chains TO service_role;

ALTER TABLE public.meridian_multi_show_chains ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own multi-show chains" ON public.meridian_multi_show_chains
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_meridian_multi_show_chains_updated_at
  BEFORE UPDATE ON public.meridian_multi_show_chains
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_meridian_chains_primary ON public.meridian_multi_show_chains(primary_competition_id);
