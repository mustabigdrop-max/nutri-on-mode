-- 1) supplement_analyses: shared reference library, read-only for signed-in users
REVOKE ALL ON public.supplement_analyses FROM anon;
REVOKE ALL ON public.supplement_analyses FROM authenticated;
GRANT SELECT ON public.supplement_analyses TO authenticated;
GRANT ALL ON public.supplement_analyses TO service_role;

ALTER TABLE public.supplement_analyses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS authenticated_can_read_supplements ON public.supplement_analyses;
CREATE POLICY "Authenticated users can read supplement library"
ON public.supplement_analyses
FOR SELECT
TO authenticated
USING (true);

-- 2) workout_logs: coach access requires an ACTIVE coach-patient link
REVOKE ALL ON public.workout_logs FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workout_logs TO authenticated;
GRANT ALL ON public.workout_logs TO service_role;

ALTER TABLE public.workout_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS athlete_own_workout_logs ON public.workout_logs;
CREATE POLICY "Athletes manage their own workout logs"
ON public.workout_logs
FOR ALL
TO authenticated
USING (auth.uid() = athlete_id)
WITH CHECK (auth.uid() = athlete_id);

DROP POLICY IF EXISTS coach_view_athlete_logs ON public.workout_logs;
CREATE POLICY "Coaches view logs of their active patients"
ON public.workout_logs
FOR SELECT
TO authenticated
USING (
  public.is_coach_of_patient(auth.uid(), workout_logs.athlete_id)
  AND EXISTS (
    SELECT 1
    FROM public.training_protocols tp
    WHERE tp.id = workout_logs.protocol_id
      AND tp.user_id = auth.uid()
  )
);