-- Phase 5b + 7: payouts (M-Pesa and bank) and fraud signals.
--
-- Flow (all through SECURITY DEFINER RPCs; tables are read-only to clients):
--   1. Ambassador saves payout details (M-Pesa number or bank account).
--      Only finance can read them in full; the ambassador sees them masked.
--   2. Finance creates a batch for one currency. It takes every commission that
--      is past its hold and not yet paid, minus anything reversed after being
--      paid, and snapshots each ambassador's payout details into the batch so a
--      later change can't redirect money already approved.
--   3. A DIFFERENT finance user approves it (two-person rule).
--   4. Finance pays each ambassador outside the portal and records the M-Pesa
--      or bank reference. When everyone is paid the batch closes as 'paid'.
-- Self-referred sales are never paid. Disputed sales wait, as do suspended
-- ambassadors and anyone whose payout details changed in the last 7 days.
-- Batch creation is serialised per currency and every batch change locks the
-- batch row, so concurrent clicks can't double-pay.
-- "Owed" per sale = its commission now - everything already in non-cancelled
-- batches, so refunds after a payout are deducted from the next one.

-- ─── Payout details ──────────────────────────────────────────────────────────

create table public.affiliate_payout_details (
  profile_id      uuid primary key references public.affiliate_profiles(id) on delete cascade,
  method          text not null check (method in ('mpesa', 'bank')),
  account_name    text not null check (char_length(account_name) between 2 and 120),
  mpesa_phone     text check (mpesa_phone ~ '^\+?[0-9]{9,15}$'),
  bank_name       text check (char_length(bank_name) between 2 and 120),
  bank_branch     text check (char_length(bank_branch) <= 120),
  account_number  text check (account_number ~ '^[A-Za-z0-9 -]{4,40}$'),
  swift_code      text check (swift_code ~ '^[A-Za-z0-9]{8}([A-Za-z0-9]{3})?$'),
  updated_at      timestamptz not null default now(),
  check ((method = 'mpesa' and mpesa_phone is not null)
      or (method = 'bank' and bank_name is not null and account_number is not null))
);

alter table public.affiliate_payout_details enable row level security;
create policy "Finance reads payout details"
  on public.affiliate_payout_details for select to authenticated
  using (private.has_staff_role(array['finance']));
revoke all on public.affiliate_payout_details from anon, authenticated;
grant select on public.affiliate_payout_details to authenticated;

create or replace function private.mask(v text)
  returns text language sql immutable set search_path = '' as $$
  select case when v is null then null
              when char_length(v) <= 4 then repeat('•', char_length(v))
              else repeat('•', 4) || right(v, 4) end
$$;

create or replace function public.save_payout_details(
  p_method text, p_account_name text, p_mpesa_phone text default null,
  p_bank_name text default null, p_bank_branch text default null,
  p_account_number text default null, p_swift_code text default null)
  returns void language plpgsql security definer set search_path = '' as $$
declare
  phone text := nullif(regexp_replace(coalesce(p_mpesa_phone, ''), '[\s-]', '', 'g'), '');
begin
  if auth.uid() is null
     or not exists (select 1 from public.affiliate_memberships m
                    where m.profile_id = auth.uid() and m.status = 'approved') then
    raise exception 'not_authorised' using errcode = '42501';
  end if;
  insert into public.affiliate_payout_details as d
    (profile_id, method, account_name, mpesa_phone, bank_name, bank_branch, account_number, swift_code, updated_at)
  values (auth.uid(), p_method, btrim(p_account_name),
          case when p_method = 'mpesa' then phone end,
          case when p_method = 'bank' then nullif(btrim(coalesce(p_bank_name, '')), '') end,
          case when p_method = 'bank' then nullif(btrim(coalesce(p_bank_branch, '')), '') end,
          case when p_method = 'bank' then nullif(btrim(coalesce(p_account_number, '')), '') end,
          case when p_method = 'bank' then nullif(upper(btrim(coalesce(p_swift_code, ''))), '') end,
          now())
  on conflict (profile_id) do update set
    method = excluded.method, account_name = excluded.account_name, mpesa_phone = excluded.mpesa_phone,
    bank_name = excluded.bank_name, bank_branch = excluded.bank_branch,
    account_number = excluded.account_number, swift_code = excluded.swift_code, updated_at = now();
  -- A changed payout destination is a classic account-takeover sign: log it.
  insert into public.partner_audit_log (actor_id, action, subject_id, details)
  values (auth.uid(), 'payout_details.updated', auth.uid(), jsonb_build_object('method', p_method));
