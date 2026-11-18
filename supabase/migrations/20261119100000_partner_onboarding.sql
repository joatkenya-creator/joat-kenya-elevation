-- ─── Partner onboarding (Ambassador Programme, Phase 2) ────────────────────
-- Applications, staff review of programme memberships, ambassador withdrawal,
-- opening/closing applications, and an append-only activity log.
--
-- Every write goes through a SECURITY DEFINER function below that checks who
-- the caller is and which status changes are allowed. The tables themselves
-- stay read-only to the browser (see 20261118100000).

-- ─── Activity log (append-only) ──────────────────────────────────────────────

create table public.partner_audit_log (
  id          bigint generated always as identity primary key,
  at          timestamptz not null default now(),
  actor_id    uuid,                 -- who did it; null = system
  action      text not null,        -- e.g. 'membership.approved'
  program_id  text references public.affiliate_programs(id),
  subject_id  uuid,                 -- ambassador affected (kept even if the account is later deleted)
  details     jsonb not null default '{}'
);

create index partner_audit_log_subject_idx on public.partner_audit_log (subject_id, at desc);
create index partner_audit_log_at_idx on public.partner_audit_log (at desc);

alter table public.partner_audit_log enable row level security;

create policy "Staff read the activity log for their programmes"
  on public.partner_audit_log for select
  to authenticated
  using (
    private.has_staff_role(array['support', 'finance'])
    or (program_id is not null and private.has_staff_role(array['program_manager'], program_id))
  );

revoke all on public.partner_audit_log from anon;
revoke insert, update, delete, truncate on public.partner_audit_log from authenticated;

-- Even the service role can't rewrite history: updates, deletes and truncates fail.
create or replace function private.forbid_audit_change()
  returns trigger
  language plpgsql
  set search_path = ''
as $$
begin
  raise exception 'partner_audit_log is append-only';
end;
$$;

create trigger partner_audit_log_no_update_delete
  before update or delete on public.partner_audit_log
  for each row execute function private.forbid_audit_change();
create trigger partner_audit_log_no_truncate
  before truncate on public.partner_audit_log
  for each statement execute function private.forbid_audit_change();

-- ─── Applications ────────────────────────────────────────────────────────────
-- A snapshot of what the applicant submitted and agreed to. The decision for
-- each programme lives on affiliate_memberships.

create table public.affiliate_applications (
  id                      uuid primary key default gen_random_uuid(),
  -- No cascade: the agreement record outlives an account deletion request,
  -- which staff handle by hand.
  user_id                 uuid not null references auth.users(id),
  programs                text[] not null,
  full_name               text not null,
  country                 text not null,
  social_links            text[] not null default '{}',
  website                 text,
  audience                text,
  experience              text,
  marketing_interests     text,
  accepted_terms_version  text not null,
  accepted_at             timestamptz not null default now(),
  created_at              timestamptz not null default now()
);

create index affiliate_applications_user_idx on public.affiliate_applications (user_id, created_at desc);

alter table public.affiliate_applications enable row level security;

create policy "Applicants read own applications; staff read their programmes"
  on public.affiliate_applications for select
  to authenticated
  using (
    user_id = auth.uid()
    or private.has_staff_role(array['support', 'finance'])
    or exists (
      select 1 from unnest(programs) p
      where private.has_staff_role(array['program_manager'], p)
    )
  );

revoke all on public.affiliate_applications from anon;
revoke insert, update, delete, truncate on public.affiliate_applications from authenticated;

-- ─── Submit an application ───────────────────────────────────────────────────
-- Creates or updates the caller's profile, records the application, and sets
-- a 'pending' membership for each requested programme. Free: no fee or purchase
-- is involved anywhere in this flow.

create or replace function public.submit_partner_application(
  p_programs      text[],
  p_full_name     text,
  p_country       text,
  p_social_links  text[],
  p_website       text,
  p_audience      text,
  p_experience    text,
  p_interests     text,
  p_accept_terms  boolean
)
  returns uuid
  language plpgsql
  security definer
  set search_path = ''
