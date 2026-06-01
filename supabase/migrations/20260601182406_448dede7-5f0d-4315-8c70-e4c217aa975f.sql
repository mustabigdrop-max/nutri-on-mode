-- Helper SECURITY DEFINER (sem recursão; consulta coach_patients).
CREATE OR REPLACE FUNCTION public.is_coach_of_patient(_coach_user_id UUID, _patient_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.coach_patients cp
    JOIN public.coach_profiles cpr ON cpr.id = cp.coach_id
    WHERE cpr.user_id = _coach_user_id
      AND cp.patient_user_id = _patient_user_id
      AND cp.status = 'active'
  );
$$;

REVOKE EXECUTE ON FUNCTION public.is_coach_of_patient(UUID, UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_coach_of_patient(UUID, UUID) TO authenticated, service_role;

-- Macro: cria 4 policies (select/insert/update/delete) para coach vinculado.
DO $$
DECLARE
  t TEXT;
  tables TEXT[] := ARRAY[
    'meridian_competitions',
    'meridian_plans',
    'meridian_checkpoints',
    'meridian_athlete_parameters',
    'meridian_peak_week_protocols',
    'meridian_post_stage_recovery',
    'meridian_multi_show_chains',
    'meridian_lifestyle_routines',
    'meridian_triad_logs',
    'meridian_menstrual_cycle_entries',
    'meridian_drug_tests'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name=t) THEN
      EXECUTE format('DROP POLICY IF EXISTS "coach_select_linked" ON public.%I', t);
      EXECUTE format('DROP POLICY IF EXISTS "coach_insert_linked" ON public.%I', t);
      EXECUTE format('DROP POLICY IF EXISTS "coach_update_linked" ON public.%I', t);
      EXECUTE format('DROP POLICY IF EXISTS "coach_delete_linked" ON public.%I', t);

      EXECUTE format($f$
        CREATE POLICY "coach_select_linked" ON public.%I
        FOR SELECT TO authenticated
        USING (public.is_coach_of_patient(auth.uid(), user_id))
      $f$, t);

      EXECUTE format($f$
        CREATE POLICY "coach_insert_linked" ON public.%I
        FOR INSERT TO authenticated
        WITH CHECK (public.is_coach_of_patient(auth.uid(), user_id))
      $f$, t);

      EXECUTE format($f$
        CREATE POLICY "coach_update_linked" ON public.%I
        FOR UPDATE TO authenticated
        USING (public.is_coach_of_patient(auth.uid(), user_id))
        WITH CHECK (public.is_coach_of_patient(auth.uid(), user_id))
      $f$, t);

      EXECUTE format($f$
        CREATE POLICY "coach_delete_linked" ON public.%I
        FOR DELETE TO authenticated
        USING (public.is_coach_of_patient(auth.uid(), user_id))
      $f$, t);
    END IF;
  END LOOP;
END $$;