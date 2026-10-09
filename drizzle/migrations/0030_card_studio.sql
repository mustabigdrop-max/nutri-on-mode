CREATE TABLE public.studio_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  script_id uuid,
  bloco_ref int,
  tipo text NOT NULL CHECK (tipo IN ('A','B','D','C')),
  template text NOT NULL,
  formato text NOT NULL DEFAULT '9:16' CHECK (formato IN ('9:16','4:5','1:1')),
  conteudo jsonb NOT NULL DEFAULT '{}'::jsonb,
  ilustracao_origem text CHECK (ilustracao_origem IN ('codigo','gerada')),
  imagem_path text,
  nome text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON public.studio_cards (user_id, created_at DESC);
CREATE INDEX ON public.studio_cards (user_id, script_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.studio_cards TO authenticated;
GRANT ALL ON public.studio_cards TO service_role;
ALTER TABLE public.studio_cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own studio cards select" ON public.studio_cards FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own studio cards insert" ON public.studio_cards FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND imagem_path IS NULL AND (ilustracao_origem IS NULL OR ilustracao_origem = 'codigo'));
CREATE POLICY "own studio cards update" ON public.studio_cards FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own studio cards delete" ON public.studio_cards FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.protect_studio_card_image() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF current_user = 'authenticated' THEN
    IF NEW.imagem_path IS DISTINCT FROM OLD.imagem_path AND NEW.imagem_path IS NOT NULL THEN NEW.imagem_path := OLD.imagem_path; END IF;
    IF NEW.ilustracao_origem = 'gerada' AND NEW.imagem_path IS NULL THEN NEW.ilustracao_origem := 'codigo'; END IF;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER protect_studio_card_image BEFORE UPDATE ON public.studio_cards FOR EACH ROW EXECUTE FUNCTION public.protect_studio_card_image();

CREATE TABLE public.brand_kit (
  user_id uuid PRIMARY KEY,
  cor_primaria text NOT NULL DEFAULT '#00D4FF',
  cor_secundaria text NOT NULL DEFAULT '#B8922A',
  cor_fundo text NOT NULL DEFAULT '#020205',
  fonte_titulo text NOT NULL DEFAULT 'Rajdhani',
  handle text,
  logo_url text,
  margem_topo int NOT NULL DEFAULT 250 CHECK (margem_topo BETWEEN 0 AND 600),
  margem_base int NOT NULL DEFAULT 340 CHECK (margem_base BETWEEN 0 AND 700),
  limite_diario_gerada int NOT NULL DEFAULT 5 CHECK (limite_diario_gerada BETWEEN 0 AND 50),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.brand_kit TO authenticated;
GRANT ALL ON public.brand_kit TO service_role;
ALTER TABLE public.brand_kit ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own brand kit" ON public.brand_kit FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);