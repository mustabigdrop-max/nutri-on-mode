-- Coach Protocol Templates: biblioteca de protocolos reutilizáveis
CREATE TABLE public.coach_protocol_templates (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id uuid NOT NULL,

  -- Identidade do template
  name text NOT NULL,
  description text,
  category text CHECK (category IN ('cutting', 'bulking', 'recomp', 'maintenance', 'contest_prep', 'health', 'custom')),
  tags text[] DEFAULT '{}',

  -- Parâmetros macro base (por 100kg de referência ou percentuais)
  kcal_formula text,        -- ex: "bw*24 + deficit_500" — documentado para o coach
  protein_g_per_kg numeric,
  carbs_g_per_kg numeric,
  fat_g_per_kg numeric,

  -- Dias de treino vs descanso (divisão macro)
  training_day_carbs_adj numeric DEFAULT 1.0,
  rest_day_carbs_adj numeric DEFAULT 0.7,

  -- Estrutura do plano (jsonb: meals × days)
  meal_structure jsonb DEFAULT '{}'::jsonb,
  -- ex: {"meals":["Café","Lanche","Almoço","Pré","Pós","Ceia"],"days":7}

  -- Snaps de refeições padrão (array de jsonb por slot)
  default_meals jsonb DEFAULT '[]'::jsonb,

  -- Protocolo farmacológico embutido (opcional)
  pharmacological_notes text,

  -- Configurações avançadas espelhando DietBuilderPage
  settings jsonb DEFAULT '{}'::jsonb,
  -- ex: {"glut4":true,"carbCycling":true,"microbiota":false,"chronobiology":true}

  -- Meta
  times_used integer DEFAULT 0,
  is_public boolean DEFAULT false,   -- futura marketplace de templates entre coachs
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.coach_protocol_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Coaches can manage own templates"
  ON public.coach_protocol_templates FOR ALL TO authenticated
  USING (auth.uid() = coach_id) WITH CHECK (auth.uid() = coach_id);

CREATE INDEX idx_coach_templates_coach ON public.coach_protocol_templates (coach_id, category);
