CREATE TABLE IF NOT EXISTS public.mce_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  checkin_date DATE NOT NULL DEFAULT CURRENT_DATE,
  sleep_quality INTEGER NOT NULL CHECK (sleep_quality BETWEEN 1 AND 10),
  stress_level INTEGER NOT NULL CHECK (stress_level BETWEEN 1 AND 10),
  nutrition_adherence INTEGER NOT NULL CHECK (nutrition_adherence BETWEEN 1 AND 10),
  hydration INTEGER NOT NULL CHECK (hydration BETWEEN 1 AND 10),
  movement INTEGER NOT NULL CHECK (movement BETWEEN 1 AND 10),
  focus_clarity INTEGER NOT NULL CHECK (focus_clarity BETWEEN 1 AND 10),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, checkin_date)
);

CREATE INDEX IF NOT EXISTS idx_mce_checkins_user_date ON public.mce_checkins(user_id, checkin_date DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.mce_checkins TO authenticated;
GRANT ALL ON public.mce_checkins TO service_role;

ALTER TABLE public.mce_checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own mce checkins"
  ON public.mce_checkins FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER trg_mce_checkins_updated_at
  BEFORE UPDATE ON public.mce_checkins
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();