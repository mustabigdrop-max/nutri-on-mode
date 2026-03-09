CREATE TABLE public.mood_checkins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  mood text NOT NULL,
  checkin_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, checkin_date)
);

ALTER TABLE public.mood_checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own mood checkins"
ON public.mood_checkins FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);