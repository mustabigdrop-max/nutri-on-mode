ALTER TABLE public.social_content DROP CONSTRAINT IF EXISTS social_content_format_check;

ALTER TABLE public.social_content
  ADD CONSTRAINT social_content_format_check
  CHECK (format IN (
    'foto_unica', 'carrossel_fotos', 'foto_legenda_forte',
    'edit', 'talking_head', 'clips_treino', 'screen_recording',
    'pov', 'timelapse',
    'stories_foto', 'stories_video', 'stories_interacao',
    'reel', 'carrossel', 'stories', 'post'
  ));

ALTER TABLE public.social_content ADD COLUMN IF NOT EXISTS tone TEXT;
ALTER TABLE public.social_content DROP CONSTRAINT IF EXISTS social_content_tone_check;
ALTER TABLE public.social_content
  ADD CONSTRAINT social_content_tone_check
  CHECK (tone IS NULL OR tone IN ('agressivo', 'cientifico', 'emocional', 'humor', 'militar', 'pai'));

ALTER TABLE public.social_content ADD COLUMN IF NOT EXISTS suggested_time TIME;