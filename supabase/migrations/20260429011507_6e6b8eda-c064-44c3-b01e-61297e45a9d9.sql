-- Tabela de sincronização TrainingON ↔ NutriON
CREATE TABLE public.training_nutrition_sync (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  training_phase TEXT,
  training_days JSONB,
  volume_sets_semana INTEGER,
  musculos_prioritarios TEXT[],
  sistema_treino TEXT,
  tempo_sessao_min INTEGER,
  tipo_fibra TEXT,
  stratum_fase TEXT,
  cardio_mesmo_dia BOOLEAN DEFAULT false,
  intensidade_treino TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index para lookup rápido por usuário
CREATE INDEX idx_training_nutrition_sync_user ON public.training_nutrition_sync(user_id);

-- RLS
ALTER TABLE public.training_nutrition_sync ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own training sync"
ON public.training_nutrition_sync
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own training sync"
ON public.training_nutrition_sync
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own training sync"
ON public.training_nutrition_sync
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own training sync"
ON public.training_nutrition_sync
FOR DELETE
USING (auth.uid() = user_id);

-- Trigger para updated_at automático
CREATE TRIGGER update_training_nutrition_sync_updated_at
BEFORE UPDATE ON public.training_nutrition_sync
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();