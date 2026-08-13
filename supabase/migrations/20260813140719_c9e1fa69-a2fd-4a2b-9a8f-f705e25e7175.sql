CREATE TABLE IF NOT EXISTS public.anamnesis (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  athlete_id UUID,
  coach_id UUID,
  athlete_name TEXT,
  mode TEXT NOT NULL DEFAULT 'online' CHECK (mode IN ('online','presencial')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','draft','completed')),
  personal JSONB NOT NULL DEFAULT '{}',
  health_history JSONB NOT NULL DEFAULT '{}',
  diet_history JSONB NOT NULL DEFAULT '{}',
  lifestyle JSONB NOT NULL DEFAULT '{}',
  training JSONB NOT NULL DEFAULT '{}',
  goals JSONB NOT NULL DEFAULT '{}',
  digestive JSONB NOT NULL DEFAULT '{}',
  hormonal JSONB NOT NULL DEFAULT '{}',
  supplements JSONB NOT NULL DEFAULT '{}',
  pharmacology JSONB NOT NULL DEFAULT '{}',
  sections_completed INTEGER NOT NULL DEFAULT 0,
  total_sections INTEGER NOT NULL DEFAULT 9,
  alerts JSONB NOT NULL DEFAULT '[]',
  invite_token TEXT UNIQUE,
  expires_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.anamnesis TO authenticated;
GRANT ALL ON public.anamnesis TO service_role;

ALTER TABLE public.anamnesis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coach manages anamnesis"
  ON public.anamnesis FOR ALL TO authenticated
  USING (auth.uid() = coach_id) WITH CHECK (auth.uid() = coach_id);

CREATE POLICY "Athlete manages own anamnesis"
  ON public.anamnesis FOR ALL TO authenticated
  USING (auth.uid() = athlete_id) WITH CHECK (auth.uid() = athlete_id);

CREATE INDEX IF NOT EXISTS idx_anamnesis_athlete ON public.anamnesis(athlete_id);
CREATE INDEX IF NOT EXISTS idx_anamnesis_coach ON public.anamnesis(coach_id);
CREATE INDEX IF NOT EXISTS idx_anamnesis_token ON public.anamnesis(invite_token);

CREATE TRIGGER trg_anamnesis_updated_at
  BEFORE UPDATE ON public.anamnesis
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Token-based public access (no anon table grants; only these functions)
CREATE OR REPLACE FUNCTION public.get_anamnesis_by_token(_token TEXT)
RETURNS SETOF public.anamnesis
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.anamnesis
  WHERE invite_token = _token
    AND (expires_at IS NULL OR expires_at > now())
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.save_anamnesis_by_token(
  _token TEXT,
  _payload JSONB,
  _sections_completed INTEGER,
  _status TEXT,
  _alerts JSONB
)
RETURNS public.anamnesis
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  row public.anamnesis;
BEGIN
  IF _status NOT IN ('pending','draft','completed') THEN
    RAISE EXCEPTION 'invalid status';
  END IF;

  UPDATE public.anamnesis SET
    personal = COALESCE(_payload->'personal', personal),
    health_history = COALESCE(_payload->'health_history', health_history),
    diet_history = COALESCE(_payload->'diet_history', diet_history),
    lifestyle = COALESCE(_payload->'lifestyle', lifestyle),
    training = COALESCE(_payload->'training', training),
    goals = COALESCE(_payload->'goals', goals),
    digestive = COALESCE(_payload->'digestive', digestive),
    hormonal = COALESCE(_payload->'hormonal', hormonal),
    supplements = COALESCE(_payload->'supplements', supplements),
    pharmacology = COALESCE(_payload->'pharmacology', pharmacology),
    sections_completed = COALESCE(_sections_completed, sections_completed),
    alerts = COALESCE(_alerts, alerts),
    status = _status,
    completed_at = CASE WHEN _status = 'completed' THEN now() ELSE completed_at END,
    updated_at = now()
  WHERE invite_token = _token
    AND (expires_at IS NULL OR expires_at > now())
  RETURNING * INTO row;

  IF row.id IS NULL THEN
    RAISE EXCEPTION 'invalid or expired token';
  END IF;

  RETURN row;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_anamnesis_by_token(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.save_anamnesis_by_token(TEXT, JSONB, INTEGER, TEXT, JSONB) TO anon, authenticated;