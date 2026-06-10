// JOAT KENYA's own deployed assistant (Supabase Edge Function).
// Same backend that powers the chatbot on the original joatkenya.com site.
// The key is a public Supabase anon JWT — safe to embed.
const JACK_URL = "https://prkdfkkhqncxkyehokop.supabase.co/functions/v1/jack";
const JACK_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBya2Rma2tocW5jeGt5ZWhva29wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzNjA3NzEsImV4cCI6MjA4OTkzNjc3MX0.401RvhF8C4D5K3J20m7vXLpKpBp39M6vn3TmRkHXe48";

export type ChatMessageT = {
  role: "user" | "assistant";
  content: string;
};

// Chatbot is intentionally scripted (no JACK round-trip). JACK's server-side
// training still positions JOAT as a talent-outsourcing agency, which conflicts
// with the current direction (software, digital marketing, media, children's
// education, AI). Patterns are tried in order — first match wins. Specific
// intents (acknowledgments, small talk, identity questions) go up top so they
// win before broader keyword hits.
const HEURISTIC_FALLBACKS: { match: RegExp; reply: string }[] = [
  // ===== Acknowledgments & social =====
  {
    match:
      /^(yes|yeah|yep|sure|ok|okay|alright|sounds good|that works|let'?s do it|cool)\s*[.!?]*\s*$/i,
    reply:
      'Great! The fastest next step is the "Book" button in the Contact section for a 30-min meeting, or the Contact form below. You can also call +254142378150 or email joatkenya120@gmail.com.',
  },
  {
    match: /^(no|nope|nah|not really|not now|maybe later)\s*[.!?]*\s*$/i,
    reply:
      "No problem. Whenever you're ready, the Contact form, the Calendly Book button and +254142378150 are all in the Contact section. Anything else I can help with?",
  },
  {
    match: /\b(thanks|thank ?you|thx|tysm|ty\b|cheers|appreciate(d)?|grateful)\b/i,
    reply:
      "You're very welcome! If you want to go deeper, you can book a 30-min meeting from the Contact section or call +254142378150 anytime.",
  },
  {
    match:
      /\b(bye|goodbye|see ?ya|talk later|cya|farewell|catch you later|see you (later|soon))\b/i,
    reply:
      "Thanks for stopping by! When you're ready, the Contact form, the Calendly Book button and +254142378150 are all in the Contact section. Have a great one.",
  },
  {
    match:
      /\b(awesome|amazing|excellent|wonderful|fantastic|love (it|this)|impressive|brilliant|incredible)\b/i,
    reply:
      "Thanks, that means a lot. Want to take the next step? Book a 30-min meeting from the Contact section, or share what you're working on via the Contact form.",
  },
  {
    match:
      /\b(disappointed|bad service|complaint|complain|terrible|awful|frustrated|unhappy|not (happy|good|great)|angry|upset)\b/i,
    reply:
      "I'm sorry about that. Your feedback matters. Please email joatkenya120@gmail.com or call +254142378150 directly so a human on our team can help right away.",
  },
  {
    match:
      /\bhow (are|r)( you| u| things)?\b|\bhow('?s| is) (it going|life|things|everything|your day)\b|\bhow do you do\b|\bhow have you been\b|\bwhat'?s up\b|\bwhatsup\b|\bsup\b/i,
    reply:
      "I'm doing great, thanks for asking! I'm here to help. Want me to walk you through our services, our packages, or set up a meeting with the team?",
  },

  // ===== Identity =====
  {
    match:
      /\b(what|who)\s+(is|are|does)\s+(j\.?\s*o\.?\s*a\.?\s*t\.?|joat)( kenya)?\b|\babout joat\b|tell me about joat|founded|since 1983|\bhistory\b/i,
    reply:
      "J.O.A.T. (Jack of All Trades) Kenya is a digital innovation studio operating since 1983. We design and deliver software, digital marketing, media production, AI solutions and children's digital education for clients worldwide. Want to talk to the team? Book a 30-min meeting from the Contact section.",
  },
  {
    match:
      /\bwho are you\b|\bwhat are you\b|\bare you (a|an) (bot|ai|robot|human|person)\b|\byour name\b/i,
    reply:
      "I'm JACK, J.O.A.T. Kenya's assistant. I can answer questions about our services, packages and team, or help you book a meeting. What are you exploring?",
  },
  {
    match:
      /^(hi|hello|hey|howdy|greetings|hola|good\s+(morning|afternoon|evening|day))\s*[!.?]*\s*$/i,
    reply:
      "Hi! I'm JACK, J.O.A.T. Kenya's assistant. I can walk you through our services, explain our packages, or set up a meeting with the team. How can I help?",
  },
  {
    match: /^(hi|hello|hey|howdy|greetings|good\s+(morning|afternoon|evening|day))\b/i,
    reply:
      "Hi there! Great to have you. I can help with our services, our packages, or setting up a meeting. Which would you like to explore?",
  },

  // ===== Bot capability / help =====
  {
    match:
      /^(help|menu|options)\s*[.!?]*\s*$|what can (you|u) (do|help)|what (can|do) you help|things you can|how can you assist/i,
    reply:
      "I can answer questions about: our services (Software Development, Digital Marketing, Media & Content, Children's Digital Education, AI Solutions); our packages (Foundation, Growth, Scale); our products (BioBiz, Majobo Kenya); booking a meeting; how to contact us; or how to apply for a role at JOAT. Which one?",
  },
  {
    match: /^(tell me more|more|elaborate|details|explain|go on)\s*[.!?]*\s*$/i,
    reply:
      "Happy to. About what? Our services, packages, a specific product (BioBiz / Majobo / Amare's Big Planet), how to book a meeting, or how to apply for a role at JOAT.",
  },

  // ===== Products (specific) =====
  {
    match: /biobiz|business card|networking app|meeting notes|transcription app/i,
    reply:
      "BioBiz is our digital business-card app with AI meeting notes and live foreign-language → English transcription. It's free on Google Play and the Apple App Store (biobiz.app). Want a quick walkthrough? Book a 30-min demo from the Contact section.",
  },
  {
    match: /amare|kids|children|young|early.?year|literacy|alphabet|edutainment|youtube series/i,
    reply:
      "We design children's digital education content, including Amare's Big Planet, our partnered animated YouTube series at youtube.com/@amaresbigplanet. To talk about custom learning content, use the Contact form (pick \"Children's Digital Education\").",
  },

  // ===== Mobile / platform-specific =====
  {
    match: /\b(ios|iphone|ipad|apple store|app store|android|google play|play store)\b/i,
    reply:
      "We build native iOS and Android apps (Flutter and React Native), publish to the Apple App Store and Google Play, and handle store optimization. BioBiz is one of our launched apps, free on both stores. Share your project via the Contact form or book a 30-min meeting.",
  },
  {
    match:
      /\b(ecommerce|e-commerce|online store|shopify|woocommerce|magento|cart|checkout|payment gateway|stripe integration|online shop|marketplace site)\b/i,
    reply:
      "We build custom ecommerce: Shopify customizations, headless storefronts, or built-from-scratch on React + Supabase, with M-Pesa, Stripe and PayPal integrations. Share what you're selling via the Contact form (\"Software Development\") and we'll send next steps.",
  },

  // ===== Tech stack =====
  {
    match:
      /\btech\s?stack\b|technolog(y|ies)|frameworks?|\b(react|nextjs|next\.js|vue|svelte|flutter|kotlin|swift|nodejs|node\.js|python|django|rails|laravel|supabase|cloudflare|aws|gcp|azure|firebase|postgres|mongodb|typescript|tailwind|deno)\b/i,
    reply:
      "Our stack: Flutter and React Native on mobile; React + Next.js + TypeScript + Tailwind on web; AI via Claude and OpenRouter; backends on Supabase, Cloudflare Workers and Postgres. We pick the right tool for each project. Want specifics? Book a 30-min meeting or message us via the Contact form.",
  },

  // ===== Services (generic, after specifics above) =====
  {
    match:
      /software|mobile app|web app|\bweb(site|app)?\b|develop|engineer(ing)?|backend|frontend|api\b|saas|\bplatform\b|\bcms\b|dashboard|admin panel/i,
    reply:
      'We build production-grade mobile apps, websites and AI-integrated products end-to-end. Tell us about your project in the Contact form (pick "Software Development") and we\'ll respond within one business day, or book a 30-min meeting from the Contact section.',
  },
  {
    match:
      /\b(google ads|meta ads|facebook ads|instagram ads|tiktok ads|linkedin ads|youtube ads|search ads|display ads|ppc|paid search)\b/i,
    reply:
      'We run paid campaigns across Google, Meta (Facebook + Instagram), TikTok, LinkedIn and YouTube, with AI-generated creative and weekly performance reviews. Use the Contact form ("Digital Marketing") or book a 30-min meeting.',
  },
  {
    match:
      /marketing|campaign|social media|\bads?\b|\bbrand\b|\bseo\b|paid media|growth marketing|content strategy/i,
    reply:
      'Our Digital Marketing service runs AI-powered campaigns, social content and paid ads across IG, TikTok, LinkedIn and Facebook. Use the Contact form (pick "Digital Marketing") or book a 30-min meeting from the Contact section.',
  },
  {
    match:
      /media|animation|\bvideo\b|blender|\b3d\b|motion|explainer|content production|brand film|videograph|cinematograph/i,
    reply:
      'Our Media & Content team produces animation, video and 3D in Blender: film-quality work for products, classrooms and brands. Share the project via the Contact form (pick "Media & Content Production").',
  },
  {
    match:
      /\bai\b|claude|openrouter|automation|\bllm\b|\bagent\b|chatbot for|generative|\bgpt\b|gemini|machine learning|\bml\b/i,
    reply:
      'Our AI Solutions team integrates Claude, OpenRouter and image models into real products: meeting summaries, live translation, content generation and agentic automation. Tell us what you want to build via the Contact form (pick "AI Solutions").',
  },
  {
    match: /\b(game (dev|development|design|studio)|roblox|unity|unreal|gamification|gaming)\b/i,
    reply:
      "We focus mainly on software, digital marketing, media, AI and children's education. Game development isn't a current focus, though our Blender pipeline does feed into interactive experiences. If you have something gamified in mind, share it via the Contact form.",
  },

  // ===== Process / engagement =====
  {
    match:
      /\b(process|how do you (work|engage|operate)|how it works|workflow|methodology|approach|discovery|kickoff|stages|phases)\b/i,
    reply:
      "We start with a short, free 30-min discovery call, then send a tailored proposal within one business day. From there it's iterative delivery in weekly check-ins. Production-grade work delivered in weeks, not quarters. Book a meeting from the Contact section to kick off.",
  },
  {
    match:
      /\b(how long|how many (days|weeks|months)|timeline|turnaround|delivery time|how (fast|quick|soon)|when (can|will|would) (i|we|you)|deadline|\beta\b|completion time)\b/i,
    reply:
      "Timelines depend on scope, but typical software builds launch in 4–8 weeks, marketing campaigns turn around in days, and media work runs 2–6 weeks. Share your project in the Contact form and we'll send a tailored timeline within 24 hours.",
  },
  {
    match:
      /\b(start (a |my )?project|begin (a |my )?project|how do i (begin|start|engage)|get started|first step|kick.?off|onboard|sign me up|engagement process)\b/i,
    reply:
      "Easy: (1) Send a quick brief via the Contact form on this page, or (2) book a 30-min discovery meeting from the Contact section (Calendly). We'll reply within one business day with next steps and a tailored proposal.",
  },
  {
    match:
      /\b(portfolio|examples|case stud(y|ies)|previous work|past project|past client|reference|samples?|showcase)\b|who have you worked with|work you have done/i,
    reply:
      "We share relevant examples on a discovery call (book a 30-min meeting from the Contact section). Public references include BioBiz (our digital business-card app), Amare's Big Planet (children's animated series) and Majobo Kenya (jobs marketplace).",
  },
  {
    match:
      /\b(testimonial|review|client (story|stories|feedback)|what do (clients|customers) say|happy clients)\b/i,
    reply:
      "There's a Testimonials section on this page with real stories from clients and BioBiz users, covering software builds, digital marketing, and children's education content. Browse it, and book a 30-min meeting if you'd like to talk specifics.",
  },

  // ===== Packages / pricing =====
  {
    match:
      /package|tier|\bplan\b|pricing|price|cost|quote|budget|foundation|\bgrowth\b|\bscale\b|how much|\$|estimate/i,
    reply:
      "Our Telegram CMS + Social packages are Foundation, Growth and Scale, all month-to-month with no lock-in. Full feature breakdown is on the Work With Us page. For custom services pricing depends on scope; share the project in the Contact form and we'll send a tailored quote within 24 hours.",
  },
  {
    match:
      /\b(pay(ment|ing)?|invoice|billing|m-?pesa|paypal|stripe|wire|swift|currency|\busd\b|\bkes\b|kenyan shilling|deposit|payment terms|how do i pay)\b/i,
    reply:
      "Payments are flexible: bank transfer, card, PayPal, or M-Pesa for Kenyan clients. We work month-to-month for retainers (Foundation/Growth/Scale) and milestone-based for project work. Share details via the Contact form and we'll send terms tailored to the scope.",
  },
  {
    match: /\b(refund|cancel(lation|ling)?|money back|cancel (my )?package)\b/i,
    reply:
      "All our packages are month-to-month with no lock-in. You can cancel or change tiers anytime. For one-off project refunds, it's case-by-case; email joatkenya120@gmail.com and we'll resolve it quickly.",
  },
  {
    match:
      /\b(maintenance|support|sla|response time|bug fix|hotfix|update my (app|site|website))\b/i,
    reply:
      "We offer ongoing maintenance and support on every project: bug fixes, security patches and feature updates. Email joatkenya120@gmail.com or book a 30-min meeting to discuss your support needs.",
  },
  {
    match: /\b(hosting|host (my )?(site|website|app)|server|domain|ssl|deployment)\b/i,
    reply:
      'We handle hosting on Cloudflare, Supabase, AWS or your preferred provider, including domain setup, SSL and deployment automation. Share what you have in mind via the Contact form ("Software Development").',
  },

  // ===== Reach / scope =====
  {
    match:
      /\b(industry|industries|sector|vertical|fintech|edtech|health.?tech|health ?care|retail|ecommerce|e-commerce|logistics|nonprofit|ngo|government|saas|b2b|b2c|media company|news company)\b/i,
    reply:
      "We work across industries: fintech, edtech, healthcare, ecommerce, media, NGOs and SaaS startups. The fit is more about ambition than sector. Tell us about your project via the Contact form and we'll match the right team.",
  },
  {
    match:
      /\b(international|global|remote|outside (kenya|africa)|abroad|\busa?\b|\buk\b|europe|asia|middle east|north america|canada)\b|work(ing)? (with|for) clients (in|across|worldwide)/i,
    reply:
      "Yes, we work with clients worldwide. Most delivery is remote, with options for on-site engagement on larger projects. Book a 30-min meeting from the Contact section (Calendly handles time zones) or email joatkenya120@gmail.com.",
  },
  {
    match: /\b(language|english|swahili|kiswahili|french|german|arabic|do you speak)\b/i,
    reply:
      "We work primarily in English and Kiswahili, with translation support for client-facing content in other languages via our AI Solutions service. What language do you need supported?",
  },
  {
    match:
      /\b(nda|non-?disclosure|confidential(ity)?|privacy of (project|idea)|secret project|sign an? nda)\b/i,
    reply:
      "Absolutely, we sign NDAs before any sensitive discovery. Mention it in the Contact form or on the discovery call and we'll send a mutual NDA before sharing anything.",
  },
  {
    match:
      /\b(data privacy|gdpr|data protection|where is my data|data residency|host(ing|ed) (in|on))\b/i,
    reply:
      "We follow industry-standard data privacy practices, host on reputable cloud providers (Cloudflare, Supabase, AWS depending on the project), and can comply with GDPR, Kenya's Data Protection Act, and similar regulations. Book a meeting to discuss your specific requirements.",
  },

  // ===== Meeting / contact / availability =====
  {
    match:
      /meeting|\bbook\b|\bdemo\b|schedule|appointment|consult|calendly|talk to|speak to|set.?up.+call|jump on a call/i,
    reply:
      'Happy to set that up. Book a 30-min meeting with our team via Calendly. There\'s a "Book" button in the Contact section. Prefer to talk now? Call +254142378150 or email joatkenya120@gmail.com.',
  },
  {
    match:
      /\b(office hours|working hours|open|closed|business hours|when (are|do) you (open|available|working)|time zone|timezone)\b/i,
    reply:
      "Our team responds within one business day, Monday–Friday (East Africa Time, UTC+3). For meetings, the Calendly Book button in the Contact section shows live availability across time zones.",
  },
  {
    match:
      /\bcontact\b|\bemail\b|\bphone\b|\bcall\b|reach (out|us)|get in touch|how do i (reach|contact)/i,
    reply:
      "Reach us at +254142378150, email joatkenya120@gmail.com, or use the Contact form on this page. We respond within one business day.",
  },
  {
    match: /\b(where|location|office|address|headquarters|hq|directions|visit (you|your))\b/i,
    reply:
      "Our headquarters is Brick Mall, 2nd Floor, Kiambu Road, Thindigua, Kenya. Phone +254142378150 or email joatkenya120@gmail.com if you'd like to visit or set up a meeting.",
  },
  {
    match:
      /\b(facebook|fb|instagram|\big\b|insta|linkedin|youtube|yt\b|tiktok|twitter|\bx\.com\b|social (media|channels?|accounts?)|follow (you|us))\b/i,
    reply:
      "You'll find our social links in the Footer: LinkedIn, Instagram, Facebook and YouTube. Follow there for updates on what we're building.",
  },

  // ===== Partner =====
  {
    match: /\bpartner\b|collaborat|\binvest\b|alliance|\bjv\b|joint venture/i,
    reply:
      "We love partnerships. Share what you have in mind via the Contact form and we'll connect you with the right team within one business day.",
  },

  // ===== Career interest (work AT JOAT) =====
  {
    match:
      /\bcareer|\bapply\b|\bintern|join your team|work for you|work at joat|open role|open position|\bjobs? (at|with|in) joat|cv|resume|portfolio submission/i,
    reply:
      "Interested in working at JOAT? Head to our Careers page (/careers) to browse current openings and apply directly to the role that fits you. Don't see your role? Send a general application. We hire talented people year-round and we'll reach out when there's a match.",
  },

  // ===== Hiring/recruiting redirect (companies asking us to source talent) =====
  {
    match:
      /\bhire\b|\bhiring\b|recruit(er|ing|ment)?|outsourc|staffing|head ?hunt|find (a |me |us )?(talent|candidate|developer|engineer|hire)|need (a |to )?(talent|developer|engineer|hire|candidates?)|workforce|source (talent|candidates)|place (a |the )?candidate/i,
    reply:
      "We're a digital innovation studio. We deliver software, digital marketing, media production, AI solutions and children's digital education, rather than staffing services. If you're hiring, Majobo Kenya (majobokenya.com) is our public job board where you can post listings. To work with us on a project, share your goals via the Contact form.",
  },

  // ===== Certifications =====
  {
    match: /cert(ifi|s\b)|\biso\b|\bnema\b|\bkra\b|compliance|compliant|accredit/i,
    reply:
      "J.O.A.T. Kenya is ISO 9001 quality-certified, NEMA NCA-1 (environmental) compliant and fully KRA tax-compliant.",
  },

  // ===== Services overview (broadest, last) =====
  {
    match: /\bservices?\b|what.+(do|offer)|capabilit|expertise|areas? (of work|of expertise)/i,
    reply:
      "We deliver five core services: Software Development, Digital Marketing, Media & Content Production, Children's Digital Education and AI Solutions. We also build our own products: BioBiz (digital business cards) and Majobo Kenya (jobs board). Which area interests you?",
  },
];

function heuristicReply(lastUserMessage: string): string {
  const hit = HEURISTIC_FALLBACKS.find((h) => h.match.test(lastUserMessage));
  if (hit) return hit.reply;
  return "I can help with our services (software, digital marketing, media, children's education, AI), our packages, or setting up a meeting. Which would you like to explore? You can also call +254142378150 or use the Contact form anytime.";
}

type JackResponse = {
  text?: string;
  reply?: string;
  message?: string;
  error?: string;
};

const CONTACT_EMAIL = "joatkenya120@gmail.com";
const CONTACT_PHONE = "+254142378150";

/**
 * JACK's server-side prompt (which we can't edit without Supabase backend access)
 * still quotes JOAT's older contact details. Rewrite them on the way out so the
 * site always shows the current phone/email. Safe no-op if JACK is already correct.
 */
function sanitizeContactDetails(text: string): string {
  return (
    text
      // Any @joatkenya.com address (careers@, hello@, info@, …) → current inbox
      .replace(/[a-zA-Z0-9._%+-]+@joatkenya\.com/g, CONTACT_EMAIL)
      // Old phone in any spacing/format → current number
      .replace(/\+?254[\s-]?729[\s-]?265[\s-]?333/g, CONTACT_PHONE)
      .replace(/\b0729[\s-]?265[\s-]?333\b/g, CONTACT_PHONE)
  );
}

/**
 * Browser-side chat completion. We deliberately do NOT call JACK (the legacy
 * Supabase Edge Function) because its server-side prompt still positions JOAT
 * as a talent-outsourcing agency, which conflicts with our current direction.
 * The bot is fully scripted via HEURISTIC_FALLBACKS above so every reply leads
 * the visitor toward our services, packages, or a meeting with the team.
 *
 * To re-enable JACK later, uncomment the fetch block and the imports/constants
 * referenced below.
 */
export async function chatCompletion(messages: ChatMessageT[]): Promise<{
  ok: true;
  source: "jack" | "fallback";
  reply: string;
}> {
  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  const lastUserText = lastUser?.content ?? "";

  // Round-trip to JACK with sanitization on the way out. If the call fails for
  // any reason we fall back to the scripted heuristics below so the chatbot
  // always answers something useful.
  try {
    const res = await fetch(JACK_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${JACK_KEY}`,
        apikey: JACK_KEY,
      },
      body: JSON.stringify({ messages }),
    });
    if (!res.ok) {
      console.error("JACK endpoint error", res.status);
      return { ok: true, source: "fallback", reply: heuristicReply(lastUserText) };
    }
    const json = (await res.json()) as JackResponse;
    const reply = (json.text ?? json.reply ?? json.message ?? "").trim();
    if (reply) return { ok: true, source: "jack", reply: sanitizeContactDetails(reply) };
  } catch (err) {
    console.error("JACK fetch error", err);
  }

  // Fallback: scripted heuristic reply with a tiny "Thinking…" delay.
  await new Promise((r) => setTimeout(r, 250));
  return { ok: true, source: "fallback", reply: heuristicReply(lastUserText) };
}
