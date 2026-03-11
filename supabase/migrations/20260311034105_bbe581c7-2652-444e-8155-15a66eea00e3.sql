
-- Stack nootrópico do usuário
CREATE TABLE public.nootropic_stacks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  challenge text,
  caffeine_tolerance text,
  health_conditions text[],
  objective text,
  generated_stack jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.nootropic_stacks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own nootropic stacks" ON public.nootropic_stacks FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Score de energia diário
CREATE TABLE public.energy_scores (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  score_date date DEFAULT CURRENT_DATE,
  score integer NOT NULL DEFAULT 5,
  possible_cause text,
  calories_that_day numeric,
  sleep_hours numeric,
  workout_type text,
  nootropic_taken boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.energy_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own energy scores" ON public.energy_scores FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Insights de energia gerados pela IA
CREATE TABLE public.energy_insights (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  insight_text text,
  insight_type text,
  generated_at timestamptz DEFAULT now(),
  read boolean DEFAULT false
);
ALTER TABLE public.energy_insights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own energy insights" ON public.energy_insights FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Modo Foco
CREATE TABLE public.focus_mode_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  event_type text,
  event_time time,
  duration_hours integer,
  protocol_generated jsonb DEFAULT '{}'::jsonb,
  performance_score integer,
  event_date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.focus_mode_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own focus mode logs" ON public.focus_mode_logs FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Adesão ao stack nootrópico
CREATE TABLE public.nootropic_daily_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  log_date date DEFAULT CURRENT_DATE,
  items_taken jsonb DEFAULT '[]'::jsonb,
  adherence_score integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.nootropic_daily_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own nootropic daily logs" ON public.nootropic_daily_logs FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Pesquisas avançadas
CREATE TABLE public.research_searches (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  query text NOT NULL,
  category text DEFAULT 'general',
  results jsonb DEFAULT '[]'::jsonb,
  citations jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.research_searches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own research searches" ON public.research_searches FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
