
-- Perfil metabólico do usuário
CREATE TABLE public.user_metabolic_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  weight DECIMAL,
  height DECIMAL,
  age INTEGER,
  sex VARCHAR(10),
  body_fat_percent DECIMAL,
  lean_mass DECIMAL,
  tdee INTEGER,
  goal VARCHAR(30),
  activity_level VARCHAR(20),
  train_time VARCHAR(20),
  does_aej BOOLEAN DEFAULT false,
  post_cardio BOOLEAN DEFAULT false,
  restrictions TEXT[] DEFAULT '{}',
  health_conditions TEXT[] DEFAULT '{}',
  budget_level VARCHAR(10) DEFAULT 'medio',
  pca_profile VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_metabolic_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own metabolic profile"
  ON public.user_metabolic_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own metabolic profile"
  ON public.user_metabolic_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own metabolic profile"
  ON public.user_metabolic_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own metabolic profile"
  ON public.user_metabolic_profiles FOR DELETE
  USING (auth.uid() = user_id);

-- Histórico de conversas do MetabolicON
CREATE TABLE public.metabolicon_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  message TEXT NOT NULL,
  response TEXT NOT NULL,
  ai_source VARCHAR(20) DEFAULT 'claude',
  route VARCHAR(20) DEFAULT 'claude',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.metabolicon_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own metabolicon conversations"
  ON public.metabolicon_conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own metabolicon conversations"
  ON public.metabolicon_conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);
