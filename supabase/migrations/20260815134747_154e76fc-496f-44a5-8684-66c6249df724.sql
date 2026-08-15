ALTER TABLE public.coach_profiles
  ADD COLUMN IF NOT EXISTS professional_role TEXT NOT NULL DEFAULT 'nutrition_coach',
  ADD COLUMN IF NOT EXISTS registration_number TEXT;

UPDATE public.coach_profiles
SET professional_role = CASE
  WHEN professional_type = 'nutritionist' THEN 'nutritionist'
  WHEN professional_type = 'medico' THEN 'nutrologist'
  WHEN professional_type = 'personal_trainer' THEN 'personal_trainer'
  ELSE 'nutrition_coach'
END
WHERE professional_role = 'nutrition_coach';

ALTER TABLE public.coach_profiles
  DROP CONSTRAINT IF EXISTS coach_profiles_professional_role_check;

ALTER TABLE public.coach_profiles
  ADD CONSTRAINT coach_profiles_professional_role_check
  CHECK (professional_role IN ('nutrition_coach','nutritionist','nutrologist','personal_trainer'));