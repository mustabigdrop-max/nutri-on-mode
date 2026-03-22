
CREATE TABLE IF NOT EXISTS public.coach_apex_sessions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id         UUID NOT NULL REFERENCES auth.users(id),
  atleta_nome      TEXT,
  tema             TEXT,
  pergunta         TEXT NOT NULL,
  resposta         TEXT,
  protocolo_salvo  BOOLEAN DEFAULT false,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.coach_atleta_prontuario (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id     UUID NOT NULL REFERENCES auth.users(id),
  atleta_nome  TEXT NOT NULL,
  protocolos   JSONB DEFAULT '[]'::jsonb,
  observacoes  TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.coach_apex_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_atleta_prontuario ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admin can manage apex sessions"
  ON public.coach_apex_sessions FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Only admin can manage prontuario"
  ON public.coach_atleta_prontuario FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin'));
