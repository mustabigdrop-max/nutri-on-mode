
DROP POLICY "service_role_full_access_sport_cache" ON public.sport_perplexity_cache;

CREATE POLICY "users_read_own_sport_cache" ON public.sport_perplexity_cache
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users_insert_own_sport_cache" ON public.sport_perplexity_cache
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_update_own_sport_cache" ON public.sport_perplexity_cache
  FOR UPDATE USING (auth.uid() = user_id);
