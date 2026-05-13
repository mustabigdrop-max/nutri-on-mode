create table if not exists public.apex_training_sync (
  id uuid default gen_random_uuid() primary key,
  athlete_id uuid not null,
  coach_id uuid references auth.users(id) on delete cascade,
  category text,
  weak_points jsonb,
  postural_deviations text,
  corrective_protocol text,
  postural_corrections text,
  priorities jsonb,
  bf_estimated numeric,
  bf_target numeric,
  apex_analysis_id uuid references public.apex_analyses(id) on delete set null,
  sync_status text default 'pending',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(athlete_id)
);

alter table public.apex_training_sync enable row level security;

create policy "Coach manages own athlete sync"
  on public.apex_training_sync for all
  using (auth.uid() = coach_id)
  with check (auth.uid() = coach_id);

create trigger update_apex_training_sync_updated_at
  before update on public.apex_training_sync
  for each row execute function public.update_updated_at_column();