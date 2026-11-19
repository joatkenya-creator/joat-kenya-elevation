-- ─── Referral links and click tracking (Ambassador Programme, Phase 3) ─────
-- Decisions (docs/partners/stage-1-discovery.md, decision log, 2026-11-19):
--   D4: last click wins, 30-day window, both programmes.
--   Consent: clicks are always counted; the referral cookie is only issued
--   after the visitor accepts cookies (handled by the track-click function).
--
-- Clicks are written only by the track-click Edge Function (service role)
-- through record_partner_click / consent_partner_click below. Browsers can't
-- call those, and never see the hashed IP stored with each click.

-- ─── Programme sites ─────────────────────────────────────────────────────────
-- The only site each programme's links may point to. Fixed host, https only,
-- so a referral link can never send anyone elsewhere.

alter table public.affiliate_programs
  add column site_url text check (site_url ~ '^https://[a-z0-9.-]+$');

update public.affiliate_programs
  set site_url = 'https://joatkenya.com', attribution_model = 'last_touch', attribution_window_days = 30
  where id = 'joat';
update public.affiliate_programs
  set site_url = 'https://amaresbigplanet.com', attribution_model = 'last_touch', attribution_window_days = 30
  where id = 'amare';

-- ─── Links ───────────────────────────────────────────────────────────────────
-- Extra links an ambassador creates: a page on the programme's site, optionally
-- labelled with a campaign. Every ambassador also has a default link (the home
-- page, ?ref=CODE) that needs no row here.

create table public.affiliate_links (
  id                uuid primary key default gen_random_uuid(),
  code              text not null unique default private.new_public_code(),
  profile_id        uuid not null references public.affiliate_profiles(id) on delete cascade,
  program_id        text not null references public.affiliate_programs(id),
  destination_path  text not null check (destination_path ~ '^/([^/\\]|$)' and char_length(destination_path) <= 500),
  campaign          text check (campaign ~ '^[a-z0-9][a-z0-9-]{0,39}$'),
  status            text not null default 'active' check (status in ('active', 'disabled')),
  created_at        timestamptz not null default now()
);

create unique index affiliate_links_unique_idx
  on public.affiliate_links (profile_id, program_id, destination_path, coalesce(campaign, ''));

alter table public.affiliate_links enable row level security;

create policy "Ambassadors read own links; staff read their programmes"
  on public.affiliate_links for select
  to authenticated
  using (
    profile_id = auth.uid()
    or private.has_staff_role(array['support', 'finance', 'program_manager'], program_id)
  );

revoke all on public.affiliate_links from anon;
revoke insert, update, delete, truncate on public.affiliate_links from authenticated;

-- ─── Clicks ──────────────────────────────────────────────────────────────────

create table public.affiliate_clicks (
  id               bigint generated always as identity primary key,
  at               timestamptz not null default now(),
  program_id       text not null references public.affiliate_programs(id),
  profile_id       uuid not null references public.affiliate_profiles(id) on delete cascade,
  link_id          uuid references public.affiliate_links(id) on delete set null,
  landing_path     text not null check (char_length(landing_path) <= 500),
  utm              jsonb not null default '{}',
  referrer_domain  text check (char_length(referrer_domain) <= 255),
  -- SHA-256 of the visitor IP with a secret salt that changes daily: enough to
  -- spot repeat and bot clicks, not enough to identify anyone. No raw IPs.
  ip_hash          text not null,
  consent          boolean not null default false,
  -- Same visitor, same ambassador, within 30 minutes: kept for fraud review,
  -- left out of click counts.
  is_duplicate     boolean not null default false
);

create index affiliate_clicks_profile_idx on public.affiliate_clicks (profile_id, program_id, at desc);
create index affiliate_clicks_ip_idx on public.affiliate_clicks (ip_hash, at desc);

alter table public.affiliate_clicks enable row level security;

create policy "Ambassadors read own clicks; staff read their programmes"
  on public.affiliate_clicks for select
  to authenticated
  using (
    profile_id = auth.uid()
    or private.has_staff_role(array['support', 'finance', 'program_manager'], program_id)
  );

