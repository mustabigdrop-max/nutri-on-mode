CREATE TABLE public.content_angles (
  id smallint PRIMARY KEY,
  nome text NOT NULL UNIQUE
);
GRANT SELECT ON public.content_angles TO anon, authenticated;
GRANT ALL ON public.content_angles TO service_role;
ALTER TABLE public.content_angles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Angles readable" ON public.content_angles FOR SELECT TO anon, authenticated USING (true);
INSERT INTO public.content_angles (id, nome) VALUES
 (1,'mito'),(2,'erro comum'),(3,'número'),(4,'confissão'),(5,'comparação'),(6,'passo a passo'),(7,'caso real'),(8,'pergunta que dói'),(9,'desafio'),(10,'bastidor');

CREATE TABLE public.content_pillars (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  chave text,
  nome text NOT NULL,
  publico text NOT NULL DEFAULT 'geral' CHECK (publico IN ('geral','profissionais','misto')),
  qtd_diaria integer NOT NULL DEFAULT 10 CHECK (qtd_diaria BETWEEN 0 AND 100),
  objetivo text[] NOT NULL DEFAULT ARRAY['alcance'] CHECK (objetivo <@ ARRAY['alcance','autoridade','conversao'] AND cardinality(objetivo) >= 1),
  mecanismo text NOT NULL DEFAULT '',
  exige_caso_real boolean NOT NULL DEFAULT false,
  ativo boolean NOT NULL DEFAULT true,
  ordem smallint NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX content_pillars_user_idx ON public.content_pillars(user_id, ordem);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.content_pillars TO authenticated;
GRANT ALL ON public.content_pillars TO service_role;
ALTER TABLE public.content_pillars ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own pillars" ON public.content_pillars FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER content_pillars_updated BEFORE UPDATE ON public.content_pillars FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.content_cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  titulo text NOT NULL,
  descricao text NOT NULL DEFAULT '',
  autorizado boolean NOT NULL DEFAULT false,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX content_cases_user_idx ON public.content_cases(user_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.content_cases TO authenticated;
GRANT ALL ON public.content_cases TO service_role;
ALTER TABLE public.content_cases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own cases" ON public.content_cases FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

ALTER TABLE public.reel_bank
  ADD COLUMN angulo text,
  ADD COLUMN publico text,
  ADD COLUMN objetivo text,
  ADD COLUMN mecanismo text,
  ADD COLUMN tensao text;

CREATE OR REPLACE FUNCTION public.seed_content_pillars(_user_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF _user_id IS NULL OR (auth.uid() IS NOT NULL AND auth.uid() <> _user_id) THEN RETURN; END IF;
  IF EXISTS (SELECT 1 FROM public.content_pillars WHERE user_id = _user_id) THEN RETURN; END IF;
  INSERT INTO public.content_pillars (user_id, chave, nome, publico, qtd_diaria, objetivo, mecanismo, exige_caso_real, ordem) VALUES
   (_user_id,'comportamento','Comportamento antes do alimento','geral',20,ARRAY['alcance'],'autorreferência + lacuna entre intenção e ação',false,1),
   (_user_id,'mitos','Mitos e verdades','geral',20,ARRAY['alcance'],'quebra de expectativa + lacuna de curiosidade',false,2),
   (_user_id,'suplementacao','Suplementação com ciência','geral',12,ARRAY['autoridade'],'autoridade + especificidade honesta',false,3),
   (_user_id,'treino','Treino e execução','geral',14,ARRAY['alcance','autoridade'],'autoeficácia + pequenas vitórias',false,4),
   (_user_id,'profissionais','Atenção e marketing para profissionais fitness','profissionais',18,ARRAY['autoridade','conversao'],'aversão à perda + comparação social',false,5),
   (_user_id,'sistemas','Sistemas e bastidores','profissionais',10,ARRAY['autoridade','conversao'],'demonstração em vez de promessa',false,6),
   (_user_id,'provas','Provas e casos reais','misto',6,ARRAY['conversao'],'prova social + narrativa',true,7);
END $$;
REVOKE ALL ON FUNCTION public.seed_content_pillars(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.seed_content_pillars(uuid) TO authenticated, service_role;