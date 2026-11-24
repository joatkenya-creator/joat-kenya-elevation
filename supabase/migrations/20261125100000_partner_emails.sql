-- Ambassador emails (2026-11-21): welcome on sign-up, application received,
-- approved, rejected (with reason), suspended (with reason).
--
-- Every one of these events already lands in partner_audit_log, so a trigger
-- there hands the row id to the Edge Function partner-email, which reads the
-- row with the service role and sends at most one email per event (claims a
-- key in partner_emails_sent first; ignores rows older than an hour).
--
-- Change from 20261119100000: the reason for a rejection or suspension is now
-- included in the email to the ambassador (the admin form says so).

create table public.partner_emails_sent (
  key      text primary key,  -- 'audit:<id>' or 'app:<application id>'
  sent_at  timestamptz not null default now()
);
alter table public.partner_emails_sent enable row level security;
revoke all on public.partner_emails_sent from anon, authenticated;

-- A confirmed sign-up becomes an 'account.created' activity row (and so a
-- welcome email). Course students sign up through the main site with
-- source = 'course' and are skipped.
create or replace function private.log_account_created()
  returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.email_confirmed_at is not null
     and (tg_op = 'INSERT' or old.email_confirmed_at is null)
     and coalesce(new.raw_user_meta_data ->> 'source', '') <> 'course' then
    insert into public.partner_audit_log (actor_id, action, subject_id)
    values (new.id, 'account.created', new.id);
  end if;
  return null;
end;
$$;

create or replace function private.notify_partner_email()
  returns trigger language plpgsql security definer set search_path = '' as $$
begin
  perform net.http_post(
    url := 'https://prkdfkkhqncxkyehokop.supabase.co/functions/v1/partner-email',
    body := jsonb_build_object('audit_id', new.id),
    headers := '{"content-type": "application/json"}'::jsonb);
  return null;
end;
$$;

-- Hosted Supabase has pg_net and the real auth.users; the offline test database doesn't.
do $$
begin
  if exists (select 1 from pg_available_extensions where name = 'pg_net') then
    create extension if not exists pg_net;
    create trigger partner_audit_log_email
      after insert on public.partner_audit_log
      for each row
      when (new.action in ('account.created', 'application.submitted', 'membership.approved',
                           'membership.rejected', 'membership.suspended'))
      execute function private.notify_partner_email();
    create trigger partner_account_created
      after insert or update of email_confirmed_at on auth.users
      for each row execute function private.log_account_created();
  end if;
end;
$$;
