CREATE TABLE IF NOT EXISTS public.plateau_protocols (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id    UUID NOT NULL,
  exercise_name TEXT NOT NULL,
  protocol_type TEXT NOT NULL,
  score         INTEGER,
  ajustes       JSONB,
  sinais        JSONB,
  applied_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at   TIMESTAMPTZ,
  resultado     TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_plateau_athlete
  ON public.plateau_protocols(athlete_id);

CREATE INDEX IF NOT EXISTS idx_plateau_athlete_exercise
  ON public.plateau_protocols(athlete_id, exercise_name);

ALTER TABLE public.plateau_protocols ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Athletes manage own plateau protocols"
  ON public.plateau_protocols FOR ALL
  USING (auth.uid() = athlete_id)
  WITH CHECK (auth.uid() = athlete_id);

CREATE POLICY "Coaches view linked athlete plateau protocols"
  ON public.plateau_protocols FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles p
      JOIN public.coach_profiles cp ON cp.id = p.coach_profile_id
      WHERE p.user_id = plateau_protocols.athlete_id
        AND cp.user_id = auth.uid()
    )
  );

CREATE POLICY "Coaches insert plateau protocols for linked athletes"
  ON public.plateau_protocols FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.profiles p
      JOIN public.coach_profiles cp ON cp.id = p.coach_profile_id
      WHERE p.user_id = plateau_protocols.athlete_id
        AND cp.user_id = auth.uid()
    )
  );