ALTER TABLE public.gym_challenges
  ADD COLUMN IF NOT EXISTS reminder_deadline_time time without time zone NOT NULL DEFAULT '21:00',
  ADD COLUMN IF NOT EXISTS reminder_escalation_hours integer[] NOT NULL DEFAULT '{0,2,14}',
  ADD COLUMN IF NOT EXISTS reminder_escalation_messages text[] NOT NULL DEFAULT '{}';

ALTER TABLE public.challenge_reminder_logs
  ADD COLUMN IF NOT EXISTS level integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS log_date date NOT NULL DEFAULT current_date,
  ADD COLUMN IF NOT EXISTS auto boolean NOT NULL DEFAULT false;

CREATE UNIQUE INDEX IF NOT EXISTS challenge_reminder_logs_unique_step
  ON public.challenge_reminder_logs (participant_id, log_date, kind, level);