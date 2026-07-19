import { Code2, Megaphone, Clapperboard, GraduationCap, Sparkles } from "lucide-react";

// Map the `icon_name` string returned from Supabase → lucide-react component.
// New icons need to be imported above and added here.
export const ICONS: Record<string, typeof Code2> = {
  Code2,
  Megaphone,
  Clapperboard,
  GraduationCap,
  Sparkles,
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
 */
export const FALLBACK_SERVICES: SvcItem[] = [
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
    icon: Megaphone,
    title: "Digital Marketing",
    summary: "Generative campaigns, content and ads that grow brands across every major platform.",
    detail:
      "We orchestrate AI and creative teams into brand-consistent campaigns, social content and paid ads, generated and optimized in hours rather than weeks.",
    industries: ["Social media", "Paid ads", "Brand campaigns", "Product launches"],
    outcomes: ["Faster creative cycles", "Multi-platform reach", "Performance-driven growth"],
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
  {
    icon: Sparkles,
    title: "AI Solutions",
    summary:
      "AI features and automations, transcription, translation and agents, built into real products.",
    detail:
      "We integrate Claude, OpenRouter and image models into production workflows: meeting summaries, live translation, content generation and agentic automation.",
    industries: ["AI features", "Automation", "Transcription & translation", "Agents"],
    outcomes: ["Smarter products", "Automated workflows", "Cutting-edge capabilities"],
  },
];
