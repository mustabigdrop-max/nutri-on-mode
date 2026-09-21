-- profiles: bloquear tambem role, trial_ends_at e coach_profile_id em updates do cliente
CREATE OR REPLACE FUNCTION public.protect_profile_billing_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF current_setting('role', true) = 'service_role' OR auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;
  IF public.has_role(auth.uid(), 'admin'::app_role) THEN
    RETURN NEW;
  END IF;
  NEW.features_override := OLD.features_override;
  NEW.plano_atual := OLD.plano_atual;
  NEW.role := OLD.role;
  NEW.trial_ends_at := OLD.trial_ends_at;
  NEW.coach_profile_id := OLD.coach_profile_id;
  RETURN NEW;
END;
$$;

-- coach_profiles: permitir admin, manter campos de cobranca travados para o proprio coach
CREATE OR REPLACE FUNCTION public.protect_coach_profile_billing_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF current_setting('role', true) = 'service_role' OR auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;
  IF public.has_role(auth.uid(), 'admin'::app_role) THEN
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

-- coach_patients: incluir features_override entre os campos protegidos
CREATE OR REPLACE FUNCTION public.protect_coach_patient_lock_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL OR current_setting('role', true) = 'service_role' THEN
    RETURN NEW;
  END IF;

  IF public.has_role(auth.uid(), 'admin'::app_role)
     OR EXISTS (
       SELECT 1 FROM public.coach_profiles cp
       WHERE cp.id = NEW.coach_id AND cp.user_id = auth.uid()
     ) THEN
    RETURN NEW;
  END IF;

  NEW.plan_expires_at := OLD.plan_expires_at;
  NEW.is_locked := OLD.is_locked;
  NEW.locked_at := OLD.locked_at;
  NEW.lock_reason := OLD.lock_reason;
  NEW.lock_notified := OLD.lock_notified;
  NEW.unlocked_at := OLD.unlocked_at;
  NEW.lock_history := OLD.lock_history;
  NEW.features_override := OLD.features_override;
  RETURN NEW;
END;
$$;
