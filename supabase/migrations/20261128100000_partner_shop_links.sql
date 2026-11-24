-- ─── Links that point at a programme's shop ──────────────────────────────────
-- Amare sells through Shopify on a separate host. Ambassadors can now link
-- straight to products and collections there. A custom shop domain later is a
-- single update of shop_url. The theme snippet (docs/shopify-theme-install.md)
-- calls track-click from the shop, so those links track too.

alter table public.affiliate_programs
  add column shop_url text check (shop_url ~ '^https://[a-z0-9.-]+$');

update public.affiliate_programs set shop_url = 'https://amares-big-planet.myshopify.com' where id = 'amare';

alter table public.affiliate_links
  add column destination_host text not null default 'site' check (destination_host in ('site', 'shop'));

drop index public.affiliate_links_unique_idx;
create unique index affiliate_links_unique_idx
  on public.affiliate_links (profile_id, program_id, destination_host, destination_path, coalesce(campaign, ''));

-- p_destination: a path ("/services", always the main site) or a full address
-- on the programme's site or shop, www. variants included. Anything else is
-- refused, so links can't be turned into redirects to other sites.
create or replace function public.create_partner_link(
  p_program_id   text,
  p_destination  text,
  p_campaign     text default null
)
  returns text
  language plpgsql
  security definer
  set search_path = ''
as $$
declare
  uid       uuid := auth.uid();
  bases     text[];
  kinds     text[] := array['site', 'shop'];
  base      text;
  www       text;
  kind      text;
  dest      text := btrim(coalesce(p_destination, ''));
  path      text;
  camp      text := nullif(lower(btrim(coalesce(p_campaign, ''))), '');
  new_code  text;
begin
  if uid is null then
    raise exception 'not_signed_in' using errcode = '42501';
  end if;
  if not exists (
    select 1 from public.affiliate_memberships m
    where m.profile_id = uid and m.program_id = p_program_id and m.status = 'approved'
  ) then
    raise exception 'not_approved' using errcode = '42501';
  end if;

  select array[a.site_url, a.shop_url] into bases from public.affiliate_programs a where a.id = p_program_id;

  if dest = '' then
    path := '/';
    kind := 'site';
  elsif dest ~ '^/' then
    path := dest;
    kind := 'site';
  else
    for i in 1..2 loop
      base := bases[i];
      continue when base is null;
      www := replace(base, 'https://', 'https://www.');
      if lower(dest) = base or lower(dest) = www then
        path := '/';
      elsif lower(dest) like base || '/%' then
        path := substr(dest, char_length(base) + 1);
      elsif lower(dest) like www || '/%' then
        path := substr(dest, char_length(www) + 1);
      else
        continue;
      end if;
      kind := kinds[i];
      exit;
    end loop;
    if kind is null then
      raise exception 'invalid_destination' using errcode = '22023';
    end if;
  end if;

  path := split_part(path, '#', 1);
  if path !~ '^/([^/\\]|$)' or path ~ '[\s<>"\\]' or char_length(path) > 500
     or path ~* '[?&](ref|ln|abp_ref)=' then
    raise exception 'invalid_destination' using errcode = '22023';
  end if;
  if camp is not null and camp !~ '^[a-z0-9][a-z0-9-]{0,39}$' then
    raise exception 'invalid_campaign' using errcode = '22023';
  end if;
  if (select count(*) from public.affiliate_links l
      where l.profile_id = uid and l.program_id = p_program_id) >= 50 then
    raise exception 'too_many_links' using errcode = '22023';
  end if;

  insert into public.affiliate_links (profile_id, program_id, destination_path, campaign, destination_host)
  values (uid, p_program_id, path, camp, kind)
  on conflict do nothing
  returning code into new_code;

  if new_code is null then
    raise exception 'link_exists' using errcode = '23505';
  end if;
  return new_code;
end;
$$;
