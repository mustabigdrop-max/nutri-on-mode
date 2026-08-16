
CREATE OR REPLACE FUNCTION public.is_coach_user(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.coach_profiles cp WHERE cp.user_id = _user_id)
      OR public.has_role(_user_id, 'admin'::app_role);
$$;

CREATE POLICY "episodes_coach_write"
ON public.mce_audio_episodes
FOR ALL
TO authenticated
USING (public.is_coach_user(auth.uid()))
WITH CHECK (public.is_coach_user(auth.uid()));

CREATE POLICY "mce_audio_read_authenticated"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'mce-audio');

CREATE POLICY "mce_audio_coach_insert"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'mce-audio' AND public.is_coach_user(auth.uid()));

CREATE POLICY "mce_audio_coach_update"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'mce-audio' AND public.is_coach_user(auth.uid()))
WITH CHECK (bucket_id = 'mce-audio' AND public.is_coach_user(auth.uid()));

CREATE POLICY "mce_audio_coach_delete"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'mce-audio' AND public.is_coach_user(auth.uid()));
