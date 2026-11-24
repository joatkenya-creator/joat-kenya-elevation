-- Commission tiers, frozen rates, USD-only programs, single-person payouts,
-- and the payout-details change email (decisions of 2026-11-21).
--
--   * Every ambassador starts at 8%. Program staff can move an ambassador to
--     10% (the growth tier, reviewed within their first 6 months).
--   * The rate is frozen on each sale when it's attributed, so a later rate
--     change never alters past sales.
--   * Both programs settle in USD: new JOAT invoices and payout batches must be
--     USD. The portal shows a local-currency estimate for display only.
--   * One person runs payouts end to end (the batch creator may approve it).
--   * Changing payout details triggers an email to the ambassador's sign-in
--     address (Edge Function payout-details-notify) when pg_net is available.

-- ─── Tiers ───────────────────────────────────────────────────────────────────

alter table public.affiliate_memberships
  add column commission_rate numeric(5,4) not null default 0.08
    check (commission_rate >= 0 and commission_rate <= 0.5);

-- The program rate is now the starting rate shown on public pages.
update public.affiliate_programs set commission_rate = 0.08 where id in ('joat', 'amare');

create or replace function public.set_commission_rate(
  p_profile uuid, p_program text, p_rate numeric, p_reason text)
  returns void language plpgsql security definer set search_path = '' as $$
declare v_old numeric;
begin
  if not private.has_staff_role(array['program_manager'], p_program) then
    raise exception 'not_authorised' using errcode = '42501';
  end if;
  if p_profile = auth.uid() then
    raise exception 'cannot_review_self' using errcode = '42501';
  end if;
  if p_rate not in (0.08, 0.10) then
    raise exception 'invalid_rate' using errcode = '22023';
  end if;
  if nullif(btrim(coalesce(p_reason, '')), '') is null then
    raise exception 'reason_required' using errcode = '22023';
  end if;
  select commission_rate into v_old from public.affiliate_memberships
  where profile_id = p_profile and program_id = p_program and status in ('approved', 'suspended')
  for update;
  if v_old is null then
    raise exception 'membership_not_found' using errcode = 'P0002';
  end if;
  update public.affiliate_memberships set commission_rate = p_rate
  where profile_id = p_profile and program_id = p_program;
  insert into public.partner_audit_log (actor_id, action, subject_id, details)
  values (auth.uid(), 'membership.rate_changed', p_profile,
          jsonb_build_object('program', p_program, 'from', v_old, 'to', p_rate, 'reason', btrim(p_reason)));
end;
$$;

revoke all on function public.set_commission_rate(uuid, text, numeric, text) from public, anon;
grant execute on function public.set_commission_rate(uuid, text, numeric, text) to authenticated;

-- ─── Frozen rate per sale ────────────────────────────────────────────────────

alter table public.shopify_orders add column commission_rate numeric(5,4);
alter table public.joat_engagements add column commission_rate numeric(5,4);

-- Sales recorded before today were made under the published 10%.
update public.shopify_orders set commission_rate = 0.10 where profile_id is not null;
update public.joat_engagements set commission_rate = 0.10;

-- Set when the sale is first attributed (or re-attributed); never on reprocessing.
create or replace function private.freeze_commission_rate()
  returns trigger language plpgsql security definer set search_path = '' as $$
declare v_program text := tg_argv[0];
begin
  if new.profile_id is not null
     and (tg_op = 'INSERT' or new.profile_id is distinct from old.profile_id) then
    new.commission_rate := coalesce(
      (select m.commission_rate from public.affiliate_memberships m
       where m.profile_id = new.profile_id and m.program_id = v_program),
      (select p.commission_rate from public.affiliate_programs p where p.id = v_program));
  end if;
  return new;
end;
$$;

create trigger shopify_orders_freeze_rate before insert or update of profile_id on public.shopify_orders
  for each row execute function private.freeze_commission_rate('amare');
create trigger joat_engagements_freeze_rate before insert or update of profile_id on public.joat_engagements
  for each row execute function private.freeze_commission_rate('joat');

