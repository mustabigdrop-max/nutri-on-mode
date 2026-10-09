ALTER TABLE public.retention_scripts
  ADD COLUMN IF NOT EXISTS exemplo_ouro boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS angulo jsonb,
  ADD COLUMN IF NOT EXISTS motivos_nota jsonb,
  ADD COLUMN IF NOT EXISTS status_qualidade text CHECK (status_qualidade IN ('aprovado','precisa_revisao')),
  ADD COLUMN IF NOT EXISTS tipo_afirmacao text;
UPDATE public.retention_scripts SET exemplo_ouro = true WHERE slug IN ('p1-03-intencao-acao','p1-05-vinte-e-um-dias','p1-04-se-entao','p2-04-abdominal-barriga','p2-09-janela-anabolica','p2-06-proteina-rim','p2-02-refeicoes-3-3','p2-10-suco-detox');
ALTER TABLE public.engine_prompts DROP CONSTRAINT IF EXISTS engine_prompts_chave_check;
ALTER TABLE public.engine_prompts ADD CONSTRAINT engine_prompts_chave_check CHECK (chave IN ('bloco_0','arquiteto','redator','critico','calibracao','atlas','retorica','angulo','proibidas'));