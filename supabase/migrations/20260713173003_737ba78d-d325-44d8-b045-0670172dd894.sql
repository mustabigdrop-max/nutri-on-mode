
-- 1) athlete_milestones: add athlete self-access via competition_athletes.patient_user_id
CREATE POLICY "Athlete reads own milestones"
ON public.athlete_milestones
FOR SELECT
TO authenticated
USING (
  athlete_id IN (
    SELECT id FROM public.competition_athletes
    WHERE patient_user_id = auth.uid()
  )
);

-- 2) coach_slots + plan_slots: restrict public read to authenticated only
DROP POLICY IF EXISTS "coach_slots_public_read" ON public.coach_slots;
CREATE POLICY "coach_slots_authenticated_read"
ON public.coach_slots
FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Anyone can read plan slots" ON public.plan_slots;
CREATE POLICY "Authenticated can read plan slots"
ON public.plan_slots
FOR SELECT
TO authenticated
USING (true);

REVOKE SELECT ON public.coach_slots FROM anon;
REVOKE SELECT ON public.plan_slots FROM anon;

-- 3) plateau_protocols: replace coach policies to use canonical is_coach_of_patient pattern
DROP POLICY IF EXISTS "Coaches view linked athlete plateau protocols" ON public.plateau_protocols;
DROP POLICY IF EXISTS "Coaches insert plateau protocols for linked athletes" ON public.plateau_protocols;

CREATE POLICY "Coaches view linked athlete plateau protocols"
ON public.plateau_protocols
FOR SELECT
TO authenticated
USING (public.is_coach_of_patient(auth.uid(), athlete_id));

CREATE POLICY "Coaches insert plateau protocols for linked athletes"
ON public.plateau_protocols
FOR INSERT
TO authenticated
WITH CHECK (public.is_coach_of_patient(auth.uid(), athlete_id));

CREATE POLICY "Coaches update linked athlete plateau protocols"
ON public.plateau_protocols
FOR UPDATE
TO authenticated
USING (public.is_coach_of_patient(auth.uid(), athlete_id))
WITH CHECK (public.is_coach_of_patient(auth.uid(), athlete_id));
