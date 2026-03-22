
CREATE TABLE IF NOT EXISTS public.coach_exam_protocols (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id    UUID NOT NULL,
  atleta_nome TEXT,
  exame       TEXT,
  valor       TEXT,
  protocolo   JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.fitoterapicos_lib (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome           TEXT NOT NULL,
  origem         TEXT,
  mecanismo      TEXT,
  dose           TEXT,
  timing         TEXT,
  ciclo          TEXT,
  indicacoes     TEXT[] DEFAULT '{}',
  contraindicoes TEXT[] DEFAULT '{}',
  interacoes     TEXT[] DEFAULT '{}',
  farmacocinetica JSONB DEFAULT '{}',
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.coach_exam_protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fitoterapicos_lib ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admin can manage exam protocols"
  ON public.coach_exam_protocols FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin'));

CREATE POLICY "Anyone authenticated can read fitoterapicos"
  ON public.fitoterapicos_lib FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admin can manage fitoterapicos"
  ON public.fitoterapicos_lib FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin'));
