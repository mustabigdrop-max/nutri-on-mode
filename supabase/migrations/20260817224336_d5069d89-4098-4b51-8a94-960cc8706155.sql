CREATE TABLE public.social_profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL UNIQUE,
  instagram_handle TEXT,
  bio_current TEXT,
  bio_score INTEGER,
  content_pillars JSONB DEFAULT '[]'::jsonb,
  funnel_stage TEXT NOT NULL DEFAULT 'tofu',
  products JSONB DEFAULT '[]'::jsonb,
  niches JSONB DEFAULT '[]'::jsonb,
  differentials JSONB DEFAULT '[]'::jsonb,
  visual_palette JSONB DEFAULT '[]'::jsonb,
  audit_completed BOOLEAN NOT NULL DEFAULT false,
  audited_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.social_profile TO authenticated;
GRANT ALL ON public.social_profile TO service_role;
ALTER TABLE public.social_profile ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own social profile" ON public.social_profile FOR ALL TO authenticated USING (auth.uid() = coach_id) WITH CHECK (auth.uid() = coach_id);
CREATE TRIGGER trg_social_profile_updated_at BEFORE UPDATE ON public.social_profile FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.social_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL,
  funnel TEXT NOT NULL CHECK (funnel IN ('tofu','mofu','bofu')),
  format TEXT NOT NULL CHECK (format IN ('reel','carrossel','stories','post')),
  objective TEXT CHECK (objective IN ('seguidores','curtidas','shares','salvamentos','vendas','cliques')),
  product TEXT,
  topic TEXT,
  hook TEXT,
  script TEXT,
  caption TEXT,
  hashtags TEXT[] DEFAULT '{}',
  production_tips JSONB,
  strategy_notes TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  scheduled_date DATE,
  published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.social_content TO authenticated;
GRANT ALL ON public.social_content TO service_role;
ALTER TABLE public.social_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own social content" ON public.social_content FOR ALL TO authenticated USING (auth.uid() = coach_id) WITH CHECK (auth.uid() = coach_id);
CREATE TRIGGER trg_social_content_updated_at BEFORE UPDATE ON public.social_content FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.social_weekly_checklist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL,
  week_start DATE NOT NULL,
  items JSONB NOT NULL DEFAULT '{}'::jsonb,
  completion_percent INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (coach_id, week_start)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.social_weekly_checklist TO authenticated;
GRANT ALL ON public.social_weekly_checklist TO service_role;
ALTER TABLE public.social_weekly_checklist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own social checklist" ON public.social_weekly_checklist FOR ALL TO authenticated USING (auth.uid() = coach_id) WITH CHECK (auth.uid() = coach_id);
CREATE TRIGGER trg_social_checklist_updated_at BEFORE UPDATE ON public.social_weekly_checklist FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.social_learning_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL,
  track TEXT NOT NULL,
  lesson TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (coach_id, track, lesson)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.social_learning_progress TO authenticated;
GRANT ALL ON public.social_learning_progress TO service_role;
ALTER TABLE public.social_learning_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own social learning" ON public.social_learning_progress FOR ALL TO authenticated USING (auth.uid() = coach_id) WITH CHECK (auth.uid() = coach_id);