
CREATE TABLE IF NOT EXISTS public.behavioral_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  perfil_mce TEXT,
  perfil_primario TEXT,
  perfil_secundario TEXT,
  estagio_mudanca TEXT DEFAULT 'contemplação',
  estagio_score INTEGER,
  mindset_score INTEGER,
  mindset_tipo TEXT,
  crencas_limitantes TEXT[],
  loops_negativos JSONB,
  loops_positivos JSONB,
  gatilhos_mapeados JSONB,
  rotinas_substitutas JSONB,
  declaracao_identidade TEXT,
  votos_identidade INTEGER DEFAULT 0,
  identidade_score INTEGER DEFAULT 0,
  horarios_criticos TEXT[],
  dias_criticos TEXT[],
  situacoes_risco TEXT[],
  historico_sabotagem JSONB,
  ponto_sabotagem_percent INTEGER,
  decisoes_antecipadas JSONB,
  implementation_intents JSONB,
  environment_design JSONB,
  streak_atual INTEGER DEFAULT 0,
  streak_maximo INTEGER DEFAULT 0,
  taxa_aderencia_geral DECIMAL DEFAULT 0,
  taxa_aderencia_7dias DECIMAL DEFAULT 0,
  episodios_emocionais INTEGER DEFAULT 0,
  episodios_retorno INTEGER DEFAULT 0,
  velocidade_retorno_media DECIMAL,
  risco_abandono INTEGER DEFAULT 0,
  previsao_abandono DATE,
  ultima_recaida DATE,
  padrao_recaida TEXT,
  notas_coach TEXT,
  intervencoes_coach JSONB,
  alertas_ativos TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.behavioral_diary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  local TEXT,
  com_quem TEXT,
  atividade TEXT,
  horario_tipo TEXT,
  emocao_primaria TEXT,
  emocao_intensidade INTEGER,
  estado_antes TEXT,
  estado_depois TEXT,
  fome_antes INTEGER,
  saciedade_depois INTEGER,
  fome_real BOOLEAN,
  decisao_tomada TEXT,
  alimento_consumido TEXT,
  satisfacao INTEGER,
  arrependimento BOOLEAN,
  o_que_aconteceu TEXT,
  o_que_aprendi TEXT,
  proxima_vez TEXT,
  intervencao_usada TEXT,
  intervencao_eficaz BOOLEAN,
  alternativa_usada TEXT,
  gatilho_id UUID,
  loop_identificado TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.emotion_regulation_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  emocao TEXT,
  intensidade INTEGER,
  tecnica_usada TEXT,
  duracao_segundos INTEGER,
  eficacia INTEGER,
  decisao_pos TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.risk_interventions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  tipo_risco TEXT,
  score_risco INTEGER,
  intervencao_tipo TEXT,
  resposta_usuario TEXT,
  eficacia INTEGER,
  acao_resultante TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.behavioral_loops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  tipo TEXT,
  gatilho TEXT,
  rotina_antiga TEXT,
  rotina_nova TEXT,
  recompensa TEXT,
  ativo BOOLEAN DEFAULT true,
  eficacia INTEGER,
  vezes_ativado INTEGER DEFAULT 0,
  vezes_sucesso INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.behavioral_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  data_predicao DATE,
  tipo TEXT,
  score_risco INTEGER,
  sinais_detectados TEXT[],
  intervencao_sugerida TEXT,
  resultado_real TEXT,
  acertou BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.behavioral_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.behavioral_diary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emotion_regulation_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_interventions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.behavioral_loops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.behavioral_predictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "User behavioral profile" ON public.behavioral_profiles FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "User behavioral diary" ON public.behavioral_diary FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "User emotion log" ON public.emotion_regulation_log FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "User risk interventions" ON public.risk_interventions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "User behavioral loops" ON public.behavioral_loops FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "User predictions" ON public.behavioral_predictions FOR ALL USING (auth.uid() = user_id);
