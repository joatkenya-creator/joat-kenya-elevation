-- Point the Media & Content Production article at the new SVG pipeline cover
-- at public/blog-covers/pipeline.svg. The design directly mirrors the article:
-- a 3-stage flow (Brief → Production → Render) with a "2-week delivery" badge.

update public.blog_posts
   set cover_image = '/blog-covers/pipeline.svg',
       updated_at  = now()
 where slug = 'modern-animation-pipelines-brand-films';
