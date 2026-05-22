ALTER TABLE public.exercises ADD COLUMN IF NOT EXISTS resistance_profile TEXT CHECK (resistance_profile IN ('ALONGADO','ENCURTADO','CONSTANTE','MISTO'));
ALTER TABLE public.exercises ADD COLUMN IF NOT EXISTS muscle_portion TEXT;
ALTER TABLE public.exercises ADD COLUMN IF NOT EXISTS profile_evidence TEXT;
CREATE INDEX IF NOT EXISTS idx_exercises_profile ON public.exercises(resistance_profile);