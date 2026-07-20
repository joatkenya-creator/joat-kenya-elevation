-- ─── Reposition the services catalog around the new core identity ───────────
-- JOAT now leads with Virtual Assistants, AI & Automation and Marketing &
-- Lead Generation; Software Development, Media & Content Production and
-- Children's Digital Education remain as supporting in-house capabilities.
-- Mirrors src/data/services-catalog.ts — keep both in sync when editing.

-- New: Virtual Assistants (leads the list)
insert into public.services
  (slug, name, short_summary, full_description, icon_name, outcomes, industries, contact_form_value, display_order, published)
values
('virtual-assistants',
 'Virtual Assistants',
 'Elite AI-run and human virtual assistants, embedded in your business to handle leads, admin and operations.',
 'From a 24/7 AI Inside Sales Agent to a dedicated, industry-literate human VA, we place elite virtual assistants inside your business to respond to leads, manage your CRM and pipeline, and carry the operational load, starting with real estate and expanding across industries.',
 'Headset',
 array['Sub-5-minute lead response','Lower overhead than a full hire','Scales from AI-only to full-time'],
 array['Real estate','Lead response (ISA)','CRM & operations','Executive support'],
 'Virtual Assistant', 10, true)
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

-- Rename + reframe: AI Solutions → AI & Automation (moves to position 20)
update public.services set
  name = 'AI & Automation',
  short_summary = 'AI agents and automations that do the work, chat, transcription, translation and workflows, built into real products.',
  full_description = 'We integrate Claude, OpenRouter and image models into production-grade automations: AI chatbots, workflow automation, meeting notes, live translation and predictive analytics that cut manual work out of your operations.',
  outcomes = array['Hours of manual work automated','24/7 always-on operations','Cutting-edge in-house AI stack'],
  industries = array['AI agents','Workflow automation','Transcription & translation','Analytics'],
  contact_form_value = 'AI & Automation',
  display_order = 20
where slug = 'ai-solutions';

-- Rename + reframe: Digital Marketing → Marketing & Lead Generation (position 30)
update public.services set
  name = 'Marketing & Lead Generation',
  short_summary = 'Generative campaigns and outbound systems built to fill your pipeline, not just grow followers.',
  full_description = 'We orchestrate AI and creative teams into brand-consistent campaigns, targeted outbound and paid ads, engineered around one outcome: qualified leads that convert, generated and optimized in hours rather than weeks.',
  outcomes = array['More qualified leads','Faster creative cycles','Performance-driven growth'],
  industries = array['Lead generation','Paid ads','Outbound campaigns','Brand content'],
  contact_form_value = 'Marketing & Lead Generation',
  display_order = 30
where slug = 'digital-marketing';

-- Demote supporting capabilities below the three new leads.
update public.services set display_order = 40 where slug = 'software-development';
update public.services set display_order = 50 where slug = 'media-content-production';
update public.services set display_order = 60 where slug = 'childrens-digital-education';
