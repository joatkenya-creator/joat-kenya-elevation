-- Phase 5a: commission rates and hold periods (decisions D6, D8 – 2026-11-20).
--   Amare: 10% of eligible net product revenue (after discounts and refunds,
--          excluding shipping and tax). Cancelled, refunded or lost-chargeback
--          orders earn nothing.
--   JOAT:  10% of the client's FIRST invoice, on confirmed payments only.
--   Both:  30-day hold after the payment before commission can be approved.
-- Rounded half-up to the cent per sale. Commission stays in the sale's currency.
--
-- Commission is calculated by the affiliate_conversions view from the stored
-- sales, so nothing is lost for sales recorded before this migration.
-- ponytail: the view uses the CURRENT rate. Before any rate change, freeze
-- commissions into a table (planned with payout batches) so past sales keep the
-- rate in force when they were verified, as the terms promise.

alter table public.affiliate_programs
  add column commission_rate numeric(5,4) check (commission_rate >= 0 and commission_rate <= 0.5),
  add column hold_days int not null default 30 check (hold_days between 0 and 180);

update public.affiliate_programs set commission_rate = 0.10, hold_days = 30 where id in ('joat', 'amare');

create or replace view public.affiliate_conversions as
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
       else round(greatest(o.eligible_revenue - coalesce(r.refunded, 0), 0) * coalesce(pr.commission_rate, 0), 2)
  end::numeric(14,2)                                         as commission,
  (o.paid_at + make_interval(days => pr.hold_days))          as hold_until
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
  round(coalesce(f.collected, 0) * coalesce(pr.commission_rate, 0), 2)::numeric(14,2),
  (f.last_paid::timestamptz + make_interval(days => pr.hold_days))
from public.joat_engagements e
join public.affiliate_programs pr on pr.id = 'joat'
left join lateral (select min(v.currency) as currency from public.joat_invoices v where v.engagement_id = e.id) i on true
left join lateral (
  select sum(pay.amount) as collected, min(pay.received_on)::timestamptz as first_paid
  from public.joat_payments pay join public.joat_invoices inv on inv.id = pay.invoice_id
  where inv.engagement_id = e.id and pay.status = 'confirmed'
) p on true
-- Commission only on the first invoice issued for the engagement.
left join lateral (
  select sum(pay.amount) as collected, max(pay.received_on) as last_paid
  from public.joat_payments pay
  where pay.status = 'confirmed'
    and pay.invoice_id = (select v.id from public.joat_invoices v where v.engagement_id = e.id
                          order by v.issued_on, v.created_at limit 1)
) f on true
where e.profile_id = auth.uid()
   or private.has_staff_role(array['support', 'finance', 'program_manager'], 'joat');

revoke all on public.affiliate_conversions from anon;
grant select on public.affiliate_conversions to authenticated;
