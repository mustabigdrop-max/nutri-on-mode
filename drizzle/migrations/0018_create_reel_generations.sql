CREATE TABLE public.reel_generations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  tema text NOT NULL,
  objetivo text NOT NULL CHECK (objetivo IN ('alcance','autoridade','venda')),
  tom text NOT NULL,
  result jsonb NOT NULL
);
GRANT SELECT, DELETE ON public.reel_generations TO authenticated;
GRANT ALL ON public.reel_generations TO service_role;
ALTER TABLE public.reel_generations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own reels read" ON public.reel_generations FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "own reels delete" ON public.reel_generations FOR DELETE TO authenticated USING (user_id = auth.uid());
CREATE INDEX reel_generations_user_idx ON public.reel_generations(user_id, created_at DESC);