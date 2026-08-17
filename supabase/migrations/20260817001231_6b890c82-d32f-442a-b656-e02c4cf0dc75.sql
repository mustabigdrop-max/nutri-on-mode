CREATE TABLE public.challenge_signups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  email text NOT NULL,
  full_name text,
  source text NOT NULL DEFAULT 'qr',
  gym_slug text,
  gym_id uuid REFERENCES public.partner_gyms(id) ON DELETE SET NULL,
  paid boolean NOT NULL DEFAULT false,
  plano text,
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX challenge_signups_email_key ON public.challenge_signups (lower(email));

GRANT INSERT ON public.challenge_signups TO anon;
GRANT SELECT, INSERT, UPDATE ON public.challenge_signups TO authenticated;
GRANT ALL ON public.challenge_signups TO service_role;

ALTER TABLE public.challenge_signups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can register a challenge signup"
ON public.challenge_signups FOR INSERT TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Coaches and admins can view challenge signups"
ON public.challenge_signups FOR SELECT TO authenticated
USING (public.is_coach_user(auth.uid()) OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Coaches and admins can update challenge signups"
ON public.challenge_signups FOR UPDATE TO authenticated
USING (public.is_coach_user(auth.uid()) OR public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.is_coach_user(auth.uid()) OR public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_challenge_signups_updated_at
BEFORE UPDATE ON public.challenge_signups
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();