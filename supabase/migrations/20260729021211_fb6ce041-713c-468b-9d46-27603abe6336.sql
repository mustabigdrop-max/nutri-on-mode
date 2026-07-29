-- 1) apex_training_rules / coach_slots / plan_slots: read-only for app users, writes only via service role
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.apex_training_rules FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.coach_slots FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.plan_slots FROM anon, authenticated;
GRANT ALL ON public.apex_training_rules TO service_role;
GRANT ALL ON public.coach_slots TO service_role;
GRANT ALL ON public.plan_slots TO service_role;

-- 2) apex_test_results: athlete linkage must be explicit and non-null
DROP POLICY IF EXISTS "athlete views own apex test results" ON public.apex_test_results;
CREATE POLICY "athlete views own apex test results"
ON public.apex_test_results
FOR SELECT
TO authenticated
USING (athlete_id IS NOT NULL AND auth.uid() IS NOT NULL AND athlete_id = auth.uid());

DROP POLICY IF EXISTS "coach manages own apex test results" ON public.apex_test_results;
CREATE POLICY "coach manages own apex test results"
ON public.apex_test_results
FOR ALL
TO authenticated
USING (coach_id = auth.uid())
WITH CHECK (coach_id = auth.uid());