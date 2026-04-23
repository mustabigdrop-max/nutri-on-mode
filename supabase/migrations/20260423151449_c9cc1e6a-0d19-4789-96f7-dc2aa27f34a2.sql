
CREATE TABLE public.plano_comparacoes_historico (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID NOT NULL REFERENCES public.coach_profiles(id) ON DELETE CASCADE,
  patient_name TEXT,
  objetivo TEXT,
  modo_principal TEXT NOT NULL DEFAULT 'economico',
  plano_a JSONB NOT NULL,
  plano_b JSONB NOT NULL,
  resumo JSONB,
  observacao TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_plano_comp_hist_coach ON public.plano_comparacoes_historico(coach_id, created_at DESC);

ALTER TABLE public.plano_comparacoes_historico ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coach manages own comparison history"
ON public.plano_comparacoes_historico
FOR ALL
TO authenticated
USING (
  coach_id IN (SELECT id FROM public.coach_profiles WHERE user_id = auth.uid())
)
WITH CHECK (
  coach_id IN (SELECT id FROM public.coach_profiles WHERE user_id = auth.uid())
);
