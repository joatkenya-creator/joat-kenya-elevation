-- Sweep all blog post excerpts and content to replace developer jargon
-- "ship / ships / shipped / shipping" with plain English the wider audience
-- understands ("launch / launches / launched / launching").
--
-- Uses PostgreSQL word-boundary regex (\m...\M) so it doesn't corrupt
-- legitimate words containing the substring (relationship, partnership,
-- internship, leadership, ownership, shipping-address, etc.).
--
-- Idempotent — running it twice does nothing on the second pass because
-- no occurrences of standalone "ship" remain after the first.

update public.blog_posts
   set excerpt = regexp_replace(
                   regexp_replace(
                     regexp_replace(
                       regexp_replace(excerpt, '\mship\M', 'launch', 'g'),
                       '\mships\M', 'launches', 'g'),
                     '\mshipped\M', 'launched', 'g'),
                   '\mshipping\M', 'launching', 'g'),
       content = regexp_replace(
                   regexp_replace(
                     regexp_replace(
                       regexp_replace(content, '\mship\M', 'launch', 'g'),
                       '\mships\M', 'launches', 'g'),
                     '\mshipped\M', 'launched', 'g'),
                   '\mshipping\M', 'launching', 'g'),
       updated_at = now()
 where excerpt ~ '\m(ship|ships|shipped|shipping)\M'
    or content ~ '\m(ship|ships|shipped|shipping)\M';
