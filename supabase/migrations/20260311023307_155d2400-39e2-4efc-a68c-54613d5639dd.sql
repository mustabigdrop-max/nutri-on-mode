
-- Add admin role
INSERT INTO public.user_roles (user_id, role)
VALUES ('70e51469-1acf-4df6-afe6-f094d21db122', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- Update plan to ON PRO
UPDATE public.profiles
SET plano_atual = 'on_pro', updated_at = now()
WHERE user_id = '70e51469-1acf-4df6-afe6-f094d21db122';

-- Create active subscription
INSERT INTO public.subscriptions (user_id, email, plano, status, activated_at, periodo)
VALUES ('70e51469-1acf-4df6-afe6-f094d21db122', 'diogo.mell0@hotmail.com', 'on_pro', 'active', now(), 'lifetime')
ON CONFLICT (user_id) DO UPDATE SET plano = 'on_pro', status = 'active', updated_at = now();
