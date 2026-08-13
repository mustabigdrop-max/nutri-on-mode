DROP POLICY IF EXISTS "Patient can view own received plans" ON public.coach_meal_plans;
CREATE POLICY "Patient can view own received plans"
ON public.coach_meal_plans FOR SELECT TO authenticated
USING (patient_user_id = auth.uid());

CREATE POLICY "Coach can view patient meal plans"
ON public.coach_meal_plans FOR SELECT TO authenticated
USING (patient_user_id IS NOT NULL AND public.is_coach_of_patient(auth.uid(), patient_user_id));

CREATE POLICY "Coach can view patient training protocols"
ON public.training_protocols FOR SELECT TO authenticated
USING (patient_user_id IS NOT NULL AND public.is_coach_of_patient(auth.uid(), patient_user_id));

GRANT SELECT, INSERT, UPDATE, DELETE ON public.coach_meal_plans TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.training_protocols TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sent_plans TO authenticated;
GRANT ALL ON public.coach_meal_plans TO service_role;
GRANT ALL ON public.training_protocols TO service_role;
GRANT ALL ON public.sent_plans TO service_role;