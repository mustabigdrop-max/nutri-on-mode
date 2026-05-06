-- Protocol Phases: periodização com datas — Gantt de fases do protocolo
CREATE TABLE public.protocol_phases (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  coach_id uuid,

  -- Identidade
  name text NOT NULL,       -- "Fase 1 — Cutting Agressivo", "Peak Week", "Manutenção"
  phase_type text CHECK (phase_type IN (
    'cutting', 'aggressive_cut', 'mini_cut',
    'bulking', 'lean_bulk',
    'maintenance', 'recomp',
    'peak_week', 'contest_prep',
    'recovery', 'refeed_week', 'diet_break', 'custom'
  )),
  color text DEFAULT '#6366f1',  -- cor no Gantt (hex)
  emoji text DEFAULT '📅',

  -- Datas
  start_date date NOT NULL,
  end_date date NOT NULL,
  duration_weeks integer GENERATED ALWAYS AS (
    CEIL((end_date - start_date)::numeric / 7)::integer
  ) STORED,

  -- Metas da fase
  target_weight_kg numeric,
  target_bf_pct numeric,
  target_muscle_gain_kg numeric,

  -- Macro targets desta fase
  kcal_target integer,
  protein_g integer,
  carbs_g integer,
  fat_g integer,
  weekly_deficit_surplus integer,  -- kcal/semana esperado

  -- Estratégia
  carb_cycling_enabled boolean DEFAULT false,
  refeed_frequency text,  -- "weekly", "biweekly", "monthly"
  cardio_protocol text,
  training_split text,

  -- Template base (opcional)
  based_on_template_id uuid REFERENCES public.coach_protocol_templates(id) ON DELETE SET NULL,

  -- Status
  status text DEFAULT 'planned' CHECK (status IN ('planned', 'active', 'completed', 'paused', 'cancelled')),
  coach_notes text,
  patient_visible boolean DEFAULT true,

  -- Resultados ao final (preenchido na conclusão)
  actual_weight_end_kg numeric,
  actual_bf_pct_end numeric,
  phase_rating integer CHECK (phase_rating BETWEEN 1 AND 5),
  completion_notes text,

  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  CHECK (end_date > start_date)
);

ALTER TABLE public.protocol_phases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own phases"
  ON public.protocol_phases FOR SELECT TO authenticated
  USING (auth.uid() = user_id AND patient_visible = true);

CREATE POLICY "Coach can manage patient phases"
  ON public.protocol_phases FOR ALL TO authenticated
  USING (auth.uid() = coach_id OR auth.uid() = user_id);

CREATE INDEX idx_protocol_phases_user ON public.protocol_phases (user_id, start_date);
CREATE INDEX idx_protocol_phases_coach ON public.protocol_phases (coach_id, status);
