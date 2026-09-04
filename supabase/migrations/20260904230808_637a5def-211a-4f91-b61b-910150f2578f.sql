CREATE TABLE public.exercise_library (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID NOT NULL DEFAULT auth.uid(),
  exercicio TEXT NOT NULL,
  padrao TEXT,
  source TEXT DEFAULT 'overlay',
  notes TEXT,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  times_used INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.exercise_library TO authenticated;
GRANT ALL ON public.exercise_library TO service_role;

ALTER TABLE public.exercise_library ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coaches manage their own exercise library"
ON public.exercise_library FOR ALL TO authenticated
USING (coach_id = auth.uid())
WITH CHECK (coach_id = auth.uid());

CREATE INDEX idx_exercise_library_coach ON public.exercise_library (coach_id, created_at DESC);

CREATE TRIGGER trg_exercise_library_updated_at
BEFORE UPDATE ON public.exercise_library
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();