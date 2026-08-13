CREATE POLICY "Coach can update patient profiles"
ON public.profiles FOR UPDATE
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.coach_patients cp
  JOIN public.coach_profiles cpf ON cp.coach_id = cpf.id
  WHERE cp.patient_user_id = profiles.user_id
    AND cpf.user_id = auth.uid()
    AND cp.status = 'active'
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.coach_patients cp
  JOIN public.coach_profiles cpf ON cp.coach_id = cpf.id
  WHERE cp.patient_user_id = profiles.user_id
    AND cpf.user_id = auth.uid()
    AND cp.status = 'active'
));