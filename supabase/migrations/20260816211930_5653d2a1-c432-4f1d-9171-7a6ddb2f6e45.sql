CREATE TABLE public.client_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL UNIQUE,
  email TEXT NOT NULL,
  temp_password TEXT NOT NULL,
  password_changed BOOLEAN NOT NULL DEFAULT false,
  welcome_sent BOOLEAN NOT NULL DEFAULT false,
  welcome_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.client_credentials TO authenticated;
GRANT ALL ON public.client_credentials TO service_role;

ALTER TABLE public.client_credentials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coach reads own patients credentials"
ON public.client_credentials FOR SELECT TO authenticated
USING (public.is_coach_of_patient(auth.uid(), client_id) OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Coach inserts own patients credentials"
ON public.client_credentials FOR INSERT TO authenticated
WITH CHECK (public.is_coach_of_patient(auth.uid(), client_id) OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Coach updates own patients credentials"
ON public.client_credentials FOR UPDATE TO authenticated
USING (public.is_coach_of_patient(auth.uid(), client_id) OR public.has_role(auth.uid(), 'admin') OR auth.uid() = client_id)
WITH CHECK (public.is_coach_of_patient(auth.uid(), client_id) OR public.has_role(auth.uid(), 'admin') OR auth.uid() = client_id);

CREATE POLICY "Coach deletes own patients credentials"
ON public.client_credentials FOR DELETE TO authenticated
USING (public.is_coach_of_patient(auth.uid(), client_id) OR public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_client_credentials_updated_at
BEFORE UPDATE ON public.client_credentials
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.coach_profiles ADD COLUMN IF NOT EXISTS welcome_template TEXT;