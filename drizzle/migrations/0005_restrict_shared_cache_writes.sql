-- nexus_como_obter: escrita apenas do próprio autor (ou admin), leitura segue aberta
alter table public.nexus_como_obter alter column created_by set default auth.uid();

drop policy if exists "authenticated can insert como obter" on public.nexus_como_obter;
drop policy if exists "authenticated can update como obter" on public.nexus_como_obter;
drop policy if exists "anyone can insert nexus_como_obter" on public.nexus_como_obter;
drop policy if exists "anyone can update nexus_como_obter" on public.nexus_como_obter;

create policy "own insert como obter"
on public.nexus_como_obter for insert to authenticated
with check (created_by = auth.uid());

create policy "own or admin update como obter"
on public.nexus_como_obter for update to authenticated
using (created_by = auth.uid() or public.has_role(auth.uid(), 'admin'))
with check (created_by = auth.uid() or public.has_role(auth.uid(), 'admin'));

-- exercise_guides: cache compartilhado — passa a ter autor e escrita restrita a ele/admin
alter table public.exercise_guides add column if not exists created_by uuid default auth.uid();

drop policy if exists "authenticated can insert exercise guides" on public.exercise_guides;
drop policy if exists "authenticated can update exercise guides" on public.exercise_guides;
drop policy if exists "anyone can insert exercise_guides" on public.exercise_guides;
drop policy if exists "anyone can update exercise_guides" on public.exercise_guides;

create policy "own insert exercise guides"
on public.exercise_guides for insert to authenticated
with check (created_by = auth.uid());

create policy "own or admin update exercise guides"
on public.exercise_guides for update to authenticated
using (created_by = auth.uid() or public.has_role(auth.uid(), 'admin'))
with check (created_by = auth.uid() or public.has_role(auth.uid(), 'admin'));