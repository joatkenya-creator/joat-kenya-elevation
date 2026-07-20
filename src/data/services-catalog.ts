import { Headset, Sparkles, Megaphone, Code2, Clapperboard, GraduationCap } from "lucide-react";

// Map the `icon_name` string returned from Supabase → lucide-react component.
// New icons need to be imported above and added here.
export const ICONS: Record<string, typeof Code2> = {
  Headset,
  Sparkles,
  Megaphone,
  Code2,
  Clapperboard,
  GraduationCap,
};

export type SvcItem = {
  icon: typeof Code2;
  title: string;
  summary: string;
  detail: string;
  industries: string[];
  outcomes: string[];
};

/**
 * Hard-coded fallback — same content as the seeded rows in Supabase. Used by
 * Services.tsx if the DB fetch fails or returns empty, and by Hero.tsx to
 * derive the "Service lines" stat count. Kept dependency-free (no
 * framer-motion, no supabase client) so importing it doesn't pull those into
 * the homepage's critical-path bundle.
 *
 * Ordered to lead with the core positioning (Virtual Assistants, AI &
 * Automation, Marketing & Lead Generation); Software Development, Media and
 * Children's Education are supporting in-house capabilities, listed after.
 */
export const FALLBACK_SERVICES: SvcItem[] = [
  {
    icon: Headset,
    title: "Virtual Assistants",
    summary:
      "Elite AI-run and human virtual assistants, embedded in your business to handle leads, admin and operations.",
    detail:
      "From a 24/7 AI Inside Sales Agent to a dedicated, industry-literate human VA, we place elite virtual assistants inside your business to respond to leads, manage your CRM and pipeline, and carry the operational load, starting with real estate and expanding across industries.",
    industries: ["Real estate", "Lead response (ISA)", "CRM & operations", "Executive support"],
    outcomes: [
      "Sub-5-minute lead response",
      "Lower overhead than a full hire",
      "Scales from AI-only to full-time",
    ],
  },
  {
    icon: Sparkles,
    title: "AI & Automation",
    summary:
      "AI agents and automations that do the work, chat, transcription, translation and workflows, built into real products.",
    detail:
      "We integrate Claude, OpenRouter and image models into production-grade automations: AI chatbots, workflow automation, meeting notes, live translation and predictive analytics that cut manual work out of your operations.",
    industries: ["AI agents", "Workflow automation", "Transcription & translation", "Analytics"],
    outcomes: [
      "Hours of manual work automated",
      "24/7 always-on operations",
      "Cutting-edge in-house AI stack",
    ],
  },
  {
    icon: Megaphone,
    title: "Marketing & Lead Generation",
    summary:
      "Generative campaigns and outbound systems built to fill your pipeline, not just grow followers.",
    detail:
      "We orchestrate AI and creative teams into brand-consistent campaigns, targeted outbound and paid ads, engineered around one outcome: qualified leads that convert, generated and optimized in hours rather than weeks.",
    industries: ["Lead generation", "Paid ads", "Outbound campaigns", "Brand content"],
    outcomes: ["More qualified leads", "Faster creative cycles", "Performance-driven growth"],
  },
  {
    icon: Code2,
    title: "Software Development",
    summary:
      "Custom mobile, web and AI products, designed, built and delivered end-to-end by our in-house engineering team.",
    detail:
      "From discovery to launch we build production-grade software (native mobile, web apps, AI integrations and edge backends) the way modern tech companies do.",
    industries: ["Mobile apps", "Web platforms", "AI integrations", "APIs & backends"],
    outcomes: [
      "Launch in weeks, not quarters",
      "Production-grade quality",
      "Scalable modern stacks",
    ],
  },
  {
    icon: Clapperboard,
    title: "Media & Content Production",
    summary:
      "Animation, video and visual content, from 3D in Blender to brand explainers, produced in-house.",
    detail:
      "Our media pipeline turns ideas into film-quality assets: character animation, motion graphics, explainers and content series that work across products, classrooms and brands.",
    industries: ["Animation & 3D", "Explainers", "Brand films", "Content series"],
    outcomes: ["Film-quality output", "Reusable asset libraries", "Consistent brand worlds"],
  },
  {
    icon: GraduationCap,
    title: "Children's Digital Education",
    summary: "Story-led educational content and learning experiences for young audiences.",
    detail:
      "We design and produce curriculum-aligned digital content (animated series, interactive activities and learning games) that make early learning joyful and effective.",
    industries: ["Animated series", "Interactive learning", "Learning games", "Curriculum content"],
    outcomes: ["Curriculum-aligned", "Engaging for ages 1–8", "Literacy & STEM outcomes"],
  },
];
