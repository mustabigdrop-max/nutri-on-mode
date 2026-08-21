ALTER TABLE public.prism_analyses ADD COLUMN IF NOT EXISTS mode TEXT;
ALTER TABLE public.prism_analyses ADD COLUMN IF NOT EXISTS subtype TEXT;
ALTER TABLE public.prism_analyses ADD COLUMN IF NOT EXISTS sale_level TEXT;
ALTER TABLE public.prism_analyses ADD COLUMN IF NOT EXISTS product_mentioned TEXT;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'prism_analyses_mode_check') THEN
    ALTER TABLE public.prism_analyses ADD CONSTRAINT prism_analyses_mode_check
      CHECK (mode IS NULL OR mode IN ('post_pronto','viral_trend','reels','vender','representatividade','lifestyle_pai','pack_semanal','ia_decide'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'prism_analyses_sale_level_check') THEN
    ALTER TABLE public.prism_analyses ADD CONSTRAINT prism_analyses_sale_level_check
      CHECK (sale_level IS NULL OR sale_level IN ('invisivel','suave','direto'));
  END IF;
END $$;