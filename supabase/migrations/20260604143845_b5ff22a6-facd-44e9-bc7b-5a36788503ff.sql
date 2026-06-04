
-- ============================================================
-- FIX 1: has_role() canonical para tabelas admin-scoped
-- ============================================================

-- coach_apex_log (dono = admin_id)
DO $$ DECLARE pol RECORD; BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename='coach_apex_log'
  LOOP EXECUTE format('DROP POLICY IF EXISTS %I ON public.coach_apex_log', pol.policyname); END LOOP;
END $$;

CREATE POLICY "Admins manage coach_apex_log" ON public.coach_apex_log
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role) OR admin_id = auth.uid())
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR admin_id = auth.uid());

-- coach_apex_sessions
DO $$ DECLARE pol RECORD; BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename='coach_apex_sessions'
  LOOP EXECUTE format('DROP POLICY IF EXISTS %I ON public.coach_apex_sessions', pol.policyname); END LOOP;
END $$;

CREATE POLICY "Admins manage coach_apex_sessions" ON public.coach_apex_sessions
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role) OR admin_id = auth.uid())
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR admin_id = auth.uid());

-- coach_atleta_prontuario
DO $$ DECLARE pol RECORD; BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename='coach_atleta_prontuario'
  LOOP EXECUTE format('DROP POLICY IF EXISTS %I ON public.coach_atleta_prontuario', pol.policyname); END LOOP;
END $$;

CREATE POLICY "Admins manage coach_atleta_prontuario" ON public.coach_atleta_prontuario
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role) OR admin_id = auth.uid())
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR admin_id = auth.uid());

-- coach_exam_protocols
DO $$ DECLARE pol RECORD; BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename='coach_exam_protocols'
  LOOP EXECUTE format('DROP POLICY IF EXISTS %I ON public.coach_exam_protocols', pol.policyname); END LOOP;
END $$;

CREATE POLICY "Admins manage coach_exam_protocols" ON public.coach_exam_protocols
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role) OR admin_id = auth.uid())
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR admin_id = auth.uid());

-- fitoterapicos_lib (biblioteca: leitura pública para autenticados; escrita admin)
DO $$ DECLARE pol RECORD; BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename='fitoterapicos_lib'
  LOOP EXECUTE format('DROP POLICY IF EXISTS %I ON public.fitoterapicos_lib', pol.policyname); END LOOP;
END $$;

CREATE POLICY "Admins write fitoterapicos_lib" ON public.fitoterapicos_lib
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated read fitoterapicos_lib" ON public.fitoterapicos_lib
FOR SELECT TO authenticated
USING (true);

-- ============================================================
-- FIX 2: apex_checkins — simplificar política do atleta
-- ============================================================
DROP POLICY IF EXISTS "Atleta reads own apex_checkins" ON public.apex_checkins;

CREATE POLICY "Atleta reads own apex_checkins" ON public.apex_checkins
FOR SELECT TO authenticated
USING (atleta_id = auth.uid());

-- ============================================================
-- FIX 3: apex_vera_bridge — DELETE somente para o coach criador
-- ============================================================
DO $$ DECLARE pol RECORD; BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename='apex_vera_bridge' AND cmd='DELETE'
  LOOP EXECUTE format('DROP POLICY IF EXISTS %I ON public.apex_vera_bridge', pol.policyname); END LOOP;
END $$;

CREATE POLICY "Coach deletes own vera_bridge" ON public.apex_vera_bridge
FOR DELETE TO authenticated
USING (coach_user_id = auth.uid());

-- ============================================================
-- FIX 4: athlete_weekly_reports — atleta lê, coach precisa de vínculo
-- ============================================================
DO $$ DECLARE pol RECORD; BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename='athlete_weekly_reports'
  LOOP EXECUTE format('DROP POLICY IF EXISTS %I ON public.athlete_weekly_reports', pol.policyname); END LOOP;
END $$;

CREATE POLICY "Athlete reads own weekly reports" ON public.athlete_weekly_reports
FOR SELECT TO authenticated
USING (athlete_id = auth.uid());

CREATE POLICY "Coach reads own weekly reports" ON public.athlete_weekly_reports
FOR SELECT TO authenticated
USING (coach_id = auth.uid());

CREATE POLICY "Coach inserts weekly report for linked athlete" ON public.athlete_weekly_reports
FOR INSERT TO authenticated
WITH CHECK (
  coach_id = auth.uid()
  AND public.is_coach_of_patient(auth.uid(), athlete_id)
);

CREATE POLICY "Coach updates own weekly reports" ON public.athlete_weekly_reports
FOR UPDATE TO authenticated
USING (coach_id = auth.uid())
WITH CHECK (
  coach_id = auth.uid()
  AND public.is_coach_of_patient(auth.uid(), athlete_id)
);

CREATE POLICY "Coach deletes own weekly reports" ON public.athlete_weekly_reports
FOR DELETE TO authenticated
USING (coach_id = auth.uid());
