
-- 1. coach_convites: remove permissive SELECT and add token-lookup function
DROP POLICY IF EXISTS "Anyone can read invites for accepting" ON public.coach_convites;

CREATE OR REPLACE FUNCTION public.get_coach_invite_by_token(_token text)
RETURNS SETOF public.coach_convites
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.coach_convites WHERE token = _token LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.get_coach_invite_by_token(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_coach_invite_by_token(text) TO authenticated, anon;

-- 2. professional_invites: remove broad public read; add invite-code lookup function
DROP POLICY IF EXISTS "Public read by invite_code (page de convite)" ON public.professional_invites;

CREATE OR REPLACE FUNCTION public.get_professional_invite_by_code(_invite_code text)
RETURNS SETOF public.professional_invites
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.professional_invites
  WHERE invite_code = _invite_code
    AND status = 'pending'
    AND expires_at > now()
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.get_professional_invite_by_code(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_professional_invite_by_code(text) TO anon, authenticated;

-- 3. meal-photos bucket: make private and drop anon SELECT
UPDATE storage.buckets SET public = false WHERE id = 'meal-photos';
DROP POLICY IF EXISTS "Public can view meal photos" ON storage.objects;

-- 4. Lock down SECURITY DEFINER functions from anon role
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.user_is_athlete_of_plan(uuid, uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.user_owns_competition_plan(uuid, uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.decrement_coach_slots() FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.increment_coach_slots() FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.generate_unique_coach_code() FROM anon, public;

GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_is_athlete_of_plan(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_owns_competition_plan(uuid, uuid) TO authenticated;
