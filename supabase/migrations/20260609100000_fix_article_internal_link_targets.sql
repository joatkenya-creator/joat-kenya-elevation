-- Keep article internal links pointed at live sections/pages.
-- The Amare selected-client block now has a real /products#amare anchor.
-- The Roblox product section is currently disabled, so route that link to services.

update public.blog_posts
set
  content = replace(content, 'href="/products#games"', 'href="/services"'),
  updated_at = now()
where content like '%href="/products#games"%';
