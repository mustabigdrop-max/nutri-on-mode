
-- 1) athlete_visual_assessments: validate coach via coach_profiles join
DROP POLICY IF EXISTS "Coach acessa avaliações dos próprios atletas" ON public.athlete_visual_assessments;

CREATE POLICY "Coach acessa avaliações dos próprios atletas"
ON public.athlete_visual_assessments
FOR ALL
TO authenticated
USING (EXISTS (SELECT 1 FROM public.coach_profiles cp WHERE cp.id = athlete_visual_assessments.coach_id AND cp.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.coach_profiles cp WHERE cp.id = athlete_visual_assessments.coach_id AND cp.user_id = auth.uid()));

-- 2) subscriptions_pending: explicit deny for writes to anon/authenticated
DROP POLICY IF EXISTS "No insert pending" ON public.subscriptions_pending;
DROP POLICY IF EXISTS "No update pending" ON public.subscriptions_pending;
DROP POLICY IF EXISTS "No delete pending" ON public.subscriptions_pending;

CREATE POLICY "No insert pending"
ON public.subscriptions_pending
FOR INSERT
TO anon, authenticated
WITH CHECK (false);

CREATE POLICY "No update pending"
ON public.subscriptions_pending
FOR UPDATE
TO anon, authenticated
USING (false)
WITH CHECK (false);

CREATE POLICY "No delete pending"
ON public.subscriptions_pending
FOR DELETE
TO anon, authenticated
USING (false);

-- 3) user_roles: explicit deny for writes (only service_role bypasses RLS)
DROP POLICY IF EXISTS "No self insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "No self update roles" ON public.user_roles;
DROP POLICY IF EXISTS "No self delete roles" ON public.user_roles;

CREATE POLICY "No self insert roles"
ON public.user_roles
FOR INSERT
TO anon, authenticated
WITH CHECK (false);

CREATE POLICY "No self update roles"
ON public.user_roles
FOR UPDATE
TO anon, authenticated
USING (false)
WITH CHECK (false);

CREATE POLICY "No self delete roles"
ON public.user_roles
FOR DELETE
TO anon, authenticated
USING (false);
