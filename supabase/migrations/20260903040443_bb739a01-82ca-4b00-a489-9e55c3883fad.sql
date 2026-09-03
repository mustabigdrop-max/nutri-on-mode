CREATE TABLE public.mce_funnel_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  step text NOT NULL,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  device text,
  referrer text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.mce_funnel_events TO anon, authenticated;
GRANT SELECT ON public.mce_funnel_events TO authenticated;
GRANT ALL ON public.mce_funnel_events TO service_role;
ALTER TABLE public.mce_funnel_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can log funnel events" ON public.mce_funnel_events FOR INSERT TO anon, authenticated WITH CHECK (step IN ('view','quiz_start','quiz_complete','lead_submitted'));
CREATE POLICY "coaches read funnel events" ON public.mce_funnel_events FOR SELECT TO authenticated USING (public.is_coach_user(auth.uid()));
CREATE INDEX idx_funnel_events_created ON public.mce_funnel_events (created_at DESC);

CREATE TABLE public.mce_clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id uuid NOT NULL,
  lead_id uuid REFERENCES public.mce_leads(id) ON DELETE SET NULL,
  name text NOT NULL,
  whatsapp text,
  goal text,
  plan text,
  monthly_value numeric,
  status text NOT NULL DEFAULT 'ativo',
  started_at date NOT NULL DEFAULT current_date,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mce_clients TO authenticated;
GRANT ALL ON public.mce_clients TO service_role;
ALTER TABLE public.mce_clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "coach manages own clients" ON public.mce_clients FOR ALL TO authenticated
  USING (coach_id = auth.uid() OR public.has_role(auth.uid(),'admin'::app_role))
  WITH CHECK (coach_id = auth.uid() OR public.has_role(auth.uid(),'admin'::app_role));
CREATE TRIGGER trg_mce_clients_updated_at BEFORE UPDATE ON public.mce_clients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.mce_client_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.mce_clients(id) ON DELETE CASCADE,
  coach_id uuid NOT NULL,
  type text NOT NULL DEFAULT 'prescricao',
  title text NOT NULL,
  content text,
  record_date date NOT NULL DEFAULT current_date,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mce_client_records TO authenticated;
GRANT ALL ON public.mce_client_records TO service_role;
ALTER TABLE public.mce_client_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "coach manages own client records" ON public.mce_client_records FOR ALL TO authenticated
  USING (coach_id = auth.uid() OR public.has_role(auth.uid(),'admin'::app_role))
  WITH CHECK (coach_id = auth.uid() OR public.has_role(auth.uid(),'admin'::app_role));
CREATE INDEX idx_client_records_client ON public.mce_client_records (client_id, record_date DESC);

ALTER TABLE public.mce_leads
  ADD COLUMN IF NOT EXISTS last_followup_at timestamptz,
  ADD COLUMN IF NOT EXISTS followup_count integer NOT NULL DEFAULT 0;