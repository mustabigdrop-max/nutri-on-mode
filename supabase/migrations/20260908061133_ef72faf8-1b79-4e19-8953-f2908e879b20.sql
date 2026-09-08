CREATE POLICY "Coaches upload own exercise videos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'exercise-videos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Coaches read own exercise videos"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'exercise-videos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Coaches update own exercise videos"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'exercise-videos'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'exercise-videos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Coaches delete own exercise videos"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'exercise-videos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);