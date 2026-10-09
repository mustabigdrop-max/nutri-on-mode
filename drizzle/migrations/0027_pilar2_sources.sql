ALTER TABLE public.retention_scripts
  ADD COLUMN IF NOT EXISTS pilar int,
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS titulo text,
  ADD COLUMN IF NOT EXISTS status text,
  ADD COLUMN IF NOT EXISTS formula text,
  ADD COLUMN IF NOT EXISTS estrutura_nome text,
  ADD COLUMN IF NOT EXISTS figura text,
  ADD COLUMN IF NOT EXISTS risco text,
  ADD COLUMN IF NOT EXISTS ordem_lote int,
  ADD COLUMN IF NOT EXISTS fonte_status text CHECK (fonte_status IN ('verificada','parcial','sem_fonte_primaria')),
  ADD COLUMN IF NOT EXISTS fonte_conferida_em timestamptz,
  ADD COLUMN IF NOT EXISTS ajuste_obrigatorio text,
  ADD COLUMN IF NOT EXISTS ressalva_obrigatoria text,
  ADD COLUMN IF NOT EXISTS checklist jsonb;
CREATE UNIQUE INDEX IF NOT EXISTS retention_scripts_user_slug ON public.retention_scripts (user_id, slug);

CREATE TABLE public.script_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  script_id uuid NOT NULL REFERENCES public.retention_scripts(id) ON DELETE CASCADE,
  rotulo_card text, referencia text, link text,
  tipo text NOT NULL CHECK (tipo IN ('primaria','secundaria')),
  observacao text,
  ordem int NOT NULL DEFAULT 0
);
CREATE UNIQUE INDEX script_sources_uniq ON public.script_sources (script_id, ordem);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.script_sources TO authenticated;
GRANT ALL ON public.script_sources TO service_role;
ALTER TABLE public.script_sources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own sources" ON public.script_sources FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.script_templates (
  slug text PRIMARY KEY,
  pilar int NOT NULL,
  payload jsonb NOT NULL
);
GRANT SELECT ON public.script_templates TO authenticated;
GRANT ALL ON public.script_templates TO service_role;
ALTER TABLE public.script_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read templates" ON public.script_templates FOR SELECT TO authenticated USING (true);

CREATE OR REPLACE FUNCTION public.seed_pilar_templates(_pilar int) RETURNS int LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE t record; sid uuid; f jsonb; i int; n int := 0; uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  FOR t IN SELECT * FROM public.script_templates WHERE pilar = _pilar LOOP
    INSERT INTO public.retention_scripts (user_id, slug, tema, titulo, objetivo, tom, pilar, status, revisao, origem, formula, estrutura_nome, figura, risco,
      ordem_lote, fonte_status, ajuste_obrigatorio, ressalva_obrigatoria, checklist, roteiro)
    VALUES (uid, t.slug, t.payload->>'titulo', t.payload->>'titulo', 'autoridade', 'direto', t.pilar, 'rascunho', 'rascunho', 'pilar',
      t.payload->>'formula', t.payload->>'estrutura', t.payload->>'figura', t.payload->>'risco', (t.payload->>'ordem_lote')::int,
      t.payload->>'fonte_status', t.payload->>'ajuste_obrigatorio', t.payload->>'ressalva_obrigatoria', t.payload->'checklist',
      jsonb_build_object('blocos', (SELECT jsonb_agg(jsonb_build_object('id', o, 'tempo', b->>0, 'fala', b->>1, 'texto_tela', b->>2, 'corte', b->>3) ORDER BY o)
        FROM jsonb_array_elements(t.payload->'blocos') WITH ORDINALITY AS x(b, o))))
    ON CONFLICT (user_id, slug) DO UPDATE SET titulo = EXCLUDED.titulo, formula = EXCLUDED.formula, estrutura_nome = EXCLUDED.estrutura_nome,
      figura = EXCLUDED.figura, risco = EXCLUDED.risco, ordem_lote = EXCLUDED.ordem_lote, fonte_status = EXCLUDED.fonte_status,
      ajuste_obrigatorio = EXCLUDED.ajuste_obrigatorio, ressalva_obrigatoria = EXCLUDED.ressalva_obrigatoria, checklist = EXCLUDED.checklist, roteiro = EXCLUDED.roteiro
    RETURNING id INTO sid;
    i := 0;
    FOR f IN SELECT * FROM jsonb_array_elements(t.payload->'fontes') LOOP
      INSERT INTO public.script_sources (user_id, script_id, rotulo_card, referencia, link, tipo, observacao, ordem)
      VALUES (uid, sid, f->>'rotulo_card', f->>'referencia', f->>'link', f->>'tipo', f->>'observacao', i)
      ON CONFLICT (script_id, ordem) DO UPDATE SET rotulo_card = EXCLUDED.rotulo_card, referencia = EXCLUDED.referencia, link = EXCLUDED.link, tipo = EXCLUDED.tipo, observacao = EXCLUDED.observacao;
      i := i + 1;
    END LOOP;
    n := n + 1;
  END LOOP;
  RETURN n;
END $$;
REVOKE ALL ON FUNCTION public.seed_pilar_templates(int) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.seed_pilar_templates(int) TO authenticated;

CREATE OR REPLACE FUNCTION public.mark_fonte_conferida(_script_id uuid) RETURNS timestamptz LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.retention_scripts SET fonte_conferida_em = now() WHERE id = _script_id AND user_id = auth.uid() RETURNING fonte_conferida_em;
$$;
REVOKE ALL ON FUNCTION public.mark_fonte_conferida(uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.mark_fonte_conferida(uuid) TO authenticated;