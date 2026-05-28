
-- 1. Remove plaintext temp_password column from partners (credential exposure)
ALTER TABLE public.partners DROP COLUMN IF EXISTS temp_password;

-- 2. Restrict science_cache to authenticated users
DROP POLICY IF EXISTS "anyone_can_read_cache" ON public.science_cache;
CREATE POLICY "authenticated_can_read_cache"
ON public.science_cache
FOR SELECT
TO authenticated
USING (true);

-- 3. Restrict science_feed to authenticated users
DROP POLICY IF EXISTS "anyone_can_read_feed" ON public.science_feed;
CREATE POLICY "authenticated_can_read_feed"
ON public.science_feed
FOR SELECT
TO authenticated
USING (true);

-- 4. Restrict supplement_analyses to authenticated users
DROP POLICY IF EXISTS "anyone_can_read_supplements" ON public.supplement_analyses;
CREATE POLICY "authenticated_can_read_supplements"
ON public.supplement_analyses
FOR SELECT
TO authenticated
USING (true);

-- Revoke anon SELECT (defense in depth)
REVOKE SELECT ON public.science_cache FROM anon;
REVOKE SELECT ON public.science_feed FROM anon;
REVOKE SELECT ON public.supplement_analyses FROM anon;
