
ALTER TABLE public.science_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone_can_read_cache" ON public.science_cache FOR SELECT USING (true);

ALTER TABLE public.science_feed ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone_can_read_feed" ON public.science_feed FOR SELECT USING (true);

ALTER TABLE public.supplement_analyses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone_can_read_supplements" ON public.supplement_analyses FOR SELECT USING (true);
