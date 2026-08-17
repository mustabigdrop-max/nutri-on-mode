ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS lean_mass_kg NUMERIC,
  ADD COLUMN IF NOT EXISTS waist_cm NUMERIC,
  ADD COLUMN IF NOT EXISTS ideal_weight_kg NUMERIC,
  ADD COLUMN IF NOT EXISTS adjusted_weight_kg NUMERIC,
  ADD COLUMN IF NOT EXISTS comorbidities TEXT[] DEFAULT '{}'::text[];

ALTER TABLE public.profiles ALTER COLUMN body_profile SET DEFAULT 'padrao';
ALTER TABLE public.profiles ALTER COLUMN abw_factor SET DEFAULT 0.25;
ALTER TABLE public.profiles ALTER COLUMN profile_source SET DEFAULT 'manual';

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_body_profile_check') THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_body_profile_check
      CHECK (body_profile IS NULL OR body_profile IN ('padrao','atletico','sobrepeso','obeso','obeso_severo','masters','adolescente'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_fat_distribution_check') THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_fat_distribution_check
      CHECK (fat_distribution IS NULL OR fat_distribution IN ('androide','ginoide','misto'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_muscle_development_check') THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_muscle_development_check
      CHECK (muscle_development IS NULL OR muscle_development IN ('baixo','moderado','alto','muito_alto'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_profile_source_check') THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_profile_source_check
      CHECK (profile_source IS NULL OR profile_source IN ('manual','apex_visual'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_protein_reference_check') THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_protein_reference_check
      CHECK (protein_reference IS NULL OR protein_reference IN ('real','ideal'));
  END IF;
END $$;