-- Bypass total de admin nas tabelas de Modo Competição
-- Mantém policies existentes e adiciona admin override em ALL

-- competition_plans
CREATE POLICY "Admin can manage all plans"
ON public.competition_plans
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- competition_weekly_logs
CREATE POLICY "Admin can manage all weekly logs"
ON public.competition_weekly_logs
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- competition_daily_logs
CREATE POLICY "Admin can manage all daily logs"
ON public.competition_daily_logs
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- coach_patients (admin pode gerenciar todos os vínculos)
CREATE POLICY "Admin can manage all coach patients"
ON public.coach_patients
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- coach_profiles (admin pode gerenciar todos os perfis de coach)
CREATE POLICY "Admin can manage all coach profiles"
ON public.coach_profiles
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Garantir que seu user_id está em user_roles como admin
INSERT INTO public.user_roles (user_id, role)
VALUES ('70e51469-1acf-4df6-afe6-f094d21db122', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;