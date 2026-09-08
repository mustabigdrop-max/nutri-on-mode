ALTER TABLE public.exercise_video_mappings
  ADD COLUMN gif_verified boolean NOT NULL DEFAULT false,
  ADD COLUMN gif_verified_at timestamptz,
  ADD COLUMN gif_verified_by uuid;

UPDATE public.exercise_video_mappings
SET gif_verified = verified,
    gif_verified_at = CASE WHEN verified THEN updated_at ELSE NULL END,
    gif_verified_by = CASE WHEN verified THEN coach_id ELSE NULL END;

CREATE OR REPLACE FUNCTION public.enforce_exercise_video_verification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  IF NEW.gif_verified = true THEN
    NEW.gif_verified_by := NEW.coach_id;
    NEW.gif_verified_at := COALESCE(NEW.gif_verified_at, now());
    NEW.verified := true;
  ELSE
    NEW.gif_verified_by := NULL;
    NEW.gif_verified_at := NULL;
    NEW.verified := false;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER enforce_exercise_video_verification_before_write
BEFORE INSERT OR UPDATE ON public.exercise_video_mappings
FOR EACH ROW EXECUTE FUNCTION public.enforce_exercise_video_verification();

DROP POLICY IF EXISTS "Authenticated can read verified mappings" ON public.exercise_video_mappings;
CREATE POLICY "Authenticated can read verified mappings"
ON public.exercise_video_mappings FOR SELECT TO authenticated
USING (gif_verified = true);

CREATE INDEX idx_evm_verified_lookup
ON public.exercise_video_mappings (coach_id, exercise_key)
WHERE gif_verified = true;