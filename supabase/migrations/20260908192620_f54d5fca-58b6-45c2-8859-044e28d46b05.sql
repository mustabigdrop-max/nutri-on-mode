CREATE TABLE public.nexus_como_obter (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  composto TEXT NOT NULL UNIQUE,
  origem TEXT NOT NULL DEFAULT 'PeptideVault',
  dados JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES auth.users,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.nexus_como_obter TO authenticated;
GRANT ALL ON public.nexus_como_obter TO service_role;

ALTER TABLE public.nexus_como_obter ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read nexus_como_obter"
ON public.nexus_como_obter FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated can insert nexus_como_obter"
ON public.nexus_como_obter FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated can update nexus_como_obter"
ON public.nexus_como_obter FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE TRIGGER update_nexus_como_obter_updated_at
BEFORE UPDATE ON public.nexus_como_obter
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();