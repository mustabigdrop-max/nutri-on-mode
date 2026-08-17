CREATE TABLE public.social_instagram_accounts (
  coach_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  ig_user_id TEXT NOT NULL,
  username TEXT,
  page_id TEXT,
  access_token TEXT NOT NULL,
  token_expires_at TIMESTAMPTZ,
  connected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT ALL ON public.social_instagram_accounts TO service_role;
ALTER TABLE public.social_instagram_accounts ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.social_instagram_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  calendar_id UUID,
  media_type TEXT NOT NULL DEFAULT 'IMAGE',
  media_url TEXT,
  caption TEXT,
  ig_media_id TEXT,
  permalink TEXT,
  status TEXT NOT NULL DEFAULT 'published',
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_social_ig_posts_coach ON public.social_instagram_posts(coach_id, created_at DESC);
GRANT SELECT ON public.social_instagram_posts TO authenticated;
GRANT ALL ON public.social_instagram_posts TO service_role;
ALTER TABLE public.social_instagram_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Coaches read their own instagram posts" ON public.social_instagram_posts
  FOR SELECT TO authenticated USING (coach_id = auth.uid());