-- Same view as 20261122100000, reading the frozen rate; commission_rate appended.
create or replace view public.affiliate_conversions with (security_barrier = true) as
select
  'amare'::text                                              as program_id,
  o.profile_id,
  'shop_order'::text                                         as kind,
  coalesce(o.order_name, o.order_id)                         as reference,
  o.paid_at                                                  as occurred_at,
  o.currency,
  greatest(o.eligible_revenue - coalesce(r.refunded, 0), 0)::numeric(14,2) as revenue,
  coalesce(r.refunded, 0)::numeric(14,2)                     as refunded,
  s.status,
  case when s.status = 'reversed' then 0
       else round(greatest(o.eligible_revenue - coalesce(r.refunded, 0), 0) * coalesce(o.commission_rate, 0), 2)
  end::numeric(14,2)                                         as commission,
  (o.paid_at + make_interval(days => pr.hold_days))          as hold_until,
  o.commission_rate
from public.shopify_orders o
join public.affiliate_programs pr on pr.id = 'amare'
left join lateral (select sum(f.amount) as refunded from public.shopify_refunds f where f.order_id = o.order_id) r on true
left join lateral (select x.status from public.shopify_disputes x where x.order_id = o.order_id
                   order by x.event_at desc limit 1) d on true
cross join lateral (select case
    when o.cancelled_at is not null
      or d.status in ('lost', 'accepted', 'charge_refunded')
      or o.eligible_revenue - coalesce(r.refunded, 0) <= 0 then 'reversed'
    when d.status is not null and d.status <> 'won' then 'disputed'
    else 'verified'
  end as status) s
where o.profile_id is not null and o.paid_at is not null
  and (o.profile_id = auth.uid()
       or private.has_staff_role(array['support', 'finance', 'program_manager'], 'amare'))
union all
select
  'joat',
  e.profile_id,
  'engagement',
  e.reference,
  p.first_paid,
  i.currency,
  coalesce(p.collected, 0)::numeric(14,2),
  0::numeric(14,2),
  case when coalesce(p.collected, 0) > 0 then 'verified' else 'awaiting_payment' end,
  round(coalesce(f.collected, 0) * coalesce(e.commission_rate, 0), 2)::numeric(14,2),
  (f.last_paid::timestamptz + make_interval(days => pr.hold_days)),
  e.commission_rate
from public.joat_engagements e
join public.affiliate_programs pr on pr.id = 'joat'
left join lateral (select min(v.currency) as currency from public.joat_invoices v where v.engagement_id = e.id) i on true
left join lateral (
  select sum(pay.amount) as collected, min(pay.received_on)::timestamptz as first_paid
  from public.joat_payments pay join public.joat_invoices inv on inv.id = pay.invoice_id
  where inv.engagement_id = e.id and pay.status = 'confirmed'
) p on true
left join lateral (
  select sum(pay.amount) as collected, max(pay.received_on) as last_paid
  from public.joat_payments pay
  where pay.status = 'confirmed'
    and pay.invoice_id = (select v.id from public.joat_invoices v where v.engagement_id = e.id
                          order by v.issued_on, v.created_at limit 1)
) f on true
where e.profile_id = auth.uid()
   or private.has_staff_role(array['support', 'finance', 'program_manager'], 'joat');

-- ─── USD only (existing rows are left as they are) ───────────────────────────

alter table public.joat_invoices
  add constraint joat_invoices_usd check (currency = 'USD') not valid;
alter table public.affiliate_payout_batches
  add constraint affiliate_payout_batches_usd check (currency = 'USD') not valid;

-- ─── One person runs payouts ─────────────────────────────────────────────────
-- Same as 20261123100000 without the creator check. A finance user who is
-- also paid in the batch still can't approve it.

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

-- ─── Payout-details change email ─────────────────────────────────────────────
-- The Edge Function emails once per change: it only sends when updated_at is
-- newer than notified_at, so calling it again (or by anyone) sends nothing.

alter table public.affiliate_payout_details add column notified_at timestamptz;

create or replace function private.notify_payout_details_change()
  returns trigger language plpgsql security definer set search_path = '' as $$
begin
  perform net.http_post(
    url := 'https://prkdfkkhqncxkyehokop.supabase.co/functions/v1/payout-details-notify',
    body := jsonb_build_object('profile_id', new.profile_id),
    headers := '{"content-type": "application/json"}'::jsonb);
  return null;
end;
$$;

-- Hosted Supabase has pg_net; the offline test database doesn't.
do $$
begin
  if exists (select 1 from pg_available_extensions where name = 'pg_net') then
    create extension if not exists pg_net;
    create trigger affiliate_payout_details_notify
      after insert or update of method, account_name, mpesa_phone, bank_name, bank_branch,
                                account_number, swift_code, updated_at
      on public.affiliate_payout_details
      for each row execute function private.notify_payout_details_change();
  end if;
end;
$$;
