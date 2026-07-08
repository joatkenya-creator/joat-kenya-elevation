-- ─── Course progress status ─────────────────────────────────────────────────
-- Backs the progress indicator on the learner's account page. Every new
-- registration defaults to 'registered' — the only stage the app itself can
-- prove true at sign-up. Later stages (deposit received, cohort under way,
-- finished) are set by the JOAT team from the Supabase table editor
-- (service role, bypasses RLS/grants), not by the student.
--
-- The existing "update own row" policy on course_students (see
-- 20260707100000_course_students.sql) does not restrict which columns a
-- student can change on their own row — only which rows. Left alone, a
-- student's browser session could PATCH its own status straight to
-- 'completed'. Postgres column-level privileges close that gap without
-- touching the row-level policy: everything else on the row stays
-- student-editable, only `status` is writable by the service role alone.

alter table public.course_students
  add column status text not null default 'registered'
    check (status in ('registered', 'deposit_paid', 'in_progress', 'completed'));

revoke update (status) on public.course_students from authenticated;
