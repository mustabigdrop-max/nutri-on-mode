ALTER TABLE public.meal_plan_items 
  ADD COLUMN IF NOT EXISTS coach_edited boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS coach_note text;