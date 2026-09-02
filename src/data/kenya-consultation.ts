import {
  Rocket,
  Building2,
  TrendingUp,
  Laptop,
  Users,
  Search,
  type LucideIcon,
} from "lucide-react";

/**
 * Configuration + copy for /kenya-consultation (Kenya Market Entry &
 * Relocation Consultation).
 *
 * Anything commercial (price) or personal (the Director's name, photo, bio)
 * is CONFIGURATION, not invented content: prices come from env vars, the
 * Director block from the placeholders below. Nothing here states a fact
 * about JOAT that isn't already published elsewhere on the site.
 */

/* ─── Commercial configuration ──────────────────────────────────────────────
 * Set these in .env / the host's build env to publish prices. While unset the
 * UI says the fee is shared on confirmation — the same wording the existing
 * /contact consultation block already uses. No code change needed to switch.
 *   VITE_CONSULT_CURRENCY=USD
 *   VITE_CONSULT_PRICE_60=250
 *   VITE_CONSULT_PRICE_120=450
 */
const CURRENCY = import.meta.env.VITE_CONSULT_CURRENCY as string | undefined;
const PRICE_60 = import.meta.env.VITE_CONSULT_PRICE_60 as string | undefined;
const PRICE_120 = import.meta.env.VITE_CONSULT_PRICE_120 as string | undefined;

function priceLabel(amount?: string) {
  if (!amount) return null;
  return CURRENCY ? `${CURRENCY} ${amount}` : amount;
}

/* ─── WhatsApp ──────────────────────────────────────────────────────────────
 * The site has no WhatsApp channel configured today, so the CTA stays hidden
 * until a number is set. Digits only, international format, no plus sign:
 *   VITE_WHATSAPP_NUMBER=254142378150
 */
const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER as string | undefined;

export const PHONE_DISPLAY = "+254 142 378 150";
export const PHONE_HREF = "tel:+254142378150";
export const EMAIL = "admin@joatkenya.com";

export const whatsappLink = WHATSAPP_NUMBER
  ? `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
      "Hello J.O.A.T. Kenya, I would like to ask about a Kenya market entry / relocation consultation.",
    )}`
  : null;

/* ─── The two consultations ─────────────────────────────────────────────── */

export type ConsultationOption = {
  minutes: 60 | 120;
  name: string;
  eyebrow: string;
  summary: string;
  bestFor: string;
  covers: string[];
  cta: string;
  price: string | null;
};

export const CONSULTATIONS: ConsultationOption[] = [
  {
    minutes: 60,
    name: "Kenya Discovery Consultation",
    eyebrow: "1 Hour · Discovery & direction",
    summary:
      "A working conversation for anyone still deciding whether Kenya is the right country, or the right market, for what they want to do. You bring the questions; we work through them against how business, hiring and daily life here actually function.",
    bestFor:
      "You are researching Kenya and want an informed conversation before committing time, money or a plane ticket.",
    covers: [
      "Whether Kenya fits the goal you are describing, whether that is living, building or investing",
      "What relocating here practically involves, and what to line up before you move",
      "Whether there is a plausible market for your idea, product or service",
      "The parts of doing business in Kenya that surprise people who arrive unprepared",
      "Sectors and opportunity areas worth your own further research",
      "What to investigate next, and who you should be speaking to",
    ],
    cta: "Book Your 1-Hour Consultation",
    price: priceLabel(PRICE_60),
  },
  {
    minutes: 120,
    name: "Kenya Market Entry Strategy Session",
    eyebrow: "2 Hours · Deep strategic assessment",
    summary:
      "A structured working session for people already serious about entering Kenya. We go through your business or investment case in detail and leave you with a clear picture of the route in, the local realities behind it, and what to resolve before you spend money.",
    bestFor:
      "You have decided Kenya is on the table and now need to pressure-test the plan with someone who operates here.",
    covers: [
      "Your business, product or investment case, examined against the local market",
      "Who your Kenyan customer would actually be, and how they buy",
      "Business model and pricing considerations for this market",
      "Routes in: register locally, partner, distribute, acquire, or test first",
      "Operational realities: premises, suppliers, payments, logistics, timelines",
      "Hiring and team building, where the talent is and what it costs to employ well",
      "Local partnerships, and how to evaluate a prospective partner",
      "Technology and systems you will need on the ground",
      "Marketing and route to customer in a market where mobile and word of mouth dominate",
      "The specific questions to answer before committing capital",
      "A recommended sequence of next steps, and where J.O.A.T. Kenya can help if you want it",
    ],
    cta: "Book a 2-Hour Market Entry Session",
    price: priceLabel(PRICE_120),
  },
];

