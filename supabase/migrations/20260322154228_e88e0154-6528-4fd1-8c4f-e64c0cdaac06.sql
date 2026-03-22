
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS features_override JSONB DEFAULT NULL;

ALTER TABLE public.coach_patients 
ADD COLUMN IF NOT EXISTS features_override JSONB DEFAULT NULL;
