
CREATE TABLE IF NOT EXISTS public.exercise_cues (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_id     UUID REFERENCES public.exercises(id) ON DELETE CASCADE,
  fase            TEXT,
  cue_texto       TEXT NOT NULL,
  cue_tipo        TEXT,
  musculo_alvo    TEXT,
  problema_comum  TEXT,
  solucao         TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.workout_sets_detail (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  diary_id        UUID REFERENCES public.workout_diary(id) ON DELETE CASCADE,
  exercise_id     UUID REFERENCES public.exercises(id) ON DELETE SET NULL,
  set_type        TEXT NOT NULL DEFAULT 'work',
  set_number      INTEGER DEFAULT 1,
  carga           DECIMAL,
  percentual_top  INTEGER,
  reps_alvo       INTEGER,
  reps_realizadas INTEGER,
  rir_alvo        INTEGER,
  rir_real        INTEGER,
  tempo_execucao  TEXT,
  tempo_descanso  INTEGER,
  tecnica_especial TEXT,
  onde_sentiu     TEXT,
  qualidade       INTEGER,
  notas           TEXT,
  concluida       BOOLEAN DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.workout_feedback (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  diary_id        UUID REFERENCES public.workout_diary(id) ON DELETE CASCADE,
  exercise_id     UUID REFERENCES public.exercises(id) ON DELETE SET NULL,
  set_id          UUID REFERENCES public.workout_sets_detail(id) ON DELETE CASCADE,
  musculo_correto BOOLEAN,
  qualidade_contracao INTEGER,
  rir_real        INTEGER,
  problemas       TEXT[],
  notas           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.progression_log (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL,
  exercise_id     UUID REFERENCES public.exercises(id) ON DELETE SET NULL,
  data            DATE DEFAULT CURRENT_DATE,
  carga_atual     DECIMAL,
  reps_atual      INTEGER,
  volume_serie    DECIMAL,
  rir_medio       DECIMAL,
  sugestao_ia     TEXT,
  acao_tomada     TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.exercise_cues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sets_detail ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progression_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Exercise cues public read"
  ON public.exercise_cues FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "User workout sets detail"
  ON public.workout_sets_detail FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.workout_diary
      WHERE workout_diary.id = workout_sets_detail.diary_id
      AND workout_diary.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.workout_diary
      WHERE workout_diary.id = workout_sets_detail.diary_id
      AND workout_diary.user_id = auth.uid()
    )
  );

CREATE POLICY "User workout feedback"
  ON public.workout_feedback FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.workout_diary
      WHERE workout_diary.id = workout_feedback.diary_id
      AND workout_diary.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.workout_diary
      WHERE workout_diary.id = workout_feedback.diary_id
      AND workout_diary.user_id = auth.uid()
    )
  );

CREATE POLICY "User progression log"
  ON public.progression_log FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
