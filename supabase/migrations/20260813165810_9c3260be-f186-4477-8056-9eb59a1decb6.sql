-- 1) coach_profiles: prevent self-service tier/limit escalation
CREATE OR REPLACE FUNCTION public.protect_coach_profile_billing_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF current_setting('role', true) = 'service_role' OR auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;
  NEW.plan := OLD.plan;
  NEW.tier := OLD.tier;
  NEW.max_patients := OLD.max_patients;
  NEW.max_alunos := OLD.max_alunos;
  NEW.trial_ends_at := OLD.trial_ends_at;
  NEW.alunos_ativos := OLD.alunos_ativos;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_coach_profile_billing ON public.coach_profiles;
CREATE TRIGGER trg_protect_coach_profile_billing
BEFORE UPDATE ON public.coach_profiles
FOR EACH ROW EXECUTE FUNCTION public.protect_coach_profile_billing_fields();

-- 2) profiles: prevent self-granting paid features / plans
CREATE OR REPLACE FUNCTION public.protect_profile_billing_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF current_setting('role', true) = 'service_role' OR auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;
  NEW.features_override := OLD.features_override;
  NEW.plano_atual := OLD.plano_atual;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_profile_billing ON public.profiles;
CREATE TRIGGER trg_protect_profile_billing
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.protect_profile_billing_fields();

-- 3) weekly_checkins: only the coach (or backend) may write coach response fields
CREATE OR REPLACE FUNCTION public.protect_checkin_coach_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF current_setting('role', true) = 'service_role' OR auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;
  IF public.is_coach_of_patient(auth.uid(), NEW.user_id)
     OR public.has_role(auth.uid(), 'admin') THEN
    RETURN NEW;
  END IF;
  NEW.coach_feedback := OLD.coach_feedback;
  NEW.coach_macro_adjustment := OLD.coach_macro_adjustment;
  NEW.coach_responded_at := OLD.coach_responded_at;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_checkin_coach_fields ON public.weekly_checkins;
CREATE TRIGGER trg_protect_checkin_coach_fields
BEFORE UPDATE ON public.weekly_checkins
FOR EACH ROW EXECUTE FUNCTION public.protect_checkin_coach_fields();