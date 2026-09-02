-- ─── Kenya Market Entry & Relocation consultation bookings ──────────────────
-- Backs /kenya-consultation. One row per requested consultation. Follows the
-- same shape as contact_submissions: anon can insert (the public booking
-- form), nobody can read through the anon key — the team reads in Supabase
-- Studio and gets an email notification per booking.

create table if not exists public.consultation_bookings (
  id                uuid primary key default gen_random_uuid(),
  created_at        timestamptz not null default now(),
  -- 60 or 120. Stored as minutes so a third duration needs no schema change.
  duration_minutes  int  not null check (duration_minutes in (60, 120)),
  start_at          timestamptz not null,
  client_timezone   text not null,
  full_name         text not null,
  email             text not null,
  phone             text not null,
  country           text not null,
  company           text,
  website           text,
  objectives        text[] not null default '{}',
  details           text not null,
  status            text not null default 'requested'
                      check (status in ('requested', 'confirmed', 'cancelled')),
  source            text default 'kenya-consultation'
);

create index if not exists consultation_bookings_start_at_idx
  on public.consultation_bookings (start_at);

-- Stops two visitors booking the same slot (the UI also filters taken slots,
-- but that read is a snapshot — this is the actual guarantee).
create unique index if not exists consultation_bookings_slot_unique
  on public.consultation_bookings (start_at)
  where status <> 'cancelled';

alter table public.consultation_bookings enable row level security;

drop policy if exists "Public can request a consultation" on public.consultation_bookings;
create policy "Public can request a consultation"
  on public.consultation_bookings
  for insert
  to anon, authenticated
  with check (true);

-- ─── Booked slots (public read) ────────────────────────────────────────────
-- The booking calendar needs to know which slots are taken without exposing
-- who booked them. This view leaks nothing but a start time and a length.
-- security_invoker is left off, so the view runs as its owner and reads past
-- the table's RLS.
create or replace view public.consultation_booked_slots as
  select start_at, duration_minutes
  from public.consultation_bookings
  where status <> 'cancelled'
    and start_at > now() - interval '1 day';

grant select on public.consultation_booked_slots to anon, authenticated;