-- Every column except ip_hash.
revoke all on public.affiliate_clicks from anon, authenticated;
grant select (id, at, program_id, profile_id, link_id, landing_path, utm, referrer_domain, consent, is_duplicate)
  on public.affiliate_clicks to authenticated;

-- ─── Ambassador creates a link ───────────────────────────────────────────────
-- p_destination: a path ("/services") or a full address on the programme's own
-- site ("https://joatkenya.com/services"). Anything else is refused, so links
-- can't be turned into redirects to other sites.

create or replace function public.create_partner_link(
  p_program_id   text,
  p_destination  text,
  p_campaign     text default null
)
  returns text
  language plpgsql
  security definer
  set search_path = ''
as $$
declare
  uid       uuid := auth.uid();
  site      text;
  dest      text := btrim(coalesce(p_destination, ''));
  path      text;
  camp      text := nullif(lower(btrim(coalesce(p_campaign, ''))), '');
  new_code  text;
begin
  if uid is null then
    raise exception 'not_signed_in' using errcode = '42501';
  end if;
  if not exists (
    select 1 from public.affiliate_memberships m
    where m.profile_id = uid and m.program_id = p_program_id and m.status = 'approved'
  ) then
    raise exception 'not_approved' using errcode = '42501';
  end if;

  select a.site_url into site from public.affiliate_programs a where a.id = p_program_id;

  if dest = '' then
    path := '/';
  elsif dest ~ '^/' then
    path := dest;
  elsif lower(dest) = site or lower(dest) = replace(site, 'https://', 'https://www.') then
    path := '/';
  elsif lower(dest) like site || '/%' then
    path := substr(dest, char_length(site) + 1);
  elsif lower(dest) like replace(site, 'https://', 'https://www.') || '/%' then
    path := substr(dest, char_length(site) + 5);
  else
    raise exception 'invalid_destination' using errcode = '22023';
  end if;

  path := split_part(path, '#', 1);
  if path !~ '^/([^/\\]|$)' or path ~ '[\s<>"\\]' or char_length(path) > 500
     or path ~* '[?&](ref|ln)=' then
    raise exception 'invalid_destination' using errcode = '22023';
  end if;
  if camp is not null and camp !~ '^[a-z0-9][a-z0-9-]{0,39}$' then
    raise exception 'invalid_campaign' using errcode = '22023';
  end if;
  if (select count(*) from public.affiliate_links l
      where l.profile_id = uid and l.program_id = p_program_id) >= 50 then
    raise exception 'too_many_links' using errcode = '22023';
  end if;

  insert into public.affiliate_links (profile_id, program_id, destination_path, campaign)
  values (uid, p_program_id, path, camp)
  on conflict do nothing
  returning code into new_code;

  if new_code is null then
    raise exception 'link_exists' using errcode = '23505';
  end if;
  return new_code;
end;
$$;

-- ─── Staff disable or re-enable a link ───────────────────────────────────────

create or replace function public.set_partner_link_status(p_link_id uuid, p_status text, p_reason text default null)
  returns void
  language plpgsql
  security definer
  set search_path = ''
as $$
declare
  link  public.affiliate_links;
  reason text := nullif(btrim(coalesce(p_reason, '')), '');
begin
  select * into link from public.affiliate_links where id = p_link_id for update;
  if link.id is null then
    raise exception 'link_not_found' using errcode = 'P0002';
  end if;
  if not private.has_staff_role(array['program_manager'], link.program_id) then
    raise exception 'not_authorised' using errcode = '42501';
  end if;
  if p_status not in ('active', 'disabled') or p_status = link.status then
    raise exception 'invalid_transition' using errcode = '22023';
  end if;
  if p_status = 'disabled' and reason is null then
    raise exception 'reason_required' using errcode = '22023';
  end if;

  update public.affiliate_links set status = p_status where id = p_link_id;

  insert into public.partner_audit_log (actor_id, action, program_id, subject_id, details)
  values (auth.uid(), 'link.' || p_status, link.program_id, link.profile_id,
          jsonb_build_object('link_code', link.code, 'reason', reason));
