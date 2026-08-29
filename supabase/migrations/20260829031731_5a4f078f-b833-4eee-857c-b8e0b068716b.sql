-- ===== SOCIAL ON — liga o agendador de publicações do Instagram =====
-- A função `instagram-scheduler` já existe e processa os posts agendados
-- (social_instagram_posts com status='scheduled' e scheduled_at vencido),
-- mas nada a chamava periodicamente — os posts agendados nunca eram
-- publicados de verdade. Este cron chama a função a cada 5 minutos.
-- A chave usada é a `anon` (pública, a mesma embutida no app); a função
-- não verifica JWT (verify_jwt=false) e não expõe nada sensível — ela só
-- processa os posts já agendados pelos próprios coaches.

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
