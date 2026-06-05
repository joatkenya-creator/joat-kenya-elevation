-- Shorten blog post excerpts to fit Google's ~155-char SERP display limit.
-- Ahrefs Site Audit flagged 13 "Meta description too long" findings; this
-- migration eliminates the 12 non-indexable ones (blog articles surfaced via
-- /news?article=<slug> deep links). The 1 indexable was the homepage and is
-- fixed in src/routes/index.tsx.
--
-- Where the original excerpts came from:
--   • how-ai (173) — supabase/migrations/20260529190000_seed_blog_posts.sql
--   • brand-consistent (155) — same seed
--   • modern-animation (192) — 20260529210000_replace_childrens_article.sql
--   • mobile-app-cost (240) — 20260530100000_rewrite_mobile_app_cost_article.sql
--   • ai-tools (168) — 20260529230000_high_volume_seo_articles.sql
--
-- Char counts in comments are post-shortening to confirm <155.

-- ─── 1. How AI Is Quietly Changing Software Delivery ────────────────────────
update public.blog_posts
   set excerpt = 'The most interesting AI in 2026 isn''t in the headlines — it''s in the small workflows quietly reshaping how teams plan, build and launch software.',
       updated_at = now()
 where slug = 'how-ai-is-quietly-changing-software-delivery';
-- 146 chars

-- ─── 2. Brand-Consistent Creative at the Speed of Prompts ───────────────────
update public.blog_posts
   set excerpt = 'AI-driven creative pipelines aren''t replacing teams — they''re freeing them. Multi-platform campaigns now launch in days, not quarters.',
       updated_at = now()
 where slug = 'brand-consistent-creative-at-the-speed-of-prompts';
-- 132 chars

-- ─── 3. Modern Animation Pipelines ──────────────────────────────────────────
update public.blog_posts
   set excerpt = 'Brand animation projects usually miss their launch window. The slowness isn''t in the artists — it''s in the pipeline. Here''s how studios recover it.',
       updated_at = now()
 where slug = 'modern-animation-pipelines-brand-films';
-- 150 chars

-- ─── 4. Mobile App Development Cost / How To Build ──────────────────────────
update public.blog_posts
   set excerpt = 'A founder''s step-by-step roadmap to launching a mobile app in 2026 — from defining the one thing it does, through choosing a partner and going live.',
       updated_at = now()
 where slug = 'mobile-app-development-cost-2026';
-- 149 chars

-- ─── 5. 15 AI Tools for Small Business ──────────────────────────────────────
update public.blog_posts
   set excerpt = 'The 15 AI tools we actually use at JOAT Kenya and recommend to clients — pick one per category and you''re running like a much bigger team.',
       updated_at = now()
 where slug = 'best-ai-tools-small-business-2026';
-- 141 chars
