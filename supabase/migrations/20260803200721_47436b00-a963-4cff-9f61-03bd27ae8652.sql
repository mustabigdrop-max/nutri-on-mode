-- 1) apex_training_rules: explicit admin-only write access
GRANT INSERT, UPDATE, DELETE ON public.apex_training_rules TO authenticated;
GRANT ALL ON public.apex_training_rules TO service_role;
REVOKE INSERT, UPDATE, DELETE ON public.apex_training_rules FROM anon;

DROP POLICY IF EXISTS "Admins insert training rules" ON public.apex_training_rules;
DROP POLICY IF EXISTS "Admins update training rules" ON public.apex_training_rules;
DROP POLICY IF EXISTS "Admins delete training rules" ON public.apex_training_rules;

CREATE POLICY "Admins insert training rules" ON public.apex_training_rules
FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins update training rules" ON public.apex_training_rules
FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins delete training rules" ON public.apex_training_rules
FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- 2) coach_slots / plan_slots: read-only for clients, writes only via service_role
REVOKE INSERT, UPDATE, DELETE ON public.coach_slots FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.plan_slots FROM anon, authenticated;
REVOKE SELECT ON public.coach_slots FROM anon;
REVOKE SELECT ON public.plan_slots FROM anon;
GRANT ALL ON public.coach_slots TO service_role;
GRANT ALL ON public.plan_slots TO service_role;

DROP POLICY IF EXISTS "No client writes to coach_slots" ON public.coach_slots;
DROP POLICY IF EXISTS "No client writes to plan_slots" ON public.plan_slots;
CREATE POLICY "No client writes to coach_slots" ON public.coach_slots
AS RESTRICTIVE FOR ALL TO anon, authenticated USING (true) WITH CHECK (false);
CREATE POLICY "No client writes to plan_slots" ON public.plan_slots
AS RESTRICTIVE FOR ALL TO anon, authenticated USING (true) WITH CHECK (false);

-- 3) coach_apex_sessions / coach_atleta_prontuario: owner-scoped only, no anon access
REVOKE ALL ON public.coach_apex_sessions FROM anon;
REVOKE ALL ON public.coach_atleta_prontuario FROM anon;
GRANT ALL ON public.coach_apex_sessions TO service_role;
GRANT ALL ON public.coach_atleta_prontuario TO service_role;

DROP POLICY IF EXISTS "Admins manage coach_apex_sessions" ON public.coach_apex_sessions;
DROP POLICY IF EXISTS "Admins manage coach_atleta_prontuario" ON public.coach_atleta_prontuario;

CREATE POLICY "Owner manages coach_apex_sessions" ON public.coach_apex_sessions
FOR ALL TO authenticated USING (admin_id = auth.uid()) WITH CHECK (admin_id = auth.uid());
CREATE POLICY "Owner manages coach_atleta_prontuario" ON public.coach_atleta_prontuario
FOR ALL TO authenticated USING (admin_id = auth.uid()) WITH CHECK (admin_id = auth.uid());