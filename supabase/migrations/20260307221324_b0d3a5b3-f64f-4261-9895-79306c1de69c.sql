
-- Add new profile columns for multi-objective onboarding
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS objetivo_principal text,
  ADD COLUMN IF NOT EXISTS perfil_comportamental text,
  ADD COLUMN IF NOT EXISTS meta_peso numeric,
  ADD COLUMN IF NOT EXISTS nivel_treino text,
  ADD COLUMN IF NOT EXISTS orcamento_semanal numeric,
  ADD COLUMN IF NOT EXISTS prefere_refeicoes text;

-- Create predictive alerts table
CREATE TABLE IF NOT EXISTS public.alertas_preditivos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  tipo_alerta text NOT NULL,
  mensagem text NOT NULL,
  enviado_em timestamp with time zone NOT NULL DEFAULT now(),
  lido boolean NOT NULL DEFAULT false
);

ALTER TABLE public.alertas_preditivos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own alerts"
  ON public.alertas_preditivos
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
