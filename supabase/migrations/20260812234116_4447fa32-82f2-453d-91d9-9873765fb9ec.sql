CREATE TABLE IF NOT EXISTS public.sent_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL,
  athlete_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('meal_plan','training_plan')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','archived','draft')),
  plan_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  coach_message TEXT NOT NULL DEFAULT '',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.sent_plans TO authenticated;
GRANT ALL ON public.sent_plans TO service_role;

ALTER TABLE public.sent_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coach manages own sent plans" ON public.sent_plans
  FOR ALL TO authenticated
  USING (auth.uid() = coach_id) WITH CHECK (auth.uid() = coach_id);

CREATE POLICY "Athlete reads own sent plans" ON public.sent_plans
  FOR SELECT TO authenticated
  USING (auth.uid() = athlete_id);

CREATE INDEX IF NOT EXISTS idx_sent_plans_athlete ON public.sent_plans(athlete_id, type, status);
CREATE INDEX IF NOT EXISTS idx_sent_plans_coach ON public.sent_plans(coach_id, created_at DESC);

CREATE TRIGGER trg_sent_plans_updated_at
  BEFORE UPDATE ON public.sent_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.archive_previous_sent_plan()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'active' THEN
    UPDATE public.sent_plans
    SET status = 'archived', updated_at = now()
    WHERE athlete_id = NEW.athlete_id
      AND type = NEW.type
      AND status = 'active'
      AND id <> NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER auto_archive_sent_plan
  AFTER INSERT ON public.sent_plans
  FOR EACH ROW EXECUTE FUNCTION public.archive_previous_sent_plan();

ALTER PUBLICATION supabase_realtime ADD TABLE public.sent_plans;