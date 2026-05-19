
ALTER TABLE public.apex_guided_sessions
  ADD COLUMN IF NOT EXISTS plano_mestre jsonb,
  ADD COLUMN IF NOT EXISTS plano_semana_atual int DEFAULT 1,
  ADD COLUMN IF NOT EXISTS plano_fase_atual int DEFAULT 1,
  ADD COLUMN IF NOT EXISTS metricas_atingidas jsonb DEFAULT '[]'::jsonb;

CREATE TABLE IF NOT EXISTS public.apex_plano_progresso (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id uuid NOT NULL REFERENCES public.apex_guided_sessions(id) ON DELETE CASCADE,
  athlete_id uuid,
  coach_id uuid NOT NULL,
  semana int NOT NULL,
  fase int NOT NULL,
  exercicio text NOT NULL,
  concluido boolean DEFAULT false,
  observacao text,
  registrado_em timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_apex_plano_progresso_session ON public.apex_plano_progresso(session_id);
CREATE INDEX IF NOT EXISTS idx_apex_plano_progresso_coach ON public.apex_plano_progresso(coach_id);

ALTER TABLE public.apex_plano_progresso ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coach reads own plano progresso"
  ON public.apex_plano_progresso FOR SELECT
  USING (auth.uid() = coach_id);

CREATE POLICY "Coach inserts own plano progresso"
  ON public.apex_plano_progresso FOR INSERT
  WITH CHECK (auth.uid() = coach_id);

CREATE POLICY "Coach updates own plano progresso"
  ON public.apex_plano_progresso FOR UPDATE
  USING (auth.uid() = coach_id);

CREATE POLICY "Coach deletes own plano progresso"
  ON public.apex_plano_progresso FOR DELETE
  USING (auth.uid() = coach_id);
