CREATE TABLE IF NOT EXISTS public.apex_analyses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  athlete_id UUID REFERENCES public.competition_athletes(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  category_label TEXT,
  analysis_text TEXT,
  bf_estimated NUMERIC,
  bf_target NUMERIC,
  weeks_estimated INTEGER,
  priority_1 TEXT,
  priority_2 TEXT,
  priority_3 TEXT,
  scores JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_apex_analyses_coach_athlete
  ON public.apex_analyses (coach_id, athlete_id, created_at DESC);

ALTER TABLE public.apex_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coach views own apex analyses"
  ON public.apex_analyses FOR SELECT
  USING (auth.uid() = coach_id);

CREATE POLICY "Coach inserts own apex analyses"
  ON public.apex_analyses FOR INSERT
  WITH CHECK (auth.uid() = coach_id);

CREATE POLICY "Coach deletes own apex analyses"
  ON public.apex_analyses FOR DELETE
  USING (auth.uid() = coach_id);