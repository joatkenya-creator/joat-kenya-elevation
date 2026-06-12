-- Revert the applications_recent view: it isn't needed. The applications table
-- is viewed newest-first by sorting on created_at in the dashboard (a base table
-- has no inherent row order). The created_at DESC index from the previous
-- migration is kept, as it keeps that sort fast.
drop view if exists public.applications_recent;
