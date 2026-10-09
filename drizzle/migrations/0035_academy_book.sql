CREATE TABLE public.academy_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  ordem int NOT NULL DEFAULT 0,
  titulo text NOT NULL,
  subtitulo text,
  descricao text,
  status text NOT NULL DEFAULT 'em_breve' CHECK (status IN ('publicado','em_breve')),
  capitulos_planejados jsonb NOT NULL DEFAULT '[]'::jsonb,
  projeto jsonb
);
GRANT SELECT ON public.academy_modules TO authenticated;
GRANT ALL ON public.academy_modules TO service_role;
ALTER TABLE public.academy_modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "modules readable" ON public.academy_modules FOR SELECT TO authenticated USING (true);

CREATE TABLE public.academy_chapters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  modulo_slug text NOT NULL,
  ordem int NOT NULL DEFAULT 0,
  titulo text NOT NULL,
  pergunta_guia text,
  tempo_leitura_min int,
  nivel_fonte text NOT NULL CHECK (nivel_fonte IN ('verificada','tradicao','tecnica_de_producao')),
  blocos jsonb NOT NULL DEFAULT '[]'::jsonb,
  glossario jsonb NOT NULL DEFAULT '[]'::jsonb,
  quiz jsonb NOT NULL DEFAULT '[]'::jsonb,
  flashcards jsonb NOT NULL DEFAULT '[]'::jsonb,
  aplique jsonb,
  fontes jsonb NOT NULL DEFAULT '[]'::jsonb,
  relacionadas jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'publicado'
);
GRANT SELECT ON public.academy_chapters TO authenticated;
GRANT ALL ON public.academy_chapters TO service_role;
ALTER TABLE public.academy_chapters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "chapters readable" ON public.academy_chapters FOR SELECT TO authenticated USING (true);

CREATE TABLE public.chapter_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  chapter_slug text NOT NULL,
  progresso_pct int NOT NULL DEFAULT 0,
  bloco_atual int NOT NULL DEFAULT 0,
  tempo_lendo_seg int NOT NULL DEFAULT 0,
  recall_texto text,
  recall_feito boolean NOT NULL DEFAULT false,
  quiz_score int,
  aplique_feito boolean NOT NULL DEFAULT false,
  concluido boolean NOT NULL DEFAULT false,
  concluido_em timestamptz,
  dominado boolean NOT NULL DEFAULT false,
  iniciado_em timestamptz NOT NULL DEFAULT now(),
  ultimo_acesso timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, chapter_slug)
);
CREATE TABLE public.chapter_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  chapter_slug text NOT NULL,
  bloco_idx int NOT NULL DEFAULT 0,
  tipo text NOT NULL CHECK (tipo IN ('nota','destaque','duvida')),
  trecho text,
  texto text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.flashcard_state (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  chapter_slug text NOT NULL,
  card_idx int NOT NULL,
  caixa int NOT NULL DEFAULT 1 CHECK (caixa BETWEEN 1 AND 5),
  due_at timestamptz NOT NULL DEFAULT now(),
  acertos int NOT NULL DEFAULT 0,
  erros int NOT NULL DEFAULT 0,
  ultimo_resultado text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, chapter_slug, card_idx)
);
CREATE TABLE public.module_exams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  modulo_slug text NOT NULL,
  tentativa int NOT NULL DEFAULT 1,
  nota int NOT NULL DEFAULT 0,
  itens jsonb NOT NULL DEFAULT '[]'::jsonb,
  antecipada boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.module_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  modulo_slug text NOT NULL,
  entrega jsonb NOT NULL DEFAULT '{}'::jsonb,
  autoavaliacao jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'rascunho' CHECK (status IN ('rascunho','entregue')),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, modulo_slug)
);
CREATE TABLE public.study_plan (
  user_id uuid PRIMARY KEY,
  novos_por_dia int NOT NULL DEFAULT 1 CHECK (novos_por_dia BETWEEN 1 AND 2),
  hora_estudo time,
  liberacoes jsonb NOT NULL DEFAULT '[]'::jsonb,
  dicas_vistas jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chapter_progress, public.chapter_notes, public.flashcard_state, public.module_exams, public.module_projects, public.study_plan TO authenticated;
GRANT ALL ON public.chapter_progress, public.chapter_notes, public.flashcard_state, public.module_exams, public.module_projects, public.study_plan TO service_role;
ALTER TABLE public.chapter_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapter_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcard_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module_exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_plan ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own chapter_progress" ON public.chapter_progress FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own chapter_notes" ON public.chapter_notes FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own flashcard_state" ON public.flashcard_state FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own module_exams" ON public.module_exams FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own module_projects" ON public.module_projects FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own study_plan" ON public.study_plan FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);