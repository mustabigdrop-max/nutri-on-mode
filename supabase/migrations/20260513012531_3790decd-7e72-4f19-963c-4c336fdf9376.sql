create table if not exists public.training_feedback (
  id uuid default gen_random_uuid() primary key,
  athlete_id uuid not null,
  coach_id uuid references auth.users(id) on delete cascade,
  session_date date not null default current_date,
  muscle_connections jsonb,
  pump_scores jsonb,
  notes text,
  created_at timestamptz default now()
);

alter table public.training_feedback enable row level security;

create policy "Coach manages own training feedback"
  on public.training_feedback for all
  using (auth.uid() = coach_id)
  with check (auth.uid() = coach_id);

create index if not exists idx_training_feedback_athlete on public.training_feedback(athlete_id);
create index if not exists idx_training_feedback_date on public.training_feedback(session_date);