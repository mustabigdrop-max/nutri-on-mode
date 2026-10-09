CREATE TABLE public.engine_prompts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  chave text NOT NULL CHECK (chave IN ('bloco_0','arquiteto','redator','critico','calibracao','atlas','retorica')),
  conteudo text NOT NULL DEFAULT '',
  padrao text NOT NULL DEFAULT '',
  versao int NOT NULL DEFAULT 1,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, chave)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.engine_prompts TO authenticated;
GRANT ALL ON public.engine_prompts TO service_role;
ALTER TABLE public.engine_prompts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own engine prompts" ON public.engine_prompts FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.engine_prompt_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id uuid NOT NULL REFERENCES public.engine_prompts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  conteudo text NOT NULL,
  versao int NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX engine_prompt_versions_prompt ON public.engine_prompt_versions (prompt_id, created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.engine_prompt_versions TO authenticated;
GRANT ALL ON public.engine_prompt_versions TO service_role;
ALTER TABLE public.engine_prompt_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own engine prompt versions" ON public.engine_prompt_versions FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);