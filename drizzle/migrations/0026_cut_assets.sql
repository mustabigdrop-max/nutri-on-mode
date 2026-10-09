CREATE TABLE public.cut_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  script_id uuid NOT NULL,
  bloco text NOT NULL,
  tempo text,
  tipo text NOT NULL CHECK (tipo IN ('dado','texto','ilustracao','diagrama')),
  descricao text,
  texto_tela text,
  url text,
  status text NOT NULL DEFAULT 'novo' CHECK (status IN ('novo','aprovado','descartado')),
  regeneracoes int NOT NULL DEFAULT 0,
  modelo text,
  custo numeric,
  prompt_hash text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON public.cut_assets (user_id, script_id);
CREATE INDEX ON public.cut_assets (user_id, tipo, created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cut_assets TO authenticated;
GRANT ALL ON public.cut_assets TO service_role;
ALTER TABLE public.cut_assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own cuts select" ON public.cut_assets FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own cuts insert code" ON public.cut_assets FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND tipo <> 'ilustracao');
CREATE POLICY "own cuts update" ON public.cut_assets FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own cuts delete" ON public.cut_assets FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.protect_cut_asset_fields() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF current_user = 'authenticated' AND OLD.tipo = 'ilustracao' THEN
    NEW.url := OLD.url; NEW.modelo := OLD.modelo; NEW.custo := OLD.custo; NEW.prompt_hash := OLD.prompt_hash; NEW.regeneracoes := OLD.regeneracoes; NEW.tipo := OLD.tipo;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER protect_cut_asset_fields BEFORE UPDATE ON public.cut_assets FOR EACH ROW EXECUTE FUNCTION public.protect_cut_asset_fields();

CREATE TABLE public.cut_settings (
  user_id uuid PRIMARY KEY,
  limite_diario_ilustracao int NOT NULL DEFAULT 30 CHECK (limite_diario_ilustracao BETWEEN 0 AND 200),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.cut_settings TO authenticated;
GRANT ALL ON public.cut_settings TO service_role;
ALTER TABLE public.cut_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own cut settings" ON public.cut_settings FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.cut_image_cache (
  user_id uuid NOT NULL,
  prompt_hash text NOT NULL,
  path text NOT NULL,
  modelo text,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, prompt_hash)
);
GRANT ALL ON public.cut_image_cache TO service_role;
ALTER TABLE public.cut_image_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cuts read own" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'cuts' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "cuts write own" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'cuts' AND (storage.foldername(name))[1] = auth.uid()::text AND (storage.foldername(name))[2] <> 'ilustracao');
CREATE POLICY "cuts update own" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'cuts' AND (storage.foldername(name))[1] = auth.uid()::text AND (storage.foldername(name))[2] <> 'ilustracao');
CREATE POLICY "cuts delete own" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'cuts' AND (storage.foldername(name))[1] = auth.uid()::text);