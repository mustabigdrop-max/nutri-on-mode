CREATE TABLE public.retention_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  script jsonb NOT NULL,
  real_data jsonb NOT NULL,
  result jsonb NOT NULL,
  pattern_keys text[] NOT NULL DEFAULT '{}'
);
GRANT SELECT, DELETE ON public.retention_feedback TO authenticated;
GRANT ALL ON public.retention_feedback TO service_role;
ALTER TABLE public.retention_feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own feedback read" ON public.retention_feedback FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "own feedback delete" ON public.retention_feedback FOR DELETE TO authenticated USING (user_id = auth.uid());
CREATE INDEX retention_feedback_user_idx ON public.retention_feedback(user_id, created_at DESC);