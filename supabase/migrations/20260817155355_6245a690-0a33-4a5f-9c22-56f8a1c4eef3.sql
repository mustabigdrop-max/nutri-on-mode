ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS body_profile TEXT,
  ADD COLUMN IF NOT EXISTS bf_percent NUMERIC,
  ADD COLUMN IF NOT EXISTS abw_factor NUMERIC,
  ADD COLUMN IF NOT EXISTS profile_source TEXT DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS profile_analyzed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS fat_distribution TEXT,
  ADD COLUMN IF NOT EXISTS muscle_development TEXT,
  ADD COLUMN IF NOT EXISTS protein_reference TEXT,
  ADD COLUMN IF NOT EXISTS visual_indicators TEXT[],
  ADD COLUMN IF NOT EXISTS nutritional_priorities TEXT[];

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_body_profile_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_body_profile_check
  CHECK (body_profile IS NULL OR body_profile IN ('padrao','atletico','sobrepeso','obeso','obeso_severo','masters','adolescente'));

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_profile_source_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_profile_source_check
  CHECK (profile_source IS NULL OR profile_source IN ('manual','apex_visual'));

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_fat_distribution_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_fat_distribution_check
  CHECK (fat_distribution IS NULL OR fat_distribution IN ('androide','ginoide','misto'));

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_muscle_development_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_muscle_development_check
  CHECK (muscle_development IS NULL OR muscle_development IN ('baixo','moderado','alto','muito_alto'));

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_protein_reference_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_protein_reference_check
  CHECK (protein_reference IS NULL OR protein_reference IN ('real','ideal','ajustado'));