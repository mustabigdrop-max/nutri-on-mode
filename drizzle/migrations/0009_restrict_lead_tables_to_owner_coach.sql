-- quiz_leads: ownership column
ALTER TABLE public.quiz_leads ADD COLUMN IF NOT EXISTS coach_id UUID DEFAULT '70e51469-1acf-4df6-afe6-f094d21db122'::uuid;
UPDATE public.quiz_leads SET coach_id = '70e51469-1acf-4df6-afe6-f094d21db122'::uuid WHERE coach_id IS NULL;
UPDATE public.mce_leads SET coach_id = '70e51469-1acf-4df6-afe6-f094d21db122'::uuid WHERE coach_id IS NULL;
ALTER TABLE public.mce_leads ALTER COLUMN coach_id SET DEFAULT '70e51469-1acf-4df6-afe6-f094d21db122'::uuid;

DROP POLICY IF EXISTS "Coach e admin leem leads" ON public.quiz_leads;
CREATE POLICY "Owner coach or admin reads quiz leads"
ON public.quiz_leads FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role) OR coach_id = auth.uid());

DROP POLICY IF EXISTS "Coach ve leads" ON public.mce_leads;
DROP POLICY IF EXISTS "Coach edita leads" ON public.mce_leads;
DROP POLICY IF EXISTS "Coach remove leads" ON public.mce_leads;
CREATE POLICY "Owner coach or admin reads mce leads"
ON public.mce_leads FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role) OR coach_id = auth.uid());
CREATE POLICY "Owner coach or admin updates mce leads"
ON public.mce_leads FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role) OR coach_id = auth.uid())
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR coach_id = auth.uid());
CREATE POLICY "Owner coach or admin deletes mce leads"
ON public.mce_leads FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role) OR coach_id = auth.uid());

-- challenge_signups: only the coach that owns the gym/challenge, or admin
CREATE OR REPLACE FUNCTION public.owns_challenge_gym(_gym_id uuid, _gym_slug text, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.partner_gyms pg
    WHERE pg.coach_user_id = _user_id
      AND (pg.id = _gym_id OR (_gym_slug IS NOT NULL AND pg.challenge_slug = _gym_slug))
  ) OR EXISTS (
    SELECT 1 FROM public.gym_challenges gc
    WHERE gc.coach_user_id = _user_id
      AND (gc.gym_id = _gym_id OR (_gym_slug IS NOT NULL AND gc.slug = _gym_slug))
  )
$$;
REVOKE ALL ON FUNCTION public.owns_challenge_gym(uuid, text, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.owns_challenge_gym(uuid, text, uuid) TO authenticated, service_role;

DROP POLICY IF EXISTS "Coaches and admins can view challenge signups" ON public.challenge_signups;
DROP POLICY IF EXISTS "Coaches and admins can update challenge signups" ON public.challenge_signups;
CREATE POLICY "Owner coach or admin views challenge signups"
ON public.challenge_signups FOR SELECT TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role)
  OR user_id = auth.uid()
  OR public.owns_challenge_gym(gym_id, gym_slug, auth.uid())
);
CREATE POLICY "Owner coach or admin updates challenge signups"
ON public.challenge_signups FOR UPDATE TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role)
  OR public.owns_challenge_gym(gym_id, gym_slug, auth.uid())
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::app_role)
  OR public.owns_challenge_gym(gym_id, gym_slug, auth.uid())
);