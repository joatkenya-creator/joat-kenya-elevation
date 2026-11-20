-- ─── Conversions: Amare shop orders and JOAT sales (Ambassador Programme, Phase 4) ─
-- Decisions (docs/partners/stage-1-discovery.md, decision log, 2026-11-19):
--   D3: Amare orders, refunds, cancellations and disputes arrive as Shopify
--       store webhooks (shopify-webhook Edge Function → ingest_shopify_event).
--   JOAT bills through M-Pesa statements, so JOAT sales are entered by staff:
--       engagement → invoice → payment, and a second staff member confirms
--       each payment before it counts.
--
-- Money is numeric(14,2) and all sums happen here in SQL, never in JS floats.
-- No commissions yet: Phase 5 calculates them from affiliate_conversions.

create extension if not exists pgcrypto with schema extensions;

-- ─── Referral token check in SQL (JOAT enquiry forms) ───────────────────────
-- Same token format as supabase/functions/_shared/referral.js. The signing key
-- lives in Supabase Vault under the name 'referral_token_key' (same value as
-- the REFERRAL_TOKEN_KEY Edge Function secret). See docs/partners/portal-deploy.md.

create or replace function private.referral_key()
  returns text
  language sql
  stable
  security definer
  set search_path = ''
as $$
  select decrypted_secret from vault.decrypted_secrets where name = 'referral_token_key' limit 1;
$$;

create or replace function private.b64url_decode(s text)
  returns bytea
  language sql
  immutable
  set search_path = ''
as $$
  select decode(rpad(translate(s, '-_', '+/'), ((char_length(s) + 3) / 4) * 4, '='), 'base64');
$$;

-- Returns the click id behind a valid, unexpired token for `p_program`, or null.
-- Only consented clicks count: a token is never issued otherwise.
create or replace function private.verify_referral_token(p_token text, p_program text, p_at timestamptz)
  returns bigint
  language plpgsql
  stable
  security definer
  set search_path = ''
as $$
declare
  key      text := private.referral_key();
  body     text;
  payload  jsonb;
  click    bigint;
begin
  if p_token is null or key is null or char_length(p_token) > 600
     or p_token !~ '^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$' then
    return null;
  end if;
  body := split_part(p_token, '.', 1);
  -- ponytail: plain text comparison of the signature; forging still needs the key. Swap for a
  -- constant-time compare if this ever verifies tokens from untrusted sources at volume.
  if rtrim(translate(encode(extensions.hmac(body, key, 'sha256'), 'base64'), '+/', '-_'), '=')
     <> split_part(p_token, '.', 2) then
    return null;
  end if;
  begin
    payload := convert_from(private.b64url_decode(body), 'UTF8')::jsonb;
  exception when others then
    return null;
  end;
  if payload ->> 'p' is distinct from p_program
     or coalesce((payload ->> 'exp')::bigint, 0) < extract(epoch from p_at) then
    return null;
  end if;
  select c.id into click
  from public.affiliate_clicks c
  where c.id = (payload ->> 'k')::bigint and c.program_id = p_program and c.consent;
  return click;
end;
$$;

-- Same hashing as the Edge Function: SHA-256 hex of the trimmed, lowercased email.
create or replace function private.email_hash(email text)
  returns text
  language sql
  immutable
  set search_path = ''
as $$
  select case when email is null then null
              else encode(sha256(convert_to(lower(btrim(email)), 'UTF8')), 'hex') end;
$$;

-- True when the ambassador's own account email matches the customer's.
create or replace function private.is_self_referral(p_profile uuid, p_email_hash text)
  returns boolean
  language sql
  stable
  security definer
  set search_path = ''
as $$
  select p_email_hash is not null and exists (
    select 1 from auth.users u where u.id = p_profile and private.email_hash(u.email) = p_email_hash
  );
$$;

-- ─── JOAT enquiries carry the referral ───────────────────────────────────────
-- The forms send referral_token; this trigger checks it and keeps only the
-- click id. The token itself is never stored, and a visitor can't set the
-- click id directly: the trigger always overwrites it.

alter table public.contact_submissions
  add column referral_token text,
  add column referral_click_id bigint references public.affiliate_clicks(id) on delete set null;
alter table public.consultation_bookings
  add column referral_token text,
  add column referral_click_id bigint references public.affiliate_clicks(id) on delete set null;

create or replace function private.attach_referral()
  returns trigger
  language plpgsql
  security definer
  set search_path = ''
as $$
begin
  new.referral_click_id := private.verify_referral_token(new.referral_token, 'joat', now());
  new.referral_token := null;
  return new;
end;
$$;

