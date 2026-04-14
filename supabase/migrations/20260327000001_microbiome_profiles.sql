-- Microbioma: persiste quiz, histórico e recomendações
CREATE TABLE public.microbiome_profiles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  assessed_at timestamptz DEFAULT now(),

  -- Bristol Scale
  stool_type integer CHECK (stool_type BETWEEN 1 AND 7),

  -- Respostas do quiz (6 questões)
  answers jsonb DEFAULT '{}'::jsonb,
  -- ex: {"bloating":"often","gas":"sometimes","fiber":"low","fermented":"never","antibiotics":"yes","stress":"high"}

  -- Scores calculados (0-100)
  diversity_score integer,
  barrier_score integer,
  inflammation_score integer,
  motility_score integer,
  overall_score integer,

  -- Recomendações geradas
  recommendations text[],

  -- Notas adicionais
  notes text,

  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.microbiome_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own microbiome profiles"
  ON public.microbiome_profiles FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Índice para histórico por data
CREATE INDEX idx_microbiome_user_date ON public.microbiome_profiles (user_id, assessed_at DESC);
