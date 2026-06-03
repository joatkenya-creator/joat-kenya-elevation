-- Point the 3 new blog posts at the branded SVG cover images served from
-- public/blog-covers/. Paths are relative so they resolve against whatever
-- domain the page is served from (localhost in dev, joatkenya.com in prod).

update public.blog_posts
   set cover_image = '/blog-covers/ai-software.svg',
       updated_at  = now()
 where slug = 'how-ai-is-quietly-changing-software-delivery';

update public.blog_posts
   set cover_image = '/blog-covers/childrens-content.svg',
       updated_at  = now()
 where slug = 'what-makes-childrens-digital-content-stick';

update public.blog_posts
   set cover_image = '/blog-covers/digital-marketing.svg',
       updated_at  = now()
 where slug = 'brand-consistent-creative-at-the-speed-of-prompts';
