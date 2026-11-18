-- ─── Partner portal foundation (Ambassador Programme, Phase 1) ─────────────
-- Programmes, staff roles, ambassador profiles and programme memberships for
-- partners.joatglobal.com. See docs/partners/stage-1-discovery.md §8.
--
-- Access model:
--   * Ambassadors read only their own profile and memberships.
--   * Staff access comes from public.partner_staff and only counts when the
--     session has passed two-factor sign-in (JWT aal = 'aal2'). Without MFA a
--     staff member is treated like any other user.
--   * Programme managers are scoped to one programme; other roles are global.
--   * Nothing here is writable from the browser except an ambassador's own
--     editable profile fields. Applications, approvals and status changes
--     arrive in Phase 2 as audited server-side functions.
--   * Staff rows are granted by hand in the SQL editor (service role), see
--     docs/partners/portal-deploy.md. There is no self-service path.

create schema if not exists private;

-- ─── Helpers ─────────────────────────────────────────────────────────────────

-- 8-character public referral code, Crockford base32 (no I, L, O, U), random
-- and non-sequential. Bytes 6 and 8 of a v4 UUID carry version/variant bits,
-- so they are skipped. 32^8 ≈ 1.1e12 codes; the unique constraint on
-- affiliate_profiles.public_code catches the (negligible) collision.
create or replace function private.new_public_code()
  returns text
  language sql
  volatile
  set search_path = ''
as $$
  select string_agg(substr('0123456789ABCDEFGHJKMNPQRSTVWXYZ', (get_byte(r.b, i) % 32) + 1, 1), '' order by i)
  from (select pg_catalog.uuid_send(pg_catalog.gen_random_uuid()) as b) r,
       unnest(array[0, 1, 2, 3, 4, 5, 10, 11]) as i;
$$;

-- ─── Programmes ──────────────────────────────────────────────────────────────

create table public.affiliate_programs (
  id                        text primary key check (id ~ '^[a-z][a-z0-9_]{1,30}$'),
  name                      text not null,
  attribution_window_days   int  not null default 30 check (attribution_window_days between 1 and 365),
  -- Null until the owner explicitly selects a model (decision D4). Tracking
  -- refuses to run for a programme with no model set.
  attribution_model         text check (attribution_model in ('first_touch', 'last_touch')),
  accepting_applications    boolean not null default false,
  created_at                timestamptz not null default now()
);

insert into public.affiliate_programs (id, name) values
  ('joat', 'JOAT Global'),
  ('amare', 'Amare''s Big Planet')
on conflict (id) do nothing;

alter table public.affiliate_programs enable row level security;

create policy "Anyone can read programmes"
  on public.affiliate_programs for select
  to anon, authenticated
  using (true);

revoke insert, update, delete, truncate on public.affiliate_programs from anon, authenticated;

-- ─── Staff roles ─────────────────────────────────────────────────────────────

create table public.partner_staff (
  user_id     uuid not null references auth.users(id) on delete cascade,
  role        text not null check (role in ('super_admin', 'program_manager', 'finance', 'support')),
  program_id  text references public.affiliate_programs(id),
  created_at  timestamptz not null default now(),
  -- Programme managers are always scoped to one programme; every other role is global.
  check ((role = 'program_manager') = (program_id is not null))
);

create unique index partner_staff_unique_idx
  on public.partner_staff (user_id, role, coalesce(program_id, ''));

-- True when the caller has passed MFA and holds one of `roles` (super_admin
-- always qualifies). With `program` null, only globally scoped roles count.
-- SECURITY DEFINER so policies can consult partner_staff without recursing
-- into its own RLS.
create or replace function private.has_staff_role(roles text[], program text default null)
  returns boolean
  language sql
  stable
  security definer
  set search_path = ''
as $$
  select coalesce(auth.jwt() ->> 'aal', '') = 'aal2'
     and exists (
       select 1 from public.partner_staff s
       where s.user_id = auth.uid()
         and (s.role = 'super_admin'
              or (s.role = any(roles) and (s.program_id is null or s.program_id = program)))
     );
$$;

revoke all on function private.has_staff_role(text[], text) from public, anon;
grant usage on schema private to authenticated;
grant execute on function private.has_staff_role(text[], text) to authenticated;
revoke all on function private.new_public_code() from public, anon, authenticated;

alter table public.partner_staff enable row level security;

-- Own rows without MFA, so the portal can tell a staff member to set up MFA.
create policy "Staff read own roles; super admins read all"
  on public.partner_staff for select
  to authenticated
  using (user_id = auth.uid() or private.has_staff_role(array[]::text[]));

revoke all on public.partner_staff from anon;
revoke insert, update, delete, truncate on public.partner_staff from authenticated;

-- ─── Ambassador profiles ─────────────────────────────────────────────────────

create table public.affiliate_profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  public_code   text not null unique default private.new_public_code(),
  full_name     text not null check (char_length(full_name) between 1 and 120),
  country       text not null check (char_length(country) between 2 and 80),
  social_links  text[] not null default '{}' check (cardinality(social_links) <= 10),
  created_at    timestamptz not null default now()
);

-- ─── Programme memberships ───────────────────────────────────────────────────

create table public.affiliate_memberships (
  profile_id         uuid not null references public.affiliate_profiles(id) on delete cascade,
  program_id         text not null references public.affiliate_programs(id),
  status             text not null default 'pending'
                       check (status in ('pending', 'approved', 'rejected', 'suspended', 'withdrawn')),
  status_changed_at  timestamptz not null default now(),
  created_at         timestamptz not null default now(),
  primary key (profile_id, program_id)
);

create index affiliate_memberships_program_idx on public.affiliate_memberships (program_id, status);

alter table public.affiliate_profiles enable row level security;
alter table public.affiliate_memberships enable row level security;

create policy "Ambassadors read own memberships; staff read their programmes"
  on public.affiliate_memberships for select
  to authenticated
  using (
    profile_id = auth.uid()
    or private.has_staff_role(array['support', 'finance', 'program_manager'], program_id)
  );

create policy "Ambassadors read own profile; staff read profiles in their programmes"
  on public.affiliate_profiles for select
  to authenticated
  using (
    id = auth.uid()
    or private.has_staff_role(array['support', 'finance'])
    or exists (
      select 1 from public.affiliate_memberships m
      where m.profile_id = affiliate_profiles.id
        and private.has_staff_role(array['program_manager'], m.program_id)
    )
  );

create policy "Ambassadors update own profile"
  on public.affiliate_profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- Column grants: an ambassador may edit only these fields, never their code.
revoke all on public.affiliate_profiles from anon;
revoke all on public.affiliate_memberships from anon;
revoke insert, update, delete, truncate on public.affiliate_profiles from authenticated;
revoke insert, update, delete, truncate on public.affiliate_memberships from authenticated;
grant update (full_name, country, social_links) on public.affiliate_profiles to authenticated;
