-- Remove the "since 1983" founding reference from published blog article
-- bodies. The two seed/rewrite migrations that introduced this text have
-- already run against the live database, so editing those files does not
-- change live content — this migration updates the rows in place.
--
-- Uses replace() so it is idempotent: re-running is a no-op once the phrase
-- is gone, and it never touches articles that don't contain it.

update public.blog_posts
   set content = replace(content, 'operating from Kiambu since 1983.', 'operating from Kiambu.'),
       updated_at = now()
 where slug = 'mobile-app-development-cost-2026'
   and content like '%operating from Kiambu since 1983.%';

update public.blog_posts
   set content = replace(content, 'in every client engagement since 1983.', 'in every client engagement.'),
       updated_at = now()
 where slug = 'choose-software-development-partner-checklist'
   and content like '%in every client engagement since 1983.%';
