CREATE TABLE IF NOT EXISTS public.vera_anamnese (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id UUID NOT NULL,
  coach_id UUID NOT NULL,

  -- Ciclo
  dia_ciclo_atual INTEGER,
  fase_atual TEXT,
  ciclo_regular BOOLEAN,
  duracao_ciclo INTEGER DEFAULT 28,

  -- Anticoncepcional
  usa_anticoncepcional BOOLEAN DEFAULT false,
  tipo_anticoncepcional TEXT,
  anticoncepcional_nome TEXT,

  -- Histórico
  historico_dieta_restritiva BOOLEAN DEFAULT false,
  anos_restricao INTEGER,
  gestacao_recente BOOLEAN DEFAULT false,
  meses_pos_parto INTEGER,
  menopausa BOOLEAN DEFAULT false,
  perimenopausa BOOLEAN DEFAULT false,
  historico_ta BOOLEAN DEFAULT false,

  -- Farmacologia
  usa_eaa BOOLEAN DEFAULT false,
  compostos_em_uso TEXT,
  ciclos_anteriores INTEGER DEFAULT 0,

  -- Objetivo
  objetivo_principal TEXT,
  categoria_competicao TEXT,
  pontos_fracos TEXT,
  lesoes TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_vera_anamnese_coach ON public.vera_anamnese(coach_id);
CREATE INDEX IF NOT EXISTS idx_vera_anamnese_athlete ON public.vera_anamnese(athlete_id);

ALTER TABLE public.vera_anamnese ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coach manages own VERA anamneses"
  ON public.vera_anamnese
  FOR ALL
  TO authenticated
  USING (auth.uid() = coach_id)
  WITH CHECK (auth.uid() = coach_id);

CREATE POLICY "Athlete views own VERA anamnese"
  ON public.vera_anamnese
  FOR SELECT
  TO authenticated
  USING (auth.uid() = athlete_id);

CREATE TRIGGER trg_vera_anamnese_updated_at
  BEFORE UPDATE ON public.vera_anamnese
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();