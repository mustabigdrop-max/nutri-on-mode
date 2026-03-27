
-- Partners table
CREATE TABLE public.partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text UNIQUE NOT NULL,
  plan text DEFAULT 'on_plus',
  status text DEFAULT 'active',
  modules text[] DEFAULT ARRAY['pca','protocolo_atleta','nutricao_sport','cardio_on'],
  commission_total numeric DEFAULT 0,
  referral_count int DEFAULT 0,
  internal_note text,
  created_by uuid,
  created_at timestamptz DEFAULT now()
);

-- Partner sessions
CREATE TABLE public.partner_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid REFERENCES public.partners(id) ON DELETE CASCADE,
  session_token text UNIQUE NOT NULL,
  ip_address text,
  device_info text,
  created_at timestamptz DEFAULT now(),
  last_active timestamptz DEFAULT now()
);

-- Session alerts
CREATE TABLE public.session_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid REFERENCES public.partners(id),
  partner_name text,
  sessions_count int,
  ips text[],
  action_taken text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- Commissions
CREATE TABLE public.commissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid REFERENCES public.partners(id),
  client_name text,
  plan_purchased text,
  amount numeric,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;

-- Admin can do everything (using existing has_role function)
CREATE POLICY "Admin full access partners" ON public.partners FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Partners read own data" ON public.partners FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admin full access partner_sessions" ON public.partner_sessions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Partners read own sessions" ON public.partner_sessions FOR SELECT TO authenticated
  USING (partner_id IN (SELECT id FROM public.partners WHERE user_id = auth.uid()));

CREATE POLICY "Admin full access session_alerts" ON public.session_alerts FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Partners read own alerts" ON public.session_alerts FOR SELECT TO authenticated
  USING (partner_id IN (SELECT id FROM public.partners WHERE user_id = auth.uid()));

CREATE POLICY "Admin full access commissions" ON public.commissions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Partners read own commissions" ON public.commissions FOR SELECT TO authenticated
  USING (partner_id IN (SELECT id FROM public.partners WHERE user_id = auth.uid()));
