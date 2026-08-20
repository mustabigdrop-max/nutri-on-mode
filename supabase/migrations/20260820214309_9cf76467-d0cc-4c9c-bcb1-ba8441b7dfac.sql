ALTER TABLE public.social_content_calendar
  ADD COLUMN IF NOT EXISTS scheduled_time TIME,
  ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS prism_analysis_id UUID REFERENCES public.prism_analyses(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_social_calendar_prism ON public.social_content_calendar(prism_analysis_id);