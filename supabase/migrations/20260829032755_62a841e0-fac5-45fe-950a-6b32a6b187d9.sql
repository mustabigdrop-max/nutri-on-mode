-- Guarda o self-comment (comentário que a IA sugere pra postar logo após
-- publicar, útil pra puxar DM/engajamento) junto do post, pra ser postado
-- automaticamente tanto na publicação imediata quanto na agendada.
ALTER TABLE public.social_instagram_posts
  ADD COLUMN IF NOT EXISTS self_comment text;
