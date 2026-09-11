CREATE TABLE IF NOT EXISTS public.social_carousel_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic text NOT NULL,
  niche text NOT NULL CHECK (niche IN ('nutricao','treino','hormonal','mce','livre')),
  tone text NOT NULL CHECK (tone IN ('cientifico','didatico','motivacional','coach')),
  slides jsonb NOT NULL CHECK (jsonb_typeof(slides) = 'array' AND jsonb_array_length(slides) = 5),
  caption text,
  sources text[] NOT NULL DEFAULT '{}',
  score jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_social_carousel_history_coach_created ON public.social_carousel_history(coach_id, created_at DESC);
ALTER TABLE public.social_carousel_history ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.social_carousel_history TO authenticated;
GRANT ALL ON public.social_carousel_history TO service_role;
DROP POLICY IF EXISTS "Coach manages own carousel history" ON public.social_carousel_history;
CREATE POLICY "Coach manages own carousel history" ON public.social_carousel_history FOR ALL TO authenticated USING (auth.uid() = coach_id) WITH CHECK (auth.uid() = coach_id);
