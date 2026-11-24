-- ─── Shopify attribution fallbacks ───────────────────────────────────────────
-- On orders/paid, the ambassador is decided in this order:
--   1. A valid _abp_ref token (checked in the Edge Function, passed as p_click_id).
--   2. _abp_code in the cart attributes, but only when it is backed by a real
--      "Apply" in the cart: a code_cart click for that code, from the same
--      visitor (daily IP hash of the order's browser_ip), within the window.
--      Typing a code straight into the hidden attribute credits nothing.
--      That click is reused; no new click is made.
--   3. A Shopify discount code equal to an approved ambassador's code (only
--      exists once ambassador discounts are switched on). A click with
--      source 'discount_code' is recorded for the order, carrying the order's
--      own IP hash and landing page. Orders without them (draft or POS
--      orders) store null rather than made-up values.
-- p_data gains (built by shopify-webhook): code, discount_codes[], ip_hash,
-- landing_path. Everything else (self-referral check, refunds, cancellations,
-- disputes, webhook_events idempotency) is unchanged.

alter table public.affiliate_clicks
  alter column ip_hash drop not null,
  alter column landing_path drop not null,
  add constraint affiliate_clicks_visit_details_check
    check (source = 'discount_code' or (ip_hash is not null and landing_path is not null));

create or replace function public.ingest_shopify_event(
  p_webhook_id  text,
  p_topic       text,
  p_event_at    timestamptz,
  p_data        jsonb,
  p_click_id    bigint
)
  returns text
  language plpgsql
  security definer
  set search_path = ''
as $$
declare
  ev_id      text := 'shopify:' || p_webhook_id;
  amb        uuid;
  v_click    bigint := p_click_id;
  ordered    timestamptz := coalesce((p_data ->> 'created_at')::timestamptz, p_event_at);
  win        interval;
  revenue    numeric(14,2);
  v_outcome  text := 'processed';
begin
  insert into public.webhook_events (id, provider, topic, resource_id)
  values (ev_id, 'shopify', p_topic, p_data ->> 'order_id')
  on conflict (id) do nothing;
  if not found then
    return 'duplicate';
  end if;

  if p_topic = 'orders/paid' then
    select make_interval(days => a.attribution_window_days) into win
    from public.affiliate_programs a where a.id = 'amare';

    -- 2. A code applied in the cart, backed by its Apply click.
    if v_click is null and p_data ->> 'code' is not null and p_data ->> 'ip_hash' is not null then
      select c.id into v_click
      from public.affiliate_clicks c
      join public.affiliate_profiles p on p.id = c.profile_id
      join public.affiliate_memberships m on m.profile_id = c.profile_id and m.program_id = 'amare'
      where c.program_id = 'amare' and c.source = 'code_cart' and c.consent
        and p.public_code = upper(p_data ->> 'code') and m.status = 'approved'
        and c.ip_hash = p_data ->> 'ip_hash'
        and c.at between ordered - win and ordered + interval '10 minutes'
      order by c.at desc
      limit 1;
    end if;

    -- 3. An ambassador's discount code used at checkout.
    if v_click is null and jsonb_typeof(p_data -> 'discount_codes') = 'array' then
      -- The same order paid again under a new webhook id reuses its click.
      select o.click_id into v_click from public.shopify_orders o
      where o.order_id = p_data ->> 'order_id' and o.click_id is not null;

      if v_click is null then
        select p.id into amb
        from jsonb_array_elements_text(p_data -> 'discount_codes') d(code)
        join public.affiliate_profiles p on p.public_code = upper(d.code)
        join public.affiliate_memberships m on m.profile_id = p.id and m.program_id = 'amare'
        where m.status = 'approved'
        limit 1;

        if amb is not null then
          insert into public.affiliate_clicks
            (at, program_id, profile_id, landing_path, ip_hash, consent, source)
          values
            (ordered, 'amare', amb, left(p_data ->> 'landing_path', 500), p_data ->> 'ip_hash', true, 'discount_code')
          returning id into v_click;
        end if;
      end if;
    end if;

    select c.profile_id into amb
    from public.affiliate_clicks c
    where c.id = v_click and c.program_id = 'amare' and c.consent;

    if amb is null then
      v_outcome := 'ignored: no referral';
    else
      select coalesce(sum(
               (l ->> 'price')::numeric * (l ->> 'qty')::int
               - (select coalesce(sum(d::numeric), 0)
                  from jsonb_array_elements_text(coalesce(l -> 'discounts', '[]')) d)
             ), 0)
      into revenue
      from jsonb_array_elements(coalesce(p_data -> 'lines', '[]')) l
      where not coalesce((l ->> 'gift_card')::boolean, false);

      insert into public.shopify_orders
        (order_id, order_name, currency, ordered_at, paid_at, eligible_revenue, click_id, profile_id, self_referral)
      values
        (p_data ->> 'order_id', left(p_data ->> 'name', 40), p_data ->> 'currency',
         (p_data ->> 'created_at')::timestamptz, p_event_at, greatest(revenue, 0), v_click, amb,
         private.is_self_referral(amb, p_data ->> 'email_hash'))
      on conflict (order_id) do update set
        order_name = excluded.order_name, currency = excluded.currency, ordered_at = excluded.ordered_at,
        paid_at = excluded.paid_at, eligible_revenue = excluded.eligible_revenue,
        click_id = excluded.click_id, profile_id = excluded.profile_id,
        self_referral = excluded.self_referral, updated_at = now();
    end if;

  elsif p_topic = 'refunds/create' then
    insert into public.shopify_refunds (refund_id, order_id, amount, refunded_at)
    select p_data ->> 'refund_id', p_data ->> 'order_id',
           coalesce(sum((l ->> 'subtotal')::numeric), 0), p_event_at
    from jsonb_array_elements(coalesce(p_data -> 'lines', '[]')) l
    where not coalesce((l ->> 'gift_card')::boolean, false)
    on conflict (refund_id) do nothing;

  elsif p_topic = 'orders/cancelled' then
    insert into public.shopify_orders (order_id, cancelled_at)
    values (p_data ->> 'order_id', coalesce((p_data ->> 'cancelled_at')::timestamptz, p_event_at))
    on conflict (order_id) do update set cancelled_at = excluded.cancelled_at, updated_at = now();

  elsif p_topic in ('disputes/create', 'disputes/update') then
    insert into public.shopify_disputes (dispute_id, order_id, status, event_at)
    values (p_data ->> 'dispute_id', p_data ->> 'order_id', p_data ->> 'status', p_event_at)
    on conflict (dispute_id) do update set status = excluded.status, event_at = excluded.event_at
      where public.shopify_disputes.event_at <= excluded.event_at;

  else
    v_outcome := 'ignored: topic';
  end if;

  update public.webhook_events set outcome = v_outcome where id = ev_id;
  return v_outcome;
end;
$$;
