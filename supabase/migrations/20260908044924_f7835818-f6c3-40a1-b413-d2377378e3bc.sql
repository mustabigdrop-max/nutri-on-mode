CREATE TABLE public.exercise_guides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_key text NOT NULL UNIQUE,
  exercise_name text NOT NULL,
  guide jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.exercise_guides TO authenticated;
GRANT ALL ON public.exercise_guides TO service_role;

ALTER TABLE public.exercise_guides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read exercise guides"
  ON public.exercise_guides FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can cache exercise guides"
  ON public.exercise_guides FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can refresh exercise guides"
  ON public.exercise_guides FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE TRIGGER update_exercise_guides_updated_at
  BEFORE UPDATE ON public.exercise_guides
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.exercise_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  coach_user_id uuid,
  exercise_name text NOT NULL,
  day_label text,
  question text NOT NULL,
  answer text,
  status text NOT NULL DEFAULT 'aberta',
  answered_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_exercise_questions_user ON public.exercise_questions(user_id, created_at DESC);
CREATE INDEX idx_exercise_questions_coach ON public.exercise_questions(coach_user_id, status);

GRANT SELECT, INSERT, UPDATE ON public.exercise_questions TO authenticated;
GRANT ALL ON public.exercise_questions TO service_role;

ALTER TABLE public.exercise_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients read own exercise questions"
  ON public.exercise_questions FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR auth.uid() = coach_user_id OR public.is_coach_of_patient(auth.uid(), user_id));

CREATE POLICY "Clients create own exercise questions"
  ON public.exercise_questions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Client or coach update exercise questions"
  ON public.exercise_questions FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR auth.uid() = coach_user_id OR public.is_coach_of_patient(auth.uid(), user_id))
  WITH CHECK (auth.uid() = user_id OR auth.uid() = coach_user_id OR public.is_coach_of_patient(auth.uid(), user_id));

CREATE TRIGGER update_exercise_questions_updated_at
  BEFORE UPDATE ON public.exercise_questions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();