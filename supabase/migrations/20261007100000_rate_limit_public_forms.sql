-- ─── Per-IP rate limit on the public form tables ────────────────────────────
-- The contact, careers, booking and newsletter forms insert straight from the
-- browser with the anon key, so nothing stopped a script from flooding them
-- (or, for bookings, reserving every slot). A BEFORE INSERT trigger counts the
-- caller's inserts per form over the last hour and rejects rows past the limit.
--
-- Client IP: Cloudflare's `cf-connecting-ip`, which the client cannot set.
-- NOT the first x-forwarded-for entry from Supabase's docs example — that one
-- is client-supplied and spoofable. No header (SQL editor, service role, the
-- team's tools) means no limit, so the team is never blocked.
--
-- Triggers rather than pgrst.db_pre_request: the pre-request hook would apply
-- to every write in the project, including the JACK bot that shares this DB.
--
-- ponytail: per-IP only — someone rotating IPs gets past it. Add a CAPTCHA
-- (Cloudflare Turnstile verified in an Edge Function) if that starts happening.

create schema if not exists private;

create table if not exists private.form_rate_limits (
  form text        not null,
  ip   inet        not null,
  at   timestamptz not null default now()
);
create index if not exists form_rate_limits_lookup_idx
  on private.form_rate_limits (form, ip, at desc);

create or replace function private.enforce_form_rate_limit()
  returns trigger
  language plpgsql
  security definer
  set search_path = ''
as $$
declare
  ip_text   text := current_setting('request.headers', true)::json ->> 'cf-connecting-ip';
  max_hits  int  := tg_argv[0]::int;
  client_ip inet;
begin
  if ip_text is null or ip_text = '' then
    return new;
  end if;
  client_ip := ip_text::inet;

  delete from private.form_rate_limits r
    where r.form = tg_table_name and r.at < now() - interval '1 hour';

  if (select count(*) from private.form_rate_limits r
      where r.form = tg_table_name and r.ip = client_ip) >= max_hits then
    raise exception 'rate_limited: too many submissions, try again later'
      using errcode = 'P0429';
  end if;

  insert into private.form_rate_limits (form, ip) values (tg_table_name, client_ip);
  return new;
end;
$$;

revoke all on function private.enforce_form_rate_limit() from public, anon, authenticated;

-- Limits per IP per hour: room for a shared office connection, useless for a flood.
drop trigger if exists rate_limit on public.contact_submissions;
create trigger rate_limit before insert on public.contact_submissions
  for each row execute function private.enforce_form_rate_limit('10');

drop trigger if exists rate_limit on public.applications;
create trigger rate_limit before insert on public.applications
  for each row execute function private.enforce_form_rate_limit('10');

drop trigger if exists rate_limit on public.consultation_bookings;
create trigger rate_limit before insert on public.consultation_bookings
  for each row execute function private.enforce_form_rate_limit('3');

drop trigger if exists rate_limit on public.newsletter_subscribers;
create trigger rate_limit before insert on public.newsletter_subscribers
  for each row execute function private.enforce_form_rate_limit('5');
