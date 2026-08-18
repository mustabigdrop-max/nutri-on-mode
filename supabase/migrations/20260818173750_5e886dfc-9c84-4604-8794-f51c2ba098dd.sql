CREATE TABLE public.social_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid(),
  title TEXT,
  category TEXT,
  objective TEXT,
  product TEXT,
  tone TEXT,
  carousel_style TEXT NOT NULL DEFAULT 'dark',
  photos JSONB NOT NULL DEFAULT '[]'::jsonb,
  generated_content JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'draft',
  published_items JSONB NOT NULL DEFAULT '{}'::jsonb,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.social_packages TO authenticated;
GRANT ALL ON public.social_packages TO service_role;

ALTER TABLE public.social_packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own social packages"
ON public.social_packages FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_social_packages_updated_at
BEFORE UPDATE ON public.social_packages
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();