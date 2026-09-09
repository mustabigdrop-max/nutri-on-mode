CREATE TABLE public.social_temas_postados (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  categoria TEXT NOT NULL,
  titulo TEXT NOT NULL,
  formato TEXT,
  postado_em DATE NOT NULL DEFAULT CURRENT_DATE,
  engajamento INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, titulo, postado_em)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.social_temas_postados TO authenticated;
GRANT ALL ON public.social_temas_postados TO service_role;

ALTER TABLE public.social_temas_postados ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own posted themes"
ON public.social_temas_postados FOR ALL TO authenticated
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_social_temas_postados_user_data ON public.social_temas_postados (user_id, postado_em DESC);