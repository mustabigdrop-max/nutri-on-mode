
-- Feminine profiles table
CREATE TABLE IF NOT EXISTS public.feminine_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  fase_ciclo TEXT NOT NULL DEFAULT 'folicular',
  duracao_ciclo INTEGER NOT NULL DEFAULT 28,
  anticoncepcional TEXT NOT NULL DEFAULT 'nao',
  menopausa TEXT NOT NULL DEFAULT 'nao',
  tpm_severa BOOLEAN NOT NULL DEFAULT false,
  triada_suspeita BOOLEAN NOT NULL DEFAULT false,
  ultima_menstruacao DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.feminine_profiles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'feminine_profiles' AND policyname = 'Users can manage own feminine profile') THEN
    CREATE POLICY "Users can manage own feminine profile"
      ON public.feminine_profiles FOR ALL
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Cache table
CREATE TABLE IF NOT EXISTS public.feminino_perplexity_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  cache_key TEXT NOT NULL,
  conhecimento TEXT NOT NULL,
  fontes JSONB DEFAULT '[]',
  gerado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  expira_em TIMESTAMPTZ NOT NULL,
  UNIQUE (user_id, cache_key)
);

CREATE INDEX IF NOT EXISTS idx_fem_cache_user ON public.feminino_perplexity_cache(user_id);
CREATE INDEX IF NOT EXISTS idx_fem_cache_exp ON public.feminino_perplexity_cache(expira_em);

ALTER TABLE public.feminino_perplexity_cache ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'feminino_perplexity_cache' AND policyname = 'Users can manage own fem cache') THEN
    CREATE POLICY "Users can manage own fem cache"
      ON public.feminino_perplexity_cache FOR ALL
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;
