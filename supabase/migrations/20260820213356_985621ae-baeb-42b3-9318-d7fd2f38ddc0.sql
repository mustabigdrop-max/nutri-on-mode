CREATE TABLE public.prism_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL,
  files_count INTEGER NOT NULL DEFAULT 0,
  file_types TEXT[] NOT NULL DEFAULT '{}',
  context TEXT,
  ai_analysis JSONB,
  ai_decision JSONB,
  ai_content JSONB,
  tone_used TEXT,
  objective_used TEXT,
  format_used TEXT,
  saved BOOLEAN NOT NULL DEFAULT false,
  published BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.prism_analyses TO authenticated;
GRANT ALL ON public.prism_analyses TO service_role;

ALTER TABLE public.prism_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coach manages own prism analyses"
  ON public.prism_analyses FOR ALL TO authenticated
  USING (auth.uid() = coach_id)
  WITH CHECK (auth.uid() = coach_id);

CREATE INDEX idx_prism_analyses_coach ON public.prism_analyses (coach_id, created_at DESC);