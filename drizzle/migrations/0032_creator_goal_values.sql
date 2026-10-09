CREATE TABLE IF NOT EXISTS public.creator_goal_values (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  metrica text NOT NULL CHECK (metrica IN ('seguidores_instagram','seguidores_tiktok','seguidores_youtube')),
  data date NOT NULL DEFAULT (now() AT TIME ZONE 'America/Sao_Paulo')::date,
  valor numeric NOT NULL CHECK (valor >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, metrica, data)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.creator_goal_values TO authenticated;
GRANT ALL ON public.creator_goal_values TO service_role;
ALTER TABLE public.creator_goal_values ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own goal values" ON public.creator_goal_values FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
ALTER TABLE public.retention_scripts ADD COLUMN IF NOT EXISTS critico2 jsonb;