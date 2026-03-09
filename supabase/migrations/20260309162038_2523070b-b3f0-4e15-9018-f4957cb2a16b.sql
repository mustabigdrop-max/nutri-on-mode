
-- GLP-1 Profiles
CREATE TABLE public.glp1_profiles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  medication text NOT NULL DEFAULT 'ozempic',
  current_dose text,
  duration_months integer DEFAULT 0,
  objective text NOT NULL DEFAULT 'emagrecer',
  profile_class text DEFAULT 'iniciante',
  exit_week integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.glp1_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own glp1 profile"
  ON public.glp1_profiles FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- GLP-1 Daily Logs
CREATE TABLE public.glp1_daily_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  log_date date NOT NULL DEFAULT CURRENT_DATE,
  protein_g numeric DEFAULT 0,
  total_kcal numeric DEFAULT 0,
  hydration_ml integer DEFAULT 0,
  nausea_level integer DEFAULT 0,
  energy_level integer DEFAULT 5,
  notes text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, log_date)
);

ALTER TABLE public.glp1_daily_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own glp1 daily logs"
  ON public.glp1_daily_logs FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- GLP-1 Weekly Scores
CREATE TABLE public.glp1_weekly_scores (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  week_start date NOT NULL,
  week_end date NOT NULL,
  avg_protein_g numeric DEFAULT 0,
  avg_kcal numeric DEFAULT 0,
  avg_hydration_ml integer DEFAULT 0,
  protocol_score integer DEFAULT 0,
  weight_kg numeric,
  lean_mass_pct numeric,
  alerts_triggered integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.glp1_weekly_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own glp1 weekly scores"
  ON public.glp1_weekly_scores FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- GLP-1 Subscriptions (upsell)
CREATE TABLE public.glp1_subscriptions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  activated_at timestamptz DEFAULT now(),
  status text DEFAULT 'active',
  trigger_source text DEFAULT 'manual',
  price numeric DEFAULT 97.00,
  canceled_at timestamptz,
  UNIQUE(user_id)
);

ALTER TABLE public.glp1_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own glp1 subscription"
  ON public.glp1_subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own glp1 subscription"
  ON public.glp1_subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own glp1 subscription"
  ON public.glp1_subscriptions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);
