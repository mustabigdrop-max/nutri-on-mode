ALTER TABLE public.script_sources
  ADD COLUMN IF NOT EXISTS autores text,
  ADD COLUMN IF NOT EXISTS organizacao text,
  ADD COLUMN IF NOT EXISTS periodico text,
  ADD COLUMN IF NOT EXISTS ano integer,
  ADD COLUMN IF NOT EXISTS tipo_estudo text,
  ADD COLUMN IF NOT EXISTS n_participantes integer;
CREATE UNIQUE INDEX IF NOT EXISTS studio_cards_reel_auto_uniq
  ON public.studio_cards (script_id, COALESCE(bloco_ref, -1), template, formato, COALESCE(variante_imagem, ''))
  WHERE (conteudo->>'origem') = 'reel_auto';