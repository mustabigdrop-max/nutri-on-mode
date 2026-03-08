
-- Fix 1: RLS policy for subscriptions_pending (no public access needed, only edge functions use it)
CREATE POLICY "No direct access to pending" ON subscriptions_pending
  FOR SELECT USING (false);

-- Fix 2: Replace SECURITY DEFINER view with SECURITY INVOKER
DROP VIEW IF EXISTS my_subscription;
CREATE VIEW my_subscription WITH (security_invoker = true) AS
SELECT plano, periodo, status, expires_at, activated_at
FROM subscriptions
WHERE user_id = auth.uid();
