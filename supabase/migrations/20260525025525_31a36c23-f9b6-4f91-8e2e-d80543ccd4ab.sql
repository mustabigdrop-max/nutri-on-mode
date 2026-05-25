
-- MCE Intelligence tables
CREATE TABLE IF NOT EXISTS public.mce_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score_m INTEGER NOT NULL CHECK (score_m BETWEEN 0 AND 100),
  score_c INTEGER NOT NULL CHECK (score_c BETWEEN 0 AND 100),
  score_e INTEGER NOT NULL CHECK (score_e BETWEEN 0 AND 100),
  source TEXT NOT NULL DEFAULT 'manual',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_mce_scores_user ON public.mce_scores(user_id, created_at DESC);
ALTER TABLE public.mce_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own mce scores" ON public.mce_scores FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own mce scores" ON public.mce_scores FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.mce_exercises_done (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_key TEXT NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_mce_ex_user ON public.mce_exercises_done(user_id, completed_at DESC);
ALTER TABLE public.mce_exercises_done ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own mce ex" ON public.mce_exercises_done FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own mce ex" ON public.mce_exercises_done FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own mce ex" ON public.mce_exercises_done FOR DELETE USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.mce_chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.mce_chat_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own mce chat" ON public.mce_chat_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own mce chat" ON public.mce_chat_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own mce chat" ON public.mce_chat_sessions FOR UPDATE USING (auth.uid() = user_id);
