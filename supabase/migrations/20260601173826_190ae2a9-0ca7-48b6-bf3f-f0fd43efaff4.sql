-- MERIDIAN Bloco 3 — Checkpoints e Ajustes
CREATE TABLE public.meridian_weekly_checkpoints (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  plan_id UUID REFERENCES public.meridian_plans(id) ON DELETE CASCADE,
  competition_id UUID REFERENCES public.meridian_competitions(id) ON DELETE SET NULL,
  checkpoint_date DATE NOT NULL DEFAULT CURRENT_DATE,
  week_number INT,
  current_phase TEXT,
  weight_kg NUMERIC(5,2),
  bf_percent NUMERIC(4,2),
  waist_cm NUMERIC(5,2),
  energy_level INT CHECK (energy_level BETWEEN 1 AND 10),
  hunger_level INT CHECK (hunger_level BETWEEN 1 AND 10),
  sleep_quality INT CHECK (sleep_quality BETWEEN 1 AND 10),
  training_performance INT CHECK (training_performance BETWEEN 1 AND 10),
  mood INT CHECK (mood BETWEEN 1 AND 10),
  adherence_pct INT CHECK (adherence_pct BETWEEN 0 AND 100),
  photo_front_url TEXT,
  photo_side_url TEXT,
  photo_back_url TEXT,
  notes TEXT,
  ai_assessment JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_meridian_checkpoints_user_date ON public.meridian_weekly_checkpoints(user_id, checkpoint_date DESC);
CREATE INDEX idx_meridian_checkpoints_plan ON public.meridian_weekly_checkpoints(plan_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.meridian_weekly_checkpoints TO authenticated;
GRANT ALL ON public.meridian_weekly_checkpoints TO service_role;

ALTER TABLE public.meridian_weekly_checkpoints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "checkpoints_own_select" ON public.meridian_weekly_checkpoints FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "checkpoints_own_insert" ON public.meridian_weekly_checkpoints FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "checkpoints_own_update" ON public.meridian_weekly_checkpoints FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "checkpoints_own_delete" ON public.meridian_weekly_checkpoints FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER trg_meridian_checkpoints_updated
BEFORE UPDATE ON public.meridian_weekly_checkpoints
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Plan adjustments
CREATE TABLE public.meridian_plan_adjustments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  plan_id UUID NOT NULL REFERENCES public.meridian_plans(id) ON DELETE CASCADE,
  checkpoint_id UUID REFERENCES public.meridian_weekly_checkpoints(id) ON DELETE SET NULL,
  adjustment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  adjustment_type TEXT NOT NULL,
  kcal_delta INT DEFAULT 0,
  cardio_delta_min INT DEFAULT 0,
  protein_delta_g INT DEFAULT 0,
  carbs_delta_g INT DEFAULT 0,
  fat_delta_g INT DEFAULT 0,
  reason TEXT,
  ai_rationale TEXT,
  applied_by TEXT NOT NULL DEFAULT 'SYSTEM',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_meridian_adjustments_plan ON public.meridian_plan_adjustments(plan_id, adjustment_date DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.meridian_plan_adjustments TO authenticated;
GRANT ALL ON public.meridian_plan_adjustments TO service_role;

ALTER TABLE public.meridian_plan_adjustments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "adjustments_own_select" ON public.meridian_plan_adjustments FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "adjustments_own_insert" ON public.meridian_plan_adjustments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "adjustments_own_update" ON public.meridian_plan_adjustments FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "adjustments_own_delete" ON public.meridian_plan_adjustments FOR DELETE TO authenticated USING (auth.uid() = user_id);