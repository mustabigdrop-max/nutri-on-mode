
-- Circadian profiles table
CREATE TABLE public.circadian_profiles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  wake_time time NOT NULL DEFAULT '06:00',
  sleep_time time NOT NULL DEFAULT '23:00',
  chronotype text NOT NULL DEFAULT 'intermediario',
  peak_energy text NOT NULL DEFAULT 'morning',
  meal_frequency int NOT NULL DEFAULT 5,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.circadian_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own circadian profile"
  ON public.circadian_profiles FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Circadian meal plans table
CREATE TABLE public.circadian_meal_plans (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  generated_date date DEFAULT CURRENT_DATE,
  meals jsonb DEFAULT '[]'::jsonb,
  total_calories numeric DEFAULT 0,
  total_protein numeric DEFAULT 0,
  total_carbs numeric DEFAULT 0,
  total_fat numeric DEFAULT 0,
  chronotype_applied text,
  workout_integrated boolean DEFAULT false,
  ai_message text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.circadian_meal_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own circadian meal plans"
  ON public.circadian_meal_plans FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
