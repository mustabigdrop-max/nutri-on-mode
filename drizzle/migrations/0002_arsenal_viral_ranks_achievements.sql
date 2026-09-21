CREATE TABLE public.apex_rank_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  rank_key text NOT NULL,
  previous_rank_key text,
  apex_score numeric NOT NULL,
  previous_apex_score numeric,
  direction text NOT NULL DEFAULT 'promotion',
  assessment_date date,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.apex_rank_history TO authenticated;
GRANT ALL ON public.apex_rank_history TO service_role;
ALTER TABLE public.apex_rank_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own rank history select" ON public.apex_rank_history
  FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_coach_of_patient(auth.uid(), user_id));
CREATE POLICY "own rank history insert" ON public.apex_rank_history
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_apex_rank_history_user ON public.apex_rank_history (user_id, created_at DESC);

CREATE TABLE public.apex_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  achievement_id text NOT NULL,
  unlocked_at timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (user_id, achievement_id)
);

GRANT SELECT, INSERT ON public.apex_achievements TO authenticated;
GRANT ALL ON public.apex_achievements TO service_role;
ALTER TABLE public.apex_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own achievements select" ON public.apex_achievements
  FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_coach_of_patient(auth.uid(), user_id));
CREATE POLICY "own achievements insert" ON public.apex_achievements
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_apex_achievements_user ON public.apex_achievements (user_id, unlocked_at DESC);