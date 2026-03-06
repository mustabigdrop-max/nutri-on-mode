
CREATE TABLE public.meal_plan_items (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  week_start date NOT NULL,
  day_index smallint NOT NULL CHECK (day_index BETWEEN 0 AND 6),
  meal_type text NOT NULL,
  food_name text NOT NULL,
  portion text,
  kcal numeric DEFAULT 0,
  protein_g numeric DEFAULT 0,
  carbs_g numeric DEFAULT 0,
  fat_g numeric DEFAULT 0,
  confirmed boolean DEFAULT false,
  swapped boolean DEFAULT false,
  original_food_name text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.meal_plan_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own meal plan items"
  ON public.meal_plan_items
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
