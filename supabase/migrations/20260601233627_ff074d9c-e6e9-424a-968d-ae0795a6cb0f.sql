
CREATE TABLE public.meridian_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  plan_id UUID REFERENCES public.meridian_plans(id) ON DELETE CASCADE,
  competition_id UUID REFERENCES public.meridian_competitions(id) ON DELETE CASCADE,
  kind TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'INFO',
  title TEXT NOT NULL,
  body TEXT,
  payload JSONB,
  dedupe_key TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX meridian_notifications_dedupe ON public.meridian_notifications(user_id, dedupe_key);
CREATE INDEX meridian_notifications_user_unread ON public.meridian_notifications(user_id, read_at, created_at DESC);

GRANT SELECT, UPDATE ON public.meridian_notifications TO authenticated;
GRANT ALL ON public.meridian_notifications TO service_role;

ALTER TABLE public.meridian_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications_select_own_or_coach"
  ON public.meridian_notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.is_coach_of_patient(auth.uid(), user_id));

CREATE POLICY "notifications_update_own"
  ON public.meridian_notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);
