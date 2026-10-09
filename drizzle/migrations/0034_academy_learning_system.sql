ALTER TABLE public.academy_progress ADD COLUMN IF NOT EXISTS etapa_atual int NOT NULL DEFAULT 0;
ALTER TABLE public.academy_progress ADD COLUMN IF NOT EXISTS pratica_scores jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.academy_progress ADD COLUMN IF NOT EXISTS dominada boolean NOT NULL DEFAULT false;
ALTER TABLE public.academy_progress ADD COLUMN IF NOT EXISTS ultimo_acesso timestamptz;
ALTER TABLE public.retention_scripts ADD COLUMN IF NOT EXISTS tecnicas jsonb;

CREATE TABLE IF NOT EXISTS public.academy_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  lesson_slug text NOT NULL,
  due_at timestamptz NOT NULL,
  intervalo_dias int NOT NULL CHECK (intervalo_dias IN (1,3,7,21)),
  feita boolean NOT NULL DEFAULT false,
  acerto boolean,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, lesson_slug, intervalo_dias)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.academy_reviews TO authenticated;
GRANT ALL ON public.academy_reviews TO service_role;
ALTER TABLE public.academy_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own reviews" ON public.academy_reviews FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.error_notebook (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  origem text NOT NULL CHECK (origem IN ('reel','lab_gancho','lab_fala','treino')),
  origem_id text,
  frase text NOT NULL,
  regra text NOT NULL,
  correcao_sugerida text,
  lesson_slug text,
  status text NOT NULL DEFAULT 'aberto' CHECK (status IN ('aberto','superado')),
  acertos_seguidos int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS error_notebook_dedup ON public.error_notebook (user_id, origem, coalesce(origem_id,''), md5(frase), regra);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.error_notebook TO authenticated;
GRANT ALL ON public.error_notebook TO service_role;
ALTER TABLE public.error_notebook ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own errors" ON public.error_notebook FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.academy_diagnostic (
  user_id uuid PRIMARY KEY,
  respostas jsonb NOT NULL DEFAULT '[]'::jsonb,
  trilha_recomendada text,
  plano jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.academy_diagnostic TO authenticated;
GRANT ALL ON public.academy_diagnostic TO service_role;
ALTER TABLE public.academy_diagnostic ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own diagnostic" ON public.academy_diagnostic FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);