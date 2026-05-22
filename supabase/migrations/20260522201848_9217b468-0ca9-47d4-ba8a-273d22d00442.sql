CREATE TABLE IF NOT EXISTS public.apex_vera_bridge (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  atleta_id UUID NOT NULL,
  coach_user_id UUID,
  package JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDENTE',
  resultado JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_avb_atleta ON public.apex_vera_bridge(atleta_id);
CREATE INDEX IF NOT EXISTS idx_avb_coach ON public.apex_vera_bridge(coach_user_id);

ALTER TABLE public.apex_vera_bridge ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Atleta vê seu bridge"
  ON public.apex_vera_bridge FOR SELECT
  USING (atleta_id = auth.uid() OR coach_user_id = auth.uid());

CREATE POLICY "Coach insere bridge"
  ON public.apex_vera_bridge FOR INSERT
  WITH CHECK (coach_user_id = auth.uid() OR atleta_id = auth.uid());

CREATE POLICY "Coach atualiza bridge"
  ON public.apex_vera_bridge FOR UPDATE
  USING (coach_user_id = auth.uid() OR atleta_id = auth.uid());

CREATE POLICY "Coach deleta bridge"
  ON public.apex_vera_bridge FOR DELETE
  USING (coach_user_id = auth.uid() OR atleta_id = auth.uid());

CREATE TRIGGER trg_avb_updated
  BEFORE UPDATE ON public.apex_vera_bridge
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();