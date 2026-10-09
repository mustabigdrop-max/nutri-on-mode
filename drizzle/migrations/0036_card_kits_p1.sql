CREATE TABLE public.card_topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  slug text NOT NULL,
  titulo text NOT NULL,
  aliases jsonb NOT NULL DEFAULT '[]'::jsonb,
  aviso_tema text,
  subtemas jsonb NOT NULL DEFAULT '[]'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, slug)
);
CREATE TABLE public.card_kits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  topic_slug text NOT NULL,
  subtema_slug text NOT NULL,
  pacote text NOT NULL CHECK (pacote IN ('reel','carrossel')),
  variante_imagem text NOT NULL DEFAULT 'sem' CHECK (variante_imagem IN ('sem','ilustracao','foto','gerada')),
  cards jsonb NOT NULL DEFAULT '[]'::jsonb,
  verificacao jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.user_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  url text NOT NULL,
  rotulo text NOT NULL DEFAULT 'ambiente',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.card_topics, public.card_kits, public.user_photos TO authenticated;
GRANT ALL ON public.card_topics, public.card_kits, public.user_photos TO service_role;
ALTER TABLE public.card_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.card_kits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own card_topics" ON public.card_topics FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own card_kits" ON public.card_kits FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own user_photos" ON public.user_photos FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

ALTER TABLE public.studio_cards
  ADD COLUMN IF NOT EXISTS kit_id uuid,
  ADD COLUMN IF NOT EXISTS topic_slug text,
  ADD COLUMN IF NOT EXISTS subtema_slug text,
  ADD COLUMN IF NOT EXISTS pacote text,
  ADD COLUMN IF NOT EXISTS selo text,
  ADD COLUMN IF NOT EXISTS prova_ref jsonb,
  ADD COLUMN IF NOT EXISTS dica text,
  ADD COLUMN IF NOT EXISTS alt_texto text,
  ADD COLUMN IF NOT EXISTS variante_imagem text,
  ADD COLUMN IF NOT EXISTS verif_status text;