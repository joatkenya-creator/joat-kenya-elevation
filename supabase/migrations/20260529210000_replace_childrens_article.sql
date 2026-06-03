-- Remove "What Makes Children's Digital Content Actually Stick" and add a new
-- Media & Content Production article in its place.

delete from public.blog_posts
 where slug = 'what-makes-childrens-digital-content-stick';

insert into public.blog_posts (title, slug, category, status, excerpt, cover_image, content)
values (
  'How Modern Animation Pipelines Cut Brand Film Timelines in Half',
  'modern-animation-pipelines-brand-films',
  'Media & Content Production',
  'published',
  'Most brand animation projects miss their launch window. The slowness usually isn''t in the artists — it''s in the pipeline. Here''s where the time actually goes and how a modern studio recovers it.',
  '/blog-covers/media-production.svg',
  $body$
<p>Most brand animation projects take six to eight weeks. By the time they ship, the campaign moment has often passed. The instinct is to blame the artists for moving slowly. The truth is usually different — the slowness is in the pipeline, not the people.</p>

<h2>Where the time actually goes</h2>
<p>Walk through a typical brand-film project and you'll find three bottlenecks that account for most of the lost weeks:</p>

<h3>1. The brief that's not a brief</h3>
<p>A client sends an email saying "we need a 30-second product video." That's not a brief — it's a request. The studio spends two weeks doing the brief that the client should have done: clarifying the audience, the tone, the call-to-action, the platforms the video will play on. By the time the actual production starts, a third of the timeline is already gone.</p>

<h3>2. Building every asset from scratch</h3>
<p>Most studios start each project with an empty Blender file. Characters get rigged from scratch. Sets get modelled from scratch. Lighting setups get rebuilt from scratch. The first three weeks of a six-week project are essentially infrastructure — none of which the client ever sees in the final film.</p>

<h3>3. The approval loop that never closes</h3>
<p>Round one: client wants something tweaked. Round two: a different stakeholder wants something else tweaked. Round three: the first stakeholder changes their mind. Each round burns three to five days of artist time and triggers a render queue.</p>

<h2>The modern pipeline answer</h2>

<h3>Standardised briefing templates that the client fills in first</h3>
<p>Before any studio time is booked, the client completes a structured brief that captures audience, tone, platforms, brand guardrails and reference films. Five questions. Twenty minutes. The studio starts production-ready instead of investigation-ready.</p>

<h3>A reusable asset library, not a blank canvas</h3>
<p>Modular characters, lighting templates, camera rigs and motion presets get built once and reused across projects. New films inherit production-grade infrastructure on day one. The studio time goes into the things that actually differentiate this film — the story, the brand expression, the unique shots — not the plumbing.</p>

<h3>Pre-vis before render</h3>
<p>Before any frame gets fully rendered, the client sees a low-quality pre-visualisation of the whole film. Tweaks happen in pre-vis, where they cost minutes instead of days. Once the pre-vis is approved, only then does the render queue start.</p>

<h2>The Blender + AI workflow</h2>
<p>At J.O.A.T. Kenya our animation pipeline runs on Blender end-to-end. Where AI fits in: lip-sync to voice tracks, motion retargeting between similar characters, denoising on lower-sample renders to cut render time. None of those tools replace creative direction. They remove the small frictions that used to fill the timeline.</p>

<h2>What stays absolutely human</h2>
<p>Storytelling. Character design. Brand expression. The choices that make a film feel like a particular brand instead of generic motion graphics. AI is comically bad at making those calls — the best brand films we deliver still depend on senior creative directors who know what the brand stands for. The pipeline removes the busywork around them, not the work itself.</p>

<h2>What this means in practice</h2>
<p>A brand film that used to take six to eight weeks now delivers in two — sometimes less for variations of an existing template. The cost structure shifts too: less time spent on infrastructure, more spent on creative.</p>

<p>If you have a brand film, explainer, animated series or content franchise sitting in the "we should do this" pile because the timeline always looked impossible, that's the conversation to have. Use the Contact form and pick "Media & Content Production" — or book a 30-min meeting from the Contact section to talk through your project.</p>
  $body$
)
on conflict (slug) do update set
  title       = excluded.title,
  category    = excluded.category,
  status      = excluded.status,
  excerpt     = excluded.excerpt,
  cover_image = excluded.cover_image,
  content     = excluded.content,
  updated_at  = now();
