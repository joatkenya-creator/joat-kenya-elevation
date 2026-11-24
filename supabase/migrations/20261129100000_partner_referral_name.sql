-- ─── "Referred by …" for a referral token ─────────────────────────────────────
-- The shop cart shows who referred the shopper even when the referral came
-- from a link (no code typed). lookup-ambassador verifies the signed token
-- first, so this only ever receives click ids the server itself issued.
-- Name only (first name + last initial), and only while still approved.

create or replace function public.referral_display_name(p_click_id bigint, p_program_id text)
  returns text
  language sql
  stable
  security definer
  set search_path = ''
as $$
  select private.display_name(p.full_name)
  from public.affiliate_clicks c
  join public.affiliate_profiles p on p.id = c.profile_id
  join public.affiliate_memberships m on m.profile_id = c.profile_id and m.program_id = c.program_id
  where c.id = p_click_id and c.program_id = p_program_id and m.status = 'approved';
$$;

revoke all on function public.referral_display_name(bigint, text) from public, anon, authenticated;
do $$ begin
  if exists (select 1 from pg_roles where rolname = 'service_role') then
    grant execute on function public.referral_display_name(bigint, text) to service_role;
  end if;
end $$;
