CREATE TABLE IF NOT EXISTS public.coach_protocol_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'maintenance',
  description TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  protein_per_kg NUMERIC NOT NULL DEFAULT 1.8,
  carbs_per_kg NUMERIC NOT NULL DEFAULT 4,
  fat_per_kg NUMERIC NOT NULL DEFAULT 1,
  training_day_carb_mult NUMERIC NOT NULL DEFAULT 1.0,
  rest_day_carb_mult NUMERIC NOT NULL DEFAULT 0.7,
  pharma_notes TEXT,
  use_glut4_post_workout BOOLEAN NOT NULL DEFAULT false,
  use_microbiota_protocol BOOLEAN NOT NULL DEFAULT false,
  use_carb_cycling BOOLEAN NOT NULL DEFAULT false,
  use_chronobiology BOOLEAN NOT NULL DEFAULT false,
  used_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.coach_protocol_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coach can view own templates" ON public.coach_protocol_templates
  FOR SELECT USING (auth.uid() = coach_id);
CREATE POLICY "Coach can insert own templates" ON public.coach_protocol_templates
  FOR INSERT WITH CHECK (auth.uid() = coach_id);
CREATE POLICY "Coach can update own templates" ON public.coach_protocol_templates
  FOR UPDATE USING (auth.uid() = coach_id);
CREATE POLICY "Coach can delete own templates" ON public.coach_protocol_templates
  FOR DELETE USING (auth.uid() = coach_id);

CREATE TRIGGER update_coach_protocol_templates_updated_at
  BEFORE UPDATE ON public.coach_protocol_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_coach_protocol_templates_coach_id ON public.coach_protocol_templates(coach_id);