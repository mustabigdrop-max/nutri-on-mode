CREATE TABLE IF NOT EXISTS public.praxis_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id UUID NOT NULL,
  message_user TEXT NOT NULL,
  message_praxis TEXT NOT NULL,
  topic TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_praxis_athlete ON public.praxis_conversations(athlete_id, created_at DESC);

GRANT SELECT, INSERT ON public.praxis_conversations TO authenticated;
GRANT ALL ON public.praxis_conversations TO service_role;

ALTER TABLE public.praxis_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Athlete reads own praxis"
  ON public.praxis_conversations FOR SELECT
  TO authenticated
  USING (auth.uid() = athlete_id);

CREATE POLICY "Athlete inserts own praxis"
  ON public.praxis_conversations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = athlete_id);

CREATE POLICY "Coach reads athlete praxis"
  ON public.praxis_conversations FOR SELECT
  TO authenticated
  USING (public.is_coach_of_patient(auth.uid(), athlete_id));