
-- Add role column to profiles
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- Add alunos columns to coach_profiles
ALTER TABLE public.coach_profiles 
  ADD COLUMN IF NOT EXISTS alunos_ativos INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS max_alunos INTEGER DEFAULT 10;

-- Create coach_convites table
CREATE TABLE IF NOT EXISTS public.coach_convites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL,
  token TEXT UNIQUE NOT NULL,
  usado BOOLEAN DEFAULT false,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '48 hours'),
  aluno_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.coach_convites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coaches can manage own invites"
  ON public.coach_convites FOR ALL
  TO authenticated
  USING (coach_id = auth.uid())
  WITH CHECK (coach_id = auth.uid());

CREATE POLICY "Anyone can read invites for accepting"
  ON public.coach_convites FOR SELECT
  TO authenticated
  USING (true);

-- Trigger: deactivate students when coach subscription is canceled
CREATE OR REPLACE FUNCTION public.deactivate_coach_students()
RETURNS TRIGGER AS $$
DECLARE
  coach_prof_id UUID;
BEGIN
  IF NEW.status = 'canceled' AND (OLD.status IS DISTINCT FROM 'canceled') THEN
    SELECT id INTO coach_prof_id
    FROM public.coach_profiles
    WHERE user_id = NEW.user_id
    LIMIT 1;
    
    IF coach_prof_id IS NOT NULL THEN
      UPDATE public.profiles
      SET role = 'user', plano_atual = 'free', coach_profile_id = NULL, updated_at = NOW()
      WHERE coach_profile_id = coach_prof_id AND role = 'aluno_coach';
      
      UPDATE public.coach_patients
      SET status = 'encerrado'
      WHERE coach_id = coach_prof_id AND status = 'active';
      
      UPDATE public.coach_profiles
      SET alunos_ativos = 0
      WHERE id = coach_prof_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_coach_subscription_canceled ON public.subscriptions;
CREATE TRIGGER on_coach_subscription_canceled
  AFTER UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.deactivate_coach_students();
