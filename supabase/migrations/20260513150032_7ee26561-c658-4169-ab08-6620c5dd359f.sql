
CREATE TABLE IF NOT EXISTS public.apex_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  athlete_name text NOT NULL,
  athlete_age int,
  athlete_weight numeric,
  athlete_height numeric,
  assessment_date date NOT NULL DEFAULT current_date,
  image_url text,
  landmarks jsonb,
  angles jsonb NOT NULL,
  apex_score int NOT NULL,
  findings jsonb NOT NULL,
  muscle_status jsonb,
  protocol jsonb,
  cueing jsonb,
  phase text CHECK (phase IN ('bulk','cut','peak','maintenance')),
  notes text
);

ALTER TABLE public.apex_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners manage their apex reports"
  ON public.apex_reports FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER trg_apex_reports_updated_at
BEFORE UPDATE ON public.apex_reports
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_apex_reports_user ON public.apex_reports(user_id, created_at DESC);

INSERT INTO storage.buckets (id, name, public)
VALUES ('assessments', 'assessments', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users read own assessment files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'assessments' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users upload own assessment files"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'assessments' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users update own assessment files"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'assessments' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users delete own assessment files"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'assessments' AND auth.uid()::text = (storage.foldername(name))[1]);
