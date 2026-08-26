-- ===== SOCIAL ON — bucket público para publicar foto/vídeo direto no Instagram =====
-- A Graph API do Instagram baixa a mídia de uma URL pública https, então o bucket
-- precisa ser público. Cada coach só pode gravar/apagar dentro da própria pasta
-- (<coach_id>/...), leitura é pública (necessária pra API do Instagram acessar).

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'social-posts',
  'social-posts',
  true,
  209715200, -- 200MB (reels podem ser vídeos grandes)
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/quicktime']
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Qualquer um lê mídia pública do Social ON"
ON storage.objects FOR SELECT
USING (bucket_id = 'social-posts');

CREATE POLICY "Coach envia sua própria mídia do Social ON"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'social-posts' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Coach atualiza sua própria mídia do Social ON"
ON storage.objects FOR UPDATE
USING (bucket_id = 'social-posts' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Coach apaga sua própria mídia do Social ON"
ON storage.objects FOR DELETE
USING (bucket_id = 'social-posts' AND auth.uid()::text = (storage.foldername(name))[1]);
