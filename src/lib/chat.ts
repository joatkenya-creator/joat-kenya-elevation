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

const HEURISTIC_FALLBACKS: { match: RegExp; reply: string }[] = [
  {
    match: /biobiz/i,
    reply:
      "BioBiz is JOAT's digital business-card app with AI meeting notes and live foreign-language → English transcription. It's free on Google Play; iOS is on the way. Grab it from biobiz.app or tell us what you'd use it for in the Contact form and we'll route you.",
  },
  {
    match: /majobo|talent|hir(e|ing)|recruit|job/i,
    reply:
      "Majobo Kenya is JOAT's hyper-local talent marketplace — 1,000+ AI-categorized jobs across East Africa. Hire at majobokenya.com, or drop a brief in the Contact section and pick 'Talent Sourcing'.",
  },
  {
    match: /amare|kids|children|story|youtube/i,
    reply:
      "Amare's Big Planet is our flagship YouTube series for African kids aged 4–12 — story-led learning rooted in African identity. Watch on youtube.com/@amaresbigplanet.",
  },
  {
    match: /roblox|game/i,
    reply:
      "We design educational Roblox experiences and custom gamified learning systems. Tell us about your audience via the Contact form.",
  },
  {
    match: /ai|marketing|content|generate|image/i,
    reply:
      "Our AI Marketing service orchestrates Claude + OpenRouter into brand-tuned image and copy pipelines — campaigns ship in hours. Tell us about your brand via the Contact form.",
  },
  {
    match: /career|apply|intern/i,
    reply:
      "Every live JOAT and partner role flows through Majobo Kenya — head to majobokenya.com to filter and apply, or join our always-open talent network via the Contact form.",
  },
  {
    match: /contact|email|phone|call|reach/i,
    reply:
      "You can reach us at +254142378150, email joatkenya120@gmail.com, or use the Contact form below.",
  },
  {
    match: /partner|invest|collaborat/i,
    reply:
      "Love that. Pick 'Partner With Us' in the nav (or use the Contact form) — we'll connect you with the right team within one business day.",
  },
  {
    match: /price|cost|quote|budget/i,
    reply:
      "Pricing depends on scope. Share the project in the Contact form and we'll send tailored options within 24 hours.",
  },
  {
    match: /cert|iso|nema|kra/i,
    reply:
      "JOAT KENYA is ISO 9001 quality-certified, NEMA NCA-1 (environmental) compliant and fully KRA tax-compliant.",
  },
];

function heuristicReply(lastUserMessage: string): string {
  const hit = HEURISTIC_FALLBACKS.find((h) => h.match.test(lastUserMessage));
  if (hit) return hit.reply;
  return "Great question — I'd love to connect you with the right team. Drop a quick note in the Contact form below or call +254142378150 and we'll respond within 24 hours.";
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
 * Browser-side chat completion: hits JOAT's own JACK Supabase Edge Function
 * (same backend the original joatkenya.com site uses). Falls back to scripted
 * heuristic replies if the network call fails.
 */
export async function chatCompletion(messages: ChatMessageT[]): Promise<{
  ok: true;
  source: "jack" | "fallback";
  reply: string;
}> {
  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  const lastUserText = lastUser?.content ?? "";

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

  return { ok: true, source: "fallback", reply: heuristicReply(lastUserText) };
}
