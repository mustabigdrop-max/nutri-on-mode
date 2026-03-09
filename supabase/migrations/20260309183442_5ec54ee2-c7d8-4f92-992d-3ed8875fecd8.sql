
CREATE TABLE public.supplement_stacks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  goal text,
  budget_tier text DEFAULT 'essencial',
  supplements jsonb DEFAULT '[]'::jsonb,
  current_supplements text[] DEFAULT '{}',
  health_conditions text[] DEFAULT '{}',
  dietary_restrictions text[] DEFAULT '{}',
  ai_summary text,
  ai_generated boolean DEFAULT true,
  active boolean DEFAULT true,
  monthly_cost numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.supplement_stacks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own supplement stacks"
  ON public.supplement_stacks FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.supplement_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  log_date date DEFAULT CURRENT_DATE,
  supplement_name text NOT NULL,
  taken_at timestamptz DEFAULT now(),
  skipped boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.supplement_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own supplement logs"
  ON public.supplement_logs FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
