CREATE TABLE public.meridian_lifestyle_routines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  plan_id UUID NULL REFERENCES public.meridian_plans(id) ON DELETE SET NULL,
  target_bf_min NUMERIC(4,2) NOT NULL,
  target_bf_max NUMERIC(4,2) NOT NULL,
  training_days_per_week INTEGER NOT NULL DEFAULT 4,
  cardio_minutes_per_week INTEGER NOT NULL DEFAULT 120,
  step_target_daily INTEGER NOT NULL DEFAULT 8000,
  current_phase TEXT NOT NULL DEFAULT 'MAINTENANCE',
  next_event_name TEXT NULL,
  next_event_date DATE NULL,
  sustainability_score INTEGER NULL,
  notes TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.meridian_lifestyle_routines TO authenticated;
GRANT ALL ON public.meridian_lifestyle_routines TO service_role;

ALTER TABLE public.meridian_lifestyle_routines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "lifestyle_routines_select_own" ON public.meridian_lifestyle_routines
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "lifestyle_routines_insert_own" ON public.meridian_lifestyle_routines
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "lifestyle_routines_update_own" ON public.meridian_lifestyle_routines
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "lifestyle_routines_delete_own" ON public.meridian_lifestyle_routines
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER update_meridian_lifestyle_routines_updated_at
BEFORE UPDATE ON public.meridian_lifestyle_routines
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
