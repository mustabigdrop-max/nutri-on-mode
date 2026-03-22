
-- Lab conversations (APEX chat history)
CREATE TABLE IF NOT EXISTS public.lab_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  pergunta TEXT NOT NULL,
  resposta TEXT,
  fontes JSONB DEFAULT '[]'::jsonb,
  perplexity_usado BOOLEAN DEFAULT false,
  intent_type TEXT DEFAULT 'scientific',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.lab_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own lab conversations"
ON public.lab_conversations FOR ALL TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Lab saved items (notebook)
CREATE TABLE IF NOT EXISTS public.lab_saved_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'resposta',
  titulo TEXT,
  conteudo JSONB DEFAULT '{}'::jsonb,
  tags TEXT[] DEFAULT '{}'::text[],
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.lab_saved_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own lab saved items"
ON public.lab_saved_items FOR ALL TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Lab protocols (curated content)
CREATE TABLE IF NOT EXISTS public.lab_protocols (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  categoria TEXT NOT NULL,
  titulo TEXT NOT NULL,
  nivel TEXT DEFAULT 'intermediario',
  tempo_leitura INTEGER DEFAULT 5,
  conteudo JSONB DEFAULT '{}'::jsonb,
  fontes JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.lab_protocols ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read lab protocols"
ON public.lab_protocols FOR SELECT TO authenticated
USING (true);

-- Lab subscriptions
CREATE TABLE IF NOT EXISTS public.lab_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  status TEXT DEFAULT 'active',
  kiwify_order_id TEXT,
  activated_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.lab_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own lab subscriptions"
ON public.lab_subscriptions FOR ALL TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
