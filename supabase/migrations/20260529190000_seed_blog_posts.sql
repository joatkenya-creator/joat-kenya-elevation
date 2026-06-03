-- Seed 3 new blog posts to flesh out the News & Articles section.
-- Idempotent — uses ON CONFLICT (slug) so re-running updates rather than errors.
--
-- Tip: to also delete the two stale "talent" posts that are currently filtered
-- client-side, uncomment the DELETE block at the end of this file.

insert into public.blog_posts (title, slug, category, status, excerpt, cover_image, content)
values
(
  'How AI Is Quietly Changing Software Delivery',
  'how-ai-is-quietly-changing-software-delivery',
  'AI Solutions',
  'published',
  'The most interesting AI in 2026 isn''t in the headlines — it''s in the small workflows quietly reshaping how teams plan, build and ship software. Here''s what we''ve learned.',
  null,
  $body1$
<p>The most interesting work happening in AI right now isn't in the headlines. It's not chatbots that promise to do everything, or autonomous agents writing entire codebases from a one-line prompt. It's smaller, quieter, and far more practical — and over the past year it has reshaped how software actually gets built.</p>

<h2>The headlines vs. the workflow</h2>
<p>Every week brings a new demo of an AI tool that promises to replace whole categories of work. Most of those demos are impressive on stage and brittle in production. The shift that actually matters hasn't been agents taking over — it's been the elimination of small frictions across the build cycle.</p>

<h2>Where AI actually helps software work today</h2>

<h3>1. Translating ideas into specifications</h3>
<p>The biggest bottleneck in custom software is rarely writing code. It's converting fuzzy client intent into something an engineering team can build. AI has dramatically shortened that loop. A 30-minute discovery call transcript can now become a draft technical brief that's 80% of the way there in minutes. A senior engineer refines the last 20%. What used to take three days takes one.</p>

<h3>2. Code review that catches the obvious before humans see it</h3>
<p>Linting has existed for years. What AI added is the ability to flag the deeper issues: a function that's plausible but subtly wrong, an unhandled edge case, a variable name that will confuse the next maintainer. We run AI review on every pull request before a human sees it. The result: humans spend their time on judgment calls instead of typo-hunting.</p>

<h3>3. Production-ready copy and content</h3>
<p>Apps need microcopy — error messages, button labels, onboarding text. Marketing needs ad variants. Documentation needs to exist. All of these used to be a slow bottleneck near the end of every project. With brand-tuned prompts, AI now generates first drafts that need only light editing.</p>

<h3>4. Customer support that scales without a team</h3>
<p>The chatbot on this site is a small example. It handles the first wave of common questions — services, packages, contact — so the human team only sees genuinely novel ones. For products with predictable support patterns, this is a force multiplier.</p>

<h2>What it still doesn't do</h2>
<p>AI doesn't replace architecture decisions. It doesn't replace the senior engineer who has seen what breaks at 10,000 concurrent users. It doesn't make business judgment calls about which feature to ship first. The teams that get the most out of AI treat it as a power tool, not a co-worker.</p>

<h2>How we integrate AI into client builds</h2>
<p>Every project at J.O.A.T. Kenya now ships with at least one AI integration baked in — sometimes user-facing (transcription, live translation, content generation), sometimes internal (smarter admin tooling, faster onboarding). The goal isn't to make the product feel "AI-powered." It's to remove the small frictions that used to keep a product from being great.</p>

<p>If you're sitting on a project where AI could help — but you're not sure where it actually fits — that's a conversation worth having. Book a 30-min meeting from the Contact section, or share your project via the Contact form.</p>
  $body1$
),
(
  'What Makes Children''s Digital Content Actually Stick',
  'what-makes-childrens-digital-content-stick',
  'Children''s Digital Education',
  'published',
  'From Amare''s Big Planet to classroom programmes, three principles that turn one-off views into lasting learning.',
  null,
  $body2$
<p>Children's digital content is one of the most crowded categories in the world. YouTube alone hosts millions of hours of kids' video. Most of it is forgettable. A small fraction sticks — and the difference between the two isn't budget. It's intent.</p>

<h2>Why most kids' content doesn't stick</h2>
<p>Most children's content optimises for the next click. Bright colours, fast cuts, surprising sounds. It works — for the moment a child is watching. The next morning they can't tell you what they saw. Worse, sometimes they can't tell you what they learned.</p>

<p>The content that genuinely shapes a child's understanding works differently. It has fewer cuts. Its lessons return in subtle variations. And it lives in a small ecosystem of parents, teachers and characters that the child trusts.</p>

<h2>Three principles that make content stick</h2>

<h3>1. An emotional anchor before a learning goal</h3>
<p>Children remember feelings before facts. A song about counting that makes them laugh will outperform a slideshow that perfectly delivers the same information. The episode of Amare's Big Planet that teaches the letter Y is, fundamentally, a story about a yak who befriends a yacht. The letter Y is the by-product of caring about the yak.</p>

<h3>2. Repetition through variation</h3>
<p>The same lesson, in different shapes. A letter learned in a song, then in a craft, then in a story, then in a real-world spotting game. Each variation reinforces the previous without feeling like repetition. This is how children's brains consolidate knowledge — through pattern recognition across slightly different examples.</p>

<h3>3. A bridge to the adults in the room</h3>
<p>Content that sticks gets discussed. Parents repeat the catchphrases. Teachers print the activity sheets. Grandparents ask which character is the favourite this week. None of that happens by accident — the content has to be designed to invite that conversation. Our children's content deliberately leaves hooks for adults: parent-conversation prompts at the end of episodes, downloadable home activities, classroom guides.</p>

<h2>How Amare's Big Planet embodies this</h2>
<p>Amare's Big Planet — the animated YouTube series we partner with on content and production — is built around these three principles. Each episode is a small story with a clear emotional arc. Lessons return episode-to-episode in different forms. Every episode is paired with classroom-ready material and parent prompts.</p>

<p>The results show up in the numbers we don't usually share: returning viewers, classroom adoption requests, parents emailing to ask when the next episode drops. None of that comes from chasing trends. It comes from treating children — and the adults around them — with respect.</p>

<h2>What we look for in new children's projects</h2>
<p>If you have a children's content idea you'd like to bring to life — animated series, learning games, interactive activities — we look for three things before saying yes: a clear emotional centre, a curriculum it could plausibly serve, and a real sense of the parents and teachers who'll meet it.</p>

<p>To talk about a project, use the Contact form and pick "Children's Digital Education." Most discovery calls start within a week.</p>
  $body2$
),
(
  'Brand-Consistent Creative at the Speed of Prompts',
  'brand-consistent-creative-at-the-speed-of-prompts',
  'Digital Marketing',
  'published',
  'AI-driven creative pipelines aren''t replacing creative teams — they''re freeing them. Here''s how multi-platform campaigns now ship in days, not quarters.',
  null,
  $body3$
<p>Most marketing teams hit the same wall: there's never enough creative. The brief approves on Monday. The design lead is double-booked. The copy needs three rounds. The campaign that was supposed to ship Friday now ships in three weeks — by which point the moment has passed.</p>

<p>The instinct is to hire more designers. The better answer, in 2026, is to redesign the pipeline.</p>

<h2>The old creative cycle, in slow motion</h2>
<p>The traditional way of running a marketing campaign looks like this: brief → designer mockups → copywriter passes → revision rounds → final approval → publish. Every handoff is a delay. Every revision burns a day. The end-to-end timeline for a multi-platform campaign at a typical agency is six to eight weeks.</p>

<p>That timeline made sense when each asset had to be hand-crafted from scratch. It doesn't make sense when AI can generate brand-consistent first drafts in minutes.</p>

<h2>The hybrid approach</h2>
<p>At J.O.A.T. Kenya we run paid campaigns across Google, Meta (Facebook + Instagram), TikTok, LinkedIn and YouTube. The pipeline that makes it possible:</p>

<ol>
  <li><strong>Brand guardrails captured once.</strong> Brand colours, voice rules, what the brand avoids saying, the visual references that work. Stored in a brand profile the AI tools reference for every generation.</li>
  <li><strong>AI-generated first drafts at scale.</strong> A single brief becomes 20 creative variants in an hour — different angles, hooks, visual concepts.</li>
  <li><strong>Human-led curation.</strong> A senior creative reviews the variants, picks the strongest 3–5, and refines them. The human still owns judgment. The AI removes the busywork.</li>
  <li><strong>Approval and publish in one flow.</strong> The client sees the curated set, picks the winners, and they ship the same day.</li>
</ol>

<p>Campaigns that used to take eight weeks now ship in two to five days. The quality bar is the same. The cost is significantly lower.</p>

<h2>What AI shouldn't do</h2>
<p>This is not "AI replaces creative teams." AI is comically bad at certain things: brand judgment, knowing what's actually been done before, reading the moment a culture is in. The best campaigns we run still depend on human creative directors making the difficult calls. The AI is upstream, removing the busywork.</p>

<p>The teams that struggle with AI marketing pipelines are the ones who treat AI as the creative. The teams that succeed treat AI as their drafting layer.</p>

<h2>What this looks like for a brand</h2>
<p>A client of ours runs a seasonal product launch every two months. Before they brought us in, each launch was a frantic 4-week scramble. Now the launch package — campaign creative across Instagram, TikTok and Meta, plus the email sequences — ships in five business days from brief. Their team's time goes into strategy and customer conversations, not production.</p>

<p>If your team is bottlenecked at the creative production stage, the fix is not necessarily another hire. It might be a redesigned pipeline. Use the Contact form (pick "Digital Marketing") to talk through your campaign cadence and we'll show you what's possible.</p>
  $body3$
)
on conflict (slug) do update set
  title       = excluded.title,
  category    = excluded.category,
  status      = excluded.status,
  excerpt     = excluded.excerpt,
  cover_image = excluded.cover_image,
  content     = excluded.content,
  updated_at  = now();

-- ─── Optional cleanup — uncomment to delete the two stale "talent" posts ───
-- delete from public.blog_posts
-- where slug in (
--   'how-joat-kenya-is-transforming-employment-in-africa',
--   'why-many-kenyans-are-unemployed-and-how-to-find-work-fast'
-- );
