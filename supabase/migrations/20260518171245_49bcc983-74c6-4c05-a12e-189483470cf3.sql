
-- Tabela de sessões guiadas APEX (Modo Rápido = 4 fotos estáticas; Completo virá depois)
CREATE TABLE IF NOT EXISTS public.apex_guided_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id uuid,
  coach_id uuid NOT NULL,
  session_type text NOT NULL CHECK (session_type IN ('complete','quick')),
  steps_data jsonb NOT NULL DEFAULT '[]'::jsonb,
  full_report jsonb,
  fcs_score numeric(5,2),
  sri_score numeric(5,2),
  body_score numeric(5,2),
  duration_minutes int,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_apex_guided_sessions_coach ON public.apex_guided_sessions(coach_id);
CREATE INDEX IF NOT EXISTS idx_apex_guided_sessions_athlete ON public.apex_guided_sessions(athlete_id);

ALTER TABLE public.apex_guided_sessions ENABLE ROW LEVEL SECURITY;

-- Coach é o auth.uid() (alinhado ao restante do módulo APEX que usa user_id direto)
CREATE POLICY "Coach can view own guided sessions"
  ON public.apex_guided_sessions FOR SELECT
  USING (auth.uid() = coach_id);

CREATE POLICY "Coach can insert own guided sessions"
  ON public.apex_guided_sessions FOR INSERT
  WITH CHECK (auth.uid() = coach_id);

CREATE POLICY "Coach can update own guided sessions"
  ON public.apex_guided_sessions FOR UPDATE
  USING (auth.uid() = coach_id);

CREATE POLICY "Coach can delete own guided sessions"
  ON public.apex_guided_sessions FOR DELETE
  USING (auth.uid() = coach_id);
