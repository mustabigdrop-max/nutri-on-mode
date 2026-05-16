ALTER TABLE public.apex_analyses 
  ADD COLUMN IF NOT EXISTS landmarks jsonb,
  ADD COLUMN IF NOT EXISTS photo_front_url text,
  ADD COLUMN IF NOT EXISTS photo_back_url text,
  ADD COLUMN IF NOT EXISTS photo_side_url text;