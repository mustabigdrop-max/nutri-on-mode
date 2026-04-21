-- Tabela de envios de protocolo do coach para alunos/parceiros
CREATE TABLE IF NOT EXISTS public.protocolo_envios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID NOT NULL,
  destinatario_id UUID NOT NULL,
  tipo_destinatario TEXT NOT NULL CHECK (tipo_destinatario IN ('aluno', 'parceiro')),
  tipo_conteudo TEXT[] NOT NULL DEFAULT '{}',
  conteudo_ids JSONB DEFAULT '{}'::jsonb,
  observacao TEXT,
  status TEXT NOT NULL DEFAULT 'enviado',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_protocolo_envios_coach ON public.protocolo_envios(coach_id);
CREATE INDEX IF NOT EXISTS idx_protocolo_envios_destinatario ON public.protocolo_envios(destinatario_id);

ALTER TABLE public.protocolo_envios ENABLE ROW LEVEL SECURITY;

-- Coach pode ver/criar envios feitos por ele (coach_id = perfil do coach do usuário logado)
CREATE POLICY "Coach can view own sends"
ON public.protocolo_envios FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.coach_profiles cp
    WHERE cp.id = protocolo_envios.coach_id AND cp.user_id = auth.uid()
  )
);

CREATE POLICY "Coach can insert sends"
ON public.protocolo_envios FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.coach_profiles cp
    WHERE cp.id = protocolo_envios.coach_id AND cp.user_id = auth.uid()
  )
);

-- Destinatário (aluno) pode ver o que recebeu
CREATE POLICY "Recipient can view received sends"
ON public.protocolo_envios FOR SELECT
TO authenticated
USING (destinatario_id = auth.uid());