export const COMPARISON: { hour: string; strategy: string }[] = [
  {
    hour: "Explore whether Kenya is right for you",
    strategy: "Deep assessment of your specific business or investment case",
  },
  {
    hour: "Talk through relocation questions",
    strategy: "Work through market-entry routes and their trade-offs",
  },
  {
    hour: "Ask open questions about the country and the economy",
    strategy: "Define target customers, segments and how they buy",
  },
  {
    hour: "Explore where the opportunities sit",
    strategy: "Examine operations, suppliers, premises and payments",
  },
  {
    hour: "Identify the considerations that matter for your plan",
    strategy: "Cover hiring, partnerships, technology and marketing",
  },
  {
    hour: "High-level guidance and direction",
    strategy: "A recommended sequence of next steps",
  },
];

/* ─── Booking form: what the visitor wants to accomplish ─────────────────── */

export const OBJECTIVES = [
  "Explore moving to Kenya",
  "Start a business in Kenya",
  "Expand my existing business into Kenya",
  "Explore investment opportunities",
  "Build a team in Kenya",
  "Find local partners",
  "Understand the Kenyan market",
  "Explore opportunities in East Africa",
  "Other",
];

/* ─── Availability ──────────────────────────────────────────────────────────
 * Kenya is UTC+3 year-round (no daylight saving), so the offset below is a
 * constant rather than a timezone-database lookup.
 */
export const AVAILABILITY = {
  timeZone: "Africa/Nairobi",
  utcOffsetHours: 3,
  /** 1 = Monday … 5 = Friday, in Nairobi local days. */
  weekdays: [1, 2, 3, 4, 5],
  /** First and last slot START hour, Nairobi local time. */
  firstHour: 9,
  lastHour: 17,
  /** Slots start on the hour. */
  stepMinutes: 60,
  /** Nothing bookable inside this window: the Director needs notice. */
  leadTimeHours: 24,
  /** How far ahead the calendar opens. */
  horizonDays: 45,
};

/* ─── Who this is for ───────────────────────────────────────────────────── */

export const AUDIENCES: { icon: LucideIcon; title: string; text: string }[] = [
  {
    icon: Rocket,
    title: "Entrepreneurs",
    text: "You are considering launching a business in Kenya and want to understand the market, the costs and the practical steps before you commit.",
  },
  {
    icon: Building2,
    title: "International businesses",
    text: "Your company is weighing expansion into Kenya or the wider East African region and needs a grounded read on the opportunity.",
  },
  {
    icon: TrendingUp,
    title: "Investors",
    text: "You are researching Kenyan opportunities and want local context on sectors, operating conditions and what due diligence should cover.",
  },
  {
    icon: Laptop,
    title: "Remote professionals & founders",
    text: "You are thinking about relocating your life or your operations here and want to know what living and working in Kenya actually looks like.",
  },
  {
    icon: Users,
    title: "Established businesses",
    text: "You need local market knowledge, partners, staffing, technology or operational support to make a Kenyan presence work.",
  },
  {
    icon: Search,
    title: "Anyone researching Kenya",
    text: "You have read everything online and now want an informed, direct conversation with someone who operates here every day.",
  },
];

/* ─── The Director ──────────────────────────────────────────────────────────
 * PLACEHOLDER: the project holds no verified biography, photograph or
 * credentials for the Director. Fill these in and the section renders them;
 * leave them null and it renders the role-based copy only. Nothing here
 * asserts a credential.
 */
export const DIRECTOR: {
  name: string | null;
  title: string;
  photo: string | null;
  bio: string[] | null;
} = {
  name: null,
  title: "Director, J.O.A.T. Kenya",
  photo: null,
  bio: null,
};

/* ─── FAQ ────────────────────────────────────────────────────────────────── */

