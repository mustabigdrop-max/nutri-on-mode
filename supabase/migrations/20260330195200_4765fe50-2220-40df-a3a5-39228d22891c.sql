
CREATE POLICY "Coach can view patient profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.coach_patients cp
    JOIN public.coach_profiles cpf ON cp.coach_id = cpf.id
    WHERE cp.patient_user_id = profiles.user_id
    AND cpf.user_id = auth.uid()
    AND cp.status = 'active'
  )
);

CREATE POLICY "Coach can view patient workout schedule"
ON public.workout_schedule
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.coach_patients cp
    JOIN public.coach_profiles cpf ON cp.coach_id = cpf.id
    WHERE cp.patient_user_id = workout_schedule.user_id
    AND cpf.user_id = auth.uid()
    AND cp.status = 'active'
  )
);
