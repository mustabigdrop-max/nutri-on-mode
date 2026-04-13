
-- GutON Assessments
CREATE TABLE public.guton_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  pattern TEXT,
  symptoms TEXT[] DEFAULT '{}',
  stress_level TEXT,
  sleep_quality TEXT,
  antibiotic_last_year BOOLEAN DEFAULT false,
  bristol_score INTEGER,
  bloating_frequency TEXT,
  foods_trigger TEXT[] DEFAULT '{}',
  notes TEXT,
  assessed_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.guton_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own guton_assessments"
ON public.guton_assessments FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- GutON Protocols
CREATE TABLE public.guton_protocols (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  pattern TEXT,
  phase INTEGER DEFAULT 1,
  week_number INTEGER DEFAULT 1,
  protocol_text TEXT,
  foods_allowed TEXT[] DEFAULT '{}',
  foods_restricted TEXT[] DEFAULT '{}',
  supplements JSONB DEFAULT '[]',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  target_end_at TIMESTAMPTZ
);

ALTER TABLE public.guton_protocols ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own guton_protocols"
ON public.guton_protocols FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- GutON Symptom Log
CREATE TABLE public.guton_symptom_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  bloating INTEGER,
  pain INTEGER,
  energy INTEGER,
  mood INTEGER,
  bristol INTEGER,
  evacuations INTEGER,
  notes TEXT
);

ALTER TABLE public.guton_symptom_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own guton_symptom_log"
ON public.guton_symptom_log FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- GutON Conversations
CREATE TABLE public.guton_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  message TEXT NOT NULL,
  response TEXT NOT NULL,
  ai_source TEXT DEFAULT 'gateway',
  pattern_detected TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.guton_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own guton_conversations"
ON public.guton_conversations FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
