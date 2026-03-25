ALTER TABLE public.meal_logs DROP CONSTRAINT IF EXISTS meal_logs_meal_type_check;
ALTER TABLE public.meal_logs ADD CONSTRAINT meal_logs_meal_type_check CHECK (meal_type IN (
  'breakfast', 'morning_snack', 'lunch', 'afternoon_snack', 'dinner', 'supper', 'snack', 'pre_workout', 'post_workout',
  'cafe_manha', 'cafe_da_manha', 'lanche_manha', 'almoco', 'lanche_tarde', 'lanche', 'jantar', 'ceia', 'check_in'
));