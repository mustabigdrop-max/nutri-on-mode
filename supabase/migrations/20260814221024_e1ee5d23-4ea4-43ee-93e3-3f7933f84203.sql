ALTER TABLE public.sent_plans ALTER COLUMN coach_message SET DEFAULT '';
UPDATE public.sent_plans SET coach_message = '' WHERE coach_message IS NULL;