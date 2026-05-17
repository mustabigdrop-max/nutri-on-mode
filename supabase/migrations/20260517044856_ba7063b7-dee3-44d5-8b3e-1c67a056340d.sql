
-- FASE 1: Fundação para sistema de Perfis Profissionais

-- 1.1 Subtipo profissional em profiles (atleta vs subtipos de coach)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS professional_type TEXT
  CHECK (professional_type IN (
    'nutritionist','personal_trainer','nutrition_coach','bodybuilding_coach','medico'
  ));

CREATE INDEX IF NOT EXISTS idx_profiles_professional_type ON public.profiles(professional_type);

-- 1.2 Código único de vinculação no coach_profiles
ALTER TABLE public.coach_profiles
  ADD COLUMN IF NOT EXISTS unique_code TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS professional_type TEXT
  CHECK (professional_type IN (
    'nutritionist','personal_trainer','nutrition_coach','bodybuilding_coach','medico'
  )),
  ADD COLUMN IF NOT EXISTS clinic_name TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'Brasil',
  ADD COLUMN IF NOT EXISTS logo_url TEXT,
  ADD COLUMN IF NOT EXISTS show_on_plan BOOLEAN DEFAULT true;

-- Função para gerar código único (8 chars alfanuméricos, prefix NUTRI-)
CREATE OR REPLACE FUNCTION public.generate_unique_coach_code()
RETURNS TEXT
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  code TEXT;
  tries INT := 0;
BEGIN
  LOOP
    code := 'NUTRI-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 6));
    IF NOT EXISTS (SELECT 1 FROM public.coach_profiles WHERE unique_code = code) THEN
      RETURN code;
    END IF;
    tries := tries + 1;
    IF tries > 10 THEN
      RAISE EXCEPTION 'Could not generate unique coach code';
    END IF;
  END LOOP;
END;
$$;

-- Backfill códigos para coaches existentes
UPDATE public.coach_profiles
SET unique_code = public.generate_unique_coach_code()
WHERE unique_code IS NULL;

-- Trigger para auto-gerar código em novos coaches
CREATE OR REPLACE FUNCTION public.set_coach_unique_code()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.unique_code IS NULL THEN
    NEW.unique_code := public.generate_unique_coach_code();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_coach_unique_code ON public.coach_profiles;
CREATE TRIGGER trg_set_coach_unique_code
BEFORE INSERT ON public.coach_profiles
FOR EACH ROW EXECUTE FUNCTION public.set_coach_unique_code();

-- 1.3 Convites profissionais
CREATE TABLE IF NOT EXISTS public.professional_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_profile_id UUID NOT NULL REFERENCES public.coach_profiles(id) ON DELETE CASCADE,
  invite_code TEXT UNIQUE NOT NULL DEFAULT upper(substr(md5(random()::text || clock_timestamp()::text), 1, 10)),
  email TEXT,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','expired','revoked')),
  accepted_by_user_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
  accepted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_prof_invites_coach ON public.professional_invites(coach_profile_id);
CREATE INDEX IF NOT EXISTS idx_prof_invites_status ON public.professional_invites(status);

ALTER TABLE public.professional_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coach views own invites"
ON public.professional_invites FOR SELECT
USING (
  coach_profile_id IN (
    SELECT id FROM public.coach_profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Coach creates own invites"
ON public.professional_invites FOR INSERT
WITH CHECK (
  coach_profile_id IN (
    SELECT id FROM public.coach_profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Coach updates own invites"
ON public.professional_invites FOR UPDATE
USING (
  coach_profile_id IN (
    SELECT id FROM public.coach_profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Public read by invite_code (page de convite)"
ON public.professional_invites FOR SELECT
USING (status = 'pending' AND expires_at > now());

-- 1.4 Notificações
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  action_url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, read, created_at DESC);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own notifications"
ON public.notifications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users update own notifications"
ON public.notifications FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users delete own notifications"
ON public.notifications FOR DELETE
USING (auth.uid() = user_id);

-- 1.5 handle_new_user atualizado para propagar professional_type
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_prof_type TEXT;
  v_role TEXT := 'user';
  v_coach_id UUID;
BEGIN
  v_prof_type := NEW.raw_user_meta_data->>'professional_type';

  -- Se é profissional, role = coach
  IF v_prof_type IS NOT NULL AND v_prof_type IN (
    'nutritionist','personal_trainer','nutrition_coach','bodybuilding_coach','medico'
  ) THEN
    v_role := 'coach';
  END IF;

  INSERT INTO public.profiles (user_id, full_name, email, role, professional_type, trial_ends_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    v_role,
    v_prof_type,
    CASE
      WHEN (NEW.raw_user_meta_data->>'is_trial')::boolean = true
      THEN now() + interval '7 days'
      ELSE NULL
    END
  );

  -- Se é profissional, criar coach_profile automaticamente
  IF v_role = 'coach' THEN
    INSERT INTO public.coach_profiles (
      user_id, professional_name, professional_type, plan, tier
    ) VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
      v_prof_type,
      'coach_free',
      'free'
    )
    ON CONFLICT (user_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;
