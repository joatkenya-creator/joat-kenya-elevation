-- ─── Contact form submissions + PDF attachment storage ─────────────────────
-- Stores every contact-form submission from joatkenya.com and any other form
-- on the site. PDFs are uploaded to a public storage bucket (URLs are seeded
-- with random UUIDs so they're not enumerable); the table holds the structured
-- form data plus the list of attached PDF URLs.

-- ─── Table: contact_submissions ─────────────────────────────────────────────
create table if not exists public.contact_submissions (
  id               uuid primary key default gen_random_uuid(),
  created_at       timestamptz not null default now(),
  first_name       text not null,
  last_name        text not null,
  email            text not null,
  service_area     text not null,
  message          text not null,
  source           text default 'website',
  attachment_paths jsonb not null default '[]'::jsonb
);

create index if not exists contact_submissions_created_at_idx
  on public.contact_submissions (created_at desc);

alter table public.contact_submissions enable row level security;

-- Anyone can submit the form; only Supabase Studio (service_role) can read.
drop policy if exists "Public can submit contact form" on public.contact_submissions;
create policy "Public can submit contact form"
  on public.contact_submissions
  for insert
  to anon, authenticated
  with check (true);

-- ─── Storage bucket: contact-attachments ────────────────────────────────────
insert into storage.buckets (id, name, public)
  values ('contact-attachments', 'contact-attachments', true)
  on conflict (id) do update set public = excluded.public;

-- Upload policy — anyone can upload, but only PDFs (by extension or mime).
drop policy if exists "Public PDF upload to contact-attachments" on storage.objects;
create policy "Public PDF upload to contact-attachments"
  on storage.objects
  for insert
  to anon, authenticated
  with check (
    bucket_id = 'contact-attachments'
    and (
      lower(right(name, 4)) = '.pdf'
      or (metadata ->> 'mimetype') = 'application/pdf'
    )
  );

-- Read policy — the bucket is public so this is just for symmetry; storage
-- URLs already serve files without policy checks when public = true.
drop policy if exists "Public read on contact-attachments" on storage.objects;
create policy "Public read on contact-attachments"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'contact-attachments');
