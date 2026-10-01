CREATE TABLE public.training_cycle_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_user_id uuid NOT NULL UNIQUE,
  pattern text NOT NULL DEFAULT 'semana',
  custom_sequence text[] ,
  start_date date NOT NULL DEFAULT CURRENT_DATE,
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.training_cycle_configs TO authenticated;
GRANT ALL ON public.training_cycle_configs TO service_role;
ALTER TABLE public.training_cycle_configs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cycle cfg access" ON public.training_cycle_configs FOR ALL TO authenticated
USING (athlete_user_id = auth.uid() OR public.is_coach_of_patient(auth.uid(), athlete_user_id) OR public.has_role(auth.uid(),'admin'))
WITH CHECK (athlete_user_id = auth.uid() OR public.is_coach_of_patient(auth.uid(), athlete_user_id) OR public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_cycle_cfg_updated BEFORE UPDATE ON public.training_cycle_configs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.training_cycle_adjustments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_user_id uuid NOT NULL,
  adjust_date date NOT NULL,
  kind text NOT NULL CHECK (kind IN ('folga_extra','treino_adiantado')),
  note text,
  created_by uuid NOT NULL DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (athlete_user_id, adjust_date)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.training_cycle_adjustments TO authenticated;
GRANT ALL ON public.training_cycle_adjustments TO service_role;
ALTER TABLE public.training_cycle_adjustments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cycle adj access" ON public.training_cycle_adjustments FOR ALL TO authenticated
USING (athlete_user_id = auth.uid() OR public.is_coach_of_patient(auth.uid(), athlete_user_id) OR public.has_role(auth.uid(),'admin'))
WITH CHECK (athlete_user_id = auth.uid() OR public.is_coach_of_patient(auth.uid(), athlete_user_id) OR public.has_role(auth.uid(),'admin'));