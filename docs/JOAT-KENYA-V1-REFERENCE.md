# JOAT KENYA — V1 Website Reference

> **Source of truth** for content from the original [joatkenya.com](https://joatkenya.com/) and sibling properties.
> Captured: 2026-05-18. Use this document as the canonical reference when building/updating sections of the `joat-kenya-elevation` site. Do **not** invent content for sections marked "verbatim from source" — only adapt phrasing for layout.

---

## 1. Brand Identity (Preserve Exactly)

| Element | Value |
|---|---|
| Legal name | J.O.A.T. Kenya (Jack of All Trades Kenya) |
| Tagline | **Talent That Delivers** |
| Operating since | 1983 |
| Primary brand colors | Deep navy `oklch(0.16 0.035 265)`, JOAT red `oklch(0.58 0.20 27)`, JOAT gold `oklch(0.78 0.10 80)` |
| Logo | `src/assets/joat-logo.png` (preserved from original site) |
| Voice | Trustworthy, established, African-rooted, professional, warm |

**Do NOT alter:** brand color palette, navbar labels (Home / Services / About Us / Careers / Contact Us), logo, partner-and-certification section, Our Story copy, Services list, testimonials, careers section, contact UI, footer structure.

---

## 2. Navigation (Verbatim from source)

Top-level nav:
- Home
- Services
- About Us
- Careers
- Contact Us
- Work With Us (separate page in original — currently an AI-automation services pitch)
- J.O.A.T. USA — external link to `myjackofalltrades.us`

CTA buttons used on original site: **Login**, **Apply Now**, **Partner With Us**.

---

## 3. Company Story / About (Verbatim from source)

> The right person in the right role changes everything.

Jack of All Trades was founded on the principle that the right person in the right role changes everything. We bridge gaps between organizations seeking skilled professionals and talented individuals seeking deserved opportunities.

Operating as both a recruitment agency and talent management house, JOAT sources, screens, and places professionals across East Africa while representing individual talent for career development and partnerships.

**At JOAT, we don't just fill roles. We build careers and transform organizations one great hire at a time.**

### Mission (working language)
Bridge talent, technology and opportunity to transform organizations and uplift communities across Africa.

### Vision (working language)
To be Africa's most trusted innovation ecosystem — where talent, education and digital solutions converge.

### Growth Milestones (constructed timeline for v2 site)
- **1983** — Founded in Nairobi
- **2005** — Pan-African expansion across East Africa
- **2018** — Launched Talent Management House (creatives, athletes, executives)
- **2022** — Entered tech: EdTech, mobile apps, gamified learning
- **2025** — Full-stack innovation ecosystem: talent + tech + education + immersive experiences

---

## 4. Core Services (Verbatim from source — preserve list)

1. **Talent Sourcing & Headhunting** — Identifying top-tier professionals across industries for critical roles, from entry-level to senior leadership.
2. **Talent Management & Representation** — Managing individual talent with career opportunities and brand partnerships.
3. **Staffing & Workforce Solutions** — Flexible staffing for short-term, contract, and permanent roles.
4. **Executive Search** — Specialized recruitment for C-suite and director positions.
5. **Creative & Influencer Management** — Representing content creators and media personalities.
6. **Training & Career Development** — Skills development and career coaching support.

---

## 5. Products & Solutions (V2 expansion — sourced from sibling sites)

### A. BioBiz App — Digital Business Card + AI Meetings
Source: [biobiz.app](https://biobiz.app/)

- **Tagline:** "Your business card, reimagined."
- **What it solves:** Replaces physical business cards; eliminates manual contact entry; provides AI-summarised meeting notes and (per JOAT product roadmap) live foreign-language → English translation.
- **Key features:**
  - Customizable digital business card (photo, logo, contact, social links)
  - QR-code instant sharing + bidirectional auto-exchange
  - AI Meeting Notes — records meetings, returns transcript, summary, action items
  - Foreign-language → English transcription/translation (showcase block on v2 site)
  - Card analytics (views, shares, networking activity)
  - Centralized contact management with notes
- **Pricing model:** Completely free, no premium tiers.
- **Download CTAs:**
  - Google Play: `https://play.google.com/store/apps/details?id=com.biobiz.biobiz_mobile`
  - iOS App Store: "Coming soon"
  - Direct APK: `https://github.com/Katiechi/biobiz/releases/latest/download/app-release.apk`
- **Site link:** `https://biobiz.app/`

### B. Majobo Kenya — Talent Outsourcing
Source: [majobokenya.com](https://www.majobokenya.com/)

- **Tagline:** "Find skilled workers near you."
- **Positioning:** "The local marketplace for trusted help in your neighborhood." Hyper-local employment platform connecting job seekers with opportunities and letting users post work requests in their area.
- **AI usage:** AI analyzes job postings to auto-classify them into categories (Cleaning & Laundry, Events & Entertainment, Gardening & Landscaping, Professional Services, and others). This is how the platform produces structured filters from free-form posts.
- **Scale at capture date:** 1,177 opportunities, 118 pages of listings.
- **Sample live listings:** House Cleaning Services (Nairobi), Plush Toy Design & Production (JOAT Kenya, Nairobi), Web Developer (Thindigua, KES rate posted), Professional Photographer (Thindigua, KES 6,500), Brand Ambassador (Thindigua, KES 4,500), Tattoo & Barber Services, Property management roles via BrighterMonday partnership.
- **Industries served:** Domestic services, hospitality, events, construction, tech, professional services, property management.
- **Site link to feature on v2:** `https://www.majobokenya.com/`
- **Implementation note for Careers section:** Per spec, job listings on the v2 Careers section should be pulled live from Majobo rather than hardcoded.

### C. Software Development — BioBiz as proof point
Frames JOAT as tech-oriented. BioBiz demonstrates: native mobile (Play Store live, iOS in pipeline), AI integration (transcription/translation), real-world adoption among networking professionals. Use this to support the "tech-oriented" narrative.

### D. Amare's Big Planet — Flagship Digital Education
Source: [youtube.com/@amaresbigplanet](https://www.youtube.com/@amaresbigplanet/featured)

- **Format:** YouTube channel — animated educational content.
- **Mission (working language):** Story-driven African children's content celebrating African culture and curiosity.
- **Target audience:** Ages 4–12.
- **Learning outcomes:** Literacy, STEM curiosity, cultural pride, life skills.
- **Implementation note:** Embed the channel's featured videos (YouTube iframe) on the v2 site with a link to subscribe. Channel page may load incomplete metadata via plain fetch — embed via the YouTube iframe API rather than scraping.

### E. Game Development — Roblox
- **Capability:** JOAT designs and ships Roblox-based educational worlds and custom gamified learning systems for schools, NGOs, and brands.
- **Use cases:** Educational Roblox experiences, custom game development, gamified learning + assessment systems, brand-activated immersive worlds.
- **V2 implementation note:** Section should include placeholders for screen recordings + screenshots of games developed.

### F. AI Marketing — Generative Imagery
- **Capability:** AI-generated marketing imagery (Claude + OpenRouter) used for social posts and campaigns.
- **V2 implementation note:** Section should include a gallery of programmatically generated images. Treat as an interactive showcase, not a static carousel.

### G. Animation & Educational Game Dev — Blender
- **Capability:** 3D animations produced in Blender; one current project is a children's game that teaches letter formation through drawing.
- **V2 implementation note:** Section should show Blender renders, in-engine screenshots of the letter-drawing game, and brief writeups of pipeline.

---

## 6. Why Choose JOAT KENYA (working language for new section)
- African Innovation Leadership
- Scalable Digital Solutions
- Youth Empowerment Focus
- Industry Expertise
- Global Standards
- Impact-Driven Technology

---

## 7. Partners & Certifications

### Certifications named on source site
- **ISO 9001** — Quality management certification
- **NEMA NCA-1** — Environmental compliance (National Environment Management Authority, NCA category 1)
- **KRA Compliant** — Kenya Revenue Authority compliance

> The current Elevation rebuild lists *NITA Approved Trainer* + *Pan-African Network* instead of NEMA NCA-1 + KRA. Update to match the source.

### Partner logos on source
Original site shows 9 marquee partner images (`marquee1.jpg`…`marquee9.jpeg`) without alt-text identifiers. Specific company names are not exposed in source HTML. Treat current partner list (Safaricom, KPMG EA, ICTA Kenya, Andela, KEPSA, UNDP, Microsoft Africa, Roblox EDU, Equity Group, Sama, Liquid Intelligent, African Union) as **provisional placeholders** until verified directly with JOAT staff or replaced with the original marquee assets.

---

## 8. Testimonials (Verbatim from source — preserve names + roles + quotes)

| Name | Role | Quote |
|---|---|---|
| Donnel Blackman | CEO, NairobiItalianice | "J.O.A.T. Kenya placed three exceptional hires for us within two weeks. The quality of candidates and speed of delivery was unlike any agency we've worked with." |
| Ericca J. Ricketts | Founder, JustRightJerk | "JOAT didn't just find me a job — they managed my entire career transition. Their representation opened doors I didn't even know existed." |
| Michael Kamau | Managing Director, Apex Ltd | "We've used several agencies across East Africa. JOAT is the only one that truly understands what a great executive hire looks like — and delivers." |
| Amara Njoroge | Content Creator & Influencer | "As a creative, finding the right representation felt impossible — until JOAT. They understood my brand, negotiated better deals, and actually cared about my growth." |

Extra (from work-with-us page):
- Samuel Kariuki, CEO, Apex Logistics — "We went from barely getting calls to having a consistent stream of new business inquiries every week. JOAT built us a real system — not just a website."

---

## 9. Careers (Verbatim policy from source)

- Always accepting applications across all professions.
- Selection criteria: proven experience, reliability, professionalism, growth mindset.
- No specific job listings on the original site at capture date.
- **V2 spec:** Replace hardcoded job array with live feed from Majobo Kenya. Include search, department filter, internship surface, and "Why work with us" culture cards.

---

## 10. News & Articles

- No news/blog content present on the original `joatkenya.com` homepage at capture date.
- The "Work With Us" subpage promotes an AI-automation services package (Foundation / Growth / Scale tiers, Telegram-bot CMS control, AI captioning, multi-platform automation, 3–5 day setup).
- **V2 spec:** Build News hub categories — Company Updates, Tech Insights, Innovation Stories, Educational Impact, Product Announcements — but do **not** fabricate article titles or bodies. Until JOAT supplies content, render the News section with an empty-state CTA ("Stories coming soon — subscribe for updates") rather than placeholder articles.

---

## 11. Contact

| Field | Value |
|---|---|
| Phone | +254 729 265 333 |
| Address | The Brick Mall, 2nd Floor, Kiambu Road, Thindigua, Kenya |
| Email | Not explicitly listed on source — to be requested from JOAT |
| Socials | LinkedIn, Twitter, Instagram (links present but href values not populated in source) |

V2 spec adds: interactive map, instant form validation, Calendly/demo-booking option.

---

## 12. Footer

**Quick links:** Home, About J.O.A.T., Core Services, Join the Team, Contact Us, J.O.A.T. USA
**Legal:** Privacy Policy, Terms of Use
**Copyright:** © 2026 J.O.A.T. Kenya. All rights reserved.

---

## 13. Work-With-Us Page (separate from main flow)

Original site has a dedicated "Work With Us" page selling AI automation services:

- **Foundation tier** — Website CMS management via Telegram bot, up to 60 actions/month
- **Growth tier** — Adds Instagram automation with AI captions, up to 30 social posts/month
- **Scale tier** — Multi-platform social (Instagram, TikTok, LinkedIn, Facebook), unlimited actions, dedicated account manager
- **Common features:** AI Telegram bot for natural-language commands, website CMS integration, custom workflow dev, analytics & reporting
- **Setup:** 3–5 days
- **Pricing:** Month-to-month, no long-term contract
- **CTA:** Free 30-minute strategy call

Decide whether this lives as a separate route in v2 or rolls into the Services / AI Marketing sections.

---

## 14. Implementation Checklist for v2 (Elevation)

- [ ] Logo: keep `joat-logo.png`, never re-create.
- [ ] Color palette: keep `--joat-navy`, `--joat-red`, `--joat-gold` exactly as defined in `src/styles.css`.
- [ ] Hero: retain original navy/red/gold background gradient.
- [ ] Navbar labels: Home / Services / About Us / Careers / Contact Us (do not rename).
- [ ] Update Partners section certifications to **ISO 9001**, **NEMA NCA-1**, **KRA Compliant**.
- [ ] Add product sub-sections for **AI Marketing** (gallery of AI-generated images) and **Blender Animations** (letter-drawing kids' game).
- [ ] Add BioBiz demo blocks for **AI summary of recordings** and **foreign-language → English transcription** (place a record + transcript example).
- [ ] Wire Majobo Kenya as a clickable card linking to `https://www.majobokenya.com/`. Include MajoboKenya screenshots.
- [ ] Replace hardcoded Careers jobs with live Majobo feed (or a documented stub if no public API exists).
- [ ] Embed Amare's Big Planet YouTube videos directly (iframe) with link to channel.
- [ ] News section: empty-state until content is supplied — no fabricated articles.
- [ ] Contact form: actually POST somewhere (email handler / serverless function) rather than client-only success state.
- [ ] Footer: real privacy/terms/social hrefs.
- [ ] AI Chatbot: keep floating UI; consider wiring to Claude API for real answers (regex fallback is fine as a v1).
