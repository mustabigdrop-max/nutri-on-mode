CREATE TABLE public.weekly_sabotage_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  week_start date NOT NULL,
  week_end date NOT NULL,
  total_meals_planned integer NOT NULL DEFAULT 0,
  total_meals_logged integer NOT NULL DEFAULT 0,
  meals_on_plan integer NOT NULL DEFAULT 0,
  meals_off_plan integer NOT NULL DEFAULT 0,
  worst_hour text,
  worst_day text,
  main_trigger text,
  protein_days_hit integer NOT NULL DEFAULT 0,
  avg_kcal_deficit numeric,
  weight_trend text,
  projected_kg_30d numeric,
  positive_highlights jsonb DEFAULT '[]'::jsonb,
  sabotage_pattern jsonb DEFAULT '{}'::jsonb,
  ai_suggestion text,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, week_start)
);

ALTER TABLE public.weekly_sabotage_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own reports"
ON public.weekly_sabotage_reports FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own reports"
ON public.weekly_sabotage_reports FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Service can insert reports"
ON public.weekly_sabotage_reports FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);