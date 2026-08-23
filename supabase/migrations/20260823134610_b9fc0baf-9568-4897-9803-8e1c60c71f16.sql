ALTER TABLE public.social_content_calendar
  ADD COLUMN IF NOT EXISTS reel_done boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS stories_done boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS day_index integer;

CREATE TABLE IF NOT EXISTS public.reels_variations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  analysis_id uuid,
  kind text NOT NULL CHECK (kind IN ('hook','cta')),
  label text,
  content text NOT NULL,
  is_winner boolean NOT NULL DEFAULT false,
  views integer,
  likes integer,
  saves integer,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.reels_variations TO authenticated;
GRANT ALL ON public.reels_variations TO service_role;

ALTER TABLE public.reels_variations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coaches manage their own reel variations"
ON public.reels_variations FOR ALL TO authenticated
USING (auth.uid() = coach_id) WITH CHECK (auth.uid() = coach_id);

CREATE INDEX IF NOT EXISTS reels_variations_coach_idx ON public.reels_variations (coach_id, created_at DESC);

CREATE TRIGGER update_reels_variations_updated_at
BEFORE UPDATE ON public.reels_variations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();