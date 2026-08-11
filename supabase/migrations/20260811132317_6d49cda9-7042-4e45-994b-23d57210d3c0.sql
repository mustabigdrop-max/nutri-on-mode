CREATE TABLE IF NOT EXISTS public.exam_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  patient_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  patient_name TEXT,
  patient_age INT,
  patient_sex TEXT,
  exames JSONB NOT NULL DEFAULT '[]'::jsonb,
  paineis JSONB NOT NULL DEFAULT '[]'::jsonb,
  observacoes TEXT,
  justificativa TEXT,
  periodicidade TEXT,
  proxima_solicitacao DATE,
  status TEXT NOT NULL DEFAULT 'pendente',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.exam_requests TO authenticated;
GRANT ALL ON public.exam_requests TO service_role;
ALTER TABLE public.exam_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coach manages own exam requests" ON public.exam_requests
  FOR ALL TO authenticated USING (auth.uid() = coach_id) WITH CHECK (auth.uid() = coach_id);
CREATE POLICY "Patient can view own exam requests" ON public.exam_requests
  FOR SELECT TO authenticated USING (auth.uid() = patient_user_id);

CREATE TABLE IF NOT EXISTS public.exam_request_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID NOT NULL REFERENCES public.exam_requests(id) ON DELETE CASCADE,
  coach_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exame_id TEXT NOT NULL,
  valor NUMERIC,
  unidade TEXT,
  status TEXT,
  data_coleta DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.exam_request_results TO authenticated;
GRANT ALL ON public.exam_request_results TO service_role;
ALTER TABLE public.exam_request_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coach manages own exam results" ON public.exam_request_results
  FOR ALL TO authenticated USING (auth.uid() = coach_id) WITH CHECK (auth.uid() = coach_id);
CREATE POLICY "Patient can view own exam results" ON public.exam_request_results
  FOR SELECT TO authenticated USING (EXISTS (
    SELECT 1 FROM public.exam_requests r WHERE r.id = request_id AND r.patient_user_id = auth.uid()
  ));

CREATE INDEX IF NOT EXISTS idx_exam_requests_coach ON public.exam_requests(coach_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_exam_request_results_request ON public.exam_request_results(request_id);