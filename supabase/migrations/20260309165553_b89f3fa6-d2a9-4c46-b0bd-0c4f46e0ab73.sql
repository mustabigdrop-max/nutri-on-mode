
-- Rotina de treino semanal do usuário
CREATE TABLE public.workout_schedule (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  day_of_week smallint NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  workout_type text NOT NULL DEFAULT 'rest',
  workout_time text NOT NULL DEFAULT 'morning',
  duration_minutes integer NOT NULL DEFAULT 60,
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, day_of_week)
);

ALTER TABLE public.workout_schedule ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own workout schedule" ON public.workout_schedule
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Log diário de treino com ajustes nutricionais
CREATE TABLE public.workout_daily_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  log_date date DEFAULT CURRENT_DATE,
  workout_type text NOT NULL DEFAULT 'rest',
  completed boolean DEFAULT false,
  calories_adjusted numeric,
  protein_adjusted numeric,
  carbs_adjusted numeric,
  fat_adjusted numeric,
  hydration_adjusted numeric,
  notes text,
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, log_date)
);

ALTER TABLE public.workout_daily_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own workout daily logs" ON public.workout_daily_logs
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Peak week / competition mode
CREATE TABLE public.peak_week_plans (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  event_name text NOT NULL DEFAULT 'Competição',
  event_date date NOT NULL,
  start_date date NOT NULL,
  status text NOT NULL DEFAULT 'active',
  daily_protocol jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, event_date)
);

ALTER TABLE public.peak_week_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own peak week plans" ON public.peak_week_plans
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
