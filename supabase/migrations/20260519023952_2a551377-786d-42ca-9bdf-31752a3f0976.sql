CREATE TABLE IF NOT EXISTS public.apex_test_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  athlete_id UUID,
  coach_id UUID NOT NULL,
  test_id TEXT NOT NULL,
  test_name TEXT NOT NULL,
  test_group TEXT,
  image_url TEXT,
  raw_result JSONB NOT NULL DEFAULT '{}'::jsonb,
  measurements JSONB NOT NULL DEFAULT '{}'::jsonb,
  muscle_updates JSONB NOT NULL DEFAULT '[]'::jsonb,
  findings_text TEXT,
  overall_severity TEXT,
  evaluated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_apex_test_results_athlete_date ON public.apex_test_results(athlete_id, evaluated_at DESC);
CREATE INDEX IF NOT EXISTS idx_apex_test_results_coach ON public.apex_test_results(coach_id);

ALTER TABLE public.apex_test_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "coach manages own apex test results"
ON public.apex_test_results FOR ALL
USING (coach_id = auth.uid())
WITH CHECK (coach_id = auth.uid());

CREATE POLICY "athlete views own apex test results"
ON public.apex_test_results FOR SELECT
USING (athlete_id = auth.uid());