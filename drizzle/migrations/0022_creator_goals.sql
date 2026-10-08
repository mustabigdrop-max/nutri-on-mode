CREATE TABLE public.creator_goals (
  user_id uuid PRIMARY KEY,
  metrica text NOT NULL DEFAULT 'reels_publicados' CHECK (metrica IN ('reels_publicados','retencao_3s')),
  alvo numeric NOT NULL CHECK (alvo > 0),
  inicio date NOT NULL DEFAULT current_date,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.creator_goals TO authenticated;
GRANT ALL ON public.creator_goals TO service_role;
ALTER TABLE public.creator_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own goals" ON public.creator_goals FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);