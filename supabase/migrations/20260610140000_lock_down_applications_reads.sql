-- ─── Lock down reads on the applications table ───────────────────────────────
-- The public (anon) key could read every application — applicant names, emails,
-- phones and CV links — a PII leak. The website only ever INSERTs applications
-- (it never reads them), and the team views applications in the Supabase
-- dashboard (an authenticated session, not the anon key). So: enable RLS and
-- let the public SUBMIT only. No public read / update / delete. The service
-- role (dashboard, server tools) bypasses RLS and is unaffected.

-- Start clean: drop every existing policy on the table (names unknown).
do $$
declare
  pol record;
begin
  for pol in
    select policyname
    from pg_policies
    where schemaname = 'public' and tablename = 'applications'
  loop
    execute format('drop policy if exists %I on public.applications', pol.policyname);
  end loop;
end $$;

alter table public.applications enable row level security;

-- Anyone may submit an application; nobody may read/list/modify via the anon key.
create policy "Public can submit applications"
  on public.applications
  for insert
  to anon, authenticated
  with check (true);
