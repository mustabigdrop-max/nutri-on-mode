CREATE TABLE public.exercise_video_mappings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id uuid NOT NULL,
  exercise_name_pt text NOT NULL,
  exercise_key text NOT NULL,
  exercise_name_en text,
  exercisedb_id text,
  gif_url text,
  custom_video_url text,
  verified boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (coach_id, exercise_key)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.exercise_video_mappings TO authenticated;
GRANT ALL ON public.exercise_video_mappings TO service_role;

ALTER TABLE public.exercise_video_mappings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coaches manage own exercise video mappings"
ON public.exercise_video_mappings FOR ALL TO authenticated
USING (auth.uid() = coach_id)
WITH CHECK (auth.uid() = coach_id);

CREATE POLICY "Authenticated can read verified mappings"
ON public.exercise_video_mappings FOR SELECT TO authenticated
USING (verified = true);

CREATE INDEX idx_evm_key ON public.exercise_video_mappings (exercise_key);

CREATE TRIGGER update_exercise_video_mappings_updated_at
BEFORE UPDATE ON public.exercise_video_mappings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();