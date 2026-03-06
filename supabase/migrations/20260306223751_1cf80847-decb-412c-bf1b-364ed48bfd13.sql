
-- Blood test uploads and AI analysis
CREATE TABLE public.blood_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  pdf_url TEXT NOT NULL,
  test_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, analyzed, validated, applied
  ai_analysis JSONB DEFAULT '{}'::jsonb,
  suggested_changes JSONB DEFAULT '{}'::jsonb,
  validated_by UUID,
  validated_at TIMESTAMPTZ,
  applied_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.blood_tests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own blood tests"
  ON public.blood_tests FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Professionals can view patient blood tests"
  ON public.blood_tests FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM professional_patients
      WHERE professional_patients.professional_id = auth.uid()
        AND professional_patients.patient_id = blood_tests.user_id
        AND professional_patients.status = 'active'
    )
  );

CREATE POLICY "Professionals can validate patient blood tests"
  ON public.blood_tests FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM professional_patients
      WHERE professional_patients.professional_id = auth.uid()
        AND professional_patients.patient_id = blood_tests.user_id
        AND professional_patients.status = 'active'
    )
  );
