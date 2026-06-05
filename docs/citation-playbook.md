# JOAT Kenya — Off-Page Citation Playbook

Five channels to make JOAT Kenya cite-able in AI assistants (ChatGPT, Claude, Perplexity, Gemini, Bing/Copilot). Ordered by leverage. Estimated total time: **4 – 8 hours** spread over 1 – 2 weeks.

The on-page work (llms.txt, robots.txt, structured data) is already done. This file is the off-page half — everything that has to happen on **other people's websites** to compound that work.

---

## 1. Wikidata — highest leverage, ~30 minutes

Wikidata is in nearly every LLM's training set. A Wikidata item with `sameAs` links to joatkenya.com is the single most-cited backlink in AI answers.

**Wikipedia itself requires "significant coverage in independent reliable sources" — JOAT may not clear that bar yet. Wikidata has no such requirement. Start here; come back to Wikipedia after the press mentions land (step 4).**

### Steps

1. Create account at <https://www.wikidata.org/wiki/Special:CreateAccount>
2. Confirm email
3. Visit <https://www.wikidata.org/wiki/Special:NewItem>
4. Fill in:
   - **Label (English):** `J.O.A.T. Kenya`
   - **Description (English):** `Kenyan digital innovation studio founded 1983`
   - **Aliases:** `JOAT Kenya` · `JOAT` · `Jack of All Trades Kenya` · `Jack Urban Services Ltd`
5. Click **Create**. The item now has a Q-number (e.g., Q123456789). Save it.
6. On the new item page, click "+ add statement" for each of the following:

| Property | Value | Type |
|---|---|---|
| `instance of` (P31) | `business` (Q4830453) | item |
| `country` (P17) | `Kenya` (Q114) | item |
| `headquarters location` (P159) | `Kiambu` (Q1024876) | item |
| `inception` (P571) | `1983` | date |
| `official website` (P856) | `https://joatkenya.com` | URL |
| `industry` (P452) | `software industry` (Q880198) | item |
| `industry` (P452) | `digital media` (Q1885703) | item (second value) |
| `LinkedIn ID` (P4264) | `joat-kenya-jack-urban-services-ltd` | external-id |
| `Facebook ID` (P2013) | `profile.php?id=61581326003888` | external-id |
| `Instagram username` (P2003) | `joat.kenya` | external-id |
| `official name` (P1448) | `J.O.A.T. Kenya` (en) | monolingual text |

7. For each statement, add a **reference** — click "+ add reference" and use:
   - `stated in` (P248) → `Official website`
   - `reference URL` (P854) → `https://joatkenya.com`
   - `retrieved` (P813) → today's date

Sourcing every statement to joatkenya.com keeps the item from being flagged for deletion.

### Why this is huge
Wikidata feeds the Google Knowledge Graph, Apple Siri/Spotlight, Microsoft Cortana, every modern LLM's training corpus, and Diffbot/Bing Knowledge Panel. One Q-item creates ~12 downstream citation surfaces.

---

## 2. Crunchbase — ~45 minutes

Crunchbase entries are scraped by Diffbot, Bing AI, Brave Search, and most enterprise data providers. Free accounts can add organizations.

### Steps

1. Create account at <https://www.crunchbase.com/register>
2. Visit <https://www.crunchbase.com/add-new>
3. Pick **Organization**
4. Fill in the fields below — copy/paste ready:

### Field-by-field content

**Organization name**
```
J.O.A.T. Kenya
```

**Also known as**
```
JOAT Kenya, JOAT, Jack of All Trades Kenya, Jack Urban Services Ltd
```

**Description (short — 250 chars)**
```
J.O.A.T. Kenya is a digital innovation studio founded in 1983, building software, digital marketing, media production, AI solutions and children's digital education for clients worldwide from Kiambu, Kenya.
```

**Description (long)**
```
J.O.A.T. Kenya (Jack of All Trades) is a digital innovation studio operating from Kiambu, Kenya, with a 40+ year operating history through parent entity Jack Urban Services Ltd.

The studio runs five service lines — software development, digital marketing, media and content production, AI solutions, and children's digital education — and runs two in-house products: BioBiz, an AI-powered digital business card with live foreign-language transcription, and Majobo Kenya, an AI-classified jobs marketplace with 1,000+ listings.

JOAT delivers entirely in-house, serving clients across Kenya, East Africa, and international markets. The team specialises in Claude, OpenAI and OpenRouter integrations, Flutter and React Native mobile builds, and Blender-based animation pipelines.
```

**Founded date**
```
1983
```

**Operating status**
```
Active
```

