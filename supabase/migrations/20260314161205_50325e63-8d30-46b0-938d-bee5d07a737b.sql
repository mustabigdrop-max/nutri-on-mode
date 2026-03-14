
CREATE TABLE public.sport_perplexity_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  cache_key TEXT NOT NULL,
  conhecimento TEXT NOT NULL,
  fontes JSONB DEFAULT '[]',
  gerado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expira_em TIMESTAMPTZ NOT NULL,
  UNIQUE (user_id, cache_key)
);

CREATE INDEX idx_sport_cache_user ON public.sport_perplexity_cache(user_id);
CREATE INDEX idx_sport_cache_key ON public.sport_perplexity_cache(user_id, cache_key);

ALTER TABLE public.sport_perplexity_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_full_access_sport_cache" ON public.sport_perplexity_cache
  FOR ALL USING (true) WITH CHECK (true);
