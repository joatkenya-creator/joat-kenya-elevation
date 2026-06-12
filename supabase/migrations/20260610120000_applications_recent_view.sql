-- ─── Newest-first access to job applications ────────────────────────────────
-- Bakes "latest application first" into the database so the dashboard, the bot,
-- or any future admin tool can read applications in reverse-chronological order
-- without having to remember to sort.

-- Index keeps created_at DESC sorts fast as the table grows.
create index if not exists applications_created_at_desc_idx
  on public.applications (created_at desc);

-- View that always returns applications newest-first.
-- security_invoker = true makes the view respect the underlying table's
-- row-level security, so it grants no more access than querying the table
-- directly (no privilege escalation).
create or replace view public.applications_recent
  with (security_invoker = true) as
  select *
  from public.applications
  order by created_at desc;