as $$
declare
  uid            uuid := auth.uid();
  terms_version  constant text := 'draft-2026-11-18';
  progs          text[];
  links          text[] := coalesce(p_social_links, '{}');
  site           text := nullif(btrim(coalesce(p_website, '')), '');
  link           text;
  app_id         uuid;
begin
  if uid is null then
    raise exception 'not_signed_in' using errcode = '42501';
  end if;
  if not coalesce(p_accept_terms, false) then
    raise exception 'terms_not_accepted' using errcode = '22023';
  end if;

  select array_agg(distinct p order by p) into progs from unnest(p_programs) p;
  if progs is null then
    raise exception 'no_programme' using errcode = '22023';
  end if;
  if exists (
    select 1 from unnest(progs) p
    where not exists (
      select 1 from public.affiliate_programs a where a.id = p and a.accepting_applications
    )
  ) then
    raise exception 'programme_closed' using errcode = '22023';
  end if;

  p_full_name := btrim(coalesce(p_full_name, ''));
  p_country := btrim(coalesce(p_country, ''));
  if char_length(p_full_name) not between 1 and 120 then
    raise exception 'invalid_name' using errcode = '22023';
  end if;
  if char_length(p_country) not between 2 and 80 then
    raise exception 'invalid_country' using errcode = '22023';
  end if;
  if cardinality(links) > 10 then
    raise exception 'too_many_links' using errcode = '22023';
  end if;
  foreach link in array links || case when site is null then '{}'::text[] else array[site] end loop
    if link is null or char_length(link) > 300 or link !~* '^https?://[^\s<>"]+$' then
      raise exception 'invalid_link' using errcode = '22023';
    end if;
  end loop;
  if char_length(coalesce(p_audience, '')) > 1000
     or char_length(coalesce(p_experience, '')) > 2000
     or char_length(coalesce(p_interests, '')) > 1000 then
    raise exception 'text_too_long' using errcode = '22023';
  end if;

  if (select count(*) from public.affiliate_applications a
      where a.user_id = uid and a.created_at > now() - interval '1 day') >= 3 then
    raise exception 'too_many_applications' using errcode = 'P0429';
  end if;
  if exists (
    select 1 from public.affiliate_memberships m
    where m.profile_id = uid and m.program_id = any(progs)
      and m.status in ('pending', 'approved', 'suspended')
  ) then
    raise exception 'already_applied' using errcode = '23505';
  end if;

  insert into public.affiliate_profiles (id, full_name, country, social_links)
  values (uid, p_full_name, p_country, links)
  on conflict (id) do update
    set full_name = excluded.full_name, country = excluded.country, social_links = excluded.social_links;

  insert into public.affiliate_applications
    (user_id, programs, full_name, country, social_links, website, audience, experience,
     marketing_interests, accepted_terms_version)
  values
    (uid, progs, p_full_name, p_country, links, site, nullif(btrim(p_audience), ''),
     nullif(btrim(p_experience), ''), nullif(btrim(p_interests), ''), terms_version)
  returning id into app_id;

  -- Re-applying after a rejection or withdrawal puts the membership back to pending.
  insert into public.affiliate_memberships (profile_id, program_id)
  select uid, p from unnest(progs) p
  on conflict (profile_id, program_id) do update
    set status = 'pending', status_changed_at = now();

  insert into public.partner_audit_log (actor_id, action, program_id, subject_id, details)
  select uid, 'application.submitted', p, uid, jsonb_build_object('application_id', app_id)
  from unnest(progs) p;

  return app_id;
end;
$$;

-- ─── Staff review ────────────────────────────────────────────────────────────
-- Allowed changes: pending → approved | rejected; approved → suspended;
-- suspended → approved. Rejecting or suspending needs a reason (kept in the
-- activity log, not shown to the ambassador). Nobody reviews their own membership.

create or replace function public.review_partner_membership(
  p_profile_id  uuid,
  p_program_id  text,
  p_status      text,
  p_reason      text default null
)
  returns void
  language plpgsql
  security definer
  set search_path = ''
