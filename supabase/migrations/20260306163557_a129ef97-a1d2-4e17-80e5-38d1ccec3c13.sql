
-- Micronutrients per meal log
CREATE TABLE public.meal_nutrients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_log_id uuid NOT NULL REFERENCES public.meal_logs(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  nutrient text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  unit text NOT NULL DEFAULT 'mg',
  daily_recommended numeric,
  daily_pct numeric,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.meal_nutrients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own meal nutrients" ON public.meal_nutrients
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_meal_nutrients_user_date ON public.meal_nutrients(user_id, created_at);
CREATE INDEX idx_meal_nutrients_meal ON public.meal_nutrients(meal_log_id);

-- Add quality_score to meal_logs
ALTER TABLE public.meal_logs ADD COLUMN IF NOT EXISTS quality_score integer;
-- Add food_names array for diversity tracking
ALTER TABLE public.meal_logs ADD COLUMN IF NOT EXISTS food_names text[];
