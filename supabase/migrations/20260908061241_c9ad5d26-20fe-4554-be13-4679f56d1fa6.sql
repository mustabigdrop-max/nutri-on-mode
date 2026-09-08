CREATE POLICY "Athletes read linked coach exercise videos"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'exercise-videos'
  AND public.is_coach_of_patient(((storage.foldername(name))[1])::uuid, auth.uid())
);