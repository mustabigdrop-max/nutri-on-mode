
-- Table for postural correction photos
CREATE TABLE public.postural_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  photo_date DATE NOT NULL DEFAULT CURRENT_DATE,
  category TEXT NOT NULL DEFAULT 'geral',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.postural_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own postural photos"
  ON public.postural_photos FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Storage bucket for postural photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('postural-photos', 'postural-photos', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users upload postural photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'postural-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users view own postural photos"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'postural-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users delete own postural photos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'postural-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
