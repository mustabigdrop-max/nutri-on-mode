
ALTER TABLE public.social_instagram_posts
  ADD COLUMN IF NOT EXISTS scheduled_at timestamptz,
  ADD COLUMN IF NOT EXISTS attempts int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS next_attempt_at timestamptz,
  ADD COLUMN IF NOT EXISTS kind text NOT NULL DEFAULT 'reel',
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_ig_posts_due
  ON public.social_instagram_posts (status, scheduled_at);

CREATE TABLE IF NOT EXISTS public.social_instagram_scheduler_state (
  id int PRIMARY KEY DEFAULT 1,
  paused boolean NOT NULL DEFAULT false,
  pause_reason text,
  lease_until timestamptz,
  last_run_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT scheduler_singleton CHECK (id = 1)
);

INSERT INTO public.social_instagram_scheduler_state (id) VALUES (1)
ON CONFLICT (id) DO NOTHING;

GRANT SELECT ON public.social_instagram_scheduler_state TO authenticated;
GRANT ALL ON public.social_instagram_scheduler_state TO service_role;
ALTER TABLE public.social_instagram_scheduler_state ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "scheduler state readable by authenticated" ON public.social_instagram_scheduler_state;
CREATE POLICY "scheduler state readable by authenticated"
  ON public.social_instagram_scheduler_state FOR SELECT TO authenticated USING (true);