**Company type**
```
For-profit
```

**Headquarters location**
```
Kiambu, Kenya
```

**Full address**
```
The Brick Mall, 2nd Floor, Kiambu Road, Thindigua, Kiambu, Kenya
```

**Number of employees**
```
1-10  (or 11-50 — use whichever range matches reality)
```

**Industries (pick all that apply)**
```
Software Development · Mobile Apps · Digital Marketing · Animation · EdTech · Artificial Intelligence · Media and Entertainment · Web Development
```

**Website**
```
https://joatkenya.com
```

**Social profiles**
- LinkedIn: `https://www.linkedin.com/company/joat-kenya-jack-urban-services-ltd/`
- Facebook: `https://www.facebook.com/profile.php?id=61581326003888`
- Instagram: `https://www.instagram.com/joat.kenya`

**Contact**
- Email: `joatkenya120@gmail.com`
- Phone: `+254142378150`

### After approval
Add the products as **separate Crunchbase entries** linked back to JOAT:
- **BioBiz** — Mobile App, AI Tools, SaaS — `https://biobiz.app`
- **Majobo Kenya** — Recruiting, Marketplace, AI Tools — `https://www.majobokenya.com/`

Approval typically takes 3 – 7 days.

---

## 3. GitHub Organization — ~30 minutes

Many LLMs weight GitHub heavily. A `.github` repo with a public-facing README at the org's URL creates a citable, indexable page with multiple joatkenya.com backlinks.

### Setup

1. If you don't already have a GitHub org, create one at <https://github.com/organizations/plan> (free tier is fine). Suggested name: `joat-kenya` (hyphens — periods aren't allowed in org names).
2. Inside the org, create a new repo named exactly `.github` — keep it **public**.
3. Inside that repo, create a file at `profile/README.md` with the content below.
4. Push. The README now renders at `https://github.com/<org-name>`.

### Content to paste into `profile/README.md`

```markdown
# J.O.A.T. Kenya · Digital Innovation Studio

> Founded 1983 · Based in Kiambu, Kenya · Building for the world.

We're a digital innovation studio operating five service lines and running two in-house products. Everything is built and delivered from Thindigua, Kiambu Road.

## What we do

- **Software Development** — Mobile apps (iOS, Android), web applications and AI-integrated products. Built with TypeScript, React, Node, Supabase, Postgres, Flutter and React Native.
- **Digital Marketing** — Generative campaigns, content and paid social across Instagram, TikTok, LinkedIn and Facebook.
- **Media & Content Production** — Animation, video and 3D in Blender. Full studio pipeline from storyboard through final render.
- **Children's Digital Education** — Curriculum-aligned animated content and learning games for ages 1–8.
- **AI Solutions** — Claude, OpenAI and OpenRouter integrations. Meeting summarisation, live foreign-language translation, content generation, agentic automation.

## Our products

- 🪪 **[BioBiz](https://biobiz.app)** — AI-powered digital business card with live foreign-language to English transcription. iOS and Android.
- 💼 **[Majobo Kenya](https://www.majobokenya.com/)** — AI-classified jobs marketplace with 1,000+ listings.

## Where to find us

- 🌐 Website: [joatkenya.com](https://joatkenya.com)
- 🧠 LLM-friendly summary: [joatkenya.com/llms.txt](https://joatkenya.com/llms.txt)
- 💼 LinkedIn: [J.O.A.T. Kenya](https://www.linkedin.com/company/joat-kenya-jack-urban-services-ltd/)
- 📷 Instagram: [@joat.kenya](https://www.instagram.com/joat.kenya)
- 📘 Facebook: [J.O.A.T. Kenya](https://www.facebook.com/profile.php?id=61581326003888)
- 📞 +254 142 378 150
- ✉️ joatkenya120@gmail.com

## On the blog

- [How Much Does It Cost to Build a Mobile App in 2026?](https://joatkenya.com/news?article=mobile-app-development-cost-2026)
- [15 AI Tools Every Small Business Should Use in 2026](https://joatkenya.com/news?article=best-ai-tools-small-business-2026)
- [Modern Animation Pipelines: From Storyboard to Render](https://joatkenya.com/news?article=modern-animation-pipelines)

---

We open-source small tools we build for ourselves. [Talk to us](https://joatkenya.com/contact) about a project, or [book a strategy call](https://joatkenya.com/work-with-us).
```

### Optional second move (high LLM-citation value)
Publish one or two small useful public repos. Suggestions:
- `joat-prompts` — a small public collection of system prompts JOAT uses internally
- `joat-design-tokens` — the brand colour palette as JSON / CSS variables
- `awesome-kenyan-tech` — a curated list of Kenyan tech companies / tools

