
-- Exercises library table
CREATE TABLE public.exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  grupo_muscular text NOT NULL,
  subgrupo_especifico text NOT NULL,
  equipamento text DEFAULT 'livre',
  musculo_primario text NOT NULL,
  musculos_secundarios text[] DEFAULT '{}',
  dificuldade text DEFAULT 'intermediario',
  execucao_texto text,
  erros_comuns text[] DEFAULT '{}',
  dicas_biomecanica text,
  variacoes text[] DEFAULT '{}',
  fases_recomendadas text[] DEFAULT '{bulking,cutting,manutencao}',
  emg_activation jsonb DEFAULT '{}',
  prioridade integer DEFAULT 2,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone authenticated can read exercises" ON public.exercises FOR SELECT TO authenticated USING (true);

-- Workout diary table
CREATE TABLE public.workout_diary (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  data date NOT NULL DEFAULT CURRENT_DATE,
  split_dia text,
  duracao_minutos integer,
  volume_total numeric DEFAULT 0,
  series_total integer DEFAULT 0,
  reps_total integer DEFAULT 0,
  avaliacao_subjetiva integer,
  notas text,
  humor_pre text,
  energia_durante integer,
  fadiga_pos integer,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.workout_diary ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own workout diary" ON public.workout_diary FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Exercise sets within diary
CREATE TABLE public.exercise_sets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  diary_id uuid REFERENCES public.workout_diary(id) ON DELETE CASCADE NOT NULL,
  exercise_id uuid REFERENCES public.exercises(id) ON DELETE SET NULL,
  exercise_name text NOT NULL,
  serie_numero integer NOT NULL DEFAULT 1,
  peso numeric,
  reps integer,
  rir integer,
  tecnica_especial text,
  tempo_descanso integer,
  concluida boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.exercise_sets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own exercise sets" ON public.exercise_sets FOR ALL TO authenticated 
  USING (EXISTS (SELECT 1 FROM public.workout_diary WHERE id = exercise_sets.diary_id AND user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.workout_diary WHERE id = exercise_sets.diary_id AND user_id = auth.uid()));

-- Personal records
CREATE TABLE public.personal_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  exercise_name text NOT NULL,
  peso_maximo numeric,
  reps_com_peso integer,
  volume_serie numeric,
  data date DEFAULT CURRENT_DATE,
  notas text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.personal_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own PRs" ON public.personal_records FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Workout templates
CREATE TABLE public.workout_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  nome text NOT NULL,
  split_tipo text,
  fase text DEFAULT 'manutencao',
  exercicios jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.workout_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own templates" ON public.workout_templates FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
