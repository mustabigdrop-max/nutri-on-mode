CREATE TABLE public.client_daily_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  activity_date DATE NOT NULL DEFAULT CURRENT_DATE,
  activity_type TEXT NOT NULL,
  activity_label TEXT,
  duration_min INTEGER NOT NULL DEFAULT 0,
  intensity TEXT NOT NULL DEFAULT 'moderada',
  kcal_adjustment INTEGER NOT NULL DEFAULT 0,
  carb_adjustment INTEGER NOT NULL DEFAULT 0,
  protein_adjustment INTEGER NOT NULL DEFAULT 0,
  fat_adjustment INTEGER NOT NULL DEFAULT 0,
  hydration_adjustment_ml INTEGER NOT NULL DEFAULT 0,
  climate_band TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_client_daily_activities_user_date
  ON public.client_daily_activities (user_id, activity_date DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.client_daily_activities TO authenticated;
GRANT ALL ON public.client_daily_activities TO service_role;

ALTER TABLE public.client_daily_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own daily activities"
  ON public.client_daily_activities FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Coaches can view their patients daily activities"
  ON public.client_daily_activities FOR SELECT TO authenticated
  USING (public.is_coach_of_patient(auth.uid(), user_id) OR public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_client_daily_activities_updated_at
  BEFORE UPDATE ON public.client_daily_activities
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();