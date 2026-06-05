-- Cross-link the AI Tools and Mobile App Cost articles for SEO and engagement.
-- Internal links between related posts:
--   • Spread page authority (Google reads them as a topical cluster)
--   • Lift time-on-site (visitors click through to the next post)
--   • Improve crawl depth so search engines index everything
--
-- The WHERE NOT LIKE guard prevents double-application if this migration runs
-- twice — the UPDATE simply no-ops once the cross-link is already present.

-- ─── AI Tools article → link to Mobile App Cost ─────────────────────────────
-- Inserts a related-reading paragraph right before the closing CTA.
update public.blog_posts
   set content = replace(
         content,
         '<p>If you''d like help designing an AI workflow',
         '<p>Building on the AI workflow above: if you''re planning a software project, the right tools materially affect both timeline and budget. See our breakdown of <a href="/news?article=mobile-app-development-cost-2026">mobile app development cost in 2026</a> for a real example of how AI-assisted development changes the math.</p>
<p>If you''d like help designing an AI workflow'
       ),
       updated_at = now()
 where slug = 'best-ai-tools-small-business-2026'
   and content not like '%mobile-app-development-cost-2026%';

-- ─── Mobile App Cost article → link to AI Tools ────────────────────────────
-- Naturally inline in the "Complex app" section where AI integration is mentioned.
update public.blog_posts
   set content = replace(
         content,
         'AI integration, video/audio, payments',
         'AI integrations (see our list of <a href="/news?article=best-ai-tools-small-business-2026">15 AI tools every small business should use</a>), video/audio, payments'
       ),
       updated_at = now()
 where slug = 'mobile-app-development-cost-2026'
   and content not like '%best-ai-tools-small-business-2026%';