export const CONSULTATION_FAQS = [
  {
    q: "Is Kenya a good place to start a business?",
    a: "It depends on what you are building and how you enter. Kenya has a large young population, deep mobile-money penetration, a regional role as an East African hub, and an established services and technology sector. It also has real friction: price competition, registration and licensing steps that take time, infrastructure that varies by location, and payment habits that catch newcomers out. The honest answer for your specific idea comes from examining it, which is what the consultation is for.",
  },
  {
    q: "Can I speak with someone about moving my business to Kenya?",
    a: "Yes, that is exactly what these sessions are. You book a 1-hour discovery consultation or a 2-hour market entry strategy session and speak directly with the Director of J.O.A.T. Kenya about your plans, by video call or phone.",
  },
  {
    q: "Can you help me determine whether Kenya is the right market for my business?",
    a: "We can help you assess it. We work through who your customer would be here, whether the demand pattern you rely on elsewhere exists in Kenya, what it would cost to operate, and what would have to be true for the plan to work. The decision stays yours; what you get is local context and an honest read rather than encouragement.",
  },
  {
    q: "What happens during the 1-hour Kenya consultation?",
    a: "You tell us what you are considering and why, and we spend the hour on your questions: whether Kenya suits the goal, what relocating or setting up practically involves, whether your idea has a plausible market here, what challenges to prepare for, and what to research next. It is a conversation, not a presentation.",
  },
  {
    q: "What is covered in the 2-hour market entry strategy session?",
    a: "A deeper, structured assessment: your business or investment case, your target Kenyan customer, business model considerations, the possible routes into the market, operational and staffing realities, partnerships, technology and marketing, the risks worth planning for, the questions to answer before committing capital, and a recommended sequence of next steps.",
  },
  {
    q: "Should I book the 1-hour or the 2-hour session?",
    a: "Book the 1-hour session if you are still deciding whether Kenya is right for you. Book the 2-hour session if you have already decided Kenya is on the table and want your plan examined in detail. If you start with the 1-hour session and want to go deeper afterwards, you can book the strategy session separately.",
  },
  {
    q: "Can international entrepreneurs book a consultation?",
    a: "Yes. These sessions are built for people outside Kenya. They run by video call in English, scheduled in Nairobi time but shown to you in your own time zone when you pick a slot.",
  },
  {
    q: "Can an existing company discuss expanding into Kenya?",
    a: "Yes. Companies exploring Kenya or East Africa as an expansion market are a core audience for the 2-hour strategy session, particularly where the question is whether to establish locally, partner, distribute, or test the market first.",
  },
  {
    q: "Can you help me understand the Kenyan market?",
    a: "Yes, that is the core of the service. J.O.A.T. Kenya has operated here for over 12 years, serving Kenyan and international clients, so the conversation is grounded in running a business here rather than in published summaries.",
  },
  {
    q: "Can you help me find business opportunities in Kenya?",
    a: "We can discuss where opportunity sits relative to your skills, capital and appetite, and point you to areas worth investigating. We do not present opportunity lists as investment recommendations, and nothing discussed is a promise of a return.",
  },
  {
    q: "Can you help me plan my move to Kenya?",
    a: "We can talk through the practical realities of relocating: cost of living, where people base themselves, connectivity, schooling questions, transport, banking and the sequence most people follow, and help you build a checklist. Immigration filings themselves must go through a licensed immigration professional.",
  },
  {
    q: "Do you provide legal, immigration, tax or investment advice?",
    a: "No. These consultations are strategic and commercial guidance about the Kenyan market. Legal, immigration, tax, accounting and regulated investment advice must come from professionals licensed to give it in Kenya, and we will say so when a question needs one. We can also point you toward the type of professional to engage.",
  },
];

/* ─── Trust: only facts already published on joatkenya.com ─────────────── */

export const TRUST_POINTS = [
  {
    stat: "12+",
    label: "Years in business",
    text: "J.O.A.T. Kenya (Jack Urban Services Ltd) has been operating from Kiambu since long before the current wave of interest in the market.",
  },
  {
    stat: "Kenya",
    label: "Based and staffed here",
    text: "The team is in Kenya, at The Brick Mall on Kiambu Road, Thindigua. The market knowledge comes from operating in it, not from visiting.",
  },
  {
    stat: "100%",
    label: "Delivered in-house",
    text: "Virtual assistants, AI automation, lead generation, software, media and children's education are all built and delivered by our own team.",
  },
];
