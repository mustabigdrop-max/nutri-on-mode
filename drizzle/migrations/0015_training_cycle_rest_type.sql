ALTER TABLE public.training_cycle_configs
  ADD COLUMN IF NOT EXISTS rest_type text NOT NULL DEFAULT 'total' CHECK (rest_type IN ('total','recuperacao_ativa','sessao_leve')),
  ADD COLUMN IF NOT EXISTS priority_group text;