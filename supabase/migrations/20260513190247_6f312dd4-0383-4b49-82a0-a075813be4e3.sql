ALTER TABLE public.corrective_training_plans
  ADD COLUMN IF NOT EXISTS apex_imported boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS apex_weak_points jsonb,
  ADD COLUMN IF NOT EXISTS training_method text,
  ADD COLUMN IF NOT EXISTS split_type text,
  ADD COLUMN IF NOT EXISTS week_number integer,
  ADD COLUMN IF NOT EXISTS weekly_volume jsonb,
  ADD COLUMN IF NOT EXISTS volume_valid boolean,
  ADD COLUMN IF NOT EXISTS volume_violations jsonb;