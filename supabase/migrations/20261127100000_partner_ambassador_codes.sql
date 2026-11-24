-- ─── Ambassador codes typed by visitors ──────────────────────────────────────
-- A visitor who types an ambassador's code (website box, shop cart) is asking
-- to be credited to that ambassador, so the click is recorded with consent and
-- a referral token is issued for the session. Only the track-click and
-- lookup-ambassador Edge Functions (service role) call these functions.
--
-- Guessing codes: every failed lookup is logged against the visitor's
-- daily-salted IP hash; after 20 failures in an hour every lookup from that
-- visitor fails, valid code or not. Successful lookups aren't counted, so a
-- busy shared network (school, mobile carrier) isn't locked out by real use.

-- ─── Where a click came from ─────────────────────────────────────────────────
alter table public.affiliate_clicks
  add column source text not null default 'link'
    check (source in ('link', 'code_site', 'code_cart', 'discount_code'));

grant select (source) on public.affiliate_clicks to authenticated;

-- ─── Failed lookups (rate limit) ─────────────────────────────────────────────
create table private.ambassador_lookup_failures (
  ip_hash  text not null,
  at       timestamptz not null default now()
);
create index ambassador_lookup_failures_idx on private.ambassador_lookup_failures (ip_hash, at);
revoke all on private.ambassador_lookup_failures from public, anon, authenticated;

-- "Erick Peterson Otieno" → "Erick O."; a single name stays as it is.
create or replace function private.display_name(full_name text)
  returns text
  language sql
  immutable
  set search_path = ''
as $$
  with w as (select regexp_split_to_array(btrim(full_name), '\s+') a)
  select case when array_length(a, 1) > 1
              then a[1] || ' ' || upper(left(a[array_length(a, 1)], 1)) || '.'
              else a[1] end
  from w;
$$;

-- The approved ambassador for a code in a programme, or null. Logs failures
-- and refuses everything once a visitor has failed 20 times in an hour.
create or replace function private.resolve_ambassador_code(p_program_id text, p_code text, p_ip_hash text)
  returns uuid
  language plpgsql
  security definer
  set search_path = ''
as $$
declare
  amb uuid;
begin
  if p_ip_hash is null then
    return null;
  end if;
  if (select count(*) from private.ambassador_lookup_failures f
      where f.ip_hash = p_ip_hash and f.at > now() - interval '1 hour') >= 20 then
    return null;
  end if;

  select p.id into amb
  from public.affiliate_profiles p
  join public.affiliate_memberships m on m.profile_id = p.id
  where p.public_code = upper(p_code) and m.program_id = p_program_id and m.status = 'approved';

  if amb is null then
    -- ponytail: purges old rows inline; move to pg_cron if this table ever grows large.
    delete from private.ambassador_lookup_failures where at < now() - interval '1 day';
    insert into private.ambassador_lookup_failures (ip_hash) values (p_ip_hash);
  end if;
  return amb;
end;
$$;

-- "Referred by Erick O." for the website and cart. Name only, nothing else.
create or replace function public.lookup_ambassador(p_program_id text, p_code text, p_ip_hash text)
  returns text
  language plpgsql
  security definer
  set search_path = ''
as $$
declare
  amb uuid := private.resolve_ambassador_code(p_program_id, p_code, p_ip_hash);
begin
  return (select private.display_name(p.full_name) from public.affiliate_profiles p where p.id = amb);
end;
$$;

-- A typed code becomes a click (consent = true: the visitor asked for it).
-- Same click limits as record_partner_click.
create or replace function public.record_partner_code_click(
  p_program_id    text,
  p_code          text,
  p_source        text,
  p_landing_path  text,
  p_ip_hash       text
)
  returns table (click_id bigint, window_days int, model text, display_name text)
  language plpgsql
  security definer
  set search_path = ''
as $$
declare
  prog  public.affiliate_programs;
  amb   uuid;
  dup   boolean;
begin
  if p_source not in ('code_site', 'code_cart') then
    raise exception 'invalid_source' using errcode = '22023';
  end if;
  select * into prog from public.affiliate_programs where id = p_program_id;
  if prog.id is null or prog.attribution_model is null then
    return;
  end if;

  amb := private.resolve_ambassador_code(p_program_id, p_code, p_ip_hash);
  if amb is null then
    return;
  end if;

  if (select count(*) from public.affiliate_clicks c
      where c.ip_hash = p_ip_hash and c.at > now() - interval '1 hour') >= 100 then
    return;
  end if;

  select exists (
    select 1 from public.affiliate_clicks c
    where c.profile_id = amb and c.program_id = p_program_id and c.ip_hash = p_ip_hash
      and c.at > now() - interval '30 minutes'
  ) into dup;

  insert into public.affiliate_clicks
    (program_id, profile_id, landing_path, ip_hash, consent, is_duplicate, source)
  values
    (p_program_id, amb, left(coalesce(p_landing_path, '/'), 500), p_ip_hash, true, dup, p_source)
  returning id into click_id;

  window_days := prog.attribution_window_days;
  model := prog.attribution_model;
  select private.display_name(p.full_name) into display_name from public.affiliate_profiles p where p.id = amb;
  return next;
end;
$$;

revoke all on function private.display_name(text) from public, anon, authenticated;
revoke all on function private.resolve_ambassador_code(text, text, text) from public, anon, authenticated;
revoke all on function public.lookup_ambassador(text, text, text) from public, anon, authenticated;
revoke all on function public.record_partner_code_click(text, text, text, text, text) from public, anon, authenticated;
do $$ begin
  if exists (select 1 from pg_roles where rolname = 'service_role') then
    grant execute on function public.lookup_ambassador(text, text, text) to service_role;
    grant execute on function public.record_partner_code_click(text, text, text, text, text) to service_role;
  end if;
end $$;
