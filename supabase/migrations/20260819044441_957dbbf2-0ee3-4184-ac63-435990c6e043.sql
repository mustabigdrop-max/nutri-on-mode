-- 1. profiles extensions
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS origin TEXT NOT NULL DEFAULT 'direct',
  ADD COLUMN IF NOT EXISTS challenge_id UUID REFERENCES public.gym_challenges(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS gym_id UUID REFERENCES public.partner_gyms(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS migrated_from_challenge BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS migrated_at TIMESTAMPTZ;

-- 2. challenge participants
CREATE TABLE IF NOT EXISTS public.challenge_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID NOT NULL REFERENCES public.gym_challenges(id) ON DELETE CASCADE,
  gym_id UUID REFERENCES public.partner_gyms(id) ON DELETE SET NULL,
  user_id UUID NOT NULL,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT,
  whatsapp TEXT,
  objetivo TEXT NOT NULL DEFAULT 'emagrecer',
  porte TEXT NOT NULL DEFAULT 'medio',
  meals_per_day INTEGER NOT NULL DEFAULT 5,
  target_kcal INTEGER NOT NULL DEFAULT 1800,
  protein_g INTEGER NOT NULL DEFAULT 130,
  carbs_g INTEGER NOT NULL DEFAULT 190,
  fat_g INTEGER NOT NULL DEFAULT 55,
  tier TEXT NOT NULL DEFAULT 'free',
  mce_score INTEGER NOT NULL DEFAULT 50,
  streak INTEGER NOT NULL DEFAULT 0,
  weight_start NUMERIC,
  weight_current NUMERIC,
  last_checkin_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'active',
  migrated_to_client BOOLEAN NOT NULL DEFAULT false,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (challenge_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_challenge_participants_challenge ON public.challenge_participants(challenge_id);
CREATE INDEX IF NOT EXISTS idx_challenge_participants_user ON public.challenge_participants(user_id);

GRANT SELECT, INSERT, UPDATE ON public.challenge_participants TO authenticated;
GRANT ALL ON public.challenge_participants TO service_role;
ALTER TABLE public.challenge_participants ENABLE ROW LEVEL SECURITY;

-- helper: is the current user the coach owner of this challenge?
CREATE OR REPLACE FUNCTION public.is_challenge_coach(_challenge_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.gym_challenges gc
    WHERE gc.id = _challenge_id AND gc.coach_user_id = _user_id
  ) OR public.has_role(_user_id, 'admin'::app_role);
$$;

-- helper: challenge of the current participant (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.my_challenge_ids(_user_id uuid)
RETURNS SETOF uuid
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT challenge_id FROM public.challenge_participants WHERE user_id = _user_id;
$$;

CREATE POLICY "participants_select_own_or_same_challenge"
  ON public.challenge_participants FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR challenge_id IN (SELECT public.my_challenge_ids(auth.uid()))
    OR public.is_challenge_coach(challenge_id, auth.uid())
  );

CREATE POLICY "participants_insert_self"
  ON public.challenge_participants FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() OR public.is_challenge_coach(challenge_id, auth.uid()));

CREATE POLICY "participants_update_own_or_coach"
  ON public.challenge_participants FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR public.is_challenge_coach(challenge_id, auth.uid()))
  WITH CHECK (user_id = auth.uid() OR public.is_challenge_coach(challenge_id, auth.uid()));

-- protect privileged fields from self-service escalation
CREATE OR REPLACE FUNCTION public.protect_challenge_participant_fields()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL OR current_setting('role', true) = 'service_role' THEN
    RETURN NEW;
  END IF;
  IF public.is_challenge_coach(NEW.challenge_id, auth.uid()) THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    NEW.tier := 'free';
    NEW.migrated_to_client := false;
  ELSE
    NEW.tier := OLD.tier;
    NEW.migrated_to_client := OLD.migrated_to_client;
    NEW.challenge_id := OLD.challenge_id;
    NEW.user_id := OLD.user_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_protect_challenge_participant_fields
  BEFORE INSERT OR UPDATE ON public.challenge_participants
  FOR EACH ROW EXECUTE FUNCTION public.protect_challenge_participant_fields();

CREATE TRIGGER trg_challenge_participants_updated_at
  BEFORE UPDATE ON public.challenge_participants
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. daily logs
CREATE TABLE IF NOT EXISTS public.challenge_daily_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  challenge_id UUID NOT NULL REFERENCES public.gym_challenges(id) ON DELETE CASCADE,
  log_date DATE NOT NULL DEFAULT (now() AT TIME ZONE 'America/Sao_Paulo')::date,
  meals_done INTEGER[] NOT NULL DEFAULT '{}',
  water_ml INTEGER NOT NULL DEFAULT 0,
  mood TEXT,
  training_done BOOLEAN NOT NULL DEFAULT false,
  points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, log_date)
);

GRANT SELECT, INSERT, UPDATE ON public.challenge_daily_logs TO authenticated;
GRANT ALL ON public.challenge_daily_logs TO service_role;
ALTER TABLE public.challenge_daily_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "challenge_logs_own"
  ON public.challenge_daily_logs FOR ALL TO authenticated
  USING (user_id = auth.uid() OR public.is_challenge_coach(challenge_id, auth.uid()))
  WITH CHECK (user_id = auth.uid());

CREATE TRIGGER trg_challenge_daily_logs_updated_at
  BEFORE UPDATE ON public.challenge_daily_logs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. public (no-login) access for landing + The Wall
CREATE OR REPLACE FUNCTION public.get_challenge_public(_slug text)
RETURNS TABLE (
  id uuid, name text, slug text, gym_name text,
  start_date date, end_date date, status text, participants integer
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT gc.id, gc.name, gc.slug, COALESCE(pg.name, '') AS gym_name,
         gc.start_date, gc.end_date, gc.status,
         (SELECT COUNT(*)::int FROM public.challenge_participants cp
           WHERE cp.challenge_id = gc.id AND cp.status = 'active')
  FROM public.gym_challenges gc
  LEFT JOIN public.partner_gyms pg ON pg.id = gc.gym_id
  WHERE gc.slug = _slug
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.get_challenge_ranking_public(_slug text, _limit integer DEFAULT 50)
RETURNS TABLE (
  display_name text, mce_score integer, streak integer, tier text, rank_position integer
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT
    split_part(NULLIF(trim(cp.full_name), ''), ' ', 1)
      || CASE WHEN position(' ' in trim(cp.full_name)) > 0
              THEN ' ' || upper(substr(split_part(trim(cp.full_name), ' ', 2), 1, 1)) || '.'
              ELSE '' END AS display_name,
    cp.mce_score, cp.streak, cp.tier,
    (ROW_NUMBER() OVER (ORDER BY cp.mce_score DESC, cp.streak DESC))::int AS rank_position
  FROM public.challenge_participants cp
  JOIN public.gym_challenges gc ON gc.id = cp.challenge_id
  WHERE gc.slug = _slug AND cp.status = 'active'
  ORDER BY cp.mce_score DESC, cp.streak DESC
  LIMIT COALESCE(_limit, 50);
$$;

GRANT EXECUTE ON FUNCTION public.get_challenge_public(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_challenge_ranking_public(text, integer) TO anon, authenticated;

-- 5. realtime for The Wall
ALTER TABLE public.challenge_participants REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.challenge_participants;