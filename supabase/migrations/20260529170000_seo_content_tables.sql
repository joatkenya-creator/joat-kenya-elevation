-- ─── joatkenya.com — SEO content + analytics tables ─────────────────────────
-- Tier 1: case_studies, testimonials, faqs
-- Tier 2: team_members, newsletter_subscribers
-- Tier 3: services, page_events
-- Tier 4: redirects, sitemap_entries, meta_overrides
--
-- Pattern:
--   Public content tables  → anon SELECT on `published = true`, no writes
--   Submission tables      → anon INSERT only, no SELECT
--   Analytics tables       → anon INSERT only
--   Admin-managed tables   → anon SELECT, writes via service_role in dashboard

-- ═══════════════════════════════════════════════════════════════════════════
-- TIER 1
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── case_studies ──────────────────────────────────────────────────────────
create table if not exists public.case_studies (
  id                  uuid primary key default gen_random_uuid(),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  slug                text unique not null,
  client_name         text not null,
  client_logo_url     text,
  industry            text,
  service_type        text,
  hero_image_url      text,
  summary             text not null,
  problem             text not null,
  solution            text not null,
  results             text not null,
  metrics             jsonb,
  technologies        text[],
  testimonial         text,
  testimonial_author  text,
  testimonial_role    text,
  duration            text,
  published           boolean not null default true,
  featured            boolean not null default false
);

create index if not exists case_studies_published_idx
  on public.case_studies (published, created_at desc);
create index if not exists case_studies_featured_idx
  on public.case_studies (featured) where featured;

alter table public.case_studies enable row level security;

drop policy if exists "Public read published case studies" on public.case_studies;
create policy "Public read published case studies"
  on public.case_studies for select to anon, authenticated
  using (published = true);

-- ─── testimonials ──────────────────────────────────────────────────────────
create table if not exists public.testimonials (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  author_name   text not null,
  author_role   text,
  company       text,
  location      text,
  quote         text not null,
  rating        smallint default 5 check (rating between 1 and 5),
  service_area  text,
  featured      boolean not null default true,
  display_order int not null default 100
);

create index if not exists testimonials_featured_idx
  on public.testimonials (featured, display_order);

alter table public.testimonials enable row level security;

drop policy if exists "Public read featured testimonials" on public.testimonials;
create policy "Public read featured testimonials"
  on public.testimonials for select to anon, authenticated
  using (featured = true);

-- ─── faqs ──────────────────────────────────────────────────────────────────
create table if not exists public.faqs (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  question      text not null,
  answer        text not null,
  topic         text not null,
  display_order int not null default 100,
  published     boolean not null default true
);

create index if not exists faqs_topic_idx
  on public.faqs (topic, display_order) where published;

alter table public.faqs enable row level security;

drop policy if exists "Public read published faqs" on public.faqs;
create policy "Public read published faqs"
  on public.faqs for select to anon, authenticated
  using (published = true);

-- ═══════════════════════════════════════════════════════════════════════════
-- TIER 2
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── team_members ──────────────────────────────────────────────────────────
create table if not exists public.team_members (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  name          text not null,
  slug          text unique,
  role          text not null,
  bio           text,
  expertise     text[],
  photo_url     text,
  linkedin_url  text,
  github_url    text,
  published     boolean not null default true,
  display_order int not null default 100
);

alter table public.team_members enable row level security;

drop policy if exists "Public read published team members" on public.team_members;
create policy "Public read published team members"
  on public.team_members for select to anon, authenticated
  using (published = true);

-- ─── newsletter_subscribers ────────────────────────────────────────────────
create table if not exists public.newsletter_subscribers (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  email           text unique not null,
  source_page     text,
  confirmed       boolean not null default false,
  unsubscribed_at timestamptz
);

alter table public.newsletter_subscribers enable row level security;

-- Public can subscribe (insert) but cannot read the list.
drop policy if exists "Public can subscribe to newsletter" on public.newsletter_subscribers;
create policy "Public can subscribe to newsletter"
  on public.newsletter_subscribers for insert to anon, authenticated
  with check (true);

