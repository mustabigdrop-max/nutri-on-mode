
CREATE TABLE IF NOT EXISTS public.mce_alter_ego (
  user_id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  name text NOT NULL,
  posture text,
  activation_phrase text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mce_alter_ego TO authenticated;
GRANT ALL ON public.mce_alter_ego TO service_role;
ALTER TABLE public.mce_alter_ego ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own alter ego" ON public.mce_alter_ego FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.mce_voice_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  kind text NOT NULL DEFAULT 'journal' CHECK (kind IN ('journal','capsule')),
  audio_path text NOT NULL,
  duration_seconds integer NOT NULL DEFAULT 0,
  note_date date NOT NULL DEFAULT (now() AT TIME ZONE 'utc')::date,
  unlock_at timestamptz,
  mce_score integer,
  transcript text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS mce_voice_notes_user_idx ON public.mce_voice_notes (user_id, created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mce_voice_notes TO authenticated;
GRANT ALL ON public.mce_voice_notes TO service_role;
ALTER TABLE public.mce_voice_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own voice notes" ON public.mce_voice_notes FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "voice read own" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'mce-voice' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "voice insert own" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'mce-voice' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "voice delete own" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'mce-voice' AND (storage.foldername(name))[1] = auth.uid()::text);
