CREATE TABLE IF NOT EXISTS public.workout_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  athlete_id UUID NOT NULL,
  protocol_id UUID REFERENCES public.training_protocols(id) ON DELETE CASCADE,
  week_number INT NOT NULL,
  day_number INT NOT NULL,
  exercise_name TEXT NOT NULL,
  top_set_kg NUMERIC,
  rpe_felt NUMERIC,
  notes TEXT,
  logged_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_workout_logs_lookup
  ON public.workout_logs(athlete_id, protocol_id, exercise_name, week_number);

ALTER TABLE public.workout_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "athlete_own_workout_logs"
  ON public.workout_logs
  FOR ALL
  USING (auth.uid() = athlete_id)
  WITH CHECK (auth.uid() = athlete_id);

CREATE POLICY "coach_view_athlete_logs"
  ON public.workout_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.training_protocols tp
      WHERE tp.id = workout_logs.protocol_id
        AND tp.user_id = auth.uid()
    )
  );