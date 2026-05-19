ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_goal_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_goal_check
  CHECK (goal IS NULL OR goal = ANY (ARRAY[
    'lose_weight','gain_muscle','definition','cutting','bulking',
    'recomposition','health','maintenance','performance','longevity','glp1'
  ]));