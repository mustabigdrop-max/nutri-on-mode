ALTER TABLE public.coach_patients ADD COLUMN IF NOT EXISTS plan_expires_at TIMESTAMPTZ;
ALTER TABLE public.coach_patients ADD COLUMN IF NOT EXISTS is_locked BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.coach_patients ADD COLUMN IF NOT EXISTS locked_at TIMESTAMPTZ;
ALTER TABLE public.coach_patients ADD COLUMN IF NOT EXISTS lock_reason TEXT;
ALTER TABLE public.coach_patients ADD COLUMN IF NOT EXISTS lock_notified BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.coach_patients ADD COLUMN IF NOT EXISTS unlocked_at TIMESTAMPTZ;
ALTER TABLE public.coach_patients ADD COLUMN IF NOT EXISTS lock_history JSONB NOT NULL DEFAULT '[]'::jsonb;

CREATE INDEX IF NOT EXISTS idx_coach_patients_plan_expires_at
  ON public.coach_patients (plan_expires_at)
  WHERE plan_expires_at IS NOT NULL;

-- O aluno pode responder ao próprio vínculo, mas nunca alterar o bloqueio.
CREATE OR REPLACE FUNCTION public.protect_coach_patient_lock_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_coach_patient_lock_fields ON public.coach_patients;
CREATE TRIGGER trg_protect_coach_patient_lock_fields
  BEFORE UPDATE ON public.coach_patients
  FOR EACH ROW EXECUTE FUNCTION public.protect_coach_patient_lock_fields();