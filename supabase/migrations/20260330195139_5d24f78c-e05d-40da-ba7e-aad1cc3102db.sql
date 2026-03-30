
CREATE POLICY "Coach can view patient meal plans"
ON public.meal_plan_items
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.coach_patients cp
    JOIN public.coach_profiles cpf ON cp.coach_id = cpf.id
    WHERE cp.patient_user_id = meal_plan_items.user_id
    AND cpf.user_id = auth.uid()
    AND cp.status = 'active'
  )
);

CREATE POLICY "Coach can insert patient meal plans"
ON public.meal_plan_items
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.coach_patients cp
    JOIN public.coach_profiles cpf ON cp.coach_id = cpf.id
    WHERE cp.patient_user_id = meal_plan_items.user_id
    AND cpf.user_id = auth.uid()
    AND cp.status = 'active'
  )
);

CREATE POLICY "Coach can delete patient meal plans"
ON public.meal_plan_items
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.coach_patients cp
    JOIN public.coach_profiles cpf ON cp.coach_id = cpf.id
    WHERE cp.patient_user_id = meal_plan_items.user_id
    AND cpf.user_id = auth.uid()
    AND cp.status = 'active'
  )
);

CREATE POLICY "Coach can update patient meal plans"
ON public.meal_plan_items
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.coach_patients cp
    JOIN public.coach_profiles cpf ON cp.coach_id = cpf.id
    WHERE cp.patient_user_id = meal_plan_items.user_id
    AND cpf.user_id = auth.uid()
    AND cp.status = 'active'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.coach_patients cp
    JOIN public.coach_profiles cpf ON cp.coach_id = cpf.id
    WHERE cp.patient_user_id = meal_plan_items.user_id
    AND cpf.user_id = auth.uid()
    AND cp.status = 'active'
  )
);
