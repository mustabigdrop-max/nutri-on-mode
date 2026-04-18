-- STRATUM Protocol — 6 tabelas core para as 7 camadas de inteligência

-- 1. Diagnóstico inicial do atleta (Camada 1)
CREATE TABLE public.stratum_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  nivel TEXT, -- iniciante / intermediario / avancado / elite
  objetivo TEXT,
  modulo_recomendado TEXT, -- chest / arms / back / legs / upper / lower / etc
  split_ideal TEXT,
  morfologia JSONB DEFAULT '{}'::jsonb, -- mobilidade tornozelo, valgo, fêmur, etc
  lesoes JSONB DEFAULT '[]'::jsonb,
  contraindicacoes JSONB DEFAULT '[]'::jsonb,
  adaptacoes JSONB DEFAULT '[]'::jsonb,
  prioridades JSONB DEFAULT '[]'::jsonb,
  frequencia_semanal INT,
  tempo_por_sessao INT,
  acesso_academia TEXT,
  historico_protocolos JSONB DEFAULT '{}'::jsonb,
  prontidao_psicologica INT,
  pca_perfil TEXT, -- Racional / Emocional / Pragmatico / Social
  diagnostico_completo TEXT, -- texto final do agente
  anamnese_respostas JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Sessões de treino registradas (Camada 2)
CREATE TABLE public.stratum_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  data_sessao DATE NOT NULL DEFAULT CURRENT_DATE,
  modulo TEXT, -- chest / arms / etc
  tipo_treino TEXT, -- forca / volume / deload / cardio
  grupo_principal TEXT,
  volume_total INT, -- total sets
  rpe_medio NUMERIC(3,1),
  duracao_minutos INT,
  fadiga_reportada INT, -- 1-10
  observacoes TEXT,
  completado BOOLEAN DEFAULT true,
  motivo_incompleto TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Exercícios por sessão (Camada 2)
CREATE TABLE public.stratum_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.stratum_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  exercicio TEXT NOT NULL,
  sets INT,
  reps_target TEXT, -- "8-10"
  reps_realizadas JSONB, -- [10, 9, 8, 7]
  carga NUMERIC(6,2),
  unidade TEXT DEFAULT 'kg',
  rpe INT,
  rir INT,
  pr BOOLEAN DEFAULT false,
  ordem INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Check-ins diários de prontidão (Camada 3)
CREATE TABLE public.stratum_readiness (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  check_date DATE NOT NULL DEFAULT CURRENT_DATE,
  sono INT, -- 1-10
  energia INT, -- 1-10
  dor TEXT, -- nenhuma / leve / moderada / severa
  dor_local TEXT,
  estresse TEXT, -- baixo / medio / alto
  hrv_delta NUMERIC(5,2), -- % vs baseline
  score INT, -- 0-100
  zona TEXT, -- verde / amarelo / laranja / vermelho
  recomendacao TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, check_date)
);

-- 5. Relatórios semanais (Camada 7)
CREATE TABLE public.stratum_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  semana_inicio DATE NOT NULL,
  semana_fim DATE NOT NULL,
  aderencia_pct NUMERIC(5,2),
  volume_total INT,
  rpe_medio NUMERIC(3,1),
  prontidao_media NUMERIC(5,2),
  volume_por_grupo JSONB DEFAULT '{}'::jsonb,
  ratio_empurrar_puxar TEXT,
  prs JSONB DEFAULT '[]'::jsonb,
  alertas JSONB DEFAULT '[]'::jsonb,
  analise_pca TEXT,
  proxima_semana JSONB DEFAULT '{}'::jsonb,
  fase_proxima TEXT,
  ajustes_automaticos JSONB DEFAULT '[]'::jsonb,
  enviado BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, semana_inicio)
);

-- 6. Log de adaptações automáticas (Camadas 2, 5, 6)
CREATE TABLE public.stratum_adaptations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  tipo TEXT NOT NULL, -- progressao / deload / platô / desequilibrio / sync_nutrion / sync_nexus
  exercicio TEXT,
  detalhe TEXT NOT NULL,
  dados JSONB DEFAULT '{}'::jsonb,
  aplicado BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.stratum_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stratum_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stratum_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stratum_readiness ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stratum_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stratum_adaptations ENABLE ROW LEVEL SECURITY;

-- Policies: cada usuário acessa apenas seus dados
CREATE POLICY "stratum_profiles_own" ON public.stratum_profiles FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "stratum_sessions_own" ON public.stratum_sessions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "stratum_exercises_own" ON public.stratum_exercises FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "stratum_readiness_own" ON public.stratum_readiness FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "stratum_reports_own" ON public.stratum_reports FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "stratum_adaptations_own" ON public.stratum_adaptations FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Triggers updated_at
CREATE TRIGGER stratum_profiles_updated BEFORE UPDATE ON public.stratum_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes para performance
CREATE INDEX idx_stratum_sessions_user_date ON public.stratum_sessions(user_id, data_sessao DESC);
CREATE INDEX idx_stratum_exercises_session ON public.stratum_exercises(session_id);
CREATE INDEX idx_stratum_readiness_user_date ON public.stratum_readiness(user_id, check_date DESC);
CREATE INDEX idx_stratum_reports_user_week ON public.stratum_reports(user_id, semana_inicio DESC);
CREATE INDEX idx_stratum_adaptations_user ON public.stratum_adaptations(user_id, created_at DESC);