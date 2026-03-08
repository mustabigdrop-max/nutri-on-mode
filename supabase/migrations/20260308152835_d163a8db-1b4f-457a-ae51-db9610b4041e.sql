
-- Table to track plan slot availability (realtime-enabled)
CREATE TABLE public.plan_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_key text NOT NULL UNIQUE,
  max_slots integer NOT NULL DEFAULT 20,
  used_slots integer NOT NULL DEFAULT 0,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS (public read, no client writes)
ALTER TABLE public.plan_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read plan slots"
  ON public.plan_slots FOR SELECT
  USING (true);

-- Seed initial data
INSERT INTO public.plan_slots (plan_key, max_slots, used_slots)
VALUES
  ('on_plus', 50, 0),
  ('on_pro', 20, 0);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.plan_slots;
