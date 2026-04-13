
-- Protocolos gerados
CREATE TABLE public.training_protocols (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  client_name text,
  phase text,
  muscles text[],
  level text,
  weeks text,
  days_per_week text,
  equipment text,
  injuries text,
  session_duration text,
  protocol_text text,
  anatomy_text text,
  tecnica_text text,
  periodizacao_text text,
  volume_landmarks jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.training_protocols ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_protocols" ON public.training_protocols
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Progressão de cargas do cliente
CREATE TABLE public.training_progress (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  protocol_id uuid REFERENCES public.training_protocols ON DELETE CASCADE,
  client_name text,
  week_number int,
  exercise text,
  sets_done int,
  reps_done int,
  weight_kg numeric,
  rpe_real numeric,
  notes text,
  logged_at timestamptz DEFAULT now()
);

ALTER TABLE public.training_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_progress" ON public.training_progress
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Templates salvos pelo coach
CREATE TABLE public.training_templates (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  template_name text,
  phase text,
  muscles text[],
  level text,
  weeks text,
  days_per_week text,
  equipment text,
  protocol_text text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.training_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_templates" ON public.training_templates
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
