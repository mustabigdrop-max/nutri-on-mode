GRANT SELECT ON public.plan_slots TO anon;
DROP POLICY IF EXISTS "Public can read plan slots" ON public.plan_slots;
CREATE POLICY "Public can read plan slots" ON public.plan_slots FOR SELECT TO anon USING (true);