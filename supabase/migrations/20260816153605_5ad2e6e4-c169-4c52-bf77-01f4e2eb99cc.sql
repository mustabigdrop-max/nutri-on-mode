-- 1) EPISODES
CREATE TABLE public.mce_audio_episodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  series TEXT NOT NULL,
  episode_number INTEGER,
  title TEXT NOT NULL,
  description TEXT,
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  audio_url TEXT,
  cover_image_url TEXT,
  scientific_reference TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  is_premium BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mce_audio_episodes TO authenticated;
GRANT ALL ON public.mce_audio_episodes TO service_role;
ALTER TABLE public.mce_audio_episodes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "episodes_read_authenticated" ON public.mce_audio_episodes
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "episodes_admin_write" ON public.mce_audio_episodes
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_mce_audio_episodes_updated_at
  BEFORE UPDATE ON public.mce_audio_episodes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2) PROGRESS
CREATE TABLE public.client_audio_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  episode_id UUID NOT NULL REFERENCES public.mce_audio_episodes(id) ON DELETE CASCADE,
  progress_seconds INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  listen_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, episode_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.client_audio_progress TO authenticated;
GRANT ALL ON public.client_audio_progress TO service_role;
ALTER TABLE public.client_audio_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "audio_progress_own_all" ON public.client_audio_progress
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "audio_progress_coach_read" ON public.client_audio_progress
  FOR SELECT TO authenticated
  USING (public.is_coach_of_patient(auth.uid(), user_id) OR public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_client_audio_progress_updated_at
  BEFORE UPDATE ON public.client_audio_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3) DAILY BRIEFINGS
CREATE TABLE public.daily_briefings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  briefing_date DATE NOT NULL DEFAULT CURRENT_DATE,
  text_content TEXT NOT NULL DEFAULT '',
  audio_url TEXT,
  listened BOOLEAN NOT NULL DEFAULT false,
  listened_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, briefing_date)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.daily_briefings TO authenticated;
GRANT ALL ON public.daily_briefings TO service_role;
ALTER TABLE public.daily_briefings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "briefings_own_all" ON public.daily_briefings
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "briefings_coach_read" ON public.daily_briefings
  FOR SELECT TO authenticated
  USING (public.is_coach_of_patient(auth.uid(), user_id) OR public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_daily_briefings_updated_at
  BEFORE UPDATE ON public.daily_briefings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4) RITUAL COMPLETIONS
CREATE TABLE public.ritual_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  ritual_type TEXT NOT NULL CHECK (ritual_type IN ('despertar','pre_treino','pos_treino','pre_sono')),
  ritual_date DATE NOT NULL DEFAULT CURRENT_DATE,
  mce_points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, ritual_type, ritual_date)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ritual_completions TO authenticated;
GRANT ALL ON public.ritual_completions TO service_role;
ALTER TABLE public.ritual_completions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rituals_own_all" ON public.ritual_completions
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "rituals_coach_read" ON public.ritual_completions
  FOR SELECT TO authenticated
  USING (public.is_coach_of_patient(auth.uid(), user_id) OR public.has_role(auth.uid(), 'admin'));