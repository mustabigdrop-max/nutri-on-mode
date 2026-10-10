ALTER TABLE public.retention_scripts ADD COLUMN IF NOT EXISTS fontes_usadas jsonb;
ALTER TABLE public.retention_scripts ADD COLUMN IF NOT EXISTS falta_fonte jsonb;
ALTER TABLE public.retention_scripts ADD COLUMN IF NOT EXISTS revalidado_em timestamptz;