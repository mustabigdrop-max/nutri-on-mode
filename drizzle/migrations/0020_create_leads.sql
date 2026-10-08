CREATE TABLE public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL CHECK (char_length(nome) BETWEEN 1 AND 100),
  arroba text NOT NULL CHECK (char_length(arroba) BETWEEN 1 AND 60),
  rede text NOT NULL CHECK (char_length(rede) <= 30),
  nicho text NOT NULL CHECK (char_length(nicho) <= 120),
  seguidores integer NOT NULL CHECK (seguidores >= 0),
  desafio text NOT NULL CHECK (char_length(desafio) <= 600),
  nota numeric CHECK (nota >= 0 AND nota <= 10),
  pilares jsonb,
  aceite_dados boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'novo' CHECK (status IN ('novo','chamado','fechado')),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.leads TO authenticated;
GRANT ALL ON public.leads TO service_role;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin reads leads" ON public.leads FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin updates leads" ON public.leads FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE INDEX leads_created_idx ON public.leads (created_at DESC);