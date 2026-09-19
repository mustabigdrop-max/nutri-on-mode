CREATE TABLE public.apex_functional_checklists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id uuid NOT NULL,
  athlete_id uuid NOT NULL REFERENCES public.competition_athletes(id) ON DELETE CASCADE,
  grupo_key text NOT NULL,
  respostas jsonb NOT NULL DEFAULT '{}'::jsonb,
  visual_score numeric,
  observacoes text,
  avaliado_em date NOT NULL DEFAULT (now())::date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.apex_functional_checklists TO authenticated;
GRANT ALL ON public.apex_functional_checklists TO service_role;
ALTER TABLE public.apex_functional_checklists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "coach manages own functional checklists"
ON public.apex_functional_checklists FOR ALL TO authenticated
USING (coach_id = auth.uid())
WITH CHECK (coach_id = auth.uid());

CREATE POLICY "athlete reads own functional checklists"
ON public.apex_functional_checklists FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.competition_athletes ca
  WHERE ca.id = apex_functional_checklists.athlete_id
    AND ca.patient_user_id = auth.uid()
));

CREATE INDEX apex_functional_checklists_athlete_idx
  ON public.apex_functional_checklists (athlete_id, grupo_key, avaliado_em DESC);

CREATE TRIGGER apex_functional_checklists_updated_at
BEFORE UPDATE ON public.apex_functional_checklists
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.apex_deficit_diagnoses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id uuid NOT NULL,
  athlete_id uuid NOT NULL REFERENCES public.competition_athletes(id) ON DELETE CASCADE,
  avaliado_em date NOT NULL DEFAULT (now())::date,
  grupos jsonb NOT NULL DEFAULT '[]'::jsonb,
  prioridades jsonb NOT NULL DEFAULT '[]'::jsonb,
  encaminhamentos jsonb NOT NULL DEFAULT '[]'::jsonb,
  proxima_reavaliacao jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.apex_deficit_diagnoses TO authenticated;
GRANT ALL ON public.apex_deficit_diagnoses TO service_role;
ALTER TABLE public.apex_deficit_diagnoses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "coach manages own deficit diagnoses"
ON public.apex_deficit_diagnoses FOR ALL TO authenticated
USING (coach_id = auth.uid())
WITH CHECK (coach_id = auth.uid());

CREATE POLICY "athlete reads own deficit diagnoses"
ON public.apex_deficit_diagnoses FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.competition_athletes ca
  WHERE ca.id = apex_deficit_diagnoses.athlete_id
    AND ca.patient_user_id = auth.uid()
));

CREATE INDEX apex_deficit_diagnoses_athlete_idx
  ON public.apex_deficit_diagnoses (athlete_id, avaliado_em DESC);