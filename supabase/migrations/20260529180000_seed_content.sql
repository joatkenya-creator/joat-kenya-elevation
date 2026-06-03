-- ─── Seed the new tables with content currently hard-coded in React ─────────
-- Idempotent: re-runs safely (uses ON CONFLICT / DELETE-then-INSERT on stable keys).
-- After this lands, the website's Testimonials, FAQ and Services sections can
-- be edited entirely from the Supabase dashboard without redeploys.

-- ═══════════════════════════════════════════════════════════════════════════
-- testimonials (7 rows from Testimonials.tsx)
-- ═══════════════════════════════════════════════════════════════════════════
delete from public.testimonials where author_name in (
  'Sarah Mitchell','Jacqueline Wanjiru','Marcus Reynolds','Brian Mwangi',
  'Amelia Carter','Joseph Otieno','Faith Achieng'
);

insert into public.testimonials (author_name, author_role, company, location, quote, rating, service_area, featured, display_order) values
('Sarah Mitchell',
 'Product Lead',
 'Crestline Ventures',
 'San Francisco',
 'BioBiz quietly replaced half my networking tools. I drop a QR and forget about it — leads always reach me, and the AI meeting summaries hand me action items before I''ve even closed my laptop. It''s become the one app I open every day.',
 5, 'BioBiz', true, 10),

('Jacqueline Wanjiru',
 'Founder',
 'Heri Health',
 'Nairobi',
 'BioBiz changed how I network. The digital card means I never miss a follow-up, and the AI meeting notes keep me sharp in every client conversation. It''s the small upgrade that has quietly grown my practice.',
 5, 'BioBiz', true, 20),

('Marcus Reynolds',
 'Marketing Director',
 'Northbound Apparel',
 'New York',
 'Their AI-driven marketing work reshaped how we launch products. We''re now producing more brand-consistent creative in a week than we used to in a quarter.',
 5, 'Digital Marketing', true, 30),

('Brian Mwangi',
 'Sales Director',
 'Tatu Capital',
 'Nairobi',
 'My team swapped paper cards for BioBiz QR scans and the difference is huge. We see who saved our card, the AI summarizes every meeting, and we close leads we used to lose. It''s the most useful tool I''ve added all year.',
 5, 'BioBiz', true, 40),

('Amelia Carter',
 'Mom of two',
 null,
 'Atlanta',
 'Amare''s Big Planet is the rare show I''m happy to let my kids watch. The stories make learning the alphabet, kindness and curiosity feel like an adventure. My five-year-old asks for it by name and remembers what he learned the next day.',
 5, 'Children''s Digital Education', true, 50),

('Joseph Otieno',
 'Primary Teacher',
 'Kilimani Academy',
 'Nairobi',
 'I show Amare''s Big Planet to my Grade 1 class and the engagement is instant. The lessons are clear, the characters are lovable, and the children come back excited about reading. It''s a brilliant teaching companion.',
 5, 'Children''s Digital Education', true, 60),

('Faith Achieng',
 'Mother of three',
 null,
 'Nakuru',
 'My kids will skip cartoons to watch Amare. The content is warm, educational and grounded in the values I want them to grow up with. As a parent it''s a relief to have something this good made for them.',
 5, 'Children''s Digital Education', true, 70);

-- ═══════════════════════════════════════════════════════════════════════════
-- faqs (6 rows from work-with-us.tsx, topic = 'packages')
-- ═══════════════════════════════════════════════════════════════════════════
delete from public.faqs where topic = 'packages';

insert into public.faqs (question, answer, topic, display_order, published) values
('Do I need any code or software knowledge?',
 'No. If you can use Telegram, you can run your business with us. Send a message; the bot handles the rest.',
 'packages', 10, true),

('Can my existing website connect?',
 'Yes. We connect to existing sites via REST API or webhook (WordPress, Webflow, custom) without rebuilding anything.',
 'packages', 20, true),

('What if the bot misunderstands me?',
 'Our AI confidence scoring catches uncertain commands and asks for clarification before publishing anything live.',
 'packages', 30, true),

('What''s the contract commitment?',
 'Everything is month-to-month. No lock-in. Cancel or change packages whenever you like.',
 'packages', 40, true),

('Can I upgrade or downgrade packages?',
 'Yes. Changes take effect from your next billing cycle.',
 'packages', 50, true),

