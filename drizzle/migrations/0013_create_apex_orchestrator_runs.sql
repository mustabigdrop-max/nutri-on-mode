CREATE TABLE public.apex_orchestrator_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id uuid NOT NULL,
  patient_user_id uuid,
  coach_user_id uuid NOT NULL,
  coach_profile_id uuid,
  visual_assessment_id uuid,
  trigger_source text NOT NULL DEFAULT 'fotos_uploaded',
  status text NOT NULL DEFAULT 'waiting_checklist',
  flagged_groups text[] NOT NULL DEFAULT '{}',
  checklist_mode text NOT NULL DEFAULT 'pending',
  checklist_results jsonb NOT NULL DEFAULT '[]'::jsonb,
  visual_report jsonb NOT NULL DEFAULT '{}'::jsonb,
  diagnostico jsonb NOT NULL DEFAULT '{}'::jsonb,
  protocolos_ativos jsonb NOT NULL DEFAULT '[]'::jsonb,
  plano_treino jsonb NOT NULL DEFAULT '{}'::jsonb,
  nutriplan_sync jsonb NOT NULL DEFAULT '[]'::jsonb,
  evolution_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  gamification_updates jsonb NOT NULL DEFAULT '{}'::jsonb,
  praxis_messages jsonb NOT NULL DEFAULT '[]'::jsonb,
  coach_report jsonb NOT NULL DEFAULT '{}'::jsonb,
  execution_log jsonb NOT NULL DEFAULT '[]'::jsonb,
  approved_at timestamptz,
  approved_by uuid,
  published_at timestamptz,
  published_reference jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT apex_orchestrator_status_check CHECK (status IN ('waiting_checklist','partial_ready','ready_for_approval','approved','published','error')),
  CONSTRAINT apex_orchestrator_trigger_check CHECK (trigger_source IN ('fotos_uploaded','coach_reassessment','adaptive_reassessment')),
  CONSTRAINT apex_orchestrator_checklist_mode_check CHECK (checklist_mode IN ('pending','fresh','reused','skipped'))
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.apex_orchestrator_runs TO authenticated;
GRANT ALL ON public.apex_orchestrator_runs TO service_role;

ALTER TABLE public.apex_orchestrator_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coaches manage own APEX orchestrations"
ON public.apex_orchestrator_runs
FOR ALL
TO authenticated
USING (
  coach_user_id = auth.uid()
  OR public.has_role(auth.uid(), 'admin'::public.app_role)
)
WITH CHECK (
  coach_user_id = auth.uid()
  OR public.has_role(auth.uid(), 'admin'::public.app_role)
);

CREATE POLICY "Athletes read own APEX orchestrations"
ON public.apex_orchestrator_runs
FOR SELECT
TO authenticated
USING (
  patient_user_id = auth.uid()
  OR EXISTS (
    SELECT 1
    FROM public.competition_athletes ca
    WHERE ca.id = apex_orchestrator_runs.athlete_id
      AND ca.patient_user_id = auth.uid()
  )
  OR public.has_role(auth.uid(), 'admin'::public.app_role)
);

CREATE INDEX idx_apex_orchestrator_runs_athlete_created
ON public.apex_orchestrator_runs (athlete_id, created_at DESC);

CREATE INDEX idx_apex_orchestrator_runs_coach_status
ON public.apex_orchestrator_runs (coach_user_id, status, created_at DESC);

CREATE TRIGGER trg_apex_orchestrator_runs_updated_at
BEFORE UPDATE ON public.apex_orchestrator_runs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();