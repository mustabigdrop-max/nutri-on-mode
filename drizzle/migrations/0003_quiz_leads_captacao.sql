CREATE TABLE public.quiz_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  whatsapp text NOT NULL,
  respostas jsonb NOT NULL DEFAULT '[]'::jsonb,
  resultado text NOT NULL,
  fonte text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.quiz_leads TO anon;
GRANT SELECT ON public.quiz_leads TO authenticated;
GRANT ALL ON public.quiz_leads TO service_role;

ALTER TABLE public.quiz_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Qualquer pessoa pode enviar o quiz"
ON public.quiz_leads FOR INSERT TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Coach e admin leem leads"
ON public.quiz_leads FOR SELECT TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
  OR EXISTS (
    SELECT 1 FROM public.coach_profiles cp
    WHERE cp.user_id = auth.uid()
  )
);

CREATE INDEX quiz_leads_created_idx ON public.quiz_leads (created_at DESC);