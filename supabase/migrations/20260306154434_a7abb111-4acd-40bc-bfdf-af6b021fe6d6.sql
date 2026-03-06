
-- Table linking professionals to their patients (max 30)
CREATE TABLE public.professional_patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id uuid NOT NULL,
  patient_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'active',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(professional_id, patient_id)
);

ALTER TABLE public.professional_patients ENABLE ROW LEVEL SECURITY;

-- Professionals can see their own patients
CREATE POLICY "Professionals can manage own patients"
  ON public.professional_patients
  FOR ALL
  TO authenticated
  USING (auth.uid() = professional_id)
  WITH CHECK (auth.uid() = professional_id);

-- Patients can see their own link
CREATE POLICY "Patients can view own link"
  ON public.professional_patients
  FOR SELECT
  TO authenticated
  USING (auth.uid() = patient_id);
