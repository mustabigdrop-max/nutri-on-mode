-- ============================================================
-- COMPETITION MODE — Infrastructure
-- ============================================================

-- 1. competition_plans
CREATE TABLE public.competition_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID NOT NULL,            -- coach_profiles.id
  athlete_id UUID NOT NULL,          -- auth.users.id (vinculado via coach_patients)

  -- Competição
  nome_competicao TEXT NOT NULL,
  federacao TEXT NOT NULL CHECK (federacao IN ('IFBB','NABBA','NPC','WFF','WBPF','OUTRA')),
  categoria TEXT NOT NULL,           -- Classic / Physique / BB / Bikini / Figure / Wellness / Mens Physique
  data_competicao DATE NOT NULL,
  local_competicao TEXT,

  -- Atleta na criação
  peso_atual NUMERIC(6,2) NOT NULL,
  altura NUMERIC(5,2) NOT NULL,
  bf_atual NUMERIC(4,2),
  massa_magra NUMERIC(6,2),
  peso_alvo_palco NUMERIC(6,2) NOT NULL,
  peso_limite_categoria NUMERIC(6,2),

  -- Protocolo farmacológico (texto livre — usado pelo cálculo)
  protocolo_farmacologico TEXT,

  -- Blocos calculados
  blocos JSONB NOT NULL DEFAULT '[]'::jsonb,
  semana_atual INTEGER NOT NULL DEFAULT 1,
  bloco_atual TEXT,

  -- Metadados de cálculo
  calculo_meta JSONB,                -- { semanas_totais, semanas_offseason, semanas_cutting, perda_necessaria, taxa_perda_semana }

  status TEXT NOT NULL DEFAULT 'planejamento'
    CHECK (status IN ('planejamento','ativo','concluido','cancelado')),

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_competition_plans_coach ON public.competition_plans(coach_id);
CREATE INDEX idx_competition_plans_athlete ON public.competition_plans(athlete_id);
CREATE INDEX idx_competition_plans_status ON public.competition_plans(status);
CREATE INDEX idx_competition_plans_data ON public.competition_plans(data_competicao);

-- 2. competition_weekly_logs
CREATE TABLE public.competition_weekly_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  competition_plan_id UUID NOT NULL REFERENCES public.competition_plans(id) ON DELETE CASCADE,
  semana INTEGER NOT NULL,
  bloco TEXT,

  -- Métricas
  peso NUMERIC(6,2),
  bf_estimado NUMERIC(4,2),
  massa_magra_estimada NUMERIC(6,2),
  circunferencia_cintura NUMERIC(5,2),

  -- Fotos (urls do storage)
  foto_frente_url TEXT,
  foto_lateral_url TEXT,
  foto_costas_url TEXT,

  -- Scores (1-5 ou %)
  recovery_score NUMERIC(4,2),
  aderencia_treino NUMERIC(5,2),     -- %
  aderencia_dieta NUMERIC(5,2),      -- %
  qualidade_sono NUMERIC(4,2),       -- 1-5
  energia_geral NUMERIC(4,2),        -- 1-5
  dor_muscular NUMERIC(4,2),         -- 1-5
  horas_sono_media NUMERIC(4,2),
  forca_status TEXT CHECK (forca_status IN ('melhorou','manteve','piorou')),

  -- Posing
  posing_minutos INTEGER DEFAULT 0,
  posing_com_musica BOOLEAN DEFAULT false,

  -- Dieta
  maior_dificuldade TEXT,
  episodio_compulsao BOOLEAN DEFAULT false,

  -- Ajustes aplicados pela IA
  ajuste_calorico INTEGER,           -- kcal +/-
  ajuste_volume INTEGER,             -- % +/-
  ajuste_cardio INTEGER,             -- min +/-

  -- Output IA
  analise_semana TEXT,
  ajustes_proxima_semana JSONB,
  alertas JSONB DEFAULT '[]'::jsonb,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (competition_plan_id, semana)
);

CREATE INDEX idx_weekly_logs_plan ON public.competition_weekly_logs(competition_plan_id);

-- 3. competition_daily_logs
CREATE TABLE public.competition_daily_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  competition_plan_id UUID NOT NULL REFERENCES public.competition_plans(id) ON DELETE CASCADE,
  data DATE NOT NULL,
  semana INTEGER NOT NULL,

  -- Treino
  treino_realizado BOOLEAN DEFAULT false,
  exercicios_log JSONB DEFAULT '[]'::jsonb,
  volume_total_kg NUMERIC(10,2),
  recovery_score_pre NUMERIC(4,2),

  -- Nutrição
  calorias_consumidas NUMERIC(8,2),
  proteina_consumida NUMERIC(6,2),
  carbo_consumido NUMERIC(6,2),
  gordura_consumida NUMERIC(6,2),
  hidratacao_ml NUMERIC(6,0),

  -- Posing
  posing_realizado BOOLEAN DEFAULT false,
  duracao_posing_min INTEGER DEFAULT 0,

  -- Cardio
  cardio_tipo TEXT,                  -- AEJ / LISS / HIIT
  cardio_duracao_min INTEGER,

  -- Farmacológico
  compostos_aplicados JSONB DEFAULT '[]'::jsonb,

  -- Score do dia
  score_dia NUMERIC(5,2),

  observacoes TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (competition_plan_id, data)
);

