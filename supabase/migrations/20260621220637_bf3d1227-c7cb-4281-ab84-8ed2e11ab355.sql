BEGIN;

-- 1. Colunas novas
ALTER TABLE public.training_protocols
  ADD COLUMN IF NOT EXISTS format_version text NOT NULL DEFAULT 'legacy',
  ADD COLUMN IF NOT EXISTS protocol_json jsonb,
  ADD COLUMN IF NOT EXISTS migration_source_id uuid
    REFERENCES public.training_protocols(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS is_legacy_replaced boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS migrated_at timestamptz;

-- 2. Constraint
ALTER TABLE public.training_protocols
  DROP CONSTRAINT IF EXISTS training_protocols_format_version_check;
ALTER TABLE public.training_protocols
  ADD CONSTRAINT training_protocols_format_version_check
  CHECK (format_version IN ('legacy', 'mello_v1'));

-- 3. Indexes
CREATE INDEX IF NOT EXISTS idx_training_protocols_format_version
  ON public.training_protocols(user_id, format_version, is_legacy_replaced);
CREATE INDEX IF NOT EXISTS idx_training_protocols_migration_source
  ON public.training_protocols(migration_source_id)
  WHERE migration_source_id IS NOT NULL;

-- 4. View de stats
DROP VIEW IF EXISTS public.trainingon_migration_stats;
CREATE VIEW public.trainingon_migration_stats
WITH (security_invoker = true) AS
SELECT
  user_id,
  COUNT(*) FILTER (WHERE format_version = 'legacy' AND NOT is_legacy_replaced)::int AS legacy_pending,
  COUNT(*) FILTER (WHERE format_version = 'mello_v1')::int AS mello_v1_count,
  COUNT(*) FILTER (WHERE is_legacy_replaced)::int AS legacy_replaced,
  COUNT(*)::int AS total_protocols,
  MAX(migrated_at) AS last_migrated_at
FROM public.training_protocols
GROUP BY user_id;

GRANT SELECT ON public.trainingon_migration_stats TO authenticated;

-- 5. Comentários
COMMENT ON COLUMN public.training_protocols.format_version IS
  'legacy = markdown antigo. mello_v1 = padrão Mello Atualização (JSON validado).';
COMMENT ON COLUMN public.training_protocols.protocol_json IS
  'Payload JSON estruturado para mello_v1 (validado contra MelloProtocolSchema).';
COMMENT ON COLUMN public.training_protocols.migration_source_id IS
  'Referência ao protocolo legado de origem quando este foi regenerado.';
COMMENT ON COLUMN public.training_protocols.is_legacy_replaced IS
  'TRUE = legado já substituído por mello_v1, oculto do feed principal.';
COMMENT ON COLUMN public.training_protocols.migrated_at IS
  'Timestamp da regeneração ou substituição.';

COMMIT;