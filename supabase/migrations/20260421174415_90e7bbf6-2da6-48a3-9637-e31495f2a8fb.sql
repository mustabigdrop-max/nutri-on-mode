
CREATE TABLE public.coach_meal_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID NOT NULL,
  patient_user_id UUID,
  patient_name TEXT NOT NULL,
  objetivo TEXT,
  plano JSONB NOT NULL,
  observacao TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_coach_meal_plans_coach ON public.coach_meal_plans(coach_id);
CREATE INDEX idx_coach_meal_plans_patient ON public.coach_meal_plans(patient_user_id);

ALTER TABLE public.coach_meal_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coach can manage own meal plans"
ON public.coach_meal_plans
FOR ALL
TO authenticated
USING (EXISTS (SELECT 1 FROM coach_profiles cp WHERE cp.id = coach_meal_plans.coach_id AND cp.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM coach_profiles cp WHERE cp.id = coach_meal_plans.coach_id AND cp.user_id = auth.uid()));

CREATE POLICY "Patient can view own received plans"
ON public.coach_meal_plans
FOR SELECT
TO authenticated
USING (patient_user_id = auth.uid() AND status = 'sent');

CREATE TRIGGER update_coach_meal_plans_updated_at
BEFORE UPDATE ON public.coach_meal_plans
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
