-- ─── One referral code per programme ─────────────────────────────────────────
-- Until now an ambassador had one code (affiliate_profiles.public_code) for
-- every programme. Each membership now has its own code (ref_code), so an
-- ambassador in both programmes shares a JOAT code and a different Amare code,
-- and every click, sale and chart is clearly one programme's.
--
-- Existing memberships: one keeps the ambassador's current code (the Amare
-- membership if there is one, since that code is typed on the website and in
-- the shop cart); any other membership gets a new code and keeps the old one
-- as alias_code, so links already shared for that programme keep working.
-- New memberships: the first gets the profile's public_code, later ones a new code.
-- All code matching goes through private.ambassador_for_code.

alter table public.affiliate_memberships
  add column ref_code text unique,
  add column alias_code text;
create index affiliate_memberships_alias_idx on public.affiliate_memberships (alias_code) where alias_code is not null;

-- A code used nowhere yet (profile codes, membership codes or aliases).
create or replace function private.new_referral_code()
  returns text
  language plpgsql
  volatile
  security definer
  set search_path = ''
as $$
declare
  c text;
begin
  loop
    c := private.new_public_code();
    exit when not exists (select 1 from public.affiliate_profiles where public_code = c)
          and not exists (select 1 from public.affiliate_memberships where ref_code = c or alias_code = c);
  end loop;
  return c;
end;
$$;

with ranked as (
  select m.profile_id, m.program_id, p.public_code,
         row_number() over (partition by m.profile_id
                            order by (m.program_id = 'amare') desc, m.created_at, m.program_id) n
  from public.affiliate_memberships m
  join public.affiliate_profiles p on p.id = m.profile_id
)
update public.affiliate_memberships m
set ref_code = case when r.n = 1 then r.public_code else private.new_referral_code() end,
    alias_code = case when r.n = 1 then null else r.public_code end
from ranked r
where r.profile_id = m.profile_id and r.program_id = m.program_id;

alter table public.affiliate_memberships alter column ref_code set not null;

create or replace function private.set_membership_code()
  returns trigger
  language plpgsql
  security definer
  set search_path = ''
as $$
begin
  if new.ref_code is null then
    select case when exists (select 1 from public.affiliate_memberships o
                             where o.profile_id = new.profile_id and o.ref_code = p.public_code)
                then private.new_referral_code() else p.public_code end
    into new.ref_code
    from public.affiliate_profiles p where p.id = new.profile_id;
  end if;
  return new;
end;
$$;

create trigger affiliate_memberships_code
  before insert on public.affiliate_memberships
  for each row execute function private.set_membership_code();

-- The approved ambassador a code belongs to in a programme, or null.
create or replace function private.ambassador_for_code(p_program_id text, p_code text)
  returns uuid
  language sql
  stable
  security definer
  set search_path = ''
as $$
  select m.profile_id from public.affiliate_memberships m
  where m.program_id = p_program_id and m.status = 'approved'
    and (m.ref_code = upper(btrim(p_code)) or m.alias_code = upper(btrim(p_code)))
  limit 1;
$$;

revoke all on function private.new_referral_code() from public, anon, authenticated;
revoke all on function private.set_membership_code() from public, anon, authenticated;
revoke all on function private.ambassador_for_code(text, text) from public, anon, authenticated;

-- ─── Code matching now per membership (bodies otherwise unchanged) ───────────

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

  amb_id := private.ambassador_for_code(p_program_id, p_ref);
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

  amb := private.ambassador_for_code(p_program_id, p_code);

  if amb is null then
    -- ponytail: purges old rows inline; move to pg_cron if this table ever grows large.
    delete from private.ambassador_lookup_failures where at < now() - interval '1 day';
    insert into private.ambassador_lookup_failures (ip_hash) values (p_ip_hash);
  end if;
  return amb;
end;
$$;

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
      where c.program_id = 'amare' and c.source = 'code_cart' and c.consent
        and c.profile_id = private.ambassador_for_code('amare', p_data ->> 'code')
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
        select x.amb into amb
        from jsonb_array_elements_text(p_data -> 'discount_codes') d(code)
        cross join lateral (select private.ambassador_for_code('amare', d.code) amb) x
        where x.amb is not null
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
  select w.profile_id, mm.ref_code, w.ok and prog.pct is not null, prog.pct,
         d.shopify_id, d.percent, d.active
  from who w
  cross join prog
  join public.affiliate_memberships mm on mm.profile_id = w.profile_id and mm.program_id = p_program_id
  left join public.ambassador_discount_codes d on d.profile_id = w.profile_id and d.program_id = p_program_id;
end;
$$;

create or replace function public.export_active_ambassadors()
  returns table (full_name text, email text, country text, program_id text, commission_rate numeric,
                 member_since timestamptz, public_code text, social_links text[])
  language plpgsql security definer set search_path = '' as $$
begin
  -- An empty role list matches super admins only (with two-factor sign-in).
  if not private.has_staff_role(array[]::text[]) then
    raise exception 'not_authorised' using errcode = '42501';
  end if;
  insert into public.partner_audit_log (actor_id, action, details)
  values (auth.uid(), 'ambassadors.exported', '{}'::jsonb);
  return query
    select p.full_name, u.email::text, p.country, m.program_id, m.commission_rate,
           m.status_changed_at, m.ref_code, p.social_links
    from public.affiliate_memberships m
    join public.affiliate_profiles p on p.id = m.profile_id
    join auth.users u on u.id = m.profile_id
    where m.status = 'approved'
    order by p.full_name, m.program_id;
end;
$$;
