CREATE TABLE public.academy_lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  trilha text NOT NULL,
  ordem int NOT NULL DEFAULT 0,
  titulo text NOT NULL,
  fonte_nivel text NOT NULL CHECK (fonte_nivel IN ('verificada','classica','tecnica_de_producao')),
  conceito text NOT NULL DEFAULT '',
  no_reel text NOT NULL DEFAULT '',
  fraco text NOT NULL DEFAULT '',
  forte text NOT NULL DEFAULT '',
  exercicio text NOT NULL DEFAULT '',
  fontes jsonb NOT NULL DEFAULT '[]'::jsonb
);
GRANT SELECT ON public.academy_lessons TO authenticated;
GRANT ALL ON public.academy_lessons TO service_role;
ALTER TABLE public.academy_lessons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Aulas visíveis a usuários logados" ON public.academy_lessons FOR SELECT TO authenticated USING (true);

CREATE TABLE public.academy_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  lesson_slug text NOT NULL,
  concluida boolean NOT NULL DEFAULT false,
  quiz_acertos int NOT NULL DEFAULT 0,
  resposta_exercicio text,
  concluida_em timestamptz,
  UNIQUE (user_id, lesson_slug)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.academy_progress TO authenticated;
GRANT ALL ON public.academy_progress TO service_role;
ALTER TABLE public.academy_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Progresso próprio" ON public.academy_progress FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.lab_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  tipo text NOT NULL CHECK (tipo IN ('gancho','figuras','fala')),
  entrada text NOT NULL DEFAULT '',
  resultado jsonb NOT NULL DEFAULT '{}'::jsonb,
  nota int NOT NULL DEFAULT 0 CHECK (nota BETWEEN 0 AND 100),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX lab_attempts_user_idx ON public.lab_attempts (user_id, tipo, created_at DESC);
GRANT SELECT, INSERT, DELETE ON public.lab_attempts TO authenticated;
GRANT ALL ON public.lab_attempts TO service_role;
ALTER TABLE public.lab_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tentativas próprias" ON public.lab_attempts FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.transcripts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  texto text NOT NULL,
  duracao_seg int,
  origem text NOT NULL DEFAULT 'colada' CHECK (origem IN ('colada','ditado')),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.transcripts TO authenticated;
GRANT ALL ON public.transcripts TO service_role;
ALTER TABLE public.transcripts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Transcrições próprias" ON public.transcripts FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);