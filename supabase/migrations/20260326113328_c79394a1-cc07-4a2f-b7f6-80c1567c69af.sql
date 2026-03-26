
CREATE TABLE public.microbioma_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  sintomas text[] NOT NULL DEFAULT '{}',
  score integer NOT NULL DEFAULT 0,
  classificacao text NOT NULL DEFAULT '',
  meta_fibras_g integer,
  analise_ia text,
  perfil_snapshot jsonb,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.microbioma_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own microbioma logs"
  ON public.microbioma_logs FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
