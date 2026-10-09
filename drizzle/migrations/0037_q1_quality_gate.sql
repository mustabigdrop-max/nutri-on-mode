ALTER TABLE public.retention_scripts
  ADD COLUMN IF NOT EXISTS nota_final numeric,
  ADD COLUMN IF NOT EXISTS nota_c1 numeric,
  ADD COLUMN IF NOT EXISTS nota_c2 numeric,
  ADD COLUMN IF NOT EXISTS teto_verificador numeric,
  ADD COLUMN IF NOT EXISTS rodadas integer,
  ADD COLUMN IF NOT EXISTS angulo_usado text,
  ADD COLUMN IF NOT EXISTS pendencias jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS historico_revisoes jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS gravado_em timestamptz,
  ADD COLUMN IF NOT EXISTS gravado_mesmo_assim jsonb,
  ADD COLUMN IF NOT EXISTS observacao text;
ALTER TABLE public.retention_scripts DROP CONSTRAINT IF EXISTS retention_scripts_status_qualidade_check;
ALTER TABLE public.retention_scripts ADD CONSTRAINT retention_scripts_status_qualidade_check
  CHECK (status_qualidade IS NULL OR status_qualidade = ANY (ARRAY['elite','aprovado','rascunho','precisa_revisao']));
COMMENT ON COLUMN public.retention_scripts.nota_geral IS 'Mean of per-block notes; the quality gate uses nota_final.';
ALTER TABLE public.retention_results
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'lancado',
  ADD COLUMN IF NOT EXISTS postado_em timestamptz,
  ADD COLUMN IF NOT EXISTS duracao_seg numeric,
  ADD COLUMN IF NOT EXISTS views numeric,
  ADD COLUMN IF NOT EXISTS ret_media_pct numeric,
  ADD COLUMN IF NOT EXISTS shares numeric,
  ADD COLUMN IF NOT EXISTS novos_seguidores numeric;
ALTER TABLE public.retention_results ADD CONSTRAINT retention_results_status_check CHECK (status = ANY (ARRAY['aguardando','lancado']));
CREATE INDEX IF NOT EXISTS retention_scripts_user_status_idx ON public.retention_scripts (user_id, status_qualidade, created_at DESC);