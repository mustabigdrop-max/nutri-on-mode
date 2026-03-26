
CREATE TABLE public.emotional_episodes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  occurred_at timestamptz DEFAULT now(),
  hour_of_day integer GENERATED ALWAYS AS (EXTRACT(HOUR FROM occurred_at AT TIME ZONE 'America/Sao_Paulo')::integer) STORED,
  day_of_week integer GENERATED ALWAYS AS (EXTRACT(DOW FROM occurred_at AT TIME ZONE 'America/Sao_Paulo')::integer) STORED,
  hunger_type text,
  emotion text,
  emotion_intensity integer,
  situation text,
  automatic_thought text,
  behavior text,
  technique_used text,
  technique_duration_sec integer,
  technique_completed boolean DEFAULT false,
  resisted boolean,
  ate_anyway boolean DEFAULT false,
  linked_meal_log_id uuid,
  post_emotion_intensity integer,
  notes text,
  context_sleep_quality integer,
  context_stress_level integer,
  context_deficit_kcal integer,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.emotional_episodes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own emotional episodes"
  ON public.emotional_episodes FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.emotional_win_rates (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  week_start date NOT NULL,
  total_episodes integer DEFAULT 0,
  resisted_count integer DEFAULT 0,
  win_rate numeric GENERATED ALWAYS AS (
    CASE WHEN total_episodes > 0
      THEN ROUND((resisted_count::numeric / total_episodes) * 100, 1)
      ELSE 0 END
  ) STORED,
  top_technique text,
  top_emotion text,
  streak_days integer DEFAULT 0,
  UNIQUE (user_id, week_start)
);

ALTER TABLE public.emotional_win_rates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own win rates"
  ON public.emotional_win_rates FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
