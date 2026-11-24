-- Super admins can download the list of active (approved) ambassadors with
-- their sign-in email. Emails live in auth.users, so this goes through a
-- SECURITY DEFINER function; every download is recorded in the activity log.

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
           m.status_changed_at, p.public_code, p.social_links
    from public.affiliate_memberships m
    join public.affiliate_profiles p on p.id = m.profile_id
    join auth.users u on u.id = m.profile_id
    where m.status = 'approved'
    order by p.full_name, m.program_id;
end;
$$;

revoke all on function public.export_active_ambassadors() from public, anon;
grant execute on function public.export_active_ambassadors() to authenticated;
