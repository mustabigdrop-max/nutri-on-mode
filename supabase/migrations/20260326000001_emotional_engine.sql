-- ============================================================
-- EMOTIONAL HUNGER ENGINE
-- "Sua fome nunca foi de comida."
-- ============================================================

-- Tabela central: episódios comportamentais unificados
-- Migra os dados que estavam em localStorage do BehavioralTriggersPage
CREATE TABLE public.emotional_episodes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,

  -- Momento
  occurred_at timestamptz DEFAULT now(),
  hour_of_day integer GENERATED ALWAYS AS (EXTRACT(HOUR FROM occurred_at)::integer) STORED,
  day_of_week integer GENERATED ALWAYS AS (EXTRACT(DOW FROM occurred_at)::integer) STORED,

  -- Tipo de fome identificada
  hunger_type text CHECK (hunger_type IN ('physical', 'emotional', 'habitual', 'boredom', 'social', 'unknown')),

  -- TCC: Situação → Emoção → Pensamento → Comportamento
  emotion text,           -- ansiedade, estresse, tédio, tristeza, solidão, culpa, comemoração, cansaço
  emotion_intensity integer CHECK (emotion_intensity BETWEEN 1 AND 10),
  situation text,         -- contexto livre: "sozinha em casa", "reunião stressante"
  automatic_thought text, -- pensamento automático: "mereço isso", "tanto faz"
  behavior text,          -- compulsão, beliscar, fora_do_plano, pular_refeicao, etc.

  -- Intervenção aplicada
  technique_used text,    -- respiracao_4_7_8, surfing_urge, journal, movimento, delay_15min, tcc_chat, none
  technique_duration_sec integer,  -- quanto tempo ficou na técnica
  technique_started_at timestamptz,
  technique_completed boolean DEFAULT false,

  -- Resultado
  resisted boolean,       -- conseguiu resistir?
  ate_anyway boolean DEFAULT false,
  linked_meal_log_id uuid,  -- se comeu, qual meal_log
  post_emotion_intensity integer CHECK (post_emotion_intensity BETWEEN 1 AND 10), -- como ficou depois
  notes text,

  -- Metadados para aprendizado
  context_sleep_quality integer, -- sono da noite anterior (1-5)
  context_stress_level integer,  -- estresse do dia (1-10)
  context_deficit_kcal integer,  -- déficit calórico do dia

  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.emotional_episodes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own emotional episodes"
  ON public.emotional_episodes FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Índices para queries do VulnerabilityMap e analytics
CREATE INDEX idx_emotional_episodes_user_time
  ON public.emotional_episodes (user_id, occurred_at DESC);

CREATE INDEX idx_emotional_episodes_user_dow_hour
  ON public.emotional_episodes (user_id, day_of_week, hour_of_day);

-- ============================================================
-- Win Rate — agregado semanal (calculado pelo app)
-- ============================================================
CREATE TABLE public.emotional_win_rates (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  week_start date NOT NULL,
  total_episodes integer DEFAULT 0,
  resisted_count integer DEFAULT 0,
  win_rate numeric GENERATED ALWAYS AS (
    CASE WHEN total_episodes > 0
      THEN ROUND((resisted_count::numeric / total_episodes) * 100, 1)
      ELSE 0
    END
  ) STORED,
  top_technique text,
  top_emotion text,
  top_context text,
  streak_days integer DEFAULT 0,
  UNIQUE (user_id, week_start)
);

ALTER TABLE public.emotional_win_rates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own win rates"
  ON public.emotional_win_rates FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