end;
$$;

create or replace function public.my_payout_details()
  returns table (method text, account_name text, destination text, updated_at timestamptz)
  language sql stable security definer set search_path = '' as $$
  select d.method, d.account_name,
         case when d.method = 'mpesa' then 'M-Pesa ' || private.mask(d.mpesa_phone)
              else d.bank_name || ' ' || private.mask(d.account_number) end,
         d.updated_at
  from public.affiliate_payout_details d where d.profile_id = auth.uid()
$$;

-- ─── Batches ─────────────────────────────────────────────────────────────────

create table public.affiliate_payout_batches (
  id            uuid primary key default gen_random_uuid(),
  currency      text not null check (currency ~ '^[A-Z]{3}$'),
  status        text not null default 'draft' check (status in ('draft', 'approved', 'paid', 'cancelled')),
  created_by    uuid not null,
  created_at    timestamptz not null default now(),
  approved_by   uuid,
  approved_at   timestamptz,
  closed_at     timestamptz,
  note          text check (char_length(note) <= 1000)
);

-- One row per ambassador per batch, with the payout destination frozen.
create table public.affiliate_payout_payees (
  batch_id        uuid not null references public.affiliate_payout_batches(id),
  profile_id      uuid not null,
  amount          numeric(14,2) not null check (amount > 0),
  method          text not null,
  account_name    text not null,
  destination     text not null,
  paid_reference  text check (char_length(paid_reference) between 1 and 60),
  paid_by         uuid,
  paid_at         timestamptz,
  primary key (batch_id, profile_id)
);
create unique index affiliate_payout_payees_ref_idx
  on public.affiliate_payout_payees (upper(paid_reference)) where paid_reference is not null;

-- One row per sale (or deduction) making up a payee's amount.
create table public.affiliate_payout_items (
  id          bigint generated always as identity primary key,
  batch_id    uuid not null,
  profile_id  uuid not null,
  program_id  text not null,
  kind        text not null,
  reference   text not null,
  amount      numeric(14,2) not null check (amount <> 0),
  foreign key (batch_id, profile_id) references public.affiliate_payout_payees (batch_id, profile_id) on delete cascade
);
create index affiliate_payout_items_ref_idx on public.affiliate_payout_items (kind, reference);

alter table public.affiliate_payout_batches enable row level security;
alter table public.affiliate_payout_payees enable row level security;
alter table public.affiliate_payout_items enable row level security;
create policy "Finance reads batches" on public.affiliate_payout_batches for select to authenticated
  using (private.has_staff_role(array['finance']));
create policy "Finance reads payees" on public.affiliate_payout_payees for select to authenticated
  using (private.has_staff_role(array['finance']));
create policy "Finance reads payout items" on public.affiliate_payout_items for select to authenticated
  using (private.has_staff_role(array['finance']));
revoke all on public.affiliate_payout_batches, public.affiliate_payout_payees, public.affiliate_payout_items
  from anon, authenticated;
grant select on public.affiliate_payout_batches, public.affiliate_payout_payees, public.affiliate_payout_items
  to authenticated;

-- What each sale still owes (positive) or must claw back (negative).
-- Only ambassadors whose membership is approved: a suspended ambassador's
-- money is held until staff reinstate them.
create or replace function private.payout_owed(p_currency text)
  returns table (profile_id uuid, program_id text, kind text, reference text, owed numeric)
  language sql stable security definer set search_path = '' as $$
  select c.profile_id, c.program_id, c.kind, c.reference,
         c.commission - coalesce((
           select sum(i.amount) from public.affiliate_payout_items i
           join public.affiliate_payout_batches b on b.id = i.batch_id
           where i.kind = c.kind and i.reference = c.reference and b.status <> 'cancelled'), 0)
  from public.affiliate_conversions c
  where c.currency = p_currency
    and ((c.status = 'verified' and c.hold_until <= now()) or c.status = 'reversed')
    and exists (select 1 from public.affiliate_memberships m
                where m.profile_id = c.profile_id and m.program_id = c.program_id and m.status = 'approved')
    and not exists (select 1 from public.shopify_orders o
                    where c.kind = 'shop_order' and coalesce(o.order_name, o.order_id) = c.reference and o.self_referral)
    and not exists (select 1 from public.joat_engagements e
                    where c.kind = 'engagement' and e.reference = c.reference and e.self_referral)
