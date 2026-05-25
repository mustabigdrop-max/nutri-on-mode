
-- 1. Fix apex_checkins athlete SELECT policy
DROP POLICY IF EXISTS "Atleta reads own apex_checkins" ON public.apex_checkins;
CREATE POLICY "Atleta reads own apex_checkins"
  ON public.apex_checkins FOR SELECT
  USING (
    atleta_id = auth.uid()
    OR atleta_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );

-- 2. coach_notifications: remove hardcoded UUID, use has_role
DROP POLICY IF EXISTS coach_create_notifications ON public.coach_notifications;
CREATE POLICY coach_create_notifications
  ON public.coach_notifications FOR INSERT
  WITH CHECK (
    (auth.uid() = sender_user_id) AND (
      EXISTS (
        SELECT 1 FROM coach_profiles cp
        JOIN coach_patients cpat ON cpat.coach_id = cp.id
        WHERE cp.user_id = auth.uid()
          AND cpat.patient_user_id = coach_notifications.recipient_user_id
          AND cpat.status = 'active'
      )
      OR public.has_role(auth.uid(), 'admin'::public.app_role)
    )
  );

-- 3. meal-photos: add UPDATE and DELETE
CREATE POLICY "Users can update own meal photos"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'meal-photos' AND (storage.foldername(name))[1] = (auth.uid())::text);

CREATE POLICY "Users can delete own meal photos"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'meal-photos' AND (storage.foldername(name))[1] = (auth.uid())::text);

-- 4. postural-photos: add UPDATE
CREATE POLICY "Users update own postural photos"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'postural-photos' AND (storage.foldername(name))[1] = (auth.uid())::text);

-- 5. athlete-photos: allow athletes to read photos that belong to them.
-- File path convention: <coach_user_id>/<athlete_record_id>/...
CREATE POLICY "Atleta lê próprias fotos"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'athlete-photos'
    AND EXISTS (
      SELECT 1 FROM public.competition_athletes ca
      WHERE ca.patient_user_id = auth.uid()
        AND ca.id::text = (storage.foldername(name))[2]
    )
  );
