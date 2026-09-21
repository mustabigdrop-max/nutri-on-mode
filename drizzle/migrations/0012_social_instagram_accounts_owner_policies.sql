REVOKE ALL ON public.social_instagram_accounts FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.social_instagram_accounts TO authenticated;
GRANT ALL ON public.social_instagram_accounts TO service_role;

DROP POLICY IF EXISTS "Owner coach reads own instagram account" ON public.social_instagram_accounts;
CREATE POLICY "Owner coach reads own instagram account"
ON public.social_instagram_accounts FOR SELECT TO authenticated
USING (coach_id = auth.uid());

DROP POLICY IF EXISTS "Owner coach inserts own instagram account" ON public.social_instagram_accounts;
CREATE POLICY "Owner coach inserts own instagram account"
ON public.social_instagram_accounts FOR INSERT TO authenticated
WITH CHECK (coach_id = auth.uid());

DROP POLICY IF EXISTS "Owner coach updates own instagram account" ON public.social_instagram_accounts;
CREATE POLICY "Owner coach updates own instagram account"
ON public.social_instagram_accounts FOR UPDATE TO authenticated
USING (coach_id = auth.uid())
WITH CHECK (coach_id = auth.uid());

DROP POLICY IF EXISTS "Owner coach deletes own instagram account" ON public.social_instagram_accounts;
CREATE POLICY "Owner coach deletes own instagram account"
ON public.social_instagram_accounts FOR DELETE TO authenticated
USING (coach_id = auth.uid());