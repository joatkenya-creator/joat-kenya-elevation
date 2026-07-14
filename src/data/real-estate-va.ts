import { Zap, Home, Rocket } from "lucide-react";
import type { Product } from "@/lib/product-types";

/**
 * The three Real Estate Virtual Assistant tiers. Shared between the Products
 * page (where they live as an in-house product line) and the dedicated
 * /real-estate-virtual-assistant landing page, so copy can't drift between
 * the two surfaces.
 */
export const realEstateVAProducts: Product[] = [
  {
    id: "va-realestate-starter",
    badge: "Real Estate VA · AI Starter (ISA)",
    title: "Never lose a lead to a slow reply again.",
    tagline:
      "Sub-5-minute AI response to every Zillow, Realtor.com, Facebook & website lead, 24/7.",
    description:
      "Starter is a fully AI-run Inside Sales Agent (ISA) built for real estate speed-to-lead: it responds to new buyer and seller leads from Zillow, Realtor.com, Facebook/Instagram and your website within minutes, qualifies intent, budget and timeline, books showings, and keeps nurturing the lead until a human needs to step in, all logged straight into your CRM. Leads contacted in the first 5 minutes convert far more often than those left waiting, so speed is the whole point.",
    features: [
      "Sub-5-minute AI response, day or night (speed-to-lead)",
      "Works every source: Zillow, Realtor.com, Facebook & website leads",
      "Acts as your 24/7 ISA: qualifies intent, budget & timeline",
      "Auto-scheduled showings, open house sign-ups & CRM logging",
    ],
    ctas: [{ label: "Get instant lead response", href: "/contact" }],
    icon: Zap,
    accent: "gold",
  },
  {
    id: "va-realestate-professional",
    badge: "Real Estate VA · Professional",
    title: "A dedicated VA who knows MLS, CRM and your pipeline.",
    tagline: "Standard-hours human support for listings, leads and client follow-up.",
    description:
      "Professional pairs your listings with a dedicated, real-estate-literate assistant: MLS entry and updates, CRM upkeep (Follow Up Boss, kvCORE and similar), lead follow-up calls and texts, and showing coordination, backed by an AI copilot for listing descriptions and social posts.",
    features: [
      "~80–120 hours/month",
      "MLS listing entry, updates & CRM management",
      "Warm & hot lead follow-up until appointments are booked",
      "AI-drafted listing descriptions & social posts",
    ],
    ctas: [{ label: "Get Professional Real Estate VA", href: "/contact" }],
    icon: Home,
    accent: "red",
    reverse: true,
  },
  {
    id: "va-realestate-executive",
    badge: "Real Estate VA · Executive",
    title: "Full-time senior support for top-producing agents & teams.",
    tagline: "Dedicated executive assistance for brokers and high-volume teams.",
    description:
      "Executive pairs a senior, full-time assistant with JOAT's own AI agents, the same engine behind BioBiz's meeting notes and live translation, for brokers and top producers who need a right hand across contract-to-close coordination, vendor and lender liaison, and sphere-of-influence database management.",
    features: [
      "Full-time, dedicated hours",
      "Contract-to-close transaction coordination",
      "Vendor, lender & title liaison",
      "Backed by our AI meeting notes & translation engine",
    ],
    ctas: [{ label: "Get Executive Real Estate VA", href: "/contact" }],
    icon: Rocket,
    accent: "gold",
  },
];

export const realEstateVAFaqs = [
  {
    q: "What is a real estate virtual assistant (VA)?",
    a: "A real estate VA is a remote assistant, either a fully AI-run ISA or a dedicated human, who handles the workload around your listings and leads: responding to inquiries, updating your CRM and MLS listings, scheduling showings, and coordinating transactions, so you can focus on clients and closings.",
  },
  {
    q: "What's the difference between the AI Starter tier and a human VA?",
    a: "Starter is a fully AI-run Inside Sales Agent (ISA): no human hours, available 24/7, built purely for instant lead response and qualification. Professional and Executive add a dedicated human assistant, backed by the same AI tools, for work that needs a person: listing management, client calls and transaction coordination.",
  },
  {
    q: "How fast do you respond to new leads?",
    a: "The AI Starter tier responds to new leads from Zillow, Realtor.com, Facebook/Instagram and your website in under 5 minutes, day or night. That speed is one of the biggest drivers of lead conversion in real estate.",
  },
  {
    q: "Which CRMs and lead sources do you work with?",
    a: "We work with the CRMs and lead sources real estate teams already use, including Follow Up Boss, kvCORE, MLS platforms, Zillow, Realtor.com and Facebook/Instagram lead ads.",
  },
  {
    q: "Can I start with AI-only and add a human VA later?",
    a: "Yes. Most teams start with the AI Starter tier for instant lead response, then add Professional or Executive support as their pipeline and listing volume grow.",
  },
  {
    q: "Is this available outside Kenya?",
    a: "Yes, we support real estate agents, brokers and teams worldwide; onboarding is fully remote.",
  },
];
