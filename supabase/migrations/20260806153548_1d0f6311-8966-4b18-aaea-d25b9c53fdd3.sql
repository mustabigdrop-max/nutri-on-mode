CREATE TABLE public.runon_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  profile JSONB NOT NULL DEFAULT '{}'::jsonb,
  protocol JSONB,
  race_mode JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.runon_profiles TO authenticated;
GRANT ALL ON public.runon_profiles TO service_role;
ALTER TABLE public.runon_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own runon profile" ON public.runon_profiles FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_runon_profiles_updated_at BEFORE UPDATE ON public.runon_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();