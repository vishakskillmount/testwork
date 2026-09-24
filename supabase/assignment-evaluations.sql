-- Stores Evaluate without AI results: counts plus wrong/correct cell details.
-- Run once in the Supabase SQL editor.

create table if not exists public.assignment_evaluations (
  id uuid primary key default gen_random_uuid(),
  student_file_name text not null,
  correct_file_name text not null,
  total_answers integer not null,
  wrong_answers integer not null,
  correct_answers integer not null,
  message text not null,
  method text not null default 'local',
  wrong_cells jsonb not null default '[]'::jsonb,
  correct_cells jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

grant select, insert
on table public.assignment_evaluations
to anon, authenticated;

alter table public.assignment_evaluations enable row level security;

drop policy if exists "assignment_evaluations_select" on public.assignment_evaluations;
drop policy if exists "assignment_evaluations_insert" on public.assignment_evaluations;

create policy "assignment_evaluations_select"
on public.assignment_evaluations for select
to anon, authenticated
using (true);

create policy "assignment_evaluations_insert"
on public.assignment_evaluations for insert
to anon, authenticated
with check (true);
