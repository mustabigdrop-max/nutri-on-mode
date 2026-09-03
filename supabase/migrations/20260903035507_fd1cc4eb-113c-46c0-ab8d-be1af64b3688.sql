CREATE TABLE public.mce_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  name TEXT NOT NULL,
  whatsapp TEXT,
  goal TEXT,
  score_mentalidade INTEGER NOT NULL DEFAULT 0,
  score_comportamento INTEGER NOT NULL DEFAULT 0,
  score_execucao INTEGER NOT NULL DEFAULT 0,
  score_total INTEGER NOT NULL DEFAULT 0,
  level TEXT NOT NULL DEFAULT 'Iniciante',
  answers JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'novo',
  notes TEXT,
  contacted_at TIMESTAMPTZ,
  converted_at TIMESTAMPTZ,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  device TEXT,
  referrer TEXT,
  coach_id UUID
);

CREATE INDEX idx_mce_leads_status ON public.mce_leads(status);
CREATE INDEX idx_mce_leads_created ON public.mce_leads(created_at DESC);
CREATE INDEX idx_mce_leads_coach ON public.mce_leads(coach_id);
CREATE INDEX idx_mce_leads_level ON public.mce_leads(level);

GRANT INSERT ON public.mce_leads TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mce_leads TO authenticated;
GRANT ALL ON public.mce_leads TO service_role;

ALTER TABLE public.mce_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Publico pode criar lead" ON public.mce_leads
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Autenticado pode criar lead" ON public.mce_leads
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Coach ve leads" ON public.mce_leads
  FOR SELECT TO authenticated
  USING (public.is_coach_user(auth.uid()) OR coach_id = auth.uid());

CREATE POLICY "Coach edita leads" ON public.mce_leads
  FOR UPDATE TO authenticated
  USING (public.is_coach_user(auth.uid()) OR coach_id = auth.uid())
  WITH CHECK (public.is_coach_user(auth.uid()) OR coach_id = auth.uid());

CREATE POLICY "Coach remove leads" ON public.mce_leads
  FOR DELETE TO authenticated
  USING (public.is_coach_user(auth.uid()) OR coach_id = auth.uid());

CREATE TRIGGER trg_mce_leads_updated_at
  BEFORE UPDATE ON public.mce_leads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.mce_lead_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.mce_leads(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  type TEXT NOT NULL,
  content TEXT,
  old_value TEXT,
  new_value TEXT,
  coach_id UUID
);

CREATE INDEX idx_lead_activities_lead ON public.mce_lead_activities(lead_id);

GRANT SELECT, INSERT, DELETE ON public.mce_lead_activities TO authenticated;
GRANT ALL ON public.mce_lead_activities TO service_role;

ALTER TABLE public.mce_lead_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coach ve atividades" ON public.mce_lead_activities
  FOR SELECT TO authenticated
  USING (public.is_coach_user(auth.uid()) OR coach_id = auth.uid());

CREATE POLICY "Coach cria atividades" ON public.mce_lead_activities
  FOR INSERT TO authenticated
  WITH CHECK (public.is_coach_user(auth.uid()) AND coach_id = auth.uid());