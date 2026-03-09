
-- Consistency scores (weekly)
CREATE TABLE public.consistency_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  week_start date NOT NULL,
  week_end date NOT NULL,
  total_score integer NOT NULL DEFAULT 0,
  adherence_score integer NOT NULL DEFAULT 0,
  quality_score integer NOT NULL DEFAULT 0,
  recovery_score integer NOT NULL DEFAULT 0,
  progress_score integer NOT NULL DEFAULT 0,
  percentile integer DEFAULT 50,
  positive_factor text,
  improvement_tip text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, week_start)
);

ALTER TABLE public.consistency_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own scores" ON public.consistency_scores
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scores" ON public.consistency_scores
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scores" ON public.consistency_scores
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Special events
CREATE TABLE public.special_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  event_type text NOT NULL,
  event_date date NOT NULL,
  intention text NOT NULL DEFAULT 'equilibrio',
  pre_strategy text,
  day_strategy text,
  post_strategy text,
  status text NOT NULL DEFAULT 'upcoming',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.special_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own events" ON public.special_events
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Monthly reports
CREATE TABLE public.monthly_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  report_month date NOT NULL,
  total_meals_logged integer DEFAULT 0,
  avg_consistency_score integer DEFAULT 0,
  best_week integer DEFAULT 0,
  best_week_score integer DEFAULT 0,
  top_foods jsonb DEFAULT '[]'::jsonb,
  pattern_analysis jsonb DEFAULT '{}'::jsonb,
  macro_averages jsonb DEFAULT '{}'::jsonb,
  previous_comparison jsonb DEFAULT '{}'::jsonb,
  projection jsonb DEFAULT '{}'::jsonb,
  focus_next_month jsonb DEFAULT '[]'::jsonb,
  ai_message text,
  weight_start numeric,
  weight_end numeric,
  protein_days_hit integer DEFAULT 0,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, report_month)
);

ALTER TABLE public.monthly_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own reports" ON public.monthly_reports
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reports" ON public.monthly_reports
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reports" ON public.monthly_reports
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
