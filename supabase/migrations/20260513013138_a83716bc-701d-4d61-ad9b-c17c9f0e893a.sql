-- Allow athletes to view their own corrective training plans
create policy "Athlete reads own corrective plan"
  on public.corrective_training_plans for select
  using (
    exists (
      select 1 from public.competition_athletes ca
      where ca.id = corrective_training_plans.athlete_id
        and ca.patient_user_id = auth.uid()
    )
  );

-- Allow athletes to view their APEX sync data (read-only)
create policy "Athlete reads own apex sync"
  on public.apex_training_sync for select
  using (
    exists (
      select 1 from public.competition_athletes ca
      where ca.id = apex_training_sync.athlete_id
        and ca.patient_user_id = auth.uid()
    )
  );

-- Allow athletes to view their own apex analyses
create policy "Athlete reads own apex analyses"
  on public.apex_analyses for select
  using (
    exists (
      select 1 from public.competition_athletes ca
      where ca.id = apex_analyses.athlete_id
        and ca.patient_user_id = auth.uid()
    )
  );

-- Allow athletes to insert their own training feedback (post check-in)
create policy "Athlete inserts own training feedback"
  on public.training_feedback for insert
  with check (
    exists (
      select 1 from public.competition_athletes ca
      where ca.id = training_feedback.athlete_id
        and ca.patient_user_id = auth.uid()
    )
  );

create policy "Athlete reads own training feedback"
  on public.training_feedback for select
  using (
    exists (
      select 1 from public.competition_athletes ca
      where ca.id = training_feedback.athlete_id
        and ca.patient_user_id = auth.uid()
    )
  );