create trigger attach_referral before insert on public.contact_submissions
  for each row execute function private.attach_referral();
create trigger attach_referral before insert on public.consultation_bookings
  for each row execute function private.attach_referral();

-- JOAT staff (with MFA) may read referred enquiries only, to turn them into engagements.
create policy "JOAT partner staff read referred enquiries"
  on public.contact_submissions for select
  to authenticated
  using (referral_click_id is not null
         and private.has_staff_role(array['program_manager', 'finance', 'support'], 'joat'));
create policy "JOAT partner staff read referred bookings"
  on public.consultation_bookings for select
  to authenticated
  using (referral_click_id is not null
         and private.has_staff_role(array['program_manager', 'finance', 'support'], 'joat'));

-- ─── Amare: Shopify orders, refunds, disputes ────────────────────────────────
-- Only what commissions need: no customer names, addresses or raw payloads.

create table public.webhook_events (
  id           text primary key,          -- 'shopify:<X-Shopify-Webhook-Id>'
  provider     text not null,
  topic        text not null,
  resource_id  text,
  received_at  timestamptz not null default now(),
  outcome      text
);

create table public.shopify_orders (
  order_id          text primary key,
  program_id        text not null default 'amare' references public.affiliate_programs(id),
  order_name        text,                  -- "#1001": the reference ambassadors see
  currency          text check (currency ~ '^[A-Z]{3}$'),
  ordered_at        timestamptz,
  paid_at           timestamptz,
  cancelled_at      timestamptz,
  -- Line items after their discounts; shipping, tax and gift cards excluded.
  eligible_revenue  numeric(14,2),
  click_id          bigint references public.affiliate_clicks(id) on delete set null,
  profile_id        uuid references public.affiliate_profiles(id) on delete set null,
  self_referral     boolean not null default false,
  updated_at        timestamptz not null default now()
);

create table public.shopify_refunds (
  refund_id    text primary key,
  order_id     text not null,
  amount       numeric(14,2) not null,     -- refunded line items, after discounts
  refunded_at  timestamptz not null
);
create index shopify_refunds_order_idx on public.shopify_refunds (order_id);

create table public.shopify_disputes (
  dispute_id  text primary key,
  order_id    text not null,
  status      text not null,               -- needs_response, under_review, won, lost, accepted, charge_refunded
  event_at    timestamptz not null
);
create index shopify_disputes_order_idx on public.shopify_disputes (order_id);

alter table public.webhook_events enable row level security;
alter table public.shopify_orders enable row level security;
alter table public.shopify_refunds enable row level security;
alter table public.shopify_disputes enable row level security;

create policy "Partner support staff read webhook events"
  on public.webhook_events for select to authenticated
  using (private.has_staff_role(array['support']));
create policy "Amare staff read shop orders"
  on public.shopify_orders for select to authenticated
  using (private.has_staff_role(array['support', 'finance', 'program_manager'], 'amare'));
create policy "Amare staff read shop refunds"
  on public.shopify_refunds for select to authenticated
  using (private.has_staff_role(array['support', 'finance', 'program_manager'], 'amare'));
create policy "Amare staff read shop disputes"
  on public.shopify_disputes for select to authenticated
  using (private.has_staff_role(array['support', 'finance', 'program_manager'], 'amare'));

revoke all on public.webhook_events, public.shopify_orders, public.shopify_refunds, public.shopify_disputes from anon;
revoke insert, update, delete, truncate on public.webhook_events, public.shopify_orders,
  public.shopify_refunds, public.shopify_disputes from authenticated;

