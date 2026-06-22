-- Fix apex_checkins athlete SELECT: join through competition_athletes.patient_user_id
DROP POLICY IF EXISTS "Atleta reads own apex_checkins" ON public.apex_checkins;
CREATE POLICY "Atleta reads own apex_checkins"
ON public.apex_checkins
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.competition_athletes ca
    WHERE ca.id = apex_checkins.atleta_id
      AND ca.patient_user_id = auth.uid()
  )
);

-- Restrict apex_training_rules SELECT to coaches and admins only
DROP POLICY IF EXISTS "Coaches leem regras" ON public.apex_training_rules;
CREATE POLICY "Coaches and admins read training rules"
ON public.apex_training_rules
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR EXISTS (SELECT 1 FROM public.coach_profiles cp WHERE cp.user_id = auth.uid())
);

-- Allow athletes to read their own visual assessments
CREATE POLICY "Atleta lê próprias avaliações visuais"
ON public.athlete_visual_assessments
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.competition_athletes ca
    WHERE ca.id = athlete_visual_assessments.athlete_id
      AND ca.patient_user_id = auth.uid()
  )
);