as $$
declare
  current_status  text;
  reason          text := nullif(btrim(coalesce(p_reason, '')), '');
begin
  if not private.has_staff_role(array['program_manager'], p_program_id) then
    raise exception 'not_authorised' using errcode = '42501';
  end if;
  if p_profile_id = auth.uid() then
    raise exception 'cannot_review_self' using errcode = '42501';
  end if;

  select m.status into current_status
  from public.affiliate_memberships m
  where m.profile_id = p_profile_id and m.program_id = p_program_id
  for update;

  if current_status is null then
    raise exception 'membership_not_found' using errcode = 'P0002';
  end if;
  if not ((current_status = 'pending' and p_status in ('approved', 'rejected'))
          or (current_status = 'approved' and p_status = 'suspended')
          or (current_status = 'suspended' and p_status = 'approved')) then
    raise exception 'invalid_transition' using errcode = '22023';
  end if;
  if p_status in ('rejected', 'suspended') and reason is null then
    raise exception 'reason_required' using errcode = '22023';
  end if;
  if char_length(coalesce(reason, '')) > 1000 then
    raise exception 'text_too_long' using errcode = '22023';
  end if;

  update public.affiliate_memberships
  set status = p_status, status_changed_at = now()
  where profile_id = p_profile_id and program_id = p_program_id;

  insert into public.partner_audit_log (actor_id, action, program_id, subject_id, details)
  values (auth.uid(), 'membership.' || p_status, p_program_id, p_profile_id,
          jsonb_build_object('from', current_status, 'reason', reason));
end;
$$;

-- ─── Ambassador withdraws from a programme ───────────────────────────────────

create or replace function public.withdraw_partner_membership(p_program_id text)
  returns void
  language plpgsql
  security definer
  set search_path = ''
as $$
declare
  previous_status text;
begin
  select m.status into previous_status
  from public.affiliate_memberships m
  where m.profile_id = auth.uid() and m.program_id = p_program_id
  for update;

  -- A suspended membership can't be withdrawn to sidestep the suspension.
  if previous_status is null or previous_status not in ('pending', 'approved') then
    raise exception 'nothing_to_withdraw' using errcode = '22023';
  end if;

  update public.affiliate_memberships
  set status = 'withdrawn', status_changed_at = now()
  where profile_id = auth.uid() and program_id = p_program_id;

  insert into public.partner_audit_log (actor_id, action, program_id, subject_id, details)
  values (auth.uid(), 'membership.withdrawn', p_program_id, auth.uid(),
          jsonb_build_object('from', previous_status));
end;
$$;

-- ─── Open or close applications (super admin only) ───────────────────────────

create or replace function public.set_partner_program_accepting(p_program_id text, p_accepting boolean)
  returns void
  language plpgsql
  security definer
  set search_path = ''
as $$
begin
  if not private.has_staff_role(array[]::text[]) then
    raise exception 'not_authorised' using errcode = '42501';
  end if;

  update public.affiliate_programs set accepting_applications = p_accepting where id = p_program_id;
  if not found then
    raise exception 'programme_not_found' using errcode = 'P0002';
  end if;

  insert into public.partner_audit_log (actor_id, action, program_id)
  values (auth.uid(),
          case when p_accepting then 'program.applications_opened' else 'program.applications_closed' end,
          p_program_id);
end;
$$;

revoke all on function public.submit_partner_application(text[], text, text, text[], text, text, text, text, boolean) from public, anon;
revoke all on function public.review_partner_membership(uuid, text, text, text) from public, anon;
revoke all on function public.withdraw_partner_membership(text) from public, anon;
revoke all on function public.set_partner_program_accepting(text, boolean) from public, anon;
revoke all on function private.forbid_audit_change() from public, anon, authenticated;

grant execute on function public.submit_partner_application(text[], text, text, text[], text, text, text, text, boolean) to authenticated;
grant execute on function public.review_partner_membership(uuid, text, text, text) to authenticated;
grant execute on function public.withdraw_partner_membership(text) to authenticated;
grant execute on function public.set_partner_program_accepting(text, boolean) to authenticated;