end;
$$;

-- ─── Record a click (track-click Edge Function only) ─────────────────────────
-- Returns the click id and the cookie lifetime, or no row when the referral
-- isn't valid (unknown code, ambassador not approved, programme not tracking,
-- or the visitor is flooding clicks).

create or replace function public.record_partner_click(
  p_program_id       text,
  p_ref              text,
  p_link_code        text,
  p_landing_path     text,
  p_utm              jsonb,
  p_referrer_domain  text,
  p_ip_hash          text,
  p_consent          boolean
)
  returns table (click_id bigint, window_days int, model text)
  language plpgsql
  security definer
  set search_path = ''
as $$
declare
  prog     public.affiliate_programs;
  amb_id   uuid;
  lnk_id   uuid;
  dup      boolean;
begin
  select * into prog from public.affiliate_programs where id = p_program_id;
  if prog.id is null or prog.attribution_model is null then
    return;
  end if;

  select p.id into amb_id
  from public.affiliate_profiles p
  join public.affiliate_memberships m on m.profile_id = p.id
  where p.public_code = upper(p_ref) and m.program_id = p_program_id and m.status = 'approved';
  if amb_id is null then
    return;
  end if;

  -- ponytail: flat 100 clicks/hour per visitor; tune once real traffic shows what bots look like.
  if (select count(*) from public.affiliate_clicks c
      where c.ip_hash = p_ip_hash and c.at > now() - interval '1 hour') >= 100 then
    return;
  end if;

  if p_link_code is not null then
    select l.id into lnk_id from public.affiliate_links l
    where l.code = upper(p_link_code) and l.profile_id = amb_id
      and l.program_id = p_program_id and l.status = 'active';
  end if;

  select exists (
    select 1 from public.affiliate_clicks c
    where c.profile_id = amb_id and c.program_id = p_program_id and c.ip_hash = p_ip_hash
      and c.at > now() - interval '30 minutes'
  ) into dup;

  insert into public.affiliate_clicks
    (program_id, profile_id, link_id, landing_path, utm, referrer_domain, ip_hash, consent, is_duplicate)
  values
    (p_program_id, amb_id, lnk_id, left(coalesce(p_landing_path, '/'), 500), coalesce(p_utm, '{}'),
     left(p_referrer_domain, 255), p_ip_hash, coalesce(p_consent, false), dup)
  returning id into click_id;

  window_days := prog.attribution_window_days;
  model := prog.attribution_model;
  return next;
end;
$$;

-- The visitor accepted cookies after landing: mark that click as consented so
-- a referral token can be issued for it. Same visitor, same site, within an hour.
create or replace function public.consent_partner_click(p_click_id bigint, p_program_id text, p_ip_hash text)
  returns table (click_id bigint, window_days int, model text)
  language sql
  security definer
  set search_path = ''
as $$
  update public.affiliate_clicks c
  set consent = true
  from public.affiliate_programs a
  where c.id = p_click_id and c.program_id = p_program_id and a.id = c.program_id
    and c.ip_hash = p_ip_hash and not c.consent and c.at > now() - interval '1 hour'
  returning c.id, a.attribution_window_days, a.attribution_model;
$$;

revoke all on function public.create_partner_link(text, text, text) from public, anon;
revoke all on function public.set_partner_link_status(uuid, text, text) from public, anon;
revoke all on function public.record_partner_click(text, text, text, text, jsonb, text, text, boolean) from public, anon, authenticated;
revoke all on function public.consent_partner_click(bigint, text, text) from public, anon, authenticated;
grant execute on function public.create_partner_link(text, text, text) to authenticated;
grant execute on function public.set_partner_link_status(uuid, text, text) to authenticated;
-- Supabase's service_role (the Edge Function) is granted explicitly; it doesn't
-- inherit from public once that grant is revoked.
do $$ begin
  if exists (select 1 from pg_roles where rolname = 'service_role') then
    grant execute on function public.record_partner_click(text, text, text, text, jsonb, text, text, boolean) to service_role;
    grant execute on function public.consent_partner_click(bigint, text, text) to service_role;
  end if;
end $$;
