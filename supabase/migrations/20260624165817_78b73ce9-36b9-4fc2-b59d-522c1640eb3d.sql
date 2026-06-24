DROP VIEW IF EXISTS public.training_migration_stats;
DROP VIEW IF EXISTS public.trainingon_migration_stats;

ALTER TABLE public.training_protocols
  DROP CONSTRAINT IF EXISTS training_protocols_format_version_check;
ALTER TABLE public.training_protocols
  DROP CONSTRAINT IF EXISTS trainingon_protocols_format_version_check;

DROP INDEX IF EXISTS public.idx_training_protocols_format_version;
DROP INDEX IF EXISTS public.idx_training_protocols_migration_source;
DROP INDEX IF EXISTS public.idx_trainingon_protocols_format_version;
DROP INDEX IF EXISTS public.idx_trainingon_protocols_migration_source;

ALTER TABLE public.training_protocols
  DROP COLUMN IF EXISTS migrated_at,
  DROP COLUMN IF EXISTS is_legacy_replaced,
  DROP COLUMN IF EXISTS migration_source_id,
  DROP COLUMN IF EXISTS protocol_json,
  DROP COLUMN IF EXISTS format_version;