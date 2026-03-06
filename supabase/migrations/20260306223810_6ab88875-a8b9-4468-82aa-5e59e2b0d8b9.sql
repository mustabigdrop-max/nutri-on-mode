
-- Storage bucket for blood test PDFs
INSERT INTO storage.buckets (id, name, public) VALUES ('blood-tests', 'blood-tests', false);

-- RLS for blood-tests bucket
CREATE POLICY "Users can upload own blood tests"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'blood-tests' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can view own blood tests"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'blood-tests' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete own blood tests"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'blood-tests' AND (storage.foldername(name))[1] = auth.uid()::text);
