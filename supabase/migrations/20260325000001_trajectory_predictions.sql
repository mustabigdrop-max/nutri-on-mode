-- Prediction Card — AI weekly trajectory prediction
CREATE TABLE public.trajectory_predictions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  generated_at timestamptz DEFAULT now(),
  current_weight numeric,
  predicted_weight_7d numeric,
  predicted_weight_30d numeric,
  predicted_bf_pct numeric,
  confidence_score integer CHECK (confidence_score BETWEEN 0 AND 100),
  trend text CHECK (trend IN ('cutting', 'gaining', 'maintaining', 'recomping', 'stalling')),
  key_insight text,
  risk_flag text,
  data_points integer DEFAULT 0,
  UNIQUE (user_id, (generated_at::date))
);
ALTER TABLE public.trajectory_predictions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own trajectory predictions"
  ON public.trajectory_predictions FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Biological Age Score
CREATE TABLE public.biological_age_scores (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  calculated_at timestamptz DEFAULT now(),
  chronological_age integer,
  biological_age numeric,
  age_delta numeric GENERATED ALWAYS AS (chronological_age - biological_age) STORED,
  score_breakdown jsonb DEFAULT '{}'::jsonb,
  -- components: diet_quality, protein_adequacy, hydration, sleep_consistency, inflammatory_load, micronutrient_coverage
  improvement_tips text[],
  UNIQUE (user_id, (calculated_at::date))
);
ALTER TABLE public.biological_age_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own bio age scores"
  ON public.biological_age_scores FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
