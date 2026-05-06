CREATE TABLE IF NOT EXISTS public.weekly_checkins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  week_start DATE NOT NULL,
  weight_kg NUMERIC,
  waist_cm NUMERIC,
  hip_cm NUMERIC,
  arm_cm NUMERIC,
  adherence_diet SMALLINT,
  adherence_training SMALLINT,
  adherence_sleep SMALLINT,
  adherence_stress SMALLINT,
  adherence_energy SMALLINT,
  adherence_hunger SMALLINT,
  bristol_scale SMALLINT,
  bloating_days SMALLINT,
  symptoms TEXT[] DEFAULT ARRAY[]::TEXT[],
  notes TEXT,
  photo_front_url TEXT,
  weight_delta_kg NUMERIC,
  coach_feedback TEXT,
  coach_macro_adjustment JSONB,
  coach_responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, week_start)
);

ALTER TABLE public.weekly_checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own checkins" ON public.weekly_checkins
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own checkins" ON public.weekly_checkins
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own checkins" ON public.weekly_checkins
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own checkins" ON public.weekly_checkins
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Coach views patient checkins" ON public.weekly_checkins
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.coach_patients cp
      JOIN public.coach_profiles prof ON prof.id = cp.coach_id
      WHERE cp.patient_user_id = weekly_checkins.user_id
        AND prof.user_id = auth.uid()
        AND cp.status = 'active'
    )
  );

CREATE POLICY "Coach updates patient checkins" ON public.weekly_checkins
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.coach_patients cp
      JOIN public.coach_profiles prof ON prof.id = cp.coach_id
      WHERE cp.patient_user_id = weekly_checkins.user_id
        AND prof.user_id = auth.uid()
        AND cp.status = 'active'
    )
  );

CREATE TRIGGER update_weekly_checkins_updated_at
  BEFORE UPDATE ON public.weekly_checkins
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_weekly_checkins_user_week ON public.weekly_checkins(user_id, week_start DESC);

-- Storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('checkin-photos', 'checkin-photos', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users upload own checkin photos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'checkin-photos' AND auth.uid()::text = (storage.foldername(name))[1]
  );
CREATE POLICY "Users view own checkin photos" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'checkin-photos' AND auth.uid()::text = (storage.foldername(name))[1]
  );
CREATE POLICY "Users delete own checkin photos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'checkin-photos' AND auth.uid()::text = (storage.foldername(name))[1]
  );
CREATE POLICY "Coach views patient checkin photos" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'checkin-photos' AND EXISTS (
      SELECT 1 FROM public.coach_patients cp
      JOIN public.coach_profiles prof ON prof.id = cp.coach_id
      WHERE cp.patient_user_id::text = (storage.foldername(name))[1]
        AND prof.user_id = auth.uid()
        AND cp.status = 'active'
    )
  );