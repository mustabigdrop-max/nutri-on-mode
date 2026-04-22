
CREATE TABLE public.ergo_diaries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  nome TEXT NOT NULL,
  objetivo TEXT,
  perfil_usuario TEXT,
  duracao_semanas INTEGER,
  data_inicio DATE,
  data_fim_prevista DATE,
  peso_inicial NUMERIC,
  bf_inicial NUMERIC,
  substancias JSONB DEFAULT '[]'::jsonb,
  auxiliares JSONB DEFAULT '[]'::jsonb,
  peptideos JSONB DEFAULT '[]'::jsonb,
  tpc_planejada JSONB,
  exames_pre_ciclo JSONB,
  alertas JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'ativo',
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ergo_diaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users own ergo_diaries select" ON public.ergo_diaries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "users own ergo_diaries insert" ON public.ergo_diaries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users own ergo_diaries update" ON public.ergo_diaries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "users own ergo_diaries delete" ON public.ergo_diaries FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER ergo_diaries_updated
BEFORE UPDATE ON public.ergo_diaries
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.ergo_checkins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  diary_id UUID NOT NULL REFERENCES public.ergo_diaries(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  semana INTEGER,
  data_checkin DATE NOT NULL DEFAULT CURRENT_DATE,
  peso NUMERIC,
  sensacao_geral INTEGER,
  qualidade_sono INTEGER,
  libido TEXT,
  pa_sistolica INTEGER,
  pa_diastolica INTEGER,
  observacoes TEXT,
  analise_ia TEXT,
  exames JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ergo_checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users own ergo_checkins select" ON public.ergo_checkins FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "users own ergo_checkins insert" ON public.ergo_checkins FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users own ergo_checkins update" ON public.ergo_checkins FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "users own ergo_checkins delete" ON public.ergo_checkins FOR DELETE USING (auth.uid() = user_id);

CREATE TABLE public.ergo_diary_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  diary_id UUID REFERENCES public.ergo_diaries(id) ON DELETE SET NULL,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ergo_diary_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users own ergo_diary_messages select" ON public.ergo_diary_messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "users own ergo_diary_messages insert" ON public.ergo_diary_messages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users own ergo_diary_messages delete" ON public.ergo_diary_messages FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_ergo_diaries_user ON public.ergo_diaries(user_id, created_at DESC);
CREATE INDEX idx_ergo_checkins_diary ON public.ergo_checkins(diary_id, data_checkin DESC);
CREATE INDEX idx_ergo_diary_messages_user ON public.ergo_diary_messages(user_id, created_at);
