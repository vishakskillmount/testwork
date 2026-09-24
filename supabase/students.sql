-- Lets the publishable key read, add, edit, and delete students.
-- Run once in the Supabase SQL editor.

grant select, insert, update, delete
on table public.students
to anon, authenticated;

alter table public.students enable row level security;

drop policy if exists "students_select" on public.students;
drop policy if exists "students_insert" on public.students;
drop policy if exists "students_update" on public.students;
drop policy if exists "students_delete" on public.students;

create policy "students_select"
on public.students for select
to anon, authenticated
using (true);

create policy "students_insert"
on public.students for insert
to anon, authenticated
with check (true);

create policy "students_update"
on public.students for update
to anon, authenticated
using (true)
with check (true);

create policy "students_delete"
on public.students for delete
to anon, authenticated
using (true);