Each repo's README should link back to joatkenya.com. LLMs frequently cite "awesome-list"–style repos when answering "what's the X in Y" questions.

---

## 4. Press mention — ~2 hours pitch + 1-3 weeks for landing

A single mention in a Kenyan .co.ke news domain is worth more than 10 directory listings for AI citations on Kenya-related queries.

### The hook to lead with

**BioBiz is the strongest pitch.** Angle: *"Kenyan-built AI app translates foreign-language meetings live, takes notes automatically — built by a 40-year-old Kiambu studio."*

That works for tech, business, and innovation desks simultaneously.

### Target publications

| Publication | Desk | Email pattern |
|---|---|---|
| Business Daily Africa | Innovation / Companies | `newsdesk@businessdailyafrica.com` |
| Capital Business | Business / Tech | `news@capitalfm.co.ke` |
| TechCabal | Africa Tech | `tips@techcabal.com` |
| Disrupt Africa | Startups | `editor@disrupt-africa.com` |
| Nation Africa — Business | Companies | `newsdesk@nation.co.ke` |
| Standard Digital — Business | Tech | `digital@standardmedia.co.ke` |
| The Star — Technology | Business | `business@the-star.co.ke` |
| WeeTracker | Africa Tech | `editor@weetracker.com` |
| Bizna Kenya | Business | `info@bizna.co.ke` |

### Pitch email template

```
Subject: Kenyan AI app translates foreign-language meetings live — story pitch

Hi [Reporter first name],

Quick pitch for [Publication]'s [tech / business / innovation] coverage.

J.O.A.T. Kenya — a digital innovation studio that's been operating from Kiambu
since 1983 — just launched BioBiz, an AI-powered digital business card app that
records meetings and transcribes foreign-language conversations into English
in real time. Built entirely in Kenya, available on iOS and Android.

Why this fits your beat:
  - It's a working AI product launched by a long-standing Kenyan team, not a
    pitch deck
  - Live foreign-language transcription is a tool African business travellers
    have been asking for
  - JOAT also runs Majobo Kenya (1,000+ AI-classified job listings) — there's
    a wider story about Kenya as an AI build-and-deploy origin

Happy to give you:
  - Founder time (30 minutes, on or off the record)
  - A live BioBiz demo
  - Numbers on usage, market or build economics
  - Press kit (logos, screenshots, headshots)

Press release attached. App live at https://biobiz.app · studio at
https://joatkenya.com.

Best,
[Your name]
[Title]
J.O.A.T. Kenya
+254 142 378 150
joatkenya120@gmail.com
```

### Press release draft

```
FOR IMMEDIATE RELEASE

Kenyan-Built AI Business Card App Now Translates Foreign Languages Live for African Professionals

KIAMBU, Kenya — June 2026 — J.O.A.T. Kenya, a digital innovation studio
founded in 1983 and based in Kiambu, today announced expanded availability of
BioBiz, an AI-powered digital business card application that automatically
generates meeting notes and transcribes foreign-language conversations into
English in real time.

BioBiz is built entirely in Kenya by the JOAT team and is now available on
iOS and Android. The app pairs the convenience of a tap-to-share digital
business card with two AI capabilities African professionals have long
requested in third-party tools: real-time meeting summarisation, and live
foreign-language to English transcription for cross-border calls.

"Most digital business card apps stop at the card," said the JOAT team. "We
built BioBiz for the meeting that happens after the exchange — the one where
half the room speaks a language you don't, and the notes you'd take by hand
become the deliverable."

J.O.A.T. Kenya operates five service lines — software development, digital
marketing, media production, AI solutions, and children's digital education —
and runs two in-house products: BioBiz, and Majobo Kenya, an AI-classified
jobs marketplace with 1,000+ listings.

ABOUT J.O.A.T. KENYA
J.O.A.T. (Jack of All Trades) Kenya is a digital innovation studio
established in 1983, operating from Kiambu, Kenya. The studio delivers
software, digital marketing, media and content production, AI solutions and
children's digital education to clients worldwide. Parent entity:
Jack Urban Services Ltd.

Web: https://joatkenya.com
BioBiz: https://biobiz.app
Majobo Kenya: https://www.majobokenya.com
LinkedIn: https://www.linkedin.com/company/joat-kenya-jack-urban-services-ltd/

MEDIA CONTACT
J.O.A.T. Kenya
+254 142 378 150
joatkenya120@gmail.com
The Brick Mall, 2nd Floor, Kiambu Road, Thindigua, Kiambu
```

