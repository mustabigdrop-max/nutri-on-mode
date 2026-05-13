create table if not exists public.corrective_training_plans (
  id uuid default gen_random_uuid() primary key,
  athlete_id uuid not null,
  coach_id uuid references auth.users(id) on delete cascade,
  apex_sync_id uuid references public.apex_training_sync(id) on delete set null,
  training_text text,
  category text,
  weak_points jsonb,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.corrective_training_plans enable row level security;

create policy "Coach manages own corrective plans"
  on public.corrective_training_plans for all
  using (auth.uid() = coach_id)
  with check (auth.uid() = coach_id);

create index if not exists idx_corrective_training_plans_athlete on public.corrective_training_plans(athlete_id);
create index if not exists idx_corrective_training_plans_coach on public.corrective_training_plans(coach_id);

create trigger update_corrective_training_plans_updated_at
  before update on public.corrective_training_plans
  for each row execute function public.update_updated_at_column();