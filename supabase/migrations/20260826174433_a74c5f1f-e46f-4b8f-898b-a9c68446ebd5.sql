CREATE POLICY "Authenticated users read social-posts media"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'social-posts');

CREATE POLICY "Coach uploads own social-posts media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'social-posts'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Coach updates own social-posts media"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'social-posts'
  AND auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'social-posts'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Coach deletes own social-posts media"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'social-posts'
  AND auth.uid()::text = (storage.foldername(name))[1]
);