ALTER TABLE public.social_instagram_accounts
  ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'token',
  ALTER COLUMN access_token SET DEFAULT '';