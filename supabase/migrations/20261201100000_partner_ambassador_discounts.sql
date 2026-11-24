-- ─── Ambassador discount codes in Shopify (built, OFF) ───────────────────────
-- Shopify checkout only accepts codes that exist as real discounts. When a
-- super admin sets ambassador_discount_percent, the sync-shopify-discounts
-- Edge Function creates one discount per approved ambassador (code =
-- public_code, that percentage, once per customer) and switches codes off for
-- ambassadors who are no longer approved. NULL (the default, and Amare's
-- setting) means no discounts: a sync then switches every code off.
-- Setup: docs/partners/shopify-discounts.md.

alter table public.affiliate_programs
  add column ambassador_discount_percent numeric(5,2)
    check (ambassador_discount_percent > 0 and ambassador_discount_percent < 100);

-- What has been created in Shopify, so later syncs update rather than duplicate.
create table public.ambassador_discount_codes (
  profile_id  uuid not null references public.affiliate_profiles(id) on delete cascade,
  program_id  text not null references public.affiliate_programs(id),
  code        text not null,
  shopify_id  text not null,
  percent     numeric(5,2) not null,
  active      boolean not null,
  synced_at   timestamptz not null default now(),
  primary key (profile_id, program_id)
);
alter table public.ambassador_discount_codes enable row level security;
revoke all on public.ambassador_discount_codes from anon, authenticated;

-- Super admin sets (or clears, with null) the percentage.
create or replace function public.set_program_discount_percent(p_program_id text, p_percent numeric)
  returns void
  language plpgsql
  security definer
  set search_path = ''
as $$
begin
  if not private.has_staff_role(array[]::text[]) then
    raise exception 'not_authorised' using errcode = '42501';
  end if;
  if p_percent is not null and not (p_percent > 0 and p_percent < 100) then
    raise exception 'invalid_percent' using errcode = '22023';
  end if;
  if not exists (select 1 from public.affiliate_programs a where a.id = p_program_id and a.shop_url is not null) then
    raise exception 'no_shop' using errcode = '22023';
  end if;

  update public.affiliate_programs set ambassador_discount_percent = p_percent where id = p_program_id;

  insert into public.partner_audit_log (actor_id, action, program_id, details)
  values (auth.uid(), 'program.discount_set', p_program_id, jsonb_build_object('percent', p_percent));
end;
$$;

-- What a sync has to do. Called as the signed-in super admin (MFA required),
-- which is how the Edge Function checks who is asking.
create or replace function public.discount_sync_plan(p_program_id text)
  returns table (profile_id uuid, code text, want_active boolean, percent numeric,
                 shopify_id text, synced_percent numeric, active boolean)
  language plpgsql
  stable
  security definer
  set search_path = ''
as $$
#variable_conflict use_column
begin
  if not private.has_staff_role(array[]::text[]) then
    raise exception 'not_authorised' using errcode = '42501';
  end if;
  return query
  with prog as (
    select a.ambassador_discount_percent pct from public.affiliate_programs a where a.id = p_program_id
  ), who as (
    select m.profile_id, (m.status = 'approved') ok from public.affiliate_memberships m
    where m.program_id = p_program_id and m.status = 'approved'
    union
    select d.profile_id, false from public.ambassador_discount_codes d
    where d.program_id = p_program_id
      and not exists (select 1 from public.affiliate_memberships m
                      where m.profile_id = d.profile_id and m.program_id = p_program_id and m.status = 'approved')
  )
  select w.profile_id, p.public_code, w.ok and prog.pct is not null, prog.pct,
         d.shopify_id, d.percent, d.active
  from who w
  cross join prog
  join public.affiliate_profiles p on p.id = w.profile_id
  left join public.ambassador_discount_codes d on d.profile_id = w.profile_id and d.program_id = p_program_id;
end;
$$;

-- The Edge Function records each Shopify change (service role only).
create or replace function public.record_discount_sync(
  p_program_id text, p_profile_id uuid, p_code text, p_shopify_id text, p_percent numeric, p_active boolean
)
  returns void
  language sql
  security definer
  set search_path = ''
as $$
  insert into public.ambassador_discount_codes (profile_id, program_id, code, shopify_id, percent, active)
  values (p_profile_id, p_program_id, p_code, p_shopify_id, p_percent, p_active)
  on conflict (profile_id, program_id) do update set
    code = excluded.code, shopify_id = excluded.shopify_id, percent = excluded.percent,
    active = excluded.active, synced_at = now();
$$;

revoke all on function public.set_program_discount_percent(text, numeric) from public, anon;
revoke all on function public.discount_sync_plan(text) from public, anon;
revoke all on function public.record_discount_sync(text, uuid, text, text, numeric, boolean) from public, anon, authenticated;
grant execute on function public.set_program_discount_percent(text, numeric) to authenticated;
grant execute on function public.discount_sync_plan(text) to authenticated;
do $$ begin
  if exists (select 1 from pg_roles where rolname = 'service_role') then
    grant execute on function public.record_discount_sync(text, uuid, text, text, numeric, boolean) to service_role;
  end if;
end $$;
