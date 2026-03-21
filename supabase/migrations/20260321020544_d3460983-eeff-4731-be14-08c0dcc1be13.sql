
CREATE TABLE public.muscle_state_checkins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  checkin_date DATE NOT NULL DEFAULT CURRENT_DATE,
  state TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, checkin_date)
);

ALTER TABLE public.muscle_state_checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own muscle state checkins"
  ON public.muscle_state_checkins
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
