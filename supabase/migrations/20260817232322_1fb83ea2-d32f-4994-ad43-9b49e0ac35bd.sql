ALTER TABLE public.social_instagram_accounts
  ADD COLUMN IF NOT EXISTS full_name text,
  ADD COLUMN IF NOT EXISTS biography text,
  ADD COLUMN IF NOT EXISTS profile_picture_url text,
  ADD COLUMN IF NOT EXISTS followers_count integer,
  ADD COLUMN IF NOT EXISTS follows_count integer,
  ADD COLUMN IF NOT EXISTS media_count integer,
  ADD COLUMN IF NOT EXISTS recent_media jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS synced_at timestamptz;