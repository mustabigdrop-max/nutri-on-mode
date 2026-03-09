
-- Consent table
CREATE TABLE public.performance_pro_consent (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  accepted_at timestamptz DEFAULT now(),
  ip_address text
);

ALTER TABLE public.performance_pro_consent ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own consent"
  ON public.performance_pro_consent
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Protocols table
CREATE TABLE public.performance_pro_protocols (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  substances text[] DEFAULT '{}',
  current_phase text DEFAULT 'inicio',
  objective text DEFAULT 'massa',
  experience_level text DEFAULT 'primeiro',
  nutrition_plan jsonb DEFAULT '{}',
  support_stack jsonb DEFAULT '[]',
  safety_alerts jsonb DEFAULT '[]',
  ai_message text,
  started_at date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.performance_pro_protocols ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own protocols"
  ON public.performance_pro_protocols
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Exams table
CREATE TABLE public.performance_pro_exams (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  exam_date date DEFAULT CURRENT_DATE,
  ldl numeric,
  hdl numeric,
  triglycerides numeric,
  tgo numeric,
  tgp numeric,
  ggt numeric,
  testosterone_total numeric,
  testosterone_free numeric,
  estradiol numeric,
  lh numeric,
  fsh numeric,
  prolactin numeric,
  hematocrit numeric,
  hemoglobin numeric,
  creatinine numeric,
  urea numeric,
  blood_pressure_systolic integer,
  blood_pressure_diastolic integer,
  psa numeric,
  notes text,
  ai_analysis jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.performance_pro_exams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own exams"
  ON public.performance_pro_exams
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
