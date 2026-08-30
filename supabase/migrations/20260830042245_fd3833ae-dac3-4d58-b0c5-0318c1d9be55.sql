-- ===== SOCIAL ON — políticas do bucket social-posts =====
-- O bucket já existe; aqui garantimos as políticas de leitura pública e
-- escrita/atualização/remoção apenas pelo coach dono da pasta.

DROP POLICY IF EXISTS "Qualquer um lê mídia pública do Social ON" ON storage.objects;
CREATE POLICY "Qualquer um lê mídia pública do Social ON"
ON storage.objects FOR SELECT
USING (bucket_id = 'social-posts');

DROP POLICY IF EXISTS "Coach envia sua própria mídia do Social ON" ON storage.objects;
CREATE POLICY "Coach envia sua própria mídia do Social ON"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'social-posts' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Coach atualiza sua própria mídia do Social ON" ON storage.objects;
CREATE POLICY "Coach atualiza sua própria mídia do Social ON"
ON storage.objects FOR UPDATE
USING (bucket_id = 'social-posts' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Coach apaga sua própria mídia do Social ON" ON storage.objects;
CREATE POLICY "Coach apaga sua própria mídia do Social ON"
ON storage.objects FOR DELETE
USING (bucket_id = 'social-posts' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ===== SOCIAL ON — cron para chamar instagram-scheduler a cada 5 minutos =====
SELECT cron.unschedule('instagram-scheduler-tick')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'instagram-scheduler-tick');

SELECT cron.schedule(
  'instagram-scheduler-tick',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://hibohvntewqtthyuotye.supabase.co/functions/v1/instagram-scheduler',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpYm9odm50ZXdxdHRoeXVvdHllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4MDM0NjMsImV4cCI6MjA4ODM3OTQ2M30.eb9PtawhjzGKM2MoS4AJo3O2A4_nF4FN7875Gdc-Nj8", "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpYm9odm50ZXdxdHRoeXVvdHllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4MDM0NjMsImV4cCI6MjA4ODM3OTQ2M30.eb9PtawhjzGKM2MoS4AJo3O2A4_nF4FN7875Gdc-Nj8"}'::jsonb,
    body := '{}'::jsonb
  ) AS request_id;
  $$
);

-- ===== SOCIAL ON — self_comment para posts do Instagram =====
ALTER TABLE public.social_instagram_posts
  ADD COLUMN IF NOT EXISTS self_comment text;

-- ===== KIT DE MÍDIA / AUTORIDADE — link público compartilhável =====
ALTER TABLE public.social_profile
  ADD COLUMN IF NOT EXISTS media_kit_token TEXT UNIQUE;

CREATE INDEX IF NOT EXISTS idx_social_profile_media_kit_token
  ON public.social_profile(media_kit_token);

CREATE OR REPLACE FUNCTION public.get_media_kit_by_token(_token TEXT)
RETURNS JSON
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT json_build_object(
    'professional_name', cp.professional_name,
    'crn', cp.crn,
    'bio', cp.bio,
    'avatar_url', cp.avatar_url,
    'specialties', cp.specialties,
    'niches', sp.niches,
    'products', sp.products,
    'differentials', sp.differentials,
    'instagram_handle', COALESCE(sia.username, sp.instagram_handle),
    'followers_count', sia.followers_count,
    'media_count', sia.media_count,
    'profile_picture_url', COALESCE(sia.profile_picture_url, cp.avatar_url),
    'recent_media', sia.recent_media
  )
  FROM public.social_profile sp
  LEFT JOIN public.coach_profiles cp ON cp.user_id = sp.coach_id
  LEFT JOIN public.social_instagram_accounts sia ON sia.coach_id = sp.coach_id
  WHERE sp.media_kit_token = _token
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_media_kit_by_token(TEXT) TO anon, authenticated;