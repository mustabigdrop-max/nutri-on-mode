ALTER TABLE public.training_protocols
ADD COLUMN IF NOT EXISTS last_viewed_week SMALLINT;