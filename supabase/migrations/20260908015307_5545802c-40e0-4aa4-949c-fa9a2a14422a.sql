ALTER TABLE public.mce_leads
  ADD COLUMN IF NOT EXISTS replied boolean,
  ADD COLUMN IF NOT EXISTS scheduled_call_at timestamptz;