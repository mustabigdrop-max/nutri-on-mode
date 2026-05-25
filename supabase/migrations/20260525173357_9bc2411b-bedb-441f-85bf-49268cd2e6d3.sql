
-- Tabelas para rastreamento de séries do TrainingON
CREATE TABLE IF NOT EXISTS public.training_set_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_date date NOT NULL DEFAULT CURRENT_DATE,
  exercise_id text NOT NULL,
  set_type text NOT NULL CHECK (set_type IN ('feeder','working','backoff','top')),
  set_number integer NOT NULL,
  load_prescribed text,
  load_done numeric,
  reps_prescribed text,
  reps_done integer,
  completed boolean NOT NULL DEFAULT false,
  feedback text CHECK (feedback IS NULL OR feedback IN ('leve','certo','pesado')),
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, session_date, exercise_id, set_type, set_number)
);

CREATE INDEX IF NOT EXISTS idx_tsl_user_date ON public.training_set_logs (user_id, session_date);

ALTER TABLE public.training_set_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tsl_select_own" ON public.training_set_logs
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "tsl_insert_own" ON public.training_set_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "tsl_update_own" ON public.training_set_logs
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "tsl_delete_own" ON public.training_set_logs
  FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER trg_tsl_updated_at
  BEFORE UPDATE ON public.training_set_logs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Sessões finalizadas
CREATE TABLE IF NOT EXISTS public.training_sessions_completed (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_date date NOT NULL,
  duration_minutes integer,
  total_sets integer,
  feeder_count integer,
  working_count integer,
  backoff_count integer,
  feedback_summary jsonb,
  ai_message text,
  completed boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, session_date)
);

ALTER TABLE public.training_sessions_completed ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tsc_select_own" ON public.training_sessions_completed
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "tsc_insert_own" ON public.training_sessions_completed
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "tsc_update_own" ON public.training_sessions_completed
  FOR UPDATE USING (auth.uid() = user_id);
