CREATE TABLE IF NOT EXISTS public.protocol_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id uuid NOT NULL,
  athlete_id uuid,
  protocol_id uuid,
  messages jsonb NOT NULL DEFAULT '[]'::jsonb,
  protocol_version integer NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'reviewing',
  approved_at timestamptz,
  final_protocol text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_protocol_reviews_coach ON public.protocol_reviews(coach_id);
CREATE INDEX IF NOT EXISTS idx_protocol_reviews_athlete ON public.protocol_reviews(athlete_id);
CREATE INDEX IF NOT EXISTS idx_protocol_reviews_protocol ON public.protocol_reviews(protocol_id);

ALTER TABLE public.protocol_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coach can view own protocol reviews"
ON public.protocol_reviews FOR SELECT
TO authenticated
USING (auth.uid() = coach_id);

CREATE POLICY "Coach can create own protocol reviews"
ON public.protocol_reviews FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = coach_id);

CREATE POLICY "Coach can update own protocol reviews"
ON public.protocol_reviews FOR UPDATE
TO authenticated
USING (auth.uid() = coach_id);

CREATE POLICY "Coach can delete own protocol reviews"
ON public.protocol_reviews FOR DELETE
TO authenticated
USING (auth.uid() = coach_id);

CREATE TRIGGER set_protocol_reviews_updated_at
BEFORE UPDATE ON public.protocol_reviews
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();