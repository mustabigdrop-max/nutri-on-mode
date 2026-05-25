
ALTER TABLE public.training_sessions_completed
  ADD COLUMN IF NOT EXISTS primary_muscle_group text,
  ADD COLUMN IF NOT EXISTS warmup_completed boolean NOT NULL DEFAULT false;
