CREATE TABLE public.partner_gyms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_user_id UUID NOT NULL,
  coach_profile_id UUID,
  name TEXT NOT NULL,
  city TEXT,
  contact_name TEXT,
  contact_phone TEXT,
  notes TEXT,
  challenge_slug TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.partner_gyms TO authenticated;
GRANT ALL ON public.partner_gyms TO service_role;

ALTER TABLE public.partner_gyms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coaches manage their own partner gyms"
ON public.partner_gyms FOR ALL TO authenticated
USING (auth.uid() = coach_user_id OR public.has_role(auth.uid(), 'admin'))
WITH CHECK (auth.uid() = coach_user_id OR public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_partner_gyms_updated_at
BEFORE UPDATE ON public.partner_gyms
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_partner_gyms_coach ON public.partner_gyms(coach_user_id);