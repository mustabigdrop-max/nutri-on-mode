CREATE OR REPLACE FUNCTION public.protect_challenge_signup_payment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF current_setting('role', true) = 'service_role' THEN
    RETURN NEW;
  END IF;
  IF public.has_role(auth.uid(), 'admin'::app_role) THEN
    RETURN NEW;
  END IF;
  IF TG_OP = 'INSERT' THEN
    NEW.paid := false;
    NEW.paid_at := NULL;
  ELSE
    NEW.paid := OLD.paid;
    NEW.paid_at := OLD.paid_at;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_challenge_signup_payment ON public.challenge_signups;
CREATE TRIGGER trg_protect_challenge_signup_payment
BEFORE INSERT OR UPDATE ON public.challenge_signups
FOR EACH ROW EXECUTE FUNCTION public.protect_challenge_signup_payment();