CREATE TABLE public.hook_formulas (id int PRIMARY KEY, nome text NOT NULL, template text NOT NULL, exemplo text, gatilho text NOT NULL);
GRANT SELECT ON public.hook_formulas TO authenticated;
GRANT ALL ON public.hook_formulas TO service_role;
ALTER TABLE public.hook_formulas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "hook_formulas read" ON public.hook_formulas FOR SELECT TO authenticated USING (true);
INSERT INTO public.hook_formulas (id, nome, template, exemplo, gatilho) VALUES
(1,'Crença errada','Quase todo mundo [faz X] errado.','Quase todo mundo toma creatina errado.','quebra_de_crenca'),
(2,'Identidade direta','Se você [comportamento frustrante], para de [ação comum].','Se você treina todo dia e não muda, para de treinar mais.','identidade'),
(3,'Contraintuitivo','[Coisa que parece boa] está travando [resultado].','Seu cardio extra está travando o seu emagrecimento.','quebra_de_crenca'),
(4,'Número + custo','[N] erros que fazem você [perda concreta].','3 erros que fazem você perder massa na dieta.','medo_de_perder'),
(5,'Lacuna específica','[Dado concreto] é menor/maior do que você pensa.','A dose de creatina que funciona é menor do que você pensa.','curiosidade'),
(6,'Confissão','Eu errei [X] por [tempo].','Eu comecei meus vídeos do jeito errado. Por isso ninguém assistia.','identidade'),
(7,'Medo de perder','Isso está te custando [X] toda semana.','Cada semana sem isso é treino jogado fora.','medo_de_perder'),
(8,'Pergunta que dói','Por que você [ciclo frustrante]?','Por que você começa a dieta na segunda e desiste na quinta?','identidade'),
(9,'Inimigo comum','Te ensinaram [X] do jeito errado.','Te ensinaram a emagrecer pela comida. Mas a fome nunca foi de comida.','polemica'),
(10,'Mito x verdade','Mito: [crença popular]. Verdade: [correção].','Mito: carboidrato à noite engorda.','quebra_de_crenca'),
(11,'Prova primeiro','[Situação inicial ruim] virou [mudança], veja o que mudou.','Só com caso real e autorizado. Sem promessa de resultado.','prova'),
(12,'Desafio','Testa isso hoje no seu treino de [grupo] e me conta.','Testa isso hoje no treino de perna.','curiosidade');

CREATE TABLE public.creator_formula_stats (user_id uuid NOT NULL, formula_id int NOT NULL REFERENCES public.hook_formulas(id), usos int NOT NULL DEFAULT 0, retencao_3s_media numeric, comentarios_media numeric, salvamentos_media numeric, updated_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY (user_id, formula_id));
GRANT SELECT ON public.creator_formula_stats TO authenticated;
GRANT ALL ON public.creator_formula_stats TO service_role;
ALTER TABLE public.creator_formula_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own formula stats" ON public.creator_formula_stats FOR SELECT TO authenticated USING (user_id = auth.uid());

ALTER TABLE public.retention_scripts ADD COLUMN formula_id int REFERENCES public.hook_formulas(id), ADD COLUMN quero_mais text;
ALTER TABLE public.retention_results ADD COLUMN comentarios numeric, ADD COLUMN salvamentos numeric;