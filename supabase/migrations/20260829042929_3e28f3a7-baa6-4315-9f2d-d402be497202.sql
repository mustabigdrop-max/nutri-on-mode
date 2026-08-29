-- ===== KIT DE MÍDIA / AUTORIDADE — link público compartilhável =====
-- Mesmo padrão de acesso público por token já usado na anamnese: nenhuma
-- concessão direta à role anon nas tabelas, só uma função SECURITY DEFINER
-- que devolve os dados públicos de quem tem o token certo.

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
