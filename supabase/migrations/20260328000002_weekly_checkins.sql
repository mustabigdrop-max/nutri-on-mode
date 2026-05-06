-- Weekly Check-in: paciente preenche → coach responde com ajustes
CREATE TABLE public.weekly_checkins (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  coach_id uuid,           -- NULL se usuário solo
  week_start date NOT NULL,

  -- ── Peso & Medidas ────────────────────────────────
  weight_kg numeric,
  waist_cm numeric,
  hip_cm numeric,
  chest_cm numeric,
  arm_cm numeric,
  thigh_cm numeric,

  -- ── Fotos de progresso ───────────────────────────
  photo_front_url text,
  photo_side_url text,
  photo_back_url text,

  -- ── Aderência auto-reportada (1-10) ─────────────
  diet_adherence integer CHECK (diet_adherence BETWEEN 1 AND 10),
  training_adherence integer CHECK (training_adherence BETWEEN 1 AND 10),
  sleep_quality integer CHECK (sleep_quality BETWEEN 1 AND 10),
  stress_level integer CHECK (stress_level BETWEEN 1 AND 10),
  energy_level integer CHECK (energy_level BETWEEN 1 AND 10),
  hunger_level integer CHECK (hunger_level BETWEEN 1 AND 10),

  -- ── Digestão & Microbiota ────────────────────────
  digestion_rating integer CHECK (digestion_rating BETWEEN 1 AND 5),
  bloating_days integer,         -- quantos dias com inchaço
  bowel_movements_per_day numeric,

  -- ── Treino ──────────────────────────────────────
  workouts_completed integer,
  workouts_planned integer,
  avg_session_duration_min integer,
  performance_trend text CHECK (performance_trend IN ('improving', 'stable', 'declining')),

  -- ── Sintomas & queixas ──────────────────────────
  symptoms text[],  -- ["cansaço","queda_capilar","libido_baixa","ansiedade"]
  medications_changed boolean DEFAULT false,
  cycle_day integer,  -- para mulheres, dia do ciclo menstrual

  -- ── Texto livre ─────────────────────────────────
  patient_notes text,

  -- ── Resposta do Coach ───────────────────────────
  coach_feedback text,
  coach_macro_adjustment jsonb,
  -- ex: {"kcal_delta":-100,"protein_delta":0,"carbs_delta":-20,"fat_delta":0,"reason":"Peso estagnado 2 semanas"}
  coach_responded_at timestamptz,
  protocol_adjusted boolean DEFAULT false,

  -- Calculado: variação de peso vs semana anterior
  weight_delta_kg numeric,

  UNIQUE (user_id, week_start),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.weekly_checkins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own checkins"
  ON public.weekly_checkins FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Coach can view and respond to patient checkins"
  ON public.weekly_checkins FOR ALL TO authenticated
  USING (auth.uid() = coach_id);

CREATE INDEX idx_weekly_checkins_user ON public.weekly_checkins (user_id, week_start DESC);
CREATE INDEX idx_weekly_checkins_coach ON public.weekly_checkins (coach_id, created_at DESC);
