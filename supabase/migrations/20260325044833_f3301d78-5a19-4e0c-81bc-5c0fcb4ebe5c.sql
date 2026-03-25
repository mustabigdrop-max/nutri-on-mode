
CREATE TABLE public.biological_age_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  chronological_age NUMERIC NOT NULL,
  biological_age NUMERIC NOT NULL,
  age_delta NUMERIC GENERATED ALWAYS AS (biological_age - chronological_age) STORED,
  score_breakdown JSONB DEFAULT '{}'::jsonb,
  improvement_tips TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.biological_age_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own biological age scores"
  ON public.biological_age_scores FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
