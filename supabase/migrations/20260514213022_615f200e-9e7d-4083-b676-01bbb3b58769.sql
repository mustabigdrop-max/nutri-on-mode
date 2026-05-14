
-- Add photo storage to apex_analyses for the new "Evolução Fotográfica" comparison feature
ALTER TABLE public.apex_analyses
  ADD COLUMN IF NOT EXISTS photos JSONB DEFAULT '{}'::jsonb;

-- Storage bucket for APEX Visual analysis photos (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('apex-visual-photos', 'apex-visual-photos', false)
ON CONFLICT (id) DO NOTHING;

-- Coach can manage files under their own uid prefix (path: <coach_uid>/...)
CREATE POLICY "Coach manages own apex-visual-photos"
  ON storage.objects FOR ALL
  TO authenticated
  USING (
    bucket_id = 'apex-visual-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  )
  WITH CHECK (
    bucket_id = 'apex-visual-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Admin full access
CREATE POLICY "Admin all apex-visual-photos"
  ON storage.objects FOR ALL
  TO authenticated
  USING (bucket_id = 'apex-visual-photos' AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'apex-visual-photos' AND public.has_role(auth.uid(), 'admin'));

-- Athlete reads own apex visual photos (path: <coach_uid>/<athlete_id>/...)
CREATE POLICY "Athlete reads own apex-visual-photos"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'apex-visual-photos'
    AND EXISTS (
      SELECT 1 FROM public.competition_athletes ca
      WHERE ca.id::text = (storage.foldername(name))[2]
        AND ca.patient_user_id = auth.uid()
    )
  );
