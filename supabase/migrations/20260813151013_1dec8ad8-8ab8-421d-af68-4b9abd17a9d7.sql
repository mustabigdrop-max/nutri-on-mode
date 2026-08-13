CREATE TABLE IF NOT EXISTS public.protocol_suggestions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  athlete_id UUID NOT NULL,
  coach_id UUID,
  rule_id TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'info' CHECK (severity IN ('info','attention','urgent')),
  category TEXT,
  title TEXT NOT NULL,
  analysis TEXT,
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  reasoning TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','dismissed','snoozed','custom')),
  approved_option INTEGER,
  custom_action TEXT,
  approved_at TIMESTAMPTZ,
  snoozed_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.protocol_suggestions TO authenticated;
GRANT ALL ON public.protocol_suggestions TO service_role;

ALTER TABLE public.protocol_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Athlete views own suggestions"
  ON public.protocol_suggestions FOR SELECT TO authenticated
  USING (athlete_id = auth.uid());

CREATE POLICY "Athlete creates own suggestions"
  ON public.protocol_suggestions FOR INSERT TO authenticated
  WITH CHECK (athlete_id = auth.uid());

CREATE POLICY "Coach views patient suggestions"
  ON public.protocol_suggestions FOR SELECT TO authenticated
  USING (coach_id = auth.uid() OR public.is_coach_of_patient(auth.uid(), athlete_id));

CREATE POLICY "Coach creates patient suggestions"
  ON public.protocol_suggestions FOR INSERT TO authenticated
  WITH CHECK (coach_id = auth.uid() OR public.is_coach_of_patient(auth.uid(), athlete_id));

CREATE POLICY "Coach updates patient suggestions"
  ON public.protocol_suggestions FOR UPDATE TO authenticated
  USING (coach_id = auth.uid() OR public.is_coach_of_patient(auth.uid(), athlete_id))
  WITH CHECK (coach_id = auth.uid() OR public.is_coach_of_patient(auth.uid(), athlete_id));

CREATE POLICY "Coach deletes patient suggestions"
  ON public.protocol_suggestions FOR DELETE TO authenticated
  USING (coach_id = auth.uid() OR public.is_coach_of_patient(auth.uid(), athlete_id));

CREATE INDEX IF NOT EXISTS idx_suggestions_coach ON public.protocol_suggestions(coach_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_suggestions_athlete ON public.protocol_suggestions(athlete_id, rule_id, created_at DESC);

CREATE TRIGGER trg_protocol_suggestions_updated_at
  BEFORE UPDATE ON public.protocol_suggestions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();