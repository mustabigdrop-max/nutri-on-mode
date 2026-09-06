CREATE TABLE public.breakdown_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Breakdown',
  exercise TEXT,
  video_path TEXT,
  trim_start NUMERIC NOT NULL DEFAULT 0,
  trim_end NUMERIC NOT NULL DEFAULT 0,
  breakpoints JSONB NOT NULL DEFAULT '[]'::jsonb,
  analyses JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.breakdown_sessions TO authenticated;
GRANT ALL ON public.breakdown_sessions TO service_role;

ALTER TABLE public.breakdown_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own breakdown sessions"
ON public.breakdown_sessions FOR ALL TO authenticated
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_breakdown_sessions_updated_at
BEFORE UPDATE ON public.breakdown_sessions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Users read own breakdown videos"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'breakdown-videos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users upload own breakdown videos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'breakdown-videos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users update own breakdown videos"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'breakdown-videos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users delete own breakdown videos"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'breakdown-videos' AND auth.uid()::text = (storage.foldername(name))[1]);