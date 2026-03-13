
INSERT INTO subscriptions (user_id, email, plano, periodo, kiwify_order_id, status, activated_at, expires_at, updated_at)
VALUES (
  '936308c1-a17a-4dc2-b7fb-2f01f79bec8e',
  'mustabigdrop@gmail.com',
  'full',
  'starter_7d',
  'manual_starter_activation',
  'active',
  now(),
  now() + interval '7 days',
  now()
)
ON CONFLICT (user_id) DO UPDATE SET
  plano = 'full',
  periodo = 'starter_7d',
  status = 'active',
  activated_at = now(),
  expires_at = now() + interval '7 days',
  updated_at = now();

UPDATE profiles SET plano_atual = 'full', updated_at = now() WHERE user_id = '936308c1-a17a-4dc2-b7fb-2f01f79bec8e';
