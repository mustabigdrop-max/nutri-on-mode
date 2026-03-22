
CREATE TABLE IF NOT EXISTS public.conversion_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL,
  feature     TEXT NOT NULL,
  action      TEXT DEFAULT 'blocked_access',
  converted   BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.conversion_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own conversion events"
ON public.conversion_events
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own conversion events"
ON public.conversion_events
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Coaches can read patient conversion events"
ON public.conversion_events
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM coach_patients cp
    JOIN coach_profiles cpf ON cpf.id = cp.coach_id
    WHERE cpf.user_id = auth.uid()
    AND cp.patient_user_id = conversion_events.user_id
    AND cp.status = 'active'
  )
);
