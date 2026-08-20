ALTER TABLE public.client_daily_activities
  ADD COLUMN IF NOT EXISTS activity_category TEXT,
  ADD COLUMN IF NOT EXISTS met NUMERIC,
  ADD COLUMN IF NOT EXISTS gross_kcal INTEGER,
  ADD COLUMN IF NOT EXISTS epoc_kcal INTEGER,
  ADD COLUMN IF NOT EXISTS net_adjustment INTEGER;

ALTER TABLE public.client_daily_activities
  DROP CONSTRAINT IF EXISTS client_daily_activities_category_check;

ALTER TABLE public.client_daily_activities
  ADD CONSTRAINT client_daily_activities_category_check
  CHECK (activity_category IS NULL OR activity_category IN ('musculacao','cardio','combate','outros'));