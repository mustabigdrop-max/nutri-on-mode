
CREATE TABLE IF NOT EXISTS public.apex_agent_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  athlete_id uuid,
  messages jsonb NOT NULL DEFAULT '[]'::jsonb,
  protocol_version integer NOT NULL DEFAULT 1,
  change_log jsonb NOT NULL DEFAULT '[]'::jsonb,
  snapshot jsonb,
  status text NOT NULL DEFAULT 'reviewing' CHECK (status IN ('reviewing','approved')),
  approved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_apex_agent_sessions_coach ON public.apex_agent_sessions(coach_id);
CREATE INDEX IF NOT EXISTS idx_apex_agent_sessions_athlete ON public.apex_agent_sessions(athlete_id);

ALTER TABLE public.apex_agent_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coach views own apex agent sessions"
  ON public.apex_agent_sessions FOR SELECT
  USING (auth.uid() = coach_id);

CREATE POLICY "Coach creates own apex agent sessions"
  ON public.apex_agent_sessions FOR INSERT
  WITH CHECK (auth.uid() = coach_id);

CREATE POLICY "Coach updates own apex agent sessions"
  ON public.apex_agent_sessions FOR UPDATE
  USING (auth.uid() = coach_id);

CREATE POLICY "Coach deletes own apex agent sessions"
  ON public.apex_agent_sessions FOR DELETE
  USING (auth.uid() = coach_id);

CREATE TRIGGER trg_apex_agent_sessions_updated_at
  BEFORE UPDATE ON public.apex_agent_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