$$;

create or replace function public.create_payout_batch(p_currency text)
  returns uuid language plpgsql security definer set search_path = '' as $$
declare
  v_batch uuid;
  v_payees int;
begin
  if not private.has_staff_role(array['finance']) then
    raise exception 'not_authorised' using errcode = '42501';
  end if;
  -- One batch creation per currency at a time, so two finance users (or two
  -- tabs) can't put the same sales into two batches.
  perform pg_advisory_xact_lock(hashtext('payout_batch:' || upper(p_currency)));

  insert into public.affiliate_payout_batches (currency, created_by)
  values (upper(p_currency), auth.uid()) returning id into v_batch;

  -- One statement = one snapshot: payee totals always equal their items.
  -- Ambassadors need payout details on file, unchanged for 7 days (a hijacked
  -- account can't redirect the next payout straight away).
  with o as (
    select o.* from private.payout_owed(upper(p_currency)) o
    join public.affiliate_payout_details d on d.profile_id = o.profile_id
    where o.owed <> 0 and d.updated_at <= now() - interval '7 days'
  ), totals as (
    select profile_id, sum(owed) amount from o group by profile_id having sum(owed) > 0
  ), payees as (
    insert into public.affiliate_payout_payees (batch_id, profile_id, amount, method, account_name, destination)
    select v_batch, t.profile_id, t.amount, d.method, d.account_name,
           case when d.method = 'mpesa' then d.mpesa_phone
                else concat_ws(' · ', d.bank_name, d.bank_branch, d.account_number, d.swift_code) end
    from totals t join public.affiliate_payout_details d on d.profile_id = t.profile_id
    returning profile_id
  )
  insert into public.affiliate_payout_items (batch_id, profile_id, program_id, kind, reference, amount)
  select v_batch, o.profile_id, o.program_id, o.kind, o.reference, o.owed
  from o join payees p on p.profile_id = o.profile_id;

  select count(*) into v_payees from public.affiliate_payout_payees where batch_id = v_batch;
  if v_payees = 0 then
    raise exception 'nothing_to_pay' using errcode = 'P0002';
  end if;

  insert into public.partner_audit_log (actor_id, action, details)
  values (auth.uid(), 'payout.batch_created',
          jsonb_build_object('batch', v_batch, 'currency', upper(p_currency), 'payees', v_payees));
  return v_batch;
end;
$$;

-- Every change to a batch locks its row first, so paying, cancelling and
-- removing can't interleave.
create or replace function private.lock_payout_batch(p_batch uuid)
  returns text language plpgsql security definer set search_path = '' as $$
declare v_status text;
begin
  select status into v_status from public.affiliate_payout_batches where id = p_batch for update;
  if v_status is null then
    raise exception 'invalid_transition' using errcode = '22023';
  end if;
  return v_status;
end;
$$;

create or replace function public.remove_payout_payee(p_batch uuid, p_profile uuid, p_reason text)
  returns void language plpgsql security definer set search_path = '' as $$
begin
  if not private.has_staff_role(array['finance']) then
    raise exception 'not_authorised' using errcode = '42501';
  end if;
  if nullif(btrim(coalesce(p_reason, '')), '') is null then
    raise exception 'reason_required' using errcode = '22023';
  end if;
  if private.lock_payout_batch(p_batch) <> 'draft' then
    raise exception 'invalid_transition' using errcode = '22023';
  end if;
  delete from public.affiliate_payout_payees where batch_id = p_batch and profile_id = p_profile;
  insert into public.partner_audit_log (actor_id, action, subject_id, details)
  values (auth.uid(), 'payout.payee_removed', p_profile, jsonb_build_object('batch', p_batch, 'reason', btrim(p_reason)));
end;
$$;

create or replace function public.approve_payout_batch(p_batch uuid)
  returns void language plpgsql security definer set search_path = '' as $$
declare b public.affiliate_payout_batches;
begin
  if not private.has_staff_role(array['finance']) then
    raise exception 'not_authorised' using errcode = '42501';
  end if;
  select * into b from public.affiliate_payout_batches where id = p_batch for update;
  if b.id is null or b.status <> 'draft' then
    raise exception 'invalid_transition' using errcode = '22023';
  end if;
  if b.created_by = auth.uid() then
    raise exception 'cannot_approve_own_batch' using errcode = '42501';
  end if;
  if exists (select 1 from public.affiliate_payout_payees where batch_id = p_batch and profile_id = auth.uid()) then
    raise exception 'cannot_approve_own_payout' using errcode = '42501';
  end if;
  if not exists (select 1 from public.affiliate_payout_payees where batch_id = p_batch) then
    raise exception 'nothing_to_pay' using errcode = 'P0002';
  end if;
  update public.affiliate_payout_batches set status = 'approved', approved_by = auth.uid(), approved_at = now()
  where id = p_batch;
  insert into public.partner_audit_log (actor_id, action, details)
  values (auth.uid(), 'payout.batch_approved', jsonb_build_object('batch', p_batch));
end;
$$;

create or replace function public.mark_payout_paid(p_batch uuid, p_profile uuid, p_reference text)
  returns void language plpgsql security definer set search_path = '' as $$
declare
  ref text := nullif(btrim(coalesce(p_reference, '')), '');
  v_amount numeric;
begin
  if not private.has_staff_role(array['finance']) then
    raise exception 'not_authorised' using errcode = '42501';
  end if;
  if ref is null then
    raise exception 'reference_required' using errcode = '22023';
  end if;
  if private.lock_payout_batch(p_batch) <> 'approved' then
    raise exception 'invalid_transition' using errcode = '22023';
  end if;
  if exists (select 1 from public.affiliate_payout_payees where upper(paid_reference) = upper(ref)) then
    raise exception 'duplicate_payment' using errcode = '23505';
  end if;
  update public.affiliate_payout_payees
  set paid_reference = ref, paid_by = auth.uid(), paid_at = now()
  where batch_id = p_batch and profile_id = p_profile and paid_reference is null
  returning amount into v_amount;
  if v_amount is null then
    raise exception 'invalid_transition' using errcode = '22023';
  end if;
  if not exists (select 1 from public.affiliate_payout_payees where batch_id = p_batch and paid_reference is null) then
    update public.affiliate_payout_batches set status = 'paid', closed_at = now() where id = p_batch;
  end if;
  insert into public.partner_audit_log (actor_id, action, subject_id, details)
  values (auth.uid(), 'payout.paid', p_profile,
          jsonb_build_object('batch', p_batch, 'amount', v_amount, 'reference', ref));
end;
$$;

create or replace function public.cancel_payout_batch(p_batch uuid, p_reason text)
  returns void language plpgsql security definer set search_path = '' as $$
begin
  if not private.has_staff_role(array['finance']) then
    raise exception 'not_authorised' using errcode = '42501';
  end if;
  if nullif(btrim(coalesce(p_reason, '')), '') is null then
    raise exception 'reason_required' using errcode = '22023';
  end if;
  -- Once anyone has been paid the batch can't be cancelled.
  if private.lock_payout_batch(p_batch) not in ('draft', 'approved')
     or exists (select 1 from public.affiliate_payout_payees where batch_id = p_batch and paid_reference is not null) then
    raise exception 'invalid_transition' using errcode = '22023';
  end if;
  update public.affiliate_payout_batches set status = 'cancelled', closed_at = now(), note = btrim(p_reason)
  where id = p_batch;
  insert into public.partner_audit_log (actor_id, action, details)
  values (auth.uid(), 'payout.batch_cancelled', jsonb_build_object('batch', p_batch, 'reason', btrim(p_reason)));
end;
$$;

-- Ambassador's own payouts (approved or paid; drafts are internal).
create or replace function public.my_payouts()
  returns table (batch_id uuid, currency text, amount numeric, status text, method text,
                 approved_at timestamptz, paid_at timestamptz, paid_reference text)
  language sql stable security definer set search_path = '' as $$
  select b.id, b.currency, p.amount, case when p.paid_at is not null then 'paid' else b.status end,
         p.method, b.approved_at, p.paid_at, p.paid_reference
  from public.affiliate_payout_payees p join public.affiliate_payout_batches b on b.id = p.batch_id
  where p.profile_id = auth.uid() and b.status in ('approved', 'paid')
  order by b.approved_at desc
$$;

-- ─── Fraud signals (Phase 7) ─────────────────────────────────────────────────
-- Per ambassador and programme, last 30 days. Uses ip_hash, which no client
-- can read directly, so only aggregate counts leave the database.

create or replace function public.partner_fraud_signals()
  returns table (profile_id uuid, program_id text, clicks int, unique_visitors int,
                 top_visitor_clicks int, duplicate_clicks int, sales int, self_referrals int)
  language sql stable security definer set search_path = '' as $$
  with c as (
    select k.profile_id, k.program_id, k.ip_hash, k.is_duplicate
    from public.affiliate_clicks k
    where k.at > now() - interval '30 days'
      and private.has_staff_role(array['support', 'finance', 'program_manager'], k.program_id)
  ), per_ip as (
    select profile_id, program_id, ip_hash, count(*) n from c group by 1, 2, 3
  ), s as (
    select v.profile_id, v.program_id, count(*)::int sales
    from public.affiliate_conversions v
    where v.occurred_at > now() - interval '30 days' and v.status <> 'awaiting_payment'
    group by 1, 2
  ), self as (
    select o.profile_id, 'amare'::text program_id, count(*)::int n from public.shopify_orders o
    where o.self_referral and private.has_staff_role(array['support', 'finance', 'program_manager'], 'amare')
    group by 1
    union all
    select e.profile_id, 'joat', count(*)::int from public.joat_engagements e
    where e.self_referral and private.has_staff_role(array['support', 'finance', 'program_manager'], 'joat')
    group by 1
  ), keys as (
    select profile_id, program_id from c union select profile_id, program_id from s
    union select profile_id, program_id from self
  )
  select k.profile_id, k.program_id,
         (select count(*)::int from c where c.profile_id = k.profile_id and c.program_id = k.program_id),
         (select count(distinct ip_hash)::int from c where c.profile_id = k.profile_id and c.program_id = k.program_id),
         coalesce((select max(n)::int from per_ip p where p.profile_id = k.profile_id and p.program_id = k.program_id), 0),
         (select count(*)::int from c where c.profile_id = k.profile_id and c.program_id = k.program_id and c.is_duplicate),
         coalesce((select sales from s where s.profile_id = k.profile_id and s.program_id = k.program_id), 0),
         coalesce((select n from self where self.profile_id = k.profile_id and self.program_id = k.program_id), 0)
  from keys k
  where k.profile_id is not null
$$;

-- ─── Permissions ─────────────────────────────────────────────────────────────

revoke all on function private.mask(text) from public, anon, authenticated;
revoke all on function private.payout_owed(text) from public, anon, authenticated;
revoke all on function private.lock_payout_batch(uuid) from public, anon, authenticated;
revoke all on function public.save_payout_details(text, text, text, text, text, text, text) from public, anon;
revoke all on function public.my_payout_details() from public, anon;
revoke all on function public.create_payout_batch(text) from public, anon;
revoke all on function public.remove_payout_payee(uuid, uuid, text) from public, anon;
revoke all on function public.approve_payout_batch(uuid) from public, anon;
revoke all on function public.mark_payout_paid(uuid, uuid, text) from public, anon;
revoke all on function public.cancel_payout_batch(uuid, text) from public, anon;
revoke all on function public.my_payouts() from public, anon;
revoke all on function public.partner_fraud_signals() from public, anon;
grant execute on function public.save_payout_details(text, text, text, text, text, text, text) to authenticated;
grant execute on function public.my_payout_details() to authenticated;
grant execute on function public.create_payout_batch(text) to authenticated;
grant execute on function public.remove_payout_payee(uuid, uuid, text) to authenticated;
grant execute on function public.approve_payout_batch(uuid) to authenticated;
grant execute on function public.mark_payout_paid(uuid, uuid, text) to authenticated;
grant execute on function public.cancel_payout_batch(uuid, text) to authenticated;
grant execute on function public.my_payouts() to authenticated;
grant execute on function public.partner_fraud_signals() to authenticated;

-- Defence in depth: user filters can't be pushed below the view's own row filter.
alter view public.affiliate_conversions set (security_barrier = true);
