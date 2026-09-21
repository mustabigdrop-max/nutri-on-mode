drop policy if exists "coaches read funnel events" on public.mce_funnel_events;

create policy "admins read funnel events"
on public.mce_funnel_events
for select
to authenticated
using (public.has_role(auth.uid(), 'admin'));