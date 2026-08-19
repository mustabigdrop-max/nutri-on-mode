ALTER TABLE public.partner_gyms
  ADD COLUMN IF NOT EXISTS next_followup_at timestamptz,
  ADD COLUMN IF NOT EXISTS followup_paused boolean NOT NULL DEFAULT false;