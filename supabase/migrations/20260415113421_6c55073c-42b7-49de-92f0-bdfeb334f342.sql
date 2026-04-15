
CREATE TABLE public.nexus_compounds (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  nome_quimico TEXT,
  sinonimos TEXT[],
  familia_farmacologica TEXT,
  origem TEXT,
  classe TEXT NOT NULL DEFAULT 'outro',
  status_regulatorio TEXT DEFAULT 'experimental',
  mecanismo_acao TEXT,
  nivel_evidencia TEXT DEFAULT 'D',
  estudos_chave JSONB DEFAULT '[]'::jsonb,
  lacunas_evidencia TEXT,
  aplicacoes_clinicas TEXT,
  aplicacoes_offlabel TEXT,
  uso_performance TEXT,
  protocolos JSONB DEFAULT '[]'::jsonb,
  sinergias JSONB DEFAULT '[]'::jsonb,
  perfil_seguranca JSONB DEFAULT '{}'::jsonb,
  status_regulatorio_paises JSONB DEFAULT '{}'::jsonb,
  take_nexus TEXT,
  editorial_estudo_semana TEXT,
  briefing_rapido TEXT,
  analise_offlabel TEXT,
  mapa_sinergias TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.nexus_compounds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read compounds"
  ON public.nexus_compounds FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can insert compounds"
  ON public.nexus_compounds FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update compounds"
  ON public.nexus_compounds FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete compounds"
  ON public.nexus_compounds FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_nexus_compounds_nome ON public.nexus_compounds (nome);
CREATE INDEX idx_nexus_compounds_classe ON public.nexus_compounds (classe);

CREATE TRIGGER update_nexus_compounds_updated_at
  BEFORE UPDATE ON public.nexus_compounds
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