### Pitch hygiene
- Send one publication at a time. Wait 3 business days. If no reply, move to next.
- Don't BCC multiple outlets simultaneously — kills credibility.
- Lead reporter pitches with one fact, one quote, one offer. Three sentences max in the opener.

---

## 5. AI search engine submissions — ~30 minutes

Most AI search engines don't have direct submission forms — they crawl. The leverage move is to submit to the **upstream crawlers** they pull from.

### Priority order

1. **Bing Webmaster Tools** (feeds ChatGPT Search, Copilot, Perplexity, You.com, DuckDuckGo, Ecosia)
   - Sign up: <https://www.bing.com/webmasters/about>
   - Add joatkenya.com
   - Verify with DNS or HTML file
   - Submit sitemap: `https://joatkenya.com/sitemap.xml`
   - **Highest single ROI on this list** — one verification, ~5 downstream LLM surfaces

2. **Google Search Console** (feeds Gemini / AI Overviews)
   - <https://search.google.com/search-console>
   - Verify domain
   - Submit sitemap
   - Submit URL Inspection for `/llms.txt` and `/llms-full.txt` so they're indexed quickly

3. **IndexNow protocol** (instant indexing on Bing, Yandex, Naver, Seznam)
   - Generate a key at <https://www.bing.com/indexnow>
   - Upload the key file to `https://joatkenya.com/<key>.txt`
   - Configure your build to ping IndexNow on deploy. Manual ping works too:
     ```
     curl -X POST "https://api.indexnow.org/IndexNow" \
       -H "Content-Type: application/json" \
       -d '{
         "host": "joatkenya.com",
         "key": "<YOUR-KEY>",
         "urlList": [
           "https://joatkenya.com/",
           "https://joatkenya.com/services",
           "https://joatkenya.com/products",
           "https://joatkenya.com/news",
           "https://joatkenya.com/llms.txt",
           "https://joatkenya.com/llms-full.txt"
         ]
       }'
     ```

4. **Yandex Webmaster** (small AI surface, but tiny effort)
   - <https://webmaster.yandex.com>
   - Add site, verify, submit sitemap

5. **Brave Search** — no direct submission, but it indexes:
   - sites Bing has (covered above)
   - sites with strong llms.txt (already done)
   - sites Common Crawl picks up (allowed in robots.txt — done)
   - **Nothing additional needed; the above three steps cover Brave.**

6. **Common Crawl** — submission request at <https://commoncrawl.org/contact>. Optional. Crawls quarterly. Already allowed via `CCBot` in robots.txt.

7. **Anthropic's web tool** — feeds from Brave Search + ClaudeBot crawler. ClaudeBot is already allowed in robots.txt. No direct submission.

8. **Perplexity** — uses PerplexityBot (allowed in robots.txt) + Bing. Step 1 covers it.

### What this stack covers
After steps 1 – 4, JOAT content is in the index pipeline for: ChatGPT (search + browsing), Claude (web tool), Perplexity, Gemini, Copilot, You.com, DuckDuckGo, Brave AI, Bing Chat, and the major training corpora.

---

## Sequencing recommendation

Don't try to do all five in one sitting. They compound, but each takes attention.

**Week 1 — under-an-hour wins**
- Day 1: Wikidata (step 1) — ~30 min
- Day 2: GitHub org + README (step 3) — ~30 min
- Day 3: Bing Webmaster Tools + IndexNow (step 5, items 1 & 3) — ~30 min

**Week 2 — slower-burn work**
- Day 1: Crunchbase submission (step 2) — ~45 min, then 3–7 day approval wait
- Day 2–5: Press release polish + first three publication pitches (step 4)

**Week 3+ — follow-through**
- Track which press pitches get responses; follow up after 3 business days
- Once 2 press mentions land, revisit Wikipedia article submission (notability bar)
- Monitor Bing Webmaster Tools for crawl errors

---

## How to know it's working

Three observable signals over 4 – 12 weeks:

1. **Server logs** show hits from `GPTBot`, `ClaudeBot`, `PerplexityBot`, `OAI-SearchBot`, `Applebot-Extended`.
2. **Ask the LLMs directly** every two weeks: "What is J.O.A.T. Kenya?" If they cite joatkenya.com or describe the services correctly, the citation pipeline is live.
3. **Google search "JOAT Kenya"** in a clean incognito window — a knowledge panel appearing on the right is downstream proof Wikidata took.

If after 8 weeks none of these show, the most likely cause is that the press mentions never landed — without independent third-party citations, AI tools are reluctant to confidently name a company. Loop back to step 4.
