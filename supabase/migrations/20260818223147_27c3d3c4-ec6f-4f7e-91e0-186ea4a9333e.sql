ALTER TABLE public.partner_gyms
  ADD COLUMN IF NOT EXISTS neighborhood TEXT,
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS owner_name TEXT,
  ADD COLUMN IF NOT EXISTS owner_phone TEXT,
  ADD COLUMN IF NOT EXISTS instagram TEXT,
  ADD COLUMN IF NOT EXISTS estimated_members INTEGER,
  ADD COLUMN IF NOT EXISTS gym_type TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'nao_contactada',
  ADD COLUMN IF NOT EXISTS commission_percent NUMERIC NOT NULL DEFAULT 25,
  ADD COLUMN IF NOT EXISTS contacted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS visited_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS closed_at TIMESTAMPTZ;

DO $$ BEGIN
  ALTER TABLE public.partner_gyms ADD CONSTRAINT partner_gyms_status_check
    CHECK (status IN ('nao_contactada','prospectada','visitada','em_negociacao','fechada','recusada'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.partner_gyms ADD CONSTRAINT partner_gyms_type_check
    CHECK (gym_type IS NULL OR gym_type IN ('boutique','media','grande','studio','crossfit'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.gym_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL REFERENCES public.partner_gyms(id) ON DELETE CASCADE,
  coach_user_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('whatsapp','visita','ligacao','email','evento','nota')),
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.gym_interactions TO authenticated;
GRANT ALL ON public.gym_interactions TO service_role;
ALTER TABLE public.gym_interactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Coaches manage their own gym interactions" ON public.gym_interactions
  FOR ALL TO authenticated
  USING (auth.uid() = coach_user_id OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (auth.uid() = coach_user_id OR public.has_role(auth.uid(), 'admin'));

CREATE TABLE IF NOT EXISTS public.gym_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID REFERENCES public.partner_gyms(id) ON DELETE SET NULL,
  coach_user_id UUID NOT NULL,
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming','active','completed')),
  commission_percent NUMERIC NOT NULL DEFAULT 25,
  qr_code_url TEXT,
  total_participants INTEGER NOT NULL DEFAULT 0,
  premium_count INTEGER NOT NULL DEFAULT 0,
  vip_count INTEGER NOT NULL DEFAULT 0,
  revenue_total NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.gym_challenges TO authenticated;
GRANT ALL ON public.gym_challenges TO service_role;
ALTER TABLE public.gym_challenges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Coaches manage their own gym challenges" ON public.gym_challenges
  FOR ALL TO authenticated
  USING (auth.uid() = coach_user_id OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (auth.uid() = coach_user_id OR public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_gym_challenges_updated_at BEFORE UPDATE ON public.gym_challenges
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.business_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_user_id UUID NOT NULL,
  description TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  due_date DATE,
  gym_id UUID REFERENCES public.partner_gyms(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.business_tasks TO authenticated;
GRANT ALL ON public.business_tasks TO service_role;
ALTER TABLE public.business_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Coaches manage their own business tasks" ON public.business_tasks
  FOR ALL TO authenticated
  USING (auth.uid() = coach_user_id OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (auth.uid() = coach_user_id OR public.has_role(auth.uid(), 'admin'));