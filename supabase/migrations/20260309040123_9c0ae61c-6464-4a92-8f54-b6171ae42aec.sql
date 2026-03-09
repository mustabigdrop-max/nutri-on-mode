-- ============================================
-- PLANO ACOMPANHADO R$197 - DATABASE SCHEMA
-- ============================================

-- 1. Coach Briefings - Weekly AI briefings for coaches
CREATE TABLE public.coach_briefings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL,
  patient_id UUID NOT NULL,
  week_start DATE NOT NULL,
  briefing_data JSONB DEFAULT '{}'::jsonb,
  ai_analysis TEXT,
  suggested_questions JSONB DEFAULT '[]'::jsonb,
  suggested_adjustments JSONB DEFAULT '[]'::jsonb,
  recommended_tone TEXT DEFAULT 'motivacional',
  risk_level TEXT DEFAULT 'low',
  positive_highlights JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'pending',
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.coach_briefings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coaches can view own briefings" ON public.coach_briefings
  FOR SELECT USING (auth.uid() = coach_id);

CREATE POLICY "Coaches can update own briefings" ON public.coach_briefings
  FOR UPDATE USING (auth.uid() = coach_id);

CREATE POLICY "Service can insert briefings" ON public.coach_briefings
  FOR INSERT WITH CHECK (auth.uid() = coach_id);

CREATE INDEX idx_briefings_coach ON public.coach_briefings(coach_id, week_start DESC);
CREATE INDEX idx_briefings_patient ON public.coach_briefings(patient_id, week_start DESC);

-- 2. Abandonment Risk Scores - Daily risk assessment
CREATE TABLE public.abandonment_risk_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  score_date DATE DEFAULT CURRENT_DATE,
  risk_score INTEGER DEFAULT 0,
  risk_level TEXT DEFAULT 'low',
  active_signals JSONB DEFAULT '[]'::jsonb,
  signal_details JSONB DEFAULT '{}'::jsonb,
  coach_notified BOOLEAN DEFAULT false,
  ai_action_taken BOOLEAN DEFAULT false,
  ai_message_sent TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, score_date)
);

ALTER TABLE public.abandonment_risk_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own risk scores" ON public.abandonment_risk_scores
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Coaches can view patient risk scores" ON public.abandonment_risk_scores
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM professional_patients
      WHERE professional_id = auth.uid()
        AND patient_id = abandonment_risk_scores.user_id
        AND status = 'active'
    )
  );

CREATE INDEX idx_risk_user_date ON public.abandonment_risk_scores(user_id, score_date DESC);
CREATE INDEX idx_risk_level ON public.abandonment_risk_scores(risk_level, score_date DESC);

-- 3. Plan Revisions - 14-day plan revision proposals
CREATE TABLE public.plan_revisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  coach_id UUID,
  revision_date DATE DEFAULT CURRENT_DATE,
  analysis_period_start DATE,
  analysis_period_end DATE,
  proposed_changes JSONB DEFAULT '[]'::jsonb,
  analysis_summary TEXT,
  impact_summary JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'pending',
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.plan_revisions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own revisions" ON public.plan_revisions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Coaches can manage patient revisions" ON public.plan_revisions
  FOR ALL USING (
    auth.uid() = coach_id OR
    EXISTS (
      SELECT 1 FROM professional_patients
      WHERE professional_id = auth.uid()
        AND patient_id = plan_revisions.user_id
        AND status = 'active'
    )
  );

CREATE INDEX idx_revisions_user ON public.plan_revisions(user_id, revision_date DESC);
CREATE INDEX idx_revisions_status ON public.plan_revisions(status, revision_date DESC);

-- 4. Voice Check-ins - Voice recording transcriptions
CREATE TABLE public.voice_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  meal_log_id UUID REFERENCES public.meal_logs(id) ON DELETE SET NULL,
  audio_url TEXT,
  audio_duration INTEGER,
  transcription TEXT,
  extracted_foods JSONB DEFAULT '[]'::jsonb,
  extracted_mood TEXT,
  extracted_context TEXT,
  confirmed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.voice_checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own voice checkins" ON public.voice_checkins
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Coaches can view patient voice checkins" ON public.voice_checkins
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM professional_patients
      WHERE professional_id = auth.uid()
        AND patient_id = voice_checkins.user_id
        AND status = 'active'
    )
  );

CREATE INDEX idx_voice_user ON public.voice_checkins(user_id, created_at DESC);

-- 5. Add transformation card fields to monthly_reports
ALTER TABLE public.monthly_reports 
ADD COLUMN IF NOT EXISTS share_card_data JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS share_card_generated BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS motivational_quote TEXT;