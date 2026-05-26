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
// education, AI). Order of patterns matters — first match wins, so put specific
// intents above general ones.
const HEURISTIC_FALLBACKS: { match: RegExp; reply: string }[] = [
  {
    match: /^(hi|hello|hey|howdy|greetings|good\s+(morning|afternoon|evening))\b/i,
    reply:
      "Hi! I'm JACK, J.O.A.T. Kenya's assistant. I can walk you through our services, explain our packages, or set up a meeting with the team. What are you looking to do?",
  },
  {
    match: /biobiz|business card|networking app|meeting notes|transcription app/i,
    reply:
      "BioBiz is our digital business-card app with AI meeting notes and live foreign-language → English transcription. It's free on Google Play and the Apple App Store. Want a quick walkthrough? Book a 30-min demo from the Contact section.",
  },
  {
    match: /amare|kids|children|young|early.?year|literacy|alphabet|edutainment|youtube series/i,
    reply:
      "We design children's digital education content, including Amare's Big Planet — our partnered animated YouTube series. Watch it on youtube.com/@amaresbigplanet, or message us about custom learning content via the Contact form (pick \"Children's Digital Education\").",
  },
  {
    match: /software|mobile app|web app|\bweb(site|app)?\b|develop|engineer(ing)?|backend|frontend|api\b|saas|platform/i,
    reply:
      "We build production-grade mobile apps, websites and AI-integrated products end-to-end. Tell us about your project in the Contact form (pick \"Software Development\") and we'll respond within one business day — or book a 30-min meeting from the Contact section.",
  },
  {
    match: /marketing|campaign|social media|\bads?\b|brand|seo|paid media|growth/i,
    reply:
      "Our Digital Marketing service runs AI-powered campaigns, social content and paid ads across every major platform. Use the Contact form (pick \"Digital Marketing\") to start, or book a 30-min meeting from the Contact section.",
  },
  {
    match: /media|animation|\bvideo\b|blender|3d|motion|explainer|content production/i,
    reply:
      "Our Media & Content team produces animation, video and 3D in Blender — film-quality work for products, classrooms and brands. Share the project via the Contact form (pick \"Media & Content Production\").",
  },
  {
    match: /\bai\b|claude|openrouter|automation|\bllm\b|agent|chatbot for|generative/i,
    reply:
      "Our AI Solutions team integrates Claude, OpenRouter and image models into real products — meeting summaries, live translation, content generation and agentic automation. Tell us what you want to build via the Contact form (pick \"AI Solutions\").",
  },
  {
    match: /package|tier|plan\b|pricing|price|cost|quote|budget|foundation|growth|scale/i,
    reply:
      "Our Telegram CMS + Social packages are Foundation, Growth and Scale — all month-to-month with no lock-in. See the full feature breakdown on our Work With Us page, or book a 30-min demo from the Contact section to walk through which one fits.",
  },
  {
    match: /meeting|\bbook\b|\bdemo\b|schedule|appointment|consult|calendly|talk to|speak to|set.?up.+call/i,
    reply:
      "Happy to set that up. Book a 30-min meeting with our team via Calendly — there's a \"Book\" button in the Contact section. Prefer to talk now? Call +254142378150 or email joatkenya120@gmail.com.",
  },
  {
    match: /contact|\bemail\b|\bphone\b|\bcall\b|reach (out|us)|get in touch/i,
    reply:
      "Reach us at +254142378150, email joatkenya120@gmail.com, or use the Contact form on this page. We respond within one business day.",
  },
  {
    match: /partner|collaborat|invest|alliance/i,
    reply:
      "We love partnerships. Share what you have in mind via the Contact form and we'll connect you with the right team within one business day.",
  },
  {
    match: /\bcareer|\bapply\b|\bintern|join your team|work for you|work at joat|open role|open position/i,
    reply:
      "Interested in working at JOAT? (1) Register on Majobo Kenya (majobokenya.com) to browse and apply for open positions. (2) Download BioBiz and create your digital business card so we can find you. We'll reach out when a role matches your skills.",
  },
  {
    match: /\bhire\b|\bhiring\b|recruit|outsourc|staffing|find (a |me )?talent|need talent|workforce/i,
    reply:
      "J.O.A.T. is a digital innovation studio — we deliver software, digital marketing, media production, AI solutions and children's digital education. If you'd like us to build something with you, share your goals via the Contact form. Browsing open jobs? See majobokenya.com.",
  },
  {
    match: /cert|\biso\b|nema|\bkra\b|compliance|compliant/i,
    reply:
      "J.O.A.T. Kenya is ISO 9001 quality-certified, NEMA NCA-1 (environmental) compliant and fully KRA tax-compliant.",
  },
  {
    match: /service|what.+(do|offer)|capabilit|expertise|help me|how can you/i,
    reply:
      "We deliver five core services: Software Development, Digital Marketing, Media & Content Production, Children's Digital Education and AI Solutions. We also build our own products — BioBiz (digital business cards) and Majobo Kenya (jobs board). Which area interests you?",
  },
  {
    match: /about|who are you|tell me about joat|history|founded|year/i,
    reply:
      "J.O.A.T. (Jack of All Trades) Kenya is a digital innovation studio operating since 1983. We design and deliver software, digital marketing, media, AI products and children's educational content for clients worldwide. Want to talk to the team? Book a 30-min meeting from the Contact section.",
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

  /*
  // Preserved for re-enabling: round-trip to JACK with sanitization on the way out.
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
  */

  // Small artificial delay so the UI's "Thinking…" indicator reads naturally.
  await new Promise((r) => setTimeout(r, 350));
  return { ok: true, source: "fallback", reply: heuristicReply(lastUserText) };
}
