-- Add two JOAT-specific articles that support product/service SEO.
-- Idempotent: re-running updates the existing rows by slug.

insert into public.blog_posts (title, slug, category, status, excerpt, cover_image, content)
values
(
  'Digital Business Cards in Kenya: Why Professionals Are Moving Beyond Paper',
  'digital-business-cards-in-kenya',
  'BioBiz',
  'published',
  'Paper cards still work, but digital business cards are faster to share, easier to update, and better for measuring real networking results.',
  '/blog-covers/digital-business-cards.svg',
  $body1$
<p>Business cards are not dead. They have simply changed shape. In Kenya, where networking often happens quickly at events, client meetings, campuses, malls and WhatsApp groups, the strongest card is the one a person can save, share and act on immediately.</p>

<h2>The problem with paper cards</h2>
<p>Paper cards are easy to hand out, but they are difficult to track. You rarely know who saved your number, who visited your website, or which introduction created a real lead. They also go out of date the moment your role, phone number, brand identity or social links change.</p>

<p>For founders, sales teams, recruiters, creators and consultants, that is a real cost. A contact that cannot find your latest profile may never become a customer.</p>

<h2>What a digital business card changes</h2>
<p>A digital business card turns your profile into a living link. You can share it by QR code, NFC, WhatsApp, email or social media. The person receiving it can save your details instantly, view your portfolio, open your social profiles or contact you without typing anything manually.</p>

<h3>1. Your information stays current</h3>
<p>When your title changes, your company updates its brand, or you add a new channel, you update the card once. Everyone who opens your link sees the current version.</p>

<h3>2. Sharing becomes frictionless</h3>
<p>At a conference or sales meeting, a QR code is faster than searching for a pen or spelling an email address. Online, a digital card is easier to forward than a photo of a paper card.</p>

<h3>3. You get a clearer view of networking</h3>
<p>Digital cards can show views, shares and saves. That data helps you understand which events, meetings and campaigns create real attention.</p>

<h2>Where BioBiz fits</h2>
<p>BioBiz is JOAT Kenya's digital business card product. It combines a shareable profile with QR sharing, analytics, AI meeting notes and live translation features. The goal is simple: help professionals turn introductions into follow-ups.</p>

<p>For a founder, BioBiz becomes a pitch profile. For a recruiter, it becomes a trusted contact page. For a creator, it becomes a portfolio doorway. For sales teams, it becomes a measurable networking tool.</p>

<h2>Who should use digital cards first?</h2>
<ul>
  <li>Founders meeting investors, partners and customers.</li>
  <li>Sales teams attending expos, launches and field activations.</li>
  <li>Recruiters and talent managers handling many introductions.</li>
  <li>Consultants, creators and freelancers building a personal brand.</li>
  <li>Students and graduates preparing for career fairs.</li>
</ul>

<h2>The bottom line</h2>
<p>Paper cards still have a place, especially in formal settings. But if your work depends on fast follow-up, measurable connections and an up-to-date professional presence, a digital card is no longer optional. It is the networking layer your phone should already have.</p>

<p>To explore BioBiz for yourself or your team, visit the BioBiz section of the JOAT Kenya site or contact our team for a walkthrough.</p>
  $body1$
),
(
  'Roblox Game Development in Africa: Why Brands and Educators Should Pay Attention',
  'roblox-game-development-in-africa',
  'Game Development',
  'published',
  'Roblox is no longer just a kids platform. It is becoming a practical space for education, brand experiences and African creative technology.',
  '/blog-covers/roblox-game-development.svg',
  $body2$
<p>Roblox is often described as a game platform, but that undersells what it has become. For young audiences, it is a social space, a creation engine and a learning environment. For brands and educators in Africa, that combination opens a serious opportunity.</p>

<h2>Why Roblox matters now</h2>
<p>Young people already spend time in interactive worlds. The question for brands and educators is whether they will meet that audience with shallow ads or with experiences that are useful, memorable and safe.</p>

<p>Roblox makes it possible to build worlds where users do something, not just watch something. They solve a challenge, explore a story, collect rewards, collaborate with friends or learn a concept through play.</p>

<h2>Three use cases worth taking seriously</h2>

<h3>1. Education through play</h3>
<p>Interactive learning works because it gives children feedback. A learner who collects letters, solves puzzles or completes a mission is not passively watching a lesson. They are rehearsing it. That is why JOAT Kenya's work around Amare's Big Planet connects naturally with game development: story, curriculum and play can reinforce one another.</p>

<h3>2. Brand worlds that people choose to enter</h3>
<p>A brand experience on Roblox should not feel like a billboard. It should feel like a world with a reason to exist. A bank could teach money habits through quests. A sports brand could create a training arena. A children's media brand could let fans explore episode locations.</p>

<h3>3. Skills development for young creators</h3>
<p>Roblox Studio introduces young builders to scripting, level design, 3D thinking, game loops, UI, community management and analytics. Those are real digital skills. A strong African Roblox pipeline can become a stepping stone into software, animation and product design careers.</p>

<h2>What makes a Roblox project work?</h2>
<p>The strongest projects have a clear loop. Players know what to do in the first 30 seconds, why it matters, and what they unlock next. They also need safe design, mobile performance, simple onboarding and regular updates. Building the world is only the first half; operating it is the second.</p>

<h2>JOAT Kenya's approach</h2>
<p>JOAT Kenya builds Roblox experiences as part of a wider creative technology pipeline. That means 3D art, scripting, education design, brand storytelling and live operations sit together. The goal is not just to publish a map. The goal is to create an experience that people return to.</p>

<p>Our selected builds, including Amare's Big Planet and Abyss, show how educational storytelling and game mechanics can sit in the same ecosystem. For partners, the same pipeline can support branded worlds, classroom tools, launch campaigns and original IP.</p>

<h2>The opportunity for Africa</h2>
<p>Africa has young audiences, strong mobile adoption and a growing creative technology sector. Roblox gives builders a way to create for local stories while reaching global players. That is a rare combination.</p>

<p>If your organization is exploring a learning game, branded world or Roblox experience, start with the objective. What should the player understand, feel or do after five minutes? Once that is clear, the world can be designed around it.</p>
  $body2$
)
on conflict (slug) do update set
  title       = excluded.title,
  category    = excluded.category,
  status      = excluded.status,
  excerpt     = excluded.excerpt,
  cover_image = excluded.cover_image,
  content     = excluded.content,
  updated_at  = now();
