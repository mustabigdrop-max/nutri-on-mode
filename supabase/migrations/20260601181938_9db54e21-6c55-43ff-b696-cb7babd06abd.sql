CREATE TABLE public.meridian_handoffs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  plan_id UUID NOT NULL REFERENCES public.meridian_plans(id) ON DELETE CASCADE,
  competition_id UUID NOT NULL REFERENCES public.meridian_competitions(id) ON DELETE CASCADE,
  target_module TEXT NOT NULL CHECK (target_module IN ('nutriplan','trainingon','dr_vertex','mce','apex')),
  phase TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','applied','discarded')),
  applied_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_meridian_handoffs_user ON public.meridian_handoffs(user_id, target_module, status);
CREATE INDEX idx_meridian_handoffs_plan ON public.meridian_handoffs(plan_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.meridian_handoffs TO authenticated;
GRANT ALL ON public.meridian_handoffs TO service_role;

ALTER TABLE public.meridian_handoffs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Athletes manage own handoffs"
  ON public.meridian_handoffs
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Coaches can view handoffs of linked athletes"
  ON public.meridian_handoffs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.coach_patients cp
      JOIN public.coach_profiles cpr ON cpr.id = cp.coach_id
      WHERE cp.patient_user_id = meridian_handoffs.user_id
        AND cpr.user_id = auth.uid()
        AND cp.status = 'active'
    )
  );

CREATE TRIGGER update_meridian_handoffs_updated_at
  BEFORE UPDATE ON public.meridian_handoffs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();