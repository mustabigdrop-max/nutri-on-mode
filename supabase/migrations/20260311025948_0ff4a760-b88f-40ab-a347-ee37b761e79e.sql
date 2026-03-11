
-- Coach profiles table
CREATE TABLE public.coach_profiles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE,
  professional_name text,
  crn text,
  specialties text[] DEFAULT '{}'::text[],
  bio text,
  avatar_url text,
  plan text DEFAULT 'coach',
  tier text DEFAULT '30',
  max_patients int DEFAULT 30,
  white_label_app_name text,
  white_label_primary_color text DEFAULT '#E8A020',
  white_label_secondary_color text DEFAULT '#1a1a2e',
  white_label_logo_url text,
  white_label_domain text,
  white_label_splash_url text,
  alert_frequency text DEFAULT 'realtime',
  alert_channels jsonb DEFAULT '{"app": true, "email": false}'::jsonb,
  trial_ends_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.coach_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own coach profile" ON public.coach_profiles
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Coach patients relationship
CREATE TABLE public.coach_patients (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id uuid REFERENCES public.coach_profiles(id) ON DELETE CASCADE NOT NULL,
  patient_user_id uuid NOT NULL,
  status text DEFAULT 'active',
  started_at date DEFAULT CURRENT_DATE,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.coach_patients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coaches can manage own patients" ON public.coach_patients
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.coach_profiles WHERE id = coach_patients.coach_id AND user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.coach_profiles WHERE id = coach_patients.coach_id AND user_id = auth.uid()));

CREATE POLICY "Patients can view own coach link" ON public.coach_patients
  FOR SELECT TO authenticated
  USING (auth.uid() = patient_user_id);

-- Coach alerts
CREATE TABLE public.coach_alerts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id uuid REFERENCES public.coach_profiles(id) ON DELETE CASCADE NOT NULL,
  patient_user_id uuid NOT NULL,
  alert_type text NOT NULL,
  message text NOT NULL,
  severity text DEFAULT 'medium',
  resolved boolean DEFAULT false,
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.coach_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coaches can manage own alerts" ON public.coach_alerts
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.coach_profiles WHERE id = coach_alerts.coach_id AND user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.coach_profiles WHERE id = coach_alerts.coach_id AND user_id = auth.uid()));

-- Coach messages
CREATE TABLE public.coach_messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id uuid REFERENCES public.coach_profiles(id) ON DELETE CASCADE NOT NULL,
  patient_user_id uuid NOT NULL,
  sender text NOT NULL DEFAULT 'coach',
  message text NOT NULL,
  read boolean DEFAULT false,
  attachment_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.coach_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coaches can manage own messages" ON public.coach_messages
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.coach_profiles WHERE id = coach_messages.coach_id AND user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.coach_profiles WHERE id = coach_messages.coach_id AND user_id = auth.uid()));

CREATE POLICY "Patients can manage own coach messages" ON public.coach_messages
  FOR ALL TO authenticated
  USING (auth.uid() = patient_user_id)
  WITH CHECK (auth.uid() = patient_user_id);

-- Coach reports
CREATE TABLE public.coach_reports (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id uuid REFERENCES public.coach_profiles(id) ON DELETE CASCADE NOT NULL,
  patient_user_id uuid NOT NULL,
  report_period text,
  report_data jsonb DEFAULT '{}'::jsonb,
  report_url text,
  ai_summary text,
  coach_message text,
  sent_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.coach_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coaches can manage own reports" ON public.coach_reports
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.coach_profiles WHERE id = coach_reports.coach_id AND user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.coach_profiles WHERE id = coach_reports.coach_id AND user_id = auth.uid()));

CREATE POLICY "Patients can view own reports" ON public.coach_reports
  FOR SELECT TO authenticated
  USING (auth.uid() = patient_user_id);

-- Marketplace protocols (future)
CREATE TABLE public.marketplace_protocols (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id uuid REFERENCES public.coach_profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  price numeric DEFAULT 0,
  duration_days int DEFAULT 30,
  protocol_data jsonb DEFAULT '{}'::jsonb,
  status text DEFAULT 'draft',
  purchases_count int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.marketplace_protocols ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coaches can manage own marketplace protocols" ON public.marketplace_protocols
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.coach_profiles WHERE id = marketplace_protocols.coach_id AND user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.coach_profiles WHERE id = marketplace_protocols.coach_id AND user_id = auth.uid()));

CREATE POLICY "Anyone can view published protocols" ON public.marketplace_protocols
  FOR SELECT TO authenticated
  USING (status = 'published');

-- Add coach_profile_id to profiles for patient linking
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS coach_profile_id uuid REFERENCES public.coach_profiles(id);

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.coach_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.coach_alerts;
