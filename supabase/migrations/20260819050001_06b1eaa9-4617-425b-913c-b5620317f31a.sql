ALTER TABLE public.gym_challenges
  ADD COLUMN IF NOT EXISTS reminders_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS reminder_checkin_time time NOT NULL DEFAULT '19:00',
  ADD COLUMN IF NOT EXISTS reminder_meal_times text[] NOT NULL DEFAULT ARRAY['12:30','20:30'],
  ADD COLUMN IF NOT EXISTS reminder_checkin_message text,
  ADD COLUMN IF NOT EXISTS reminder_meal_message text;

ALTER TABLE public.challenge_daily_logs
  ADD COLUMN IF NOT EXISTS day_completed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS checkin_at timestamptz;

CREATE TABLE IF NOT EXISTS public.challenge_reminder_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id uuid NOT NULL REFERENCES public.gym_challenges(id) ON DELETE CASCADE,
  participant_id uuid NOT NULL REFERENCES public.challenge_participants(id) ON DELETE CASCADE,
  kind text NOT NULL DEFAULT 'checkin',
  message text,
  sent_by uuid,
  sent_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.challenge_reminder_logs TO authenticated;
GRANT ALL ON public.challenge_reminder_logs TO service_role;

ALTER TABLE public.challenge_reminder_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coach reads own challenge reminders"
ON public.challenge_reminder_logs FOR SELECT TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.gym_challenges gc
          WHERE gc.id = challenge_id AND gc.coach_user_id = auth.uid())
  OR public.has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Coach logs own challenge reminders"
ON public.challenge_reminder_logs FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (SELECT 1 FROM public.gym_challenges gc
          WHERE gc.id = challenge_id AND gc.coach_user_id = auth.uid())
  OR public.has_role(auth.uid(), 'admin'::app_role)
);

CREATE INDEX IF NOT EXISTS idx_challenge_reminder_logs_challenge
  ON public.challenge_reminder_logs (challenge_id, sent_at DESC);