-- ═══════════════════════════════════════════════════════════════════════════
-- TIER 3
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── services ──────────────────────────────────────────────────────────────
create table if not exists public.services (
  id                 uuid primary key default gen_random_uuid(),
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  slug               text unique not null,
  name               text not null,
  short_summary      text not null,
  full_description   text not null,
  icon_name          text,
  outcomes           text[] not null default '{}',
  industries         text[] not null default '{}',
  contact_form_value text,
  hero_image_url     text,
  display_order      int not null default 100,
  published          boolean not null default true
);

create index if not exists services_display_order_idx
  on public.services (display_order) where published;

alter table public.services enable row level security;

drop policy if exists "Public read published services" on public.services;
create policy "Public read published services"
  on public.services for select to anon, authenticated
  using (published = true);

-- ─── page_events ───────────────────────────────────────────────────────────
create table if not exists public.page_events (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  event_type  text not null,
  target      text not null,
  page_url    text,
  visitor_id  text,
  metadata    jsonb
);

create index if not exists page_events_created_at_idx
  on public.page_events (created_at desc);
create index if not exists page_events_target_idx
  on public.page_events (target, created_at desc);

alter table public.page_events enable row level security;

-- Public can log events but cannot read them.
drop policy if exists "Public can log page events" on public.page_events;
create policy "Public can log page events"
  on public.page_events for insert to anon, authenticated
  with check (true);

-- ═══════════════════════════════════════════════════════════════════════════
-- TIER 4 — SEO infrastructure
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── redirects ─────────────────────────────────────────────────────────────
create table if not exists public.redirects (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  from_path    text unique not null,
  to_path      text not null,
  status_code  int not null default 301 check (status_code in (301, 302, 307, 308))
);

alter table public.redirects enable row level security;

drop policy if exists "Public read redirects" on public.redirects;
create policy "Public read redirects"
  on public.redirects for select to anon, authenticated
  using (true);

-- ─── sitemap_entries ───────────────────────────────────────────────────────
create table if not exists public.sitemap_entries (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  url_path     text unique not null,
  lastmod      timestamptz not null default now(),
  changefreq   text default 'monthly' check (
    changefreq in ('always','hourly','daily','weekly','monthly','yearly','never')
  ),
  priority     numeric(2,1) default 0.5 check (priority between 0.0 and 1.0),
  published    boolean not null default true
);

alter table public.sitemap_entries enable row level security;

drop policy if exists "Public read published sitemap entries" on public.sitemap_entries;
create policy "Public read published sitemap entries"
  on public.sitemap_entries for select to anon, authenticated
  using (published = true);

-- ─── meta_overrides ────────────────────────────────────────────────────────
create table if not exists public.meta_overrides (
  url_path        text primary key,
  title           text,
  description     text,
  og_image_url    text,
  noindex         boolean not null default false,
  updated_at      timestamptz not null default now()
);

alter table public.meta_overrides enable row level security;

drop policy if exists "Public read meta overrides" on public.meta_overrides;
create policy "Public read meta overrides"
  on public.meta_overrides for select to anon, authenticated
  using (true);

-- ═══════════════════════════════════════════════════════════════════════════
-- Auto-update updated_at on rows that have it
-- ═══════════════════════════════════════════════════════════════════════════
create or replace function public.touch_updated_at()
  returns trigger
  language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists case_studies_updated_at on public.case_studies;
create trigger case_studies_updated_at
  before update on public.case_studies
  for each row execute function public.touch_updated_at();

drop trigger if exists services_updated_at on public.services;
create trigger services_updated_at
  before update on public.services
  for each row execute function public.touch_updated_at();

drop trigger if exists sitemap_entries_updated_at on public.sitemap_entries;
create trigger sitemap_entries_updated_at
  before update on public.sitemap_entries
  for each row execute function public.touch_updated_at();

drop trigger if exists meta_overrides_updated_at on public.meta_overrides;
create trigger meta_overrides_updated_at
  before update on public.meta_overrides
  for each row execute function public.touch_updated_at();
