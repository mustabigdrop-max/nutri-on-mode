CREATE TABLE public.social_content_calendar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL,
  date DATE NOT NULL,
  pillar TEXT NOT NULL CHECK (pillar IN ('mce_drop','bastidor','transformacao','entretenimento','cta')),
  format TEXT NOT NULL CHECK (format IN ('reel','carrossel','stories','post_unico','live','collab')),
  topic TEXT NOT NULL,
  hook TEXT,
  caption TEXT,
  reel_script TEXT,
  hashtags TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','ready','published','skipped')),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.social_content_calendar TO authenticated;
GRANT ALL ON public.social_content_calendar TO service_role;
ALTER TABLE public.social_content_calendar ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Coach manages own calendar" ON public.social_content_calendar FOR ALL TO authenticated USING (auth.uid() = coach_id) WITH CHECK (auth.uid() = coach_id);
CREATE TRIGGER trg_social_calendar_updated_at BEFORE UPDATE ON public.social_content_calendar FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.social_hooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL,
  category TEXT NOT NULL DEFAULT 'educativo',
  hook_text TEXT NOT NULL,
  used_count INTEGER NOT NULL DEFAULT 0,
  engagement_score INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.social_hooks TO authenticated;
GRANT ALL ON public.social_hooks TO service_role;
ALTER TABLE public.social_hooks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Coach manages own hooks" ON public.social_hooks FOR ALL TO authenticated USING (auth.uid() = coach_id) WITH CHECK (auth.uid() = coach_id);

CREATE TABLE public.social_audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL,
  handle TEXT,
  bio_score INTEGER,
  content_mix JSONB DEFAULT '{}'::jsonb,
  issues JSONB DEFAULT '[]'::jsonb,
  recommendations JSONB DEFAULT '{}'::jsonb,
  audited_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.social_audits TO authenticated;
GRANT ALL ON public.social_audits TO service_role;
ALTER TABLE public.social_audits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Coach manages own audits" ON public.social_audits FOR ALL TO authenticated USING (auth.uid() = coach_id) WITH CHECK (auth.uid() = coach_id);