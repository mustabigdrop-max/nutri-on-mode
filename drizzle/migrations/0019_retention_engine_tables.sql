CREATE TABLE public.retention_scripts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  tema text NOT NULL,
  objetivo text NOT NULL CHECK (objetivo IN ('alcance','autoridade','venda')),
  tom text NOT NULL CHECK (tom IN ('direto','bem-humorado','intenso')),
  rede text NOT NULL DEFAULT 'instagram',
  estrutura jsonb NOT NULL DEFAULT '{}'::jsonb,
  roteiro jsonb NOT NULL DEFAULT '{}'::jsonb,
  notas jsonb NOT NULL DEFAULT '{}'::jsonb,
  nota_geral numeric,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, DELETE ON public.retention_scripts TO authenticated;
GRANT ALL ON public.retention_scripts TO service_role;
ALTER TABLE public.retention_scripts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own scripts read" ON public.retention_scripts FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "own scripts delete" ON public.retention_scripts FOR DELETE TO authenticated USING (user_id = auth.uid());
CREATE INDEX retention_scripts_user_idx ON public.retention_scripts(user_id, created_at DESC);

CREATE TABLE public.creator_voice (
  user_id uuid PRIMARY KEY,
  expressoes_usa text[] NOT NULL DEFAULT '{}',
  expressoes_evita text[] NOT NULL DEFAULT '{}',
  nicho text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.creator_voice TO authenticated;
GRANT ALL ON public.creator_voice TO service_role;
ALTER TABLE public.creator_voice ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own voice all" ON public.creator_voice FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE TABLE public.retention_patterns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  tipo text NOT NULL CHECK (tipo IN ('gancho','loop','cta')),
  texto text NOT NULL,
  retencao_media numeric,
  amostras integer NOT NULL DEFAULT 0 CHECK (amostras >= 0),
  confirmado boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, tipo, texto)
);
GRANT SELECT, DELETE ON public.retention_patterns TO authenticated;
GRANT ALL ON public.retention_patterns TO service_role;
ALTER TABLE public.retention_patterns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own patterns read" ON public.retention_patterns FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "own patterns delete" ON public.retention_patterns FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE TABLE public.retention_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  script_id uuid NOT NULL REFERENCES public.retention_scripts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  curva_real jsonb NOT NULL DEFAULT '[]'::jsonb,
  pct_3s numeric CHECK (pct_3s BETWEEN 0 AND 100),
  tempo_medio numeric CHECK (tempo_medio >= 0),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.retention_results TO authenticated;
GRANT ALL ON public.retention_results TO service_role;
ALTER TABLE public.retention_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own results read" ON public.retention_results FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "own results insert" ON public.retention_results FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() AND EXISTS (SELECT 1 FROM public.retention_scripts s WHERE s.id = script_id AND s.user_id = auth.uid()));
CREATE POLICY "own results delete" ON public.retention_results FOR DELETE TO authenticated USING (user_id = auth.uid());

COMMENT ON TABLE public.reel_generations IS 'DEPRECATED: replaced by retention_scripts';