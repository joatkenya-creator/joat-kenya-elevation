-- ─── Course student accounts ───────────────────────────────────────────────
-- Backs the /courses sign-up, login and account pages. One row per
-- authenticated student, keyed 1:1 to auth.users. Unlike the anon-insert
-- lead tables (e.g. applications), this table has no anonymous access at
-- all: a row can only be created, read or updated by its own owner via
-- Supabase Auth, so a student can never see another student's details.

create table public.course_students (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  phone text not null,
  registrant_type text not null check (registrant_type in ('student', 'parent')),
  college text,
  tier text not null check (tier in ('builder', 'shipper', 'pro')),
  payment_preference text not null check (payment_preference in ('full', 'installments', 'parent_pays')),
  how_heard text,
  created_at timestamptz not null default now()
);

alter table public.course_students enable row level security;

create policy "Students can insert their own row"
  on public.course_students
  for insert
  to authenticated
  with check (auth.uid() = id);

create policy "Students can view their own row"
  on public.course_students
  for select
  to authenticated
  using (auth.uid() = id);

create policy "Students can update their own row"
  on public.course_students
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);
