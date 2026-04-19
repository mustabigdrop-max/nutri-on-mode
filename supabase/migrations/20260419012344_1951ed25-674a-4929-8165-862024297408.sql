-- 1. Permitir que aluno veja protocolo prescrito a ele
DROP POLICY IF EXISTS "users_own_protocols" ON public.training_protocols;
DROP POLICY IF EXISTS "patients_view_prescribed" ON public.training_protocols;

CREATE POLICY "users_own_protocols"
ON public.training_protocols
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "patients_view_prescribed"
ON public.training_protocols
FOR SELECT
USING (auth.uid() = patient_user_id);

-- 2. Tabela de notificações coach -> aluno
CREATE TABLE IF NOT EXISTS public.coach_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recipient_user_id UUID NOT NULL,
  sender_user_id UUID NOT NULL,
  notification_type TEXT NOT NULL DEFAULT 'training_plan',
  title TEXT NOT NULL,
  message TEXT,
  action_url TEXT,
  reference_id UUID,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.coach_notifications ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_coach_notif_recipient ON public.coach_notifications(recipient_user_id, read, created_at DESC);

-- Aluno vê suas próprias
CREATE POLICY "recipient_view_own_notifications"
ON public.coach_notifications
FOR SELECT
USING (auth.uid() = recipient_user_id);

-- Aluno marca como lida
CREATE POLICY "recipient_update_own_notifications"
ON public.coach_notifications
FOR UPDATE
USING (auth.uid() = recipient_user_id);

-- Coach cria notificação para aluno vinculado
CREATE POLICY "coach_create_notifications"
ON public.coach_notifications
FOR INSERT
WITH CHECK (
  auth.uid() = sender_user_id
  AND (
    EXISTS (
      SELECT 1 FROM public.coach_profiles cp
      JOIN public.coach_patients cpat ON cpat.coach_id = cp.id
      WHERE cp.user_id = auth.uid()
        AND cpat.patient_user_id = coach_notifications.recipient_user_id
        AND cpat.status = 'active'
    )
    OR auth.uid() = '70e51469-1acf-4df6-afe6-f094d21db122'::uuid
  )
);

-- Coach vê o que enviou
CREATE POLICY "sender_view_sent_notifications"
ON public.coach_notifications
FOR SELECT
USING (auth.uid() = sender_user_id);