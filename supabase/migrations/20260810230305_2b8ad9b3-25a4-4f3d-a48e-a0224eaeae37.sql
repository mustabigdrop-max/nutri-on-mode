CREATE TABLE public.mce_diagnostics (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pillar text NOT NULL CHECK (pillar IN ('M','C','E')),
  answers integer[] NOT NULL DEFAULT '{5,5,5}',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, pillar)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.mce_diagnostics TO authenticated;
GRANT ALL ON public.mce_diagnostics TO service_role;

ALTER TABLE public.mce_diagnostics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own mce diagnostics"
  ON public.mce_diagnostics FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER trg_mce_diagnostics_updated_at
  BEFORE UPDATE ON public.mce_diagnostics
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();