-- Called by the shopify-webhook Edge Function after it has checked Shopify's
-- signature and the referral token. Each webhook is processed once; events
-- may arrive late or out of order, so every table is keyed by Shopify's own
-- ids and the conversion is worked out from all of them at read time.
--
-- p_data (built by supabase/functions/_shared/shopify.js):
--   orders/paid      { order_id, name, currency, created_at, email_hash,
--                      lines: [{ price, qty, discounts: [..], gift_card }] }
--   refunds/create   { refund_id, order_id, lines: [{ subtotal, gift_card }] }
--   orders/cancelled { order_id, cancelled_at }
--   disputes/*       { dispute_id, order_id, status }
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
  ev_id    text := 'shopify:' || p_webhook_id;
  amb      uuid;
  revenue  numeric(14,2);
  v_outcome  text := 'processed';
begin
  insert into public.webhook_events (id, provider, topic, resource_id)
  values (ev_id, 'shopify', p_topic, p_data ->> 'order_id')
  on conflict (id) do nothing;
  if not found then
    return 'duplicate';
  end if;

  if p_topic = 'orders/paid' then
    select c.profile_id into amb
    from public.affiliate_clicks c
    where c.id = p_click_id and c.program_id = 'amare' and c.consent;

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
         (p_data ->> 'created_at')::timestamptz, p_event_at, greatest(revenue, 0), p_click_id, amb,
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

-- ─── JOAT: engagements, invoices, payments ───────────────────────────────────

create table public.joat_engagements (
  id             uuid primary key default gen_random_uuid(),
  reference      text not null unique default ('J-' || private.new_public_code()),
  lead_type      text not null check (lead_type in ('contact', 'booking')),
  lead_id        uuid not null,
  click_id       bigint not null references public.affiliate_clicks(id),
  profile_id     uuid not null references public.affiliate_profiles(id),
  client_name    text not null check (char_length(client_name) between 1 and 200),
  service        text not null check (char_length(service) between 1 and 200),
  agreed_on      date not null,
  contract_ref   text check (char_length(contract_ref) <= 200),
  self_referral  boolean not null default false,
  created_by     uuid not null,
  created_at     timestamptz not null default now(),
  unique (lead_type, lead_id)
);

create table public.joat_invoices (
  id              uuid primary key default gen_random_uuid(),
  engagement_id   uuid not null references public.joat_engagements(id),
  invoice_number  text not null unique check (char_length(invoice_number) between 1 and 60),
  amount          numeric(14,2) not null check (amount > 0),
  currency        text not null check (currency ~ '^[A-Z]{3}$'),
  issued_on       date not null,
  created_by      uuid not null,
  created_at      timestamptz not null default now()
);

create table public.joat_payments (
  id           uuid primary key default gen_random_uuid(),
  invoice_id   uuid not null references public.joat_invoices(id),
  amount       numeric(14,2) not null check (amount > 0),
  received_on  date not null,
  method       text not null check (method in ('mpesa', 'bank', 'card', 'cash', 'other')),
  reference    text not null check (char_length(reference) between 1 and 60),   -- e.g. M-Pesa code
  status       text not null default 'recorded' check (status in ('recorded', 'confirmed', 'rejected')),
  recorded_by  uuid not null,
  recorded_at  timestamptz not null default now(),
  reviewed_by  uuid,
  reviewed_at  timestamptz,
  review_note  text check (char_length(review_note) <= 1000)
);
-- The same M-Pesa (or bank) reference can only ever be entered once.
create unique index joat_payments_reference_idx on public.joat_payments (method, upper(reference));

alter table public.joat_engagements enable row level security;
alter table public.joat_invoices enable row level security;
alter table public.joat_payments enable row level security;

create policy "JOAT staff read engagements" on public.joat_engagements for select to authenticated
  using (private.has_staff_role(array['support', 'finance', 'program_manager'], 'joat'));
create policy "JOAT staff read invoices" on public.joat_invoices for select to authenticated
  using (private.has_staff_role(array['support', 'finance', 'program_manager'], 'joat'));
create policy "JOAT staff read payments" on public.joat_payments for select to authenticated
  using (private.has_staff_role(array['support', 'finance', 'program_manager'], 'joat'));

revoke all on public.joat_engagements, public.joat_invoices, public.joat_payments from anon;
revoke insert, update, delete, truncate on public.joat_engagements, public.joat_invoices,
  public.joat_payments from authenticated;

-- A JOAT programme manager turns a referred enquiry into an engagement.
create or replace function public.create_joat_engagement(
  p_lead_type     text,
  p_lead_id       uuid,
  p_client_name   text,
  p_service       text,
  p_agreed_on     date,
  p_contract_ref  text default null
)
  returns text
  language plpgsql
  security definer
  set search_path = ''
as $$
declare
  click   bigint;
  email   text;
  amb     uuid;
  ref     text;
begin
  if not private.has_staff_role(array['program_manager'], 'joat') then
    raise exception 'not_authorised' using errcode = '42501';
  end if;

  if p_lead_type = 'contact' then
    select s.referral_click_id, s.email into click, email from public.contact_submissions s where s.id = p_lead_id;
  elsif p_lead_type = 'booking' then
    select b.referral_click_id, b.email into click, email from public.consultation_bookings b where b.id = p_lead_id;
  end if;
  if click is null then
    raise exception 'lead_not_referred' using errcode = '22023';
  end if;
  select c.profile_id into amb from public.affiliate_clicks c where c.id = click;

  insert into public.joat_engagements
    (lead_type, lead_id, click_id, profile_id, client_name, service, agreed_on, contract_ref, self_referral, created_by)
  values
    (p_lead_type, p_lead_id, click, amb, btrim(p_client_name), btrim(p_service), p_agreed_on,
     nullif(btrim(coalesce(p_contract_ref, '')), ''), private.is_self_referral(amb, private.email_hash(email)), auth.uid())
  returning reference into ref;

  insert into public.partner_audit_log (actor_id, action, program_id, subject_id, details)
  values (auth.uid(), 'joat.engagement_created', 'joat', amb, jsonb_build_object('engagement', ref));
  return ref;
exception when unique_violation then
  raise exception 'engagement_exists' using errcode = '23505';
end;
$$;

create or replace function public.add_joat_invoice(
  p_engagement_id   uuid,
  p_invoice_number  text,
  p_amount          numeric,
  p_currency        text,
  p_issued_on       date
)
  returns void
  language plpgsql
  security definer
  set search_path = ''
as $$
declare
  eng public.joat_engagements;
begin
  if not private.has_staff_role(array['program_manager', 'finance'], 'joat') then
    raise exception 'not_authorised' using errcode = '42501';
  end if;
  select * into eng from public.joat_engagements where id = p_engagement_id;
  if eng.id is null then
    raise exception 'engagement_not_found' using errcode = 'P0002';
  end if;
  if exists (select 1 from public.joat_invoices i
             where i.engagement_id = p_engagement_id and i.currency <> upper(p_currency)) then
    raise exception 'currency_mismatch' using errcode = '22023';
  end if;

  insert into public.joat_invoices (engagement_id, invoice_number, amount, currency, issued_on, created_by)
  values (p_engagement_id, btrim(p_invoice_number), round(p_amount, 2), upper(p_currency), p_issued_on, auth.uid());

  insert into public.partner_audit_log (actor_id, action, program_id, subject_id, details)
  values (auth.uid(), 'joat.invoice_added', 'joat', eng.profile_id,
          jsonb_build_object('engagement', eng.reference, 'invoice', btrim(p_invoice_number),
                             'amount', round(p_amount, 2), 'currency', upper(p_currency)));
exception when unique_violation then
  raise exception 'invoice_exists' using errcode = '23505';
end;
$$;

create or replace function public.record_joat_payment(
  p_invoice_id   uuid,
  p_amount       numeric,
  p_received_on  date,
  p_method       text,
  p_reference    text
)
  returns void
  language plpgsql
  security definer
  set search_path = ''
as $$
declare
  inv       public.joat_invoices;
  paid      numeric(14,2);
  eng_prof  uuid;
begin
  if not private.has_staff_role(array['program_manager', 'finance'], 'joat') then
    raise exception 'not_authorised' using errcode = '42501';
  end if;
  select * into inv from public.joat_invoices where id = p_invoice_id for update;
  if inv.id is null then
    raise exception 'invoice_not_found' using errcode = 'P0002';
  end if;
  if p_received_on > current_date then
    raise exception 'future_date' using errcode = '22023';
  end if;
  select coalesce(sum(p.amount), 0) into paid
  from public.joat_payments p where p.invoice_id = p_invoice_id and p.status <> 'rejected';
  if paid + round(p_amount, 2) > inv.amount then
    raise exception 'overpayment' using errcode = '22023';
  end if;

  insert into public.joat_payments (invoice_id, amount, received_on, method, reference, recorded_by)
  values (p_invoice_id, round(p_amount, 2), p_received_on, p_method, upper(btrim(p_reference)), auth.uid());

  select e.profile_id into eng_prof from public.joat_engagements e where e.id = inv.engagement_id;
  insert into public.partner_audit_log (actor_id, action, program_id, subject_id, details)
  values (auth.uid(), 'joat.payment_recorded', 'joat', eng_prof,
          jsonb_build_object('invoice', inv.invoice_number, 'amount', round(p_amount, 2),
                             'method', p_method, 'reference', upper(btrim(p_reference))));
exception when unique_violation then
  raise exception 'duplicate_payment' using errcode = '23505';
end;
$$;

-- A second person confirms (or rejects) a recorded payment against the M-Pesa
-- statement. Only confirmed payments count towards a conversion.
create or replace function public.review_joat_payment(p_payment_id uuid, p_confirm boolean, p_note text default null)
  returns void
  language plpgsql
  security definer
  set search_path = ''
as $$
declare
  pay       public.joat_payments;
  note      text := nullif(btrim(coalesce(p_note, '')), '');
  eng_prof  uuid;
begin
  if not private.has_staff_role(array['finance'], 'joat') then
    raise exception 'not_authorised' using errcode = '42501';
  end if;
  select * into pay from public.joat_payments where id = p_payment_id for update;
  if pay.id is null then
    raise exception 'payment_not_found' using errcode = 'P0002';
  end if;
  if pay.status <> 'recorded' then
    raise exception 'invalid_transition' using errcode = '22023';
  end if;
  if pay.recorded_by = auth.uid() then
    raise exception 'cannot_confirm_own_entry' using errcode = '42501';
  end if;
  if not p_confirm and note is null then
    raise exception 'reason_required' using errcode = '22023';
  end if;

  update public.joat_payments
  set status = case when p_confirm then 'confirmed' else 'rejected' end,
      reviewed_by = auth.uid(), reviewed_at = now(), review_note = note
  where id = p_payment_id;

  select e.profile_id into eng_prof
  from public.joat_invoices i join public.joat_engagements e on e.id = i.engagement_id
  where i.id = pay.invoice_id;
  insert into public.partner_audit_log (actor_id, action, program_id, subject_id, details)
  values (auth.uid(), case when p_confirm then 'joat.payment_confirmed' else 'joat.payment_rejected' end,
          'joat', eng_prof, jsonb_build_object('reference', pay.reference, 'amount', pay.amount, 'reason', note));
end;
$$;

-- ─── Conversions (what ambassadors and staff see) ────────────────────────────
-- One row per referred sale. Runs as its owner, so it can join the staff-only
-- tables, and filters rows itself: an ambassador sees only their own, staff
-- only their programmes. Exposes no customer details.

create view public.affiliate_conversions as
select
  'amare'::text                                              as program_id,
  o.profile_id,
  'shop_order'::text                                         as kind,
  coalesce(o.order_name, o.order_id)                         as reference,
  o.paid_at                                                  as occurred_at,
  o.currency,
  greatest(o.eligible_revenue - coalesce(r.refunded, 0), 0)::numeric(14,2) as revenue,
  coalesce(r.refunded, 0)::numeric(14,2)                     as refunded,
  case
    when o.cancelled_at is not null
      or d.status in ('lost', 'accepted', 'charge_refunded')
      or o.eligible_revenue - coalesce(r.refunded, 0) <= 0 then 'reversed'
    when d.status is not null and d.status <> 'won' then 'disputed'
    else 'verified'
  end                                                        as status
from public.shopify_orders o
left join lateral (select sum(f.amount) as refunded from public.shopify_refunds f where f.order_id = o.order_id) r on true
left join lateral (select x.status from public.shopify_disputes x where x.order_id = o.order_id
                   order by x.event_at desc limit 1) d on true
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
  case when coalesce(p.collected, 0) > 0 then 'verified' else 'awaiting_payment' end
from public.joat_engagements e
left join lateral (select min(v.currency) as currency from public.joat_invoices v where v.engagement_id = e.id) i on true
left join lateral (
  select sum(pay.amount) as collected, min(pay.received_on)::timestamptz as first_paid
  from public.joat_payments pay join public.joat_invoices inv on inv.id = pay.invoice_id
  where inv.engagement_id = e.id and pay.status = 'confirmed'
) p on true
where e.profile_id = auth.uid()
   or private.has_staff_role(array['support', 'finance', 'program_manager'], 'joat');

revoke all on public.affiliate_conversions from anon;
grant select on public.affiliate_conversions to authenticated;

-- ─── Permissions ─────────────────────────────────────────────────────────────

revoke all on function public.ingest_shopify_event(text, text, timestamptz, jsonb, bigint) from public, anon, authenticated;
revoke all on function public.create_joat_engagement(text, uuid, text, text, date, text) from public, anon;
revoke all on function public.add_joat_invoice(uuid, text, numeric, text, date) from public, anon;
revoke all on function public.record_joat_payment(uuid, numeric, date, text, text) from public, anon;
revoke all on function public.review_joat_payment(uuid, boolean, text) from public, anon;
revoke all on function private.referral_key() from public, anon, authenticated;
revoke all on function private.verify_referral_token(text, text, timestamptz) from public, anon, authenticated;
revoke all on function private.is_self_referral(uuid, text) from public, anon, authenticated;
revoke all on function private.attach_referral() from public, anon, authenticated;

grant execute on function public.create_joat_engagement(text, uuid, text, text, date, text) to authenticated;
grant execute on function public.add_joat_invoice(uuid, text, numeric, text, date) to authenticated;
grant execute on function public.record_joat_payment(uuid, numeric, date, text, text) to authenticated;
grant execute on function public.review_joat_payment(uuid, boolean, text) to authenticated;
do $$ begin
  if exists (select 1 from pg_roles where rolname = 'service_role') then
    grant execute on function public.ingest_shopify_event(text, text, timestamptz, jsonb, bigint) to service_role;
  end if;
end $$;
