CREATE TABLE public.training_exercise_overrides (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references auth.users(id) on delete cascade,
  protocol_id uuid not null references public.training_protocols(id) on delete cascade,
  week_number int not null check (week_number between 1 and 52),
  day_number int not null check (day_number between 1 and 14),
  exercise_name text not null,
  action text not null default 'edit' check (action in ('edit','replace','add','remove')),
  new_exercise_name text,
  sets text,
  reps text,
  rpe text,
  rir text,
  rest text,
  coach_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (protocol_id, week_number, day_number, exercise_name)
);

CREATE INDEX idx_teo_protocol_week ON public.training_exercise_overrides (protocol_id, week_number);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.training_exercise_overrides TO authenticated;
GRANT ALL ON public.training_exercise_overrides TO service_role;
ALTER TABLE public.training_exercise_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "coach manages own overrides" ON public.training_exercise_overrides
  FOR ALL TO authenticated
  USING (coach_id = auth.uid())
  WITH CHECK (coach_id = auth.uid() AND EXISTS (
    SELECT 1 FROM public.training_protocols tp WHERE tp.id = protocol_id AND tp.user_id = auth.uid()
  ));

CREATE POLICY "athlete reads own protocol overrides" ON public.training_exercise_overrides
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.training_protocols tp
    WHERE tp.id = protocol_id AND tp.patient_user_id = auth.uid()
  ));

CREATE TABLE public.training_week_overrides (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references auth.users(id) on delete cascade,
  protocol_id uuid not null references public.training_protocols(id) on delete cascade,
  week_number int not null check (week_number between 1 and 52),
  forced_deload boolean not null default false,
  coach_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (protocol_id, week_number)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.training_week_overrides TO authenticated;
GRANT ALL ON public.training_week_overrides TO service_role;
ALTER TABLE public.training_week_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "coach manages own week overrides" ON public.training_week_overrides
  FOR ALL TO authenticated
  USING (coach_id = auth.uid())
  WITH CHECK (coach_id = auth.uid() AND EXISTS (
    SELECT 1 FROM public.training_protocols tp WHERE tp.id = protocol_id AND tp.user_id = auth.uid()
  ));

CREATE POLICY "athlete reads own week overrides" ON public.training_week_overrides
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.training_protocols tp
    WHERE tp.id = protocol_id AND tp.patient_user_id = auth.uid()
  ));

CREATE TRIGGER trg_teo_updated BEFORE UPDATE ON public.training_exercise_overrides
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_two_updated BEFORE UPDATE ON public.training_week_overrides
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();