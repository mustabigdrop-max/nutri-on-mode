
INSERT INTO storage.buckets (id, name, public) VALUES ('meal-photos', 'meal-photos', true) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can upload meal photos" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'meal-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can view own meal photos" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'meal-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Public can view meal photos" ON storage.objects
FOR SELECT TO anon
USING (bucket_id = 'meal-photos');
