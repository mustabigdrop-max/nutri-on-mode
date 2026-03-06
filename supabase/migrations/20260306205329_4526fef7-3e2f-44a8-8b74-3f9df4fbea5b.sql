
-- 1. Foods table (base alimentar TACO/OpenFoodFacts)
CREATE TABLE public.foods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  calorias_100g numeric NOT NULL DEFAULT 0,
  proteina_100g numeric NOT NULL DEFAULT 0,
  carbo_100g numeric NOT NULL DEFAULT 0,
  gordura_100g numeric NOT NULL DEFAULT 0,
  fibra numeric DEFAULT 0,
  sodio numeric DEFAULT 0,
  vitaminas jsonb DEFAULT '{}',
  fonte text NOT NULL DEFAULT 'custom',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.foods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read foods" ON public.foods
  FOR SELECT USING (true);

-- 2. Meals saved (refeições favoritas)
CREATE TABLE public.meals_saved (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  nome text NOT NULL,
  alimentos jsonb NOT NULL DEFAULT '[]',
  total_macros jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.meals_saved ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own saved meals" ON public.meals_saved
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 3. Water logs (hidratação)
CREATE TABLE public.water_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  log_date date NOT NULL DEFAULT CURRENT_DATE,
  ml_total integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, log_date)
);

ALTER TABLE public.water_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own water logs" ON public.water_logs
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
