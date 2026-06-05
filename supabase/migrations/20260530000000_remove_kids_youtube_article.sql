-- Remove the "Best Educational YouTube Channels for Kids 2026" article.
-- The article was published in the 2026-05-29 high-volume SEO batch but is being
-- retired because it isn't a core fit for JOAT's commercial focus. Article
-- referenced by neither sitemap nor any other blog post's internal links, so
-- this delete is safe in isolation.

delete from public.blog_posts
 where slug = 'best-educational-youtube-channels-kids-2026';