('Is this only available in Kenya?',
 'No. The platform is location-agnostic and we have clients globally. Onboarding is fully remote.',
 'packages', 60, true);

-- ═══════════════════════════════════════════════════════════════════════════
-- services (5 rows from Services.tsx)
-- ═══════════════════════════════════════════════════════════════════════════
-- icon_name maps to lucide-react icons used in the component.
insert into public.services
  (slug, name, short_summary, full_description, icon_name, outcomes, industries, contact_form_value, display_order, published)
values
('software-development',
 'Software Development',
 'Custom mobile, web and AI products, designed, built and delivered end-to-end by our in-house engineering team.',
 'From discovery to launch we build production-grade software (native mobile, web apps, AI integrations and edge backends) the way modern tech companies do.',
 'Code2',
 array['Launch in weeks, not quarters','Production-grade quality','Scalable modern stacks'],
 array['Mobile apps','Web platforms','AI integrations','APIs & backends'],
 'Software Development', 10, true),

('digital-marketing',
 'Digital Marketing',
 'Generative campaigns, content and ads that grow brands across every major platform.',
 'We orchestrate AI and creative teams into brand-consistent campaigns, social content and paid ads, generated and optimized in hours rather than weeks.',
 'Megaphone',
 array['Faster creative cycles','Multi-platform reach','Performance-driven growth'],
 array['Social media','Paid ads','Brand campaigns','Product launches'],
 'Digital Marketing', 20, true),

('media-content-production',
 'Media & Content Production',
 'Animation, video and visual content, from 3D in Blender to brand explainers, produced in-house.',
 'Our media pipeline turns ideas into film-quality assets: character animation, motion graphics, explainers and content series that work across products, classrooms and brands.',
 'Clapperboard',
 array['Film-quality output','Reusable asset libraries','Consistent brand worlds'],
 array['Animation & 3D','Explainers','Brand films','Content series'],
 'Media & Content Production', 30, true),

('childrens-digital-education',
 'Children''s Digital Education',
 'Story-led educational content and learning experiences for young audiences.',
 'We design and produce curriculum-aligned digital content (animated series, interactive activities and learning games) that make early learning joyful and effective.',
 'GraduationCap',
 array['Curriculum-aligned','Engaging for ages 1–8','Literacy & STEM outcomes'],
 array['Animated series','Interactive learning','Learning games','Curriculum content'],
 'Children''s Digital Education', 40, true),

('ai-solutions',
 'AI Solutions',
 'AI features and automations, transcription, translation and agents, built into real products.',
 'We integrate Claude, OpenRouter and image models into production workflows: meeting summaries, live translation, content generation and agentic automation.',
 'Sparkles',
 array['Smarter products','Automated workflows','Cutting-edge capabilities'],
 array['AI features','Automation','Transcription & translation','Agents'],
 'AI Solutions', 50, true)
on conflict (slug) do update set
  name             = excluded.name,
  short_summary    = excluded.short_summary,
  full_description = excluded.full_description,
  icon_name        = excluded.icon_name,
  outcomes         = excluded.outcomes,
  industries       = excluded.industries,
  contact_form_value = excluded.contact_form_value,
  display_order    = excluded.display_order,
  published        = excluded.published;

-- ═══════════════════════════════════════════════════════════════════════════
-- sitemap_entries (10 rows mirroring public/sitemap.xml)
-- ═══════════════════════════════════════════════════════════════════════════
insert into public.sitemap_entries (url_path, lastmod, changefreq, priority, published) values
('/',              now(), 'weekly',  1.0, true),
('/about',         now(), 'monthly', 0.8, true),
('/services',      now(), 'monthly', 0.9, true),
('/products',      now(), 'monthly', 0.9, true),
('/careers',       now(), 'weekly',  0.7, true),
('/news',          now(), 'weekly',  0.7, true),
('/contact',       now(), 'monthly', 0.8, true),
('/work-with-us',  now(), 'monthly', 0.9, true),
('/privacy',       now(), 'yearly',  0.3, true),
('/terms',         now(), 'yearly',  0.3, true)
on conflict (url_path) do update set
  lastmod    = excluded.lastmod,
  changefreq = excluded.changefreq,
  priority   = excluded.priority,
  published  = excluded.published;
