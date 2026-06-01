
CREATE TABLE IF NOT EXISTS public.meridian_telemetry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  plan_id UUID,
  event_type TEXT NOT NULL,
  event_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.meridian_telemetry TO authenticated;
GRANT ALL ON public.meridian_telemetry TO service_role;

ALTER TABLE public.meridian_telemetry ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users insert own telemetry"
  ON public.meridian_telemetry FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users read own telemetry"
  ON public.meridian_telemetry FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_meridian_telemetry_user_event
  ON public.meridian_telemetry (user_id, event_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_meridian_telemetry_plan
  ON public.meridian_telemetry (plan_id, created_at DESC);
