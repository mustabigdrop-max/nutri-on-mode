
-- Nexus-Bio Messages table
CREATE TABLE public.nexus_bio_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.nexus_bio_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own nexus messages" ON public.nexus_bio_messages
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own nexus messages" ON public.nexus_bio_messages
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Peptide Search History table
CREATE TABLE public.peptide_search_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  result_summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.peptide_search_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own peptide searches" ON public.peptide_search_history
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own peptide searches" ON public.peptide_search_history
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_nexus_bio_messages_user_id ON public.nexus_bio_messages(user_id, created_at DESC);
CREATE INDEX idx_peptide_search_history_user_id ON public.peptide_search_history(user_id, created_at DESC);
