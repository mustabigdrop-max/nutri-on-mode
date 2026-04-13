
-- Cache de análises científicas
CREATE TABLE public.science_cache (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  cache_key text UNIQUE NOT NULL,
  query text NOT NULL,
  perplexity_raw text,
  claude_formatted text,
  citations jsonb,
  module text,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '7 days')
);
CREATE INDEX idx_science_cache_key ON public.science_cache(cache_key);
CREATE INDEX idx_science_cache_expires ON public.science_cache(expires_at);

-- Estudos salvos pelo coach
CREATE TABLE public.saved_studies (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  title text,
  authors text,
  year int,
  journal text,
  finding text,
  practical_implication text,
  url text,
  muscle_tags text[],
  exercise_tags text[],
  topic_tags text[],
  saved_at timestamptz DEFAULT now()
);
ALTER TABLE public.saved_studies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_saved_studies" ON public.saved_studies FOR ALL USING (auth.uid() = user_id);

-- Feed de novidades científicas
CREATE TABLE public.science_feed (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  week_reference text,
  topic text,
  summary text,
  full_content text,
  citations jsonb,
  category text,
  relevance_score int,
  created_at timestamptz DEFAULT now()
);

-- Histórico Dr. Evidence
CREATE TABLE public.dr_evidence_history (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  question text,
  perplexity_raw text,
  claude_answer text,
  citations jsonb,
  context_tags text[],
  asked_at timestamptz DEFAULT now()
);
ALTER TABLE public.dr_evidence_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_dr_evidence" ON public.dr_evidence_history FOR ALL USING (auth.uid() = user_id);

-- Análises de suplementos (cache)
CREATE TABLE public.supplement_analyses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  supplement_name text UNIQUE,
  analysis_text text,
  citations jsonb,
  evidence_level text,
  last_updated timestamptz DEFAULT now()
);

-- Biblioteca de exercícios biomecânicos
CREATE TABLE public.biomechanics_exercises (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  exercise_name text NOT NULL,
  muscle_group text NOT NULL,
  muscles_primary text[],
  muscles_secondary text[],
  muscles_stabilizer text[],
  movement_pattern text,
  plane_of_motion text,
  joint_actions text[],
  anatomy_text text,
  biomechanics_text text,
  recruitment_text text,
  execution_text text,
  science_text text,
  perplexity_citations jsonb,
  youtube_url text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.biomechanics_exercises ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_biomechanics" ON public.biomechanics_exercises FOR ALL USING (auth.uid() = user_id);
