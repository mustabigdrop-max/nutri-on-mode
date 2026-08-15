
-- Enforce patient consent before coach/professional links become active.
CREATE OR REPLACE FUNCTION public.enforce_patient_link_consent()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_patient uuid;
BEGIN
  -- Server-side (service_role / triggers without a JWT) keeps full control.
  IF auth.uid() IS NULL OR current_setting('role', true) = 'service_role' THEN
    RETURN NEW;
  END IF;

  IF TG_TABLE_NAME = 'coach_patients' THEN
    v_patient := NEW.patient_user_id;
  ELSE
    v_patient := NEW.patient_id;
  END IF;

  -- The patient themself, or an admin, may activate the link.
  IF auth.uid() = v_patient OR public.has_role(auth.uid(), 'admin') THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    NEW.status := 'pending';
  ELSIF NEW.status = 'active' AND COALESCE(OLD.status, '') <> 'active' THEN
    NEW.status := OLD.status;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_coach_patients_consent ON public.coach_patients;
CREATE TRIGGER trg_coach_patients_consent
BEFORE INSERT OR UPDATE ON public.coach_patients
FOR EACH ROW EXECUTE FUNCTION public.enforce_patient_link_consent();

DROP TRIGGER IF EXISTS trg_professional_patients_consent ON public.professional_patients;
CREATE TRIGGER trg_professional_patients_consent
BEFORE INSERT OR UPDATE ON public.professional_patients
FOR EACH ROW EXECUTE FUNCTION public.enforce_patient_link_consent();

-- patient_team: only the patient may grant consent / activate a membership.
CREATE OR REPLACE FUNCTION public.enforce_patient_team_consent()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF auth.uid() IS NULL OR current_setting('role', true) = 'service_role' THEN
    RETURN NEW;
  END IF;

  IF auth.uid() = NEW.patient_id OR public.has_role(auth.uid(), 'admin') THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    NEW.status := 'pending';
    NEW.patient_consent := false;
    NEW.patient_consent_at := NULL;
    NEW.accepted_at := NULL;
  ELSE
    IF NEW.patient_consent IS DISTINCT FROM OLD.patient_consent THEN
      NEW.patient_consent := OLD.patient_consent;
      NEW.patient_consent_at := OLD.patient_consent_at;
    END IF;
    IF NEW.status = 'active' AND COALESCE(OLD.status, '') <> 'active' THEN
      NEW.status := OLD.status;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_patient_team_consent ON public.patient_team;
CREATE TRIGGER trg_patient_team_consent
BEFORE INSERT OR UPDATE ON public.patient_team
FOR EACH ROW EXECUTE FUNCTION public.enforce_patient_team_consent();
