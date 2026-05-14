-- APEX Visual Coach — módulo de evolução fotográfica semanal
CREATE TABLE IF NOT EXISTS public.apex_checkins (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  atleta_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  admin_id        UUID REFERENCES auth.users(id),
  semana          INTEGER NOT NULL,
  semanas_faltam  INTEGER,
  foto_url        TEXT NOT NULL,
  fase            TEXT DEFAULT 'cutting',
  peso_kg         NUMERIC(5,2),
  bf_percent      NUMERIC(4,1),
  score_geral     NUMERIC(3,1),
  score_separacao NUMERIC(3,1),
  score_textura   NUMERIC(3,1),
  score_dureza    NUMERIC(3,1),
  score_proporcao NUMERIC(3,1),
  analise_ia      JSONB,
  delta_score     NUMERIC(4,1),
  delta_analise   TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_apex_checkins_atleta
  ON public.apex_checkins(atleta_id, semana DESC);

ALTER TABLE public.apex_checkins ENABLE ROW LEVEL SECURITY;

-- Admin (via user_roles) gerencia tudo
CREATE POLICY "Admin manages apex_checkins"
  ON public.apex_checkins FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Atleta lê os próprios check-ins
CREATE POLICY "Atleta reads own apex_checkins"
  ON public.apex_checkins FOR SELECT
  TO authenticated
  USING (
    atleta_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );

-- Bucket privado
INSERT INTO storage.buckets (id, name, public)
VALUES ('apex-checkins', 'apex-checkins', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Admin all apex-checkins storage"
  ON storage.objects FOR ALL
  TO authenticated
  USING (bucket_id = 'apex-checkins' AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'apex-checkins' AND public.has_role(auth.uid(), 'admin'));