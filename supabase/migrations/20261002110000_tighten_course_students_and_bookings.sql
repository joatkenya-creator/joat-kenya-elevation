-- ─── Enforce the column locks and booking rules the app already assumes ─────
--
-- 1. course_students.status / tier
--    20260707120000 ran `revoke update (status) ... from authenticated`, but
--    Supabase grants authenticated table-level UPDATE and INSERT on public
--    tables, and Postgres ignores a column-level REVOKE while a table-level
--    grant exists. So a signed-in student could still PATCH their own row to
--    status = 'completed', insert their row with status = 'completed', or
--    change their tier (which sets their price) after registering.
--    Replace the table-level grants with column lists: a student may set
--    everything the sign-up form sends on insert, may later edit only the
--    fields the account page edits, and can never write status. The team
--    still edits any column from Studio (service role bypasses grants).
--    RLS (own row only) is unchanged.

revoke insert, update on public.course_students from authenticated;
grant insert (id, full_name, phone, registrant_type, college, tier, payment_preference, how_heard)
  on public.course_students to authenticated;
grant update (full_name, phone, registrant_type, college, payment_preference)
  on public.course_students to authenticated;

-- anon has no policies here, so RLS already blocks it; drop the grants too.
revoke all on public.course_students from anon;

-- 2. consultation_bookings
--    The insert policy was `with check (true)`, so the anon key could create
--    bookings already marked 'confirmed', in the past, or years ahead, and —
--    because of the one-booking-per-slot unique index — reserve every slot in
--    the calendar. Constrain new rows to what the booking form can produce:
--    always 'requested', in the future, within the booking horizon (45 days in
--    src/data/kenya-consultation.ts; 90 here leaves room to extend it), with
--    field lengths matching the form's validation.

drop policy if exists "Public can request a consultation" on public.consultation_bookings;
create policy "Public can request a consultation"
  on public.consultation_bookings
  for insert
  to anon, authenticated
  with check (
    status = 'requested'
    and start_at > now()
    and start_at < now() + interval '90 days'
    and char_length(full_name) <= 120
    and char_length(email) <= 160
    and char_length(phone) <= 40
    and char_length(country) <= 80
    and char_length(coalesce(company, '')) <= 120
    and char_length(coalesce(website, '')) <= 200
    and char_length(details) <= 4000
    and char_length(client_timezone) <= 64
    and coalesce(cardinality(objectives), 0) <= 20
  );
