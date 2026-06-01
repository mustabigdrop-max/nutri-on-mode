CREATE TABLE public.meridian_drug_tests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  competition_id UUID NULL REFERENCES public.meridian_competitions(id) ON DELETE SET NULL,
  plan_id UUID NULL REFERENCES public.meridian_plans(id) ON DELETE SET NULL,
  federation TEXT NOT NULL,
  test_type TEXT NOT NULL,
  scheduled_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'SCHEDULED',
  result TEXT NULL,
  is_mandatory BOOLEAN NOT NULL DEFAULT true,
  notes TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.meridian_drug_tests TO authenticated;
GRANT ALL ON public.meridian_drug_tests TO service_role;

ALTER TABLE public.meridian_drug_tests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "drug_tests_select_own" ON public.meridian_drug_tests
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "drug_tests_insert_own" ON public.meridian_drug_tests
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "drug_tests_update_own" ON public.meridian_drug_tests
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "drug_tests_delete_own" ON public.meridian_drug_tests
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER update_meridian_drug_tests_updated_at
BEFORE UPDATE ON public.meridian_drug_tests
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_meridian_drug_tests_user ON public.meridian_drug_tests(user_id, scheduled_date DESC);
CREATE INDEX idx_meridian_drug_tests_competition ON public.meridian_drug_tests(competition_id);
