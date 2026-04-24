CREATE TABLE public.coach_plan_adjustments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID NOT NULL REFERENCES public.coach_profiles(id) ON DELETE CASCADE,
  patient_user_id UUID,
  patient_name TEXT,
  objetivo TEXT,
  target_kcal NUMERIC,
  total_antes NUMERIC,
  total_depois NUMERIC,
  delta_kcal NUMERIC,
  fator NUMERIC,
  dentro_da_banda BOOLEAN,
  aplicado BOOLEAN DEFAULT false,
  status_msg TEXT,
  plano_snapshot JSONB,
  ajuste_meta JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_coach_plan_adjustments_coach ON public.coach_plan_adjustments(coach_id, created_at DESC);
CREATE INDEX idx_coach_plan_adjustments_patient ON public.coach_plan_adjustments(patient_user_id, created_at DESC);

ALTER TABLE public.coach_plan_adjustments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coach can manage own plan adjustments"
ON public.coach_plan_adjustments
FOR ALL
TO authenticated
USING (EXISTS (SELECT 1 FROM public.coach_profiles cp WHERE cp.id = coach_plan_adjustments.coach_id AND cp.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.coach_profiles cp WHERE cp.id = coach_plan_adjustments.coach_id AND cp.user_id = auth.uid()));

CREATE POLICY "Service role full access"
ON public.coach_plan_adjustments
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);