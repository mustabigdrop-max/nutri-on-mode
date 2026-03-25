
CREATE TABLE IF NOT EXISTS public.daily_nutrition_protocol (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  data DATE NOT NULL,
  tipo_dia TEXT,
  treino_tipo TEXT,
  cardio_tipo TEXT,
  cardio_duracao INTEGER,
  objetivo TEXT,
  calorias_meta INTEGER,
  proteina_meta INTEGER,
  carb_meta INTEGER,
  gordura_meta INTEGER,
  calorias_consumidas INTEGER DEFAULT 0,
  proteina_consumida DECIMAL DEFAULT 0,
  carb_consumido DECIMAL DEFAULT 0,
  gordura_consumida DECIMAL DEFAULT 0,
  meal_timeline JSONB,
  supplement_schedule JSONB,
  alertas_gerados JSONB,
  sincronizado BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, data)
);

CREATE TABLE IF NOT EXISTS public.cardio_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  data DATE NOT NULL,
  horario TIME DEFAULT '06:30',
  tipo TEXT,
  zona TEXT,
  duracao INTEGER,
  calorias INTEGER,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.nutry_sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  data DATE,
  trigger TEXT,
  alteracoes JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.daily_nutrition_protocol ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cardio_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nutry_sync_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "User daily protocol" ON public.daily_nutrition_protocol FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "User cardio sessions" ON public.cardio_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "User sync log" ON public.nutry_sync_log FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_daily_protocol_user_data ON public.daily_nutrition_protocol(user_id, data);
CREATE INDEX idx_cardio_user_data ON public.cardio_sessions(user_id, data);
