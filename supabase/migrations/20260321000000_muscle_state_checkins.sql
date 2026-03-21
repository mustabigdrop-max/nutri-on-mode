-- Flat / Full / Spilled — daily muscle state check-in
CREATE TABLE public.muscle_state_checkins (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  checkin_date date NOT NULL DEFAULT CURRENT_DATE,
  state text NOT NULL CHECK (state IN ('flat', 'full', 'spilled')),
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, checkin_date)
);

ALTER TABLE public.muscle_state_checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own muscle state checkins"
  ON public.muscle_state_checkins
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
