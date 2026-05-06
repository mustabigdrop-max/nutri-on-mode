CREATE TABLE IF NOT EXISTS public.protocol_phases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_user_id UUID NOT NULL,
  coach_id UUID NOT NULL,
  name TEXT NOT NULL,
  phase_type TEXT NOT NULL DEFAULT 'maintenance',
  emoji TEXT DEFAULT '🎯',
  color TEXT DEFAULT '#E8A020',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'planned',
  target_weight_kg NUMERIC,
  target_body_fat NUMERIC,
  kcal INTEGER,
  protein_g INTEGER,
  carbs_g INTEGER,
  fat_g INTEGER,
  carb_cycling BOOLEAN DEFAULT false,
  refeed_protocol TEXT,
  cardio_protocol TEXT,
  template_id UUID,
  visible_to_patient BOOLEAN DEFAULT true,
  completion_rating SMALLINT,
  completion_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.protocol_phases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coach manages patient phases" ON public.protocol_phases
  FOR ALL USING (auth.uid() = coach_id) WITH CHECK (auth.uid() = coach_id);

CREATE POLICY "Patient views own visible phases" ON public.protocol_phases
  FOR SELECT USING (auth.uid() = patient_user_id AND visible_to_patient = true);

CREATE TRIGGER update_protocol_phases_updated_at
  BEFORE UPDATE ON public.protocol_phases
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_protocol_phases_patient ON public.protocol_phases(patient_user_id, start_date);