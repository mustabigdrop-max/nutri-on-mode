-- 1. Enum
DO $$ BEGIN
  CREATE TYPE public.professional_role AS ENUM (
    'nutricionista', 'personal_trainer', 'medico_esportivo',
    'nutrologo', 'fisioterapeuta', 'psicologo',
    'coach_esportivo', 'preparador_fisico'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2. Profiles extras
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS professional_role public.professional_role;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS registration_number TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS registration_type TEXT;

-- 3. patient_team
CREATE TABLE IF NOT EXISTS public.patient_team (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL,
  professional_id UUID NOT NULL,
  professional_role public.professional_role NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','active','inactive','rejected')),
  invited_by UUID,
  invite_message TEXT,
  patient_consent BOOLEAN NOT NULL DEFAULT false,
  patient_consent_at TIMESTAMPTZ,
  permissions JSONB NOT NULL DEFAULT '{}'::jsonb,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (patient_id, professional_id)
);
CREATE INDEX IF NOT EXISTS idx_patient_team_patient ON public.patient_team(patient_id, status);
CREATE INDEX IF NOT EXISTS idx_patient_team_prof ON public.patient_team(professional_id, status);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.patient_team TO authenticated;
GRANT ALL ON public.patient_team TO service_role;
ALTER TABLE public.patient_team ENABLE ROW LEVEL SECURITY;

-- 4. Helper functions (security definer, avoid RLS recursion)
CREATE OR REPLACE FUNCTION public.is_team_member(_patient_id uuid, _professional_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.patient_team
    WHERE patient_id = _patient_id
      AND professional_id = _professional_id
      AND status = 'active'
  );
$$;

CREATE OR REPLACE FUNCTION public.team_role_of(_patient_id uuid, _professional_id uuid)
RETURNS public.professional_role LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT professional_role FROM public.patient_team
  WHERE patient_id = _patient_id
    AND professional_id = _professional_id
    AND status = 'active'
  LIMIT 1;
$$;

-- 5. patient_team policies
DROP POLICY IF EXISTS "Team visibility" ON public.patient_team;
CREATE POLICY "Team visibility" ON public.patient_team FOR SELECT TO authenticated
USING (
  professional_id = auth.uid()
  OR invited_by = auth.uid()
  OR patient_id = auth.uid()
  OR public.is_team_member(patient_id, auth.uid())
);

DROP POLICY IF EXISTS "Team invites" ON public.patient_team;
CREATE POLICY "Team invites" ON public.patient_team FOR INSERT TO authenticated
WITH CHECK (
  invited_by = auth.uid()
  AND (
    public.is_team_member(patient_id, auth.uid())
    OR professional_id = auth.uid()
    OR public.is_coach_of_patient(auth.uid(), patient_id)
  )
);

DROP POLICY IF EXISTS "Invited updates own membership" ON public.patient_team;
CREATE POLICY "Invited updates own membership" ON public.patient_team FOR UPDATE TO authenticated
USING (professional_id = auth.uid() OR invited_by = auth.uid())
WITH CHECK (professional_id = auth.uid() OR invited_by = auth.uid());

DROP POLICY IF EXISTS "Patient consents own team" ON public.patient_team;
CREATE POLICY "Patient consents own team" ON public.patient_team FOR UPDATE TO authenticated
USING (patient_id = auth.uid())
WITH CHECK (patient_id = auth.uid());

DROP POLICY IF EXISTS "Inviter removes membership" ON public.patient_team;
CREATE POLICY "Inviter removes membership" ON public.patient_team FOR DELETE TO authenticated
USING (invited_by = auth.uid() OR professional_id = auth.uid() OR patient_id = auth.uid());

CREATE TRIGGER trg_patient_team_updated_at BEFORE UPDATE ON public.patient_team
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 6. professional_notes
CREATE TABLE IF NOT EXISTS public.professional_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL,
  author_id UUID NOT NULL,
  author_role public.professional_role NOT NULL,
  content TEXT NOT NULL,
  visibility TEXT NOT NULL DEFAULT 'all' CHECK (visibility IN (
    'all','nutri_only','personal_only','medico_only',
    'nutri_personal','nutri_medico','personal_medico','private'
  )),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_prof_notes ON public.professional_notes(patient_id, created_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.professional_notes TO authenticated;
GRANT ALL ON public.professional_notes TO service_role;
ALTER TABLE public.professional_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Team reads visible notes" ON public.professional_notes;
CREATE POLICY "Team reads visible notes" ON public.professional_notes FOR SELECT TO authenticated
USING (
  author_id = auth.uid()
  OR (
    visibility <> 'private'
    AND public.is_team_member(patient_id, auth.uid())
    AND (
      visibility = 'all'
      OR (visibility = 'nutri_only'
          AND public.team_role_of(patient_id, auth.uid()) IN ('nutricionista','nutrologo'))
      OR (visibility = 'personal_only'
          AND public.team_role_of(patient_id, auth.uid()) IN ('personal_trainer','preparador_fisico','coach_esportivo'))
      OR (visibility = 'medico_only'
          AND public.team_role_of(patient_id, auth.uid()) IN ('medico_esportivo','nutrologo'))
      OR (visibility = 'nutri_personal'
          AND public.team_role_of(patient_id, auth.uid()) IN ('nutricionista','nutrologo','personal_trainer','preparador_fisico','coach_esportivo'))
      OR (visibility = 'nutri_medico'
          AND public.team_role_of(patient_id, auth.uid()) IN ('nutricionista','nutrologo','medico_esportivo'))
      OR (visibility = 'personal_medico'
          AND public.team_role_of(patient_id, auth.uid()) IN ('personal_trainer','preparador_fisico','coach_esportivo','medico_esportivo','nutrologo'))
    )
  )
);

DROP POLICY IF EXISTS "Team writes notes" ON public.professional_notes;
CREATE POLICY "Team writes notes" ON public.professional_notes FOR INSERT TO authenticated
WITH CHECK (author_id = auth.uid() AND public.is_team_member(patient_id, auth.uid()));

DROP POLICY IF EXISTS "Author manages own notes" ON public.professional_notes;
CREATE POLICY "Author manages own notes" ON public.professional_notes FOR UPDATE TO authenticated
USING (author_id = auth.uid()) WITH CHECK (author_id = auth.uid());

DROP POLICY IF EXISTS "Author deletes own notes" ON public.professional_notes;
CREATE POLICY "Author deletes own notes" ON public.professional_notes FOR DELETE TO authenticated
USING (author_id = auth.uid());

CREATE TRIGGER trg_professional_notes_updated_at BEFORE UPDATE ON public.professional_notes
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 7. professional_alerts
CREATE TABLE IF NOT EXISTS public.professional_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL,
  triggered_by UUID,
  target_professional UUID NOT NULL,
  trigger_type TEXT NOT NULL,
  message TEXT NOT NULL,
  action_url TEXT,
  status TEXT NOT NULL DEFAULT 'unread' CHECK (status IN ('unread','read','resolved')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_prof_alerts ON public.professional_alerts(target_professional, status, created_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.professional_alerts TO authenticated;
GRANT ALL ON public.professional_alerts TO service_role;
ALTER TABLE public.professional_alerts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Professional reads own alerts" ON public.professional_alerts;
CREATE POLICY "Professional reads own alerts" ON public.professional_alerts FOR SELECT TO authenticated
USING (target_professional = auth.uid());

DROP POLICY IF EXISTS "Professional updates own alerts" ON public.professional_alerts;
CREATE POLICY "Professional updates own alerts" ON public.professional_alerts FOR UPDATE TO authenticated
USING (target_professional = auth.uid()) WITH CHECK (target_professional = auth.uid());

DROP POLICY IF EXISTS "Team creates alerts" ON public.professional_alerts;
CREATE POLICY "Team creates alerts" ON public.professional_alerts FOR INSERT TO authenticated
WITH CHECK (triggered_by = auth.uid() AND public.is_team_member(patient_id, auth.uid()));

-- 8. patient_timeline
CREATE TABLE IF NOT EXISTS public.patient_timeline (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL,
  actor_id UUID,
  actor_role public.professional_role,
  actor_name TEXT,
  event_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  data_category TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_timeline ON public.patient_timeline(patient_id, created_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.patient_timeline TO authenticated;
GRANT ALL ON public.patient_timeline TO service_role;
ALTER TABLE public.patient_timeline ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Team reads timeline" ON public.patient_timeline;
CREATE POLICY "Team reads timeline" ON public.patient_timeline FOR SELECT TO authenticated
USING (patient_id = auth.uid() OR public.is_team_member(patient_id, auth.uid()));

DROP POLICY IF EXISTS "Team writes timeline" ON public.patient_timeline;
CREATE POLICY "Team writes timeline" ON public.patient_timeline FOR INSERT TO authenticated
WITH CHECK (
  actor_id = auth.uid()
  AND (patient_id = auth.uid() OR public.is_team_member(patient_id, auth.uid()))
);

-- 9. Trigger de alertas cruzados em sent_plans
CREATE OR REPLACE FUNCTION public.notify_team_on_plan_change()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  team_member RECORD;
  trigger_msg TEXT;
  actor_user_id UUID;
  target_roles public.professional_role[];
  evt_title TEXT;
BEGIN
  SELECT user_id INTO actor_user_id FROM public.coach_profiles WHERE id = NEW.coach_id;
  IF actor_user_id IS NULL THEN
    actor_user_id := NEW.coach_id;
  END IF;

  IF NEW.type = 'training_plan' THEN
    trigger_msg := 'Plano de treino atualizado — revisar macros peri-treino';
    target_roles := ARRAY['nutricionista','nutrologo']::public.professional_role[];
    evt_title := 'Novo plano de treino enviado';
  ELSIF NEW.type = 'meal_plan' THEN
    trigger_msg := 'Plano alimentar atualizado — verificar energia peri-treino';
    target_roles := ARRAY['personal_trainer','preparador_fisico','coach_esportivo']::public.professional_role[];
    evt_title := 'Novo plano alimentar enviado';
  ELSE
    trigger_msg := NULL;
    target_roles := ARRAY[]::public.professional_role[];
    evt_title := 'Novo envio para o paciente';
  END IF;

  IF trigger_msg IS NOT NULL THEN
    FOR team_member IN
      SELECT professional_id FROM public.patient_team
      WHERE patient_id = NEW.athlete_id
        AND status = 'active'
        AND professional_role = ANY(target_roles)
        AND professional_id IS DISTINCT FROM actor_user_id
    LOOP
      INSERT INTO public.professional_alerts
        (patient_id, triggered_by, target_professional, trigger_type, message)
      VALUES (NEW.athlete_id, actor_user_id, team_member.professional_id,
              NEW.type || '_changed', trigger_msg);
    END LOOP;
  END IF;

  INSERT INTO public.patient_timeline
    (patient_id, actor_id, event_type, title, data_category)
  VALUES (NEW.athlete_id, actor_user_id, 'plan_sent', evt_title, NEW.type);

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_plan_sent ON public.sent_plans;
CREATE TRIGGER on_plan_sent AFTER INSERT ON public.sent_plans
FOR EACH ROW EXECUTE FUNCTION public.notify_team_on_plan_change();