CREATE INDEX idx_daily_logs_plan ON public.competition_daily_logs(competition_plan_id);
CREATE INDEX idx_daily_logs_data ON public.competition_daily_logs(data);

-- ============================================================
-- TRIGGERS — updated_at
-- ============================================================
CREATE TRIGGER trg_competition_plans_updated_at
  BEFORE UPDATE ON public.competition_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- HELPER — verifica se um user é o coach dono do plano
-- ============================================================
CREATE OR REPLACE FUNCTION public.user_owns_competition_plan(_user_id UUID, _plan_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.competition_plans cp
    JOIN public.coach_profiles cprof ON cprof.id = cp.coach_id
    WHERE cp.id = _plan_id AND cprof.user_id = _user_id
  );
$$;

CREATE OR REPLACE FUNCTION public.user_is_athlete_of_plan(_user_id UUID, _plan_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.competition_plans cp
    WHERE cp.id = _plan_id AND cp.athlete_id = _user_id
  );
$$;

-- ============================================================
-- RLS — competition_plans
-- ============================================================
ALTER TABLE public.competition_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coach can view own plans"
  ON public.competition_plans FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.coach_profiles cp
      WHERE cp.id = competition_plans.coach_id AND cp.user_id = auth.uid()
    )
  );

CREATE POLICY "Athlete can view own plan"
  ON public.competition_plans FOR SELECT
  USING (athlete_id = auth.uid());

CREATE POLICY "Admin can view all plans"
  ON public.competition_plans FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Coach can create plans for their athletes"
  ON public.competition_plans FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.coach_profiles cp
      WHERE cp.id = competition_plans.coach_id AND cp.user_id = auth.uid()
    )
  );

CREATE POLICY "Coach can update own plans"
  ON public.competition_plans FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.coach_profiles cp
      WHERE cp.id = competition_plans.coach_id AND cp.user_id = auth.uid()
    )
  );

CREATE POLICY "Coach can delete own plans"
  ON public.competition_plans FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.coach_profiles cp
      WHERE cp.id = competition_plans.coach_id AND cp.user_id = auth.uid()
    )
  );

-- ============================================================
-- RLS — competition_weekly_logs
-- ============================================================
ALTER TABLE public.competition_weekly_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coach and athlete can view weekly logs"
  ON public.competition_weekly_logs FOR SELECT
  USING (
    public.user_owns_competition_plan(auth.uid(), competition_plan_id)
    OR public.user_is_athlete_of_plan(auth.uid(), competition_plan_id)
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Coach and athlete can insert weekly logs"
  ON public.competition_weekly_logs FOR INSERT
  WITH CHECK (
    public.user_owns_competition_plan(auth.uid(), competition_plan_id)
    OR public.user_is_athlete_of_plan(auth.uid(), competition_plan_id)
  );

CREATE POLICY "Coach and athlete can update weekly logs"
  ON public.competition_weekly_logs FOR UPDATE
  USING (
    public.user_owns_competition_plan(auth.uid(), competition_plan_id)
    OR public.user_is_athlete_of_plan(auth.uid(), competition_plan_id)
  );

CREATE POLICY "Coach can delete weekly logs"
  ON public.competition_weekly_logs FOR DELETE
  USING (public.user_owns_competition_plan(auth.uid(), competition_plan_id));

-- ============================================================
-- RLS — competition_daily_logs
-- ============================================================
ALTER TABLE public.competition_daily_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coach and athlete can view daily logs"
  ON public.competition_daily_logs FOR SELECT
  USING (
    public.user_owns_competition_plan(auth.uid(), competition_plan_id)
    OR public.user_is_athlete_of_plan(auth.uid(), competition_plan_id)
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Coach and athlete can insert daily logs"
  ON public.competition_daily_logs FOR INSERT
  WITH CHECK (
    public.user_owns_competition_plan(auth.uid(), competition_plan_id)
    OR public.user_is_athlete_of_plan(auth.uid(), competition_plan_id)
  );

CREATE POLICY "Coach and athlete can update daily logs"
  ON public.competition_daily_logs FOR UPDATE
  USING (
    public.user_owns_competition_plan(auth.uid(), competition_plan_id)
    OR public.user_is_athlete_of_plan(auth.uid(), competition_plan_id)
  );

CREATE POLICY "Coach can delete daily logs"
  ON public.competition_daily_logs FOR DELETE
  USING (public.user_owns_competition_plan(auth.uid(), competition_plan_id));