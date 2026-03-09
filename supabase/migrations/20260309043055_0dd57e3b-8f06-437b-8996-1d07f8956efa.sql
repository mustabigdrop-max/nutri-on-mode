
-- Add trial_ends_at to profiles for 7-day trial tracking
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS trial_ends_at timestamp with time zone DEFAULT NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS first_meal_registered boolean DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS activation_completed boolean DEFAULT false;

-- Activation metrics table for tracking user activation funnel
CREATE TABLE public.activation_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  signup_at timestamp with time zone DEFAULT now(),
  first_meal_at timestamp with time zone DEFAULT NULL,
  tour_completed_at timestamp with time zone DEFAULT NULL,
  notifications_configured boolean DEFAULT false,
  notification_preferences jsonb DEFAULT '{}'::jsonb,
  days_active integer DEFAULT 0,
  total_meals_day1 integer DEFAULT 0,
  reengagement_sent integer DEFAULT 0,
  trial_paused boolean DEFAULT false,
  trial_pause_until date DEFAULT NULL,
  last_app_open timestamp with time zone DEFAULT NULL,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.activation_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own activation metrics"
  ON public.activation_metrics FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
