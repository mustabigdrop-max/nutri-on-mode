
create table if not exists public.social_posts_tracked (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  data date not null default current_date,
  tipo text not null,
  tema text,
  modulo_origem text,
  formato text,
  curtidas integer,
  comentarios integer,
  salvamentos integer,
  compartilhamentos integer,
  alcance integer,
  leads_gerados integer not null default 0,
  score_performance numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.social_posts_tracked to authenticated;
grant all on public.social_posts_tracked to service_role;
alter table public.social_posts_tracked enable row level security;
create policy "own posts tracked" on public.social_posts_tracked
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create index if not exists social_posts_tracked_user_data_idx on public.social_posts_tracked (user_id, data desc);

create table if not exists public.social_dm_triggers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  palavra text not null,
  mensagem text not null,
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.social_dm_triggers to authenticated;
grant all on public.social_dm_triggers to service_role;
alter table public.social_dm_triggers enable row level security;
create policy "own dm triggers" on public.social_dm_triggers
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create table if not exists public.bio_link_clicks (
  id uuid primary key default gen_random_uuid(),
  link_id text not null,
  referrer text,
  utm_source text,
  device text,
  created_at timestamptz not null default now()
);
grant insert on public.bio_link_clicks to anon;
grant select, insert on public.bio_link_clicks to authenticated;
grant all on public.bio_link_clicks to service_role;
alter table public.bio_link_clicks enable row level security;
create policy "anyone can register bio click" on public.bio_link_clicks
  for insert to anon, authenticated with check (true);
create policy "authenticated can read bio clicks" on public.bio_link_clicks
  for select to authenticated using (true);
create index if not exists bio_link_clicks_link_idx on public.bio_link_clicks (link_id, created_at desc);
