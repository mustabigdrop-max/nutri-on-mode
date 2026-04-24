
CREATE TABLE public.coach_fix_all_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id uuid NOT NULL REFERENCES public.coach_profiles(id) ON DELETE CASCADE,
  run_id uuid NOT NULL,
  patient_user_id uuid,
  patient_name text,
  step_index integer NOT NULL,
  step_type text NOT NULL,
  attempt integer,
  ok boolean NOT NULL DEFAULT true,
  message text,
  details jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_coach_fix_all_logs_coach ON public.coach_fix_all_logs (coach_id, created_at DESC);
CREATE INDEX idx_coach_fix_all_logs_run ON public.coach_fix_all_logs (run_id, step_index);

ALTER TABLE public.coach_fix_all_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coach can manage own fix-all logs"
  ON public.coach_fix_all_logs
  FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.coach_profiles cp WHERE cp.id = coach_fix_all_logs.coach_id AND cp.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.coach_profiles cp WHERE cp.id = coach_fix_all_logs.coach_id AND cp.user_id = auth.uid()));

CREATE POLICY "Service role full access fix-all logs"
  ON public.coach_fix_all_logs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
