import { motion } from "framer-motion";
import {
  Download,
  Users,
  GraduationCap,
  Rocket,
  Gamepad2,
  ArrowRight,
  Check,
  Apple,
  ExternalLink,
  Mic,
  Languages,
  Brush,
  Sparkles,
  Boxes,
  Play,
} from "lucide-react";
import biobiz from "@/assets/biobiz-mock.jpg";
import biobizShare from "@/assets/biobiz-share.jpg";
import biobizFeatures from "@/assets/biobiz-features.jpg";
import biobizRecordings from "@/assets/biobiz-recordings.jpg";
import biobizLogo from "@/assets/biobiz-logo.jpeg";
import { GermanSampleAudio } from "./GermanSampleAudio";
import amare from "@/assets/amare-planet.jpg";
import roblox from "@/assets/roblox-world.jpg";
import talent from "@/assets/talent.jpg";
import majoboLogo from "@/assets/majobo-logo.jpeg";

type CTA = { label: string; href: string; icon?: "download" | "apple" | "external" };

type Product = {
  id: string;
  badge: string;
  title: string;
  tagline: string;
  description: string;
  features: string[];
  ctas: CTA[];
  image?: string;
  reverse?: boolean;
  icon: React.ComponentType<{ className?: string }>;
  accent: "red" | "gold";
  extra?: React.ReactNode;
  /** Optional product brand logo. If `logoMark` is supplied (URL/import) it renders
   * as an image; otherwise `logoLetter` renders a gradient placeholder square. */
  logoMark?: string;
  logoLetter?: string;
};

function CTAIcon({ kind }: { kind?: CTA["icon"] }) {
  if (kind === "download") return <Download className="w-4 h-4" />;
  if (kind === "apple") return <Apple className="w-4 h-4" />;
  if (kind === "external") return <ExternalLink className="w-4 h-4" />;
  return null;
}

const BiobizExtra = (
  <div className="mt-10 grid md:grid-cols-2 gap-5">
    {/* AI summary of recordings */}
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-(--joat-gold)/15 flex items-center justify-center">
          <Mic className="w-5 h-5 text-(--joat-gold)" />
        </div>
        <div>
          <div className="text-xs uppercase tracking-widest text-gold">AI Meeting Notes</div>
          <div className="font-semibold text-foreground">Record → Summarize → Action</div>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">
        BioBiz records meetings, transcribes them, and returns a clean summary with key insights of
        the recordings.
      </p>
      <div className="mt-4 rounded-xl bg-(--joat-navy-deep)/60 border border-white/5 p-4 text-sm">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
          <span className="w-2 h-2 rounded-full bg-(--joat-red) animate-pulse" />
          Sample summary
        </div>
        <p className="text-foreground/90 leading-relaxed">
          <span className="text-gold font-semibold">Topic:</span> Q3 inventory sync with Westlands
          branch. <span className="text-gold font-semibold">Decisions:</span> reorder cycle
          shortened to weekly; M-Pesa float increased.
        </p>
        <ul className="mt-3 space-y-1.5 text-xs text-foreground/80">
          <li className="flex gap-2">
            <Check className="w-3.5 h-3.5 text-(--joat-gold) mt-0.5 shrink-0" />
            James to push new stock-alert thresholds by Fri
          </li>
          <li className="flex gap-2">
            <Check className="w-3.5 h-3.5 text-(--joat-gold) mt-0.5 shrink-0" />
            Wanjiru to onboard 2 new vendors via QR cards
          </li>
          <li className="flex gap-2">
            <Check className="w-3.5 h-3.5 text-(--joat-gold) mt-0.5 shrink-0" />
            Follow-up call: Tuesday 10:00 EAT
          </li>
        </ul>
      </div>
    </div>

    {/* Foreign language → English translation */}
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-(--joat-red)/15 flex items-center justify-center">
          <Languages className="w-5 h-5 text-(--joat-red)" />
        </div>
        <div>
          <div className="text-xs uppercase tracking-widest text-gold">Live Translation</div>
          <div className="font-semibold text-foreground">Speak any language → read English</div>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">
        Capture a conversation in German, French, Swahili, Mandarin or any supported language — get
        a clean English transcript instantly.
      </p>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-(--joat-navy-deep)/60 border border-white/5 p-3">
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Recording · German
            </div>
            <GermanSampleAudio />
          </div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-(--joat-red) animate-pulse" />
            <span className="text-xs text-foreground/80">00:42</span>
          </div>
          <p className="text-xs text-foreground/90 italic leading-relaxed">
            "Wir müssen unseren Vertrieb in der Küstenregion vor der Urlaubssaison ausbauen."
          </p>
        </div>
        <div className="rounded-xl bg-(--joat-gold)/10 border border-(--joat-gold)/30 p-3">
          <div className="text-[10px] uppercase tracking-widest text-gold mb-1">
            English transcript
          </div>
          <div className="flex items-center gap-2 mb-2">
            <Languages className="w-3 h-3 text-(--joat-gold)" />
            <span className="text-xs text-foreground/80">Auto-translated</span>
          </div>
          <p className="text-xs text-foreground/95 leading-relaxed">
            "We need to expand our distribution to the coastal region before the holiday season."
          </p>
        </div>
      </div>
    </div>

    {/* Screenshots straight from the Play Store listing */}
    <div className="md:col-span-2 mt-2">
      <div className="flex items-end justify-between gap-3 mb-5 flex-wrap">
        <div>
          <div className="text-xs uppercase tracking-widest text-gold">Inside the BioBiz app</div>
        </div>
        <a
          href="https://play.google.com/store/apps/details?id=com.biobiz.biobiz_mobile"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 text-sm font-semibold text-(--joat-gold) hover:underline"
        >
          See on Play Store <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
        {[
          {
            src: biobiz,
            label: "My Card",
            note: "Your digital business card — live views, shares and saves.",
          },
          {
            src: biobizShare,
            label: "Share Card",
            note: "QR + Copy link, Text, Email, WhatsApp, LinkedIn — share anywhere.",
          },
          {
            src: biobizRecordings,
            label: "AI Notetaker",
            note: "Record meetings; instant AI summary + action items.",
          },
          {
            src: biobizFeatures,
            label: "All features",
            note: "Card analytics, email signature, NFC, lead capture, CRM, and more.",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="glass rounded-2xl overflow-hidden border border-(--glass-border) hover:border-(--joat-gold)/40 transition-colors group"
          >
            <div className="aspect-[3/4] bg-(--joat-navy-deep) flex items-center justify-center overflow-hidden">
              <img
                src={s.src}
                alt={`BioBiz · ${s.label} screen`}
                loading="lazy"
                className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-[1.03]"
              />
            </div>
            <div className="p-4">
              <div className="text-xs font-semibold text-gold uppercase tracking-wider">
                {s.label}
              </div>
              <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{s.note}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const MajoboExtra = (
  <div className="mt-10 grid md:grid-cols-5 gap-5 items-stretch">
    <div className="md:col-span-3 glass rounded-2xl p-6">
      <div className="text-xs uppercase tracking-widest text-gold mb-2">How AI powers Majobo</div>
      <h4 className="text-xl font-bold text-foreground">
        From free-form posts to structured opportunity.
      </h4>
      <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
        Anyone can post work — cleaning, photography, web dev, brand ambassadorship — in plain
        language. Majobo's AI reads each post, infers the role, skills required and location, then
        auto-classifies it into the right category and surfaces it to nearby workers. The result:
        1,000+ active opportunities, searchable like a structured job board, with no manual tagging.
      </p>
      <ul className="mt-4 grid sm:grid-cols-2 gap-2 text-sm">
        {[
          "AI-driven category inference",
          "Hyper-local matching",
          "Flexible: gig, contract, permanent",
        ].map((f) => (
          <li key={f} className="flex items-start gap-2 text-foreground/90">
            <Check className="w-4 h-4 mt-0.5 shrink-0 text-(--joat-red)" />
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <div className="mt-5 flex flex-wrap gap-2">
        {[
          "Cleaning & Laundry",
          "Events & Entertainment",
          "Gardening & Landscaping",
          "Professional Services",
          "Tech & Web",
          "Property Management",
        ].map((c) => (
          <span key={c} className="text-xs px-3 py-1 rounded-full glass text-foreground/80">
            {c}
          </span>
        ))}
      </div>
    </div>

    <div className="md:col-span-2 relative">
      <div className="absolute -inset-2 rounded-3xl bg-linear-to-br from-(--joat-red)/20 via-transparent to-(--joat-gold)/20 blur-2xl" />
      <div className="relative glass rounded-2xl overflow-hidden border border-(--glass-border)">
        <div className="px-4 py-2 bg-(--joat-navy-deep) flex items-center gap-1.5 border-b border-white/5">
          <span className="w-2.5 h-2.5 rounded-full bg-(--joat-red)" />
          <span className="w-2.5 h-2.5 rounded-full bg-(--joat-gold)" />
          <span className="w-2.5 h-2.5 rounded-full bg-foreground/30" />
          <span className="ml-3 text-xs text-muted-foreground">majobokenya.com</span>
        </div>
        <iframe
          src="https://www.majobokenya.com/"
          title="Majobo Kenya live preview"
          loading="lazy"
          referrerPolicy="no-referrer"
          className="w-full h-[420px] bg-white"
        />
      </div>
      <a
        href="https://www.majobokenya.com/"
        target="_blank"
        rel="noreferrer"
        className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-(--joat-gold) hover:underline"
      >
        Open Majobo Kenya <ExternalLink className="w-3.5 h-3.5" />
      </a>
    </div>
  </div>
);

const AmareVideos = [
  {
    id: "_cZMYWcZlNc",
    label: "Featured episode",
    note: "Our flagship Amare's Big Planet episode — open to brand sponsorship.",
  },
  {
    id: "Ye8ebNqBoYY",
    label: "Learning adventures",
    note: "Curriculum-aligned activities for ages 1–8",
  },
  {
    id: "ORDhzHxc7Dw",
    label: "Cultural pride series",
    note: "Stories that turn African heritage into curiosity",
  },
];

const AmareExtra = (
  <div className="mt-10">
    <div className="flex items-end justify-between gap-3 mb-4 flex-wrap">
      <div>
        <div className="text-xs uppercase tracking-widest text-gold">Featured on YouTube</div>
        <h4 className="text-xl font-bold text-foreground">Watch Amare's Big Planet</h4>
      </div>
      <a
        href="https://www.youtube.com/@amaresbigplanet/featured"
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 text-sm font-semibold text-(--joat-gold) hover:underline"
      >
        Open the channel <ExternalLink className="w-3.5 h-3.5" />
      </a>
    </div>
    <div className="grid md:grid-cols-3 gap-5">
      {AmareVideos.map((v) => (
        <a
          key={v.id}
          href={`https://www.youtube.com/watch?v=${v.id}`}
          target="_blank"
          rel="noreferrer"
          aria-label={`Watch ${v.label} on YouTube`}
          className="group glass rounded-2xl overflow-hidden block hover:border-(--joat-gold)/40 transition-all"
        >
          <div className="relative aspect-video overflow-hidden bg-(--joat-navy-deep)">
            <img
              src={`https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`}
              srcSet={`https://i.ytimg.com/vi/${v.id}/mqdefault.jpg 320w, https://i.ytimg.com/vi/${v.id}/hqdefault.jpg 480w, https://i.ytimg.com/vi/${v.id}/sddefault.jpg 640w, https://i.ytimg.com/vi/${v.id}/maxresdefault.jpg 1280w`}
              sizes="(min-width: 768px) 33vw, 100vw"
              alt={`${v.label} thumbnail`}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-white/95 flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xl">
                <Play className="w-6 h-6 text-(--joat-red) fill-current ml-1" />
              </div>
            </div>
          </div>
          <div className="p-4">
            <div className="text-xs text-gold font-semibold uppercase tracking-wider">
              Amare's Big Planet
            </div>
            <div className="mt-1 font-bold text-foreground group-hover:text-(--joat-gold) transition-colors">
              {v.label}
            </div>
            <div className="text-xs text-muted-foreground mt-1">{v.note}</div>
          </div>
        </a>
      ))}
    </div>
  </div>
);

const featuredGames = [
  {
    src: "/videos/amares-big-planet.mp4",
    title: "Amare's Big Planet",
    tag: "Roblox · Open-world alphabet adventure",
    description:
      "Explore a vast world to collect all 26 letters of the alphabet while dodging deadly energy waves and mysterious Collectors. Use safe zones, earn fly charges, and climb the all-time leaderboard — full mobile support included.",
  },
  {
    src: "/videos/abyss.mp4",
    title: "Abyss",
    tag: "Roblox · Underwater exploration",
    description:
      "Dive through evolving underwater zones — bright Coral Reefs, eerie Kelp Forests, the haunting Deep Sea and ancient Sunken Ruins — where each unlocked level reveals deeper, more dangerous waters. Collect items, manage oxygen and uncover what lies beneath the surface.",
  },
];

const RobloxExtra = (
  <div className="mt-10">
    <div className="flex items-center gap-3 mb-4">
      <Gamepad2 className="w-5 h-5 text-gold" />
      <h4 className="text-xl font-bold text-foreground">Selected Roblox builds</h4>
    </div>
    <div className="grid md:grid-cols-2 gap-5">
      {featuredGames.map((g) => (
        <div
          key={g.title}
          className="glass rounded-2xl overflow-hidden group border border-(--joat-gold)/30"
        >
          <div className="aspect-video relative bg-(--joat-navy-deep) overflow-hidden">
            <video
              src={g.src}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              controls={false}
              disableRemotePlayback
              ref={(el) => {
                if (!el) return;
                // Belt-and-suspenders mute: ensures muted DOM property + HTML
                // attribute are both set before autoplay starts, across all browsers.
                el.muted = true;
                el.volume = 0;
                el.setAttribute("muted", "");
              }}
              className="w-full h-full object-cover"
              aria-label={`${g.title} gameplay preview (muted)`}
            />
            <div className="absolute top-2 left-2 text-[10px] uppercase tracking-widest text-(--joat-navy-deep) font-bold px-2 py-0.5 rounded bg-(--joat-gold)">
              Live build · gameplay
            </div>
          </div>
          <div className="p-5">
            <div className="font-bold text-foreground text-lg">{g.title}</div>
            <div className="text-xs text-(--joat-gold) uppercase tracking-wider mt-0.5">
              {g.tag}
            </div>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{g.description}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const BlenderExtra = (
  <div className="mt-10 grid lg:grid-cols-2 gap-5">
    <div className="glass rounded-2xl p-6">
      <div className="text-xs uppercase tracking-widest text-gold mb-2">3D pipeline</div>
      <h4 className="text-xl font-bold text-foreground">Animations built in Blender</h4>
      <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
        We use Blender end-to-end — modeling, rigging, lighting, render — to ship film-quality
        assets that double as game characters, classroom explainers, and brand identity systems.
      </p>
    </div>
    <div className="glass rounded-2xl p-6">
      <div className="text-xs uppercase tracking-widest text-gold mb-2">In production</div>
      <h4 className="text-xl font-bold text-foreground">Drawalette — a kids' drawing game</h4>
      <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
        A game we're building from Blender assets: children learn the alphabet by tracing each
        letter, the character cheers them on, and progress unlocks new worlds. Built for tablets,
        designed for African early-years curricula.
      </p>
      <ul className="mt-4 space-y-1.5 text-sm">
        {[
          "Stroke-order recognition (A–Z)",
          "Voice cues in Swahili + English",
          "Reward system tied to literacy milestones",
        ].map((f) => (
          <li key={f} className="flex items-start gap-2 text-foreground/90">
            <Check className="w-4 h-4 mt-0.5 shrink-0 text-(--joat-gold)" />
            <span>{f}</span>
          </li>
        ))}
      </ul>
    </div>
  </div>
);

const products: Product[] = [
  {
    id: "biobiz",
    badge: "BioBiz App",
    title: "Your business card, reimagined — with AI in your pocket.",
    tagline: "Digital business cards, instant networking, AI meeting notes and live translation.",
    description:
      "BioBiz turns a phone into a complete networking toolkit. Build a digital business card in under 60 seconds, exchange it by QR, and let our AI capture meetings, summarize them, and translate foreign-language conversations into English on the fly.",
    features: [
      "Customizable digital cards (photo, logo, socials, contact)",
      "QR-code sharing + bidirectional auto-exchange",
      "AI meeting recordings with summaries & action items",
      "Foreign-language → English transcription",
      "Card analytics: views, shares, follow-ups",
    ],
    ctas: [
      {
        label: "Get on Play Store",
        href: "https://play.google.com/store/apps/details?id=com.biobiz.biobiz_mobile",
        icon: "download",
      },
      { label: "App Store · Coming soon", href: "https://biobiz.app/", icon: "apple" },
      { label: "biobiz.app", href: "https://biobiz.app/", icon: "external" },
    ],
    image: biobiz,
    icon: Rocket,
    accent: "gold",
    extra: BiobizExtra,
    logoMark: biobizLogo,
  },
  {
    id: "majobo",
    badge: "Majobo Kenya · Talent Outsourcing",
    title: "Find skilled workers near you.",
    tagline: "The local marketplace for trusted help in your neighborhood.",
    description:
      "Majobo Kenya is JOAT's talent-outsourcing platform: a hyper-local marketplace where businesses and households post work and AI matches them with vetted, ready-to-deploy talent. From house cleaning to web development, 1,000+ active opportunities flow through the platform every day.",
    features: [
      "AI-classified job categories (no manual tagging)",
      "Industries: Domestic, Events, Hospitality, Tech, Property, Pro Services",
      "Hyper-local matching by location & skill",
    ],
    ctas: [
      { label: "Open Majobo Kenya", href: "https://www.majobokenya.com/", icon: "external" },
      { label: "Hire Talent", href: "#contact" },
    ],
    image: talent,
    reverse: true,
    icon: Users,
    accent: "red",
    extra: MajoboExtra,
    logoMark: majoboLogo,
  },
  {
    id: "software",
    badge: "Software Development",
    title: "Built by an engineering team that ships.",
    tagline: "Production-grade mobile, web and AI products — built in-house.",
    description:
      "BioBiz is a proof point of how we work: real product, real users, real shipping cadence. From native mobile (Flutter, React Native) to AI integrations (Claude, OpenRouter) to backend (Supabase, Cloudflare Workers), we build software the way modern tech companies do — and we partner with organizations who want the same engineering culture without hiring a full team.",
    features: [
      "Native mobile + web with shared design systems",
      "AI integrations: transcription, translation, agentic flows",
      "Edge backends on Cloudflare Workers + Supabase",
      "From discovery to launch in weeks, not quarters",
    ],
    ctas: [{ label: "Talk to Engineering Team", href: "#contact" }],
    icon: Boxes,
    accent: "gold",
  },
  {
    id: "amare",
    badge: "Amare's Big Planet · Digital Education",
    title: "A story-driven world where African kids learn to dream big.",
    tagline: "Animated YouTube series for ages 1–8 celebrating African culture & curiosity.",
    description:
      "Amare's Big Planet is our flagship educational property — a colorful, story-led YouTube universe that turns reading, science and life skills into adventures rooted in African identity. Watch on YouTube; the production pipeline feeds directly into our games and classroom programs.",
    features: [
      "Animated episodes + interactive learning activities",
      "Ages 1–8, aligned to early-years curricula",
      "Outcomes: literacy, STEM curiosity, cultural pride",
    ],
    ctas: [
      {
        label: "Watch on YouTube",
        href: "https://www.youtube.com/@amaresbigplanet/featured",
        icon: "external",
      },
    ],
    image: amare,
    reverse: true,
    icon: GraduationCap,
    accent: "red",
    extra: AmareExtra,
  },
  {
    id: "games",
    badge: "Game Development · Roblox",
    title: "Professional game studios — built for Roblox.",
    tagline: "Original Roblox titles and bespoke worlds, shipped end-to-end by the tech team.",
    description:
      "We are professional game developers. Our Roblox studio designs, builds and ships original titles, brand-activated worlds and custom multiplayer experiences — from concept and 3D art through scripting, monetization and live ops.",
    features: [
      "Original Roblox titles + bespoke client builds",
      "Full studio pipeline: 3D art, scripting, FX, audio",
      "Multiplayer architecture and live operations",
      "Brand-activated immersive worlds for partners",
    ],
    ctas: [{ label: "Commission a build", href: "#contact" }],
    image: roblox,
    icon: Gamepad2,
    accent: "gold",
    extra: RobloxExtra,
  },
  {
    id: "ai-marketing",
    badge: "AI Marketing",
    title: "Campaigns at the speed of prompts.",
    tagline: "Generative imagery and copy pipelines powered by Claude + OpenRouter.",
    description:
      "We orchestrate Claude, OpenRouter and image models into production marketing pipelines: brand-consistent posts, multi-format campaigns and on-trend creative — generated in hours rather than weeks. Perfect for product launches, social-first brands and budget-conscious growth teams.",
    features: [
      "Brand-tuned image generation",
      "AI-written captions, hooks & ad variants",
      "Multi-platform output (IG, TikTok, LinkedIn, X)",
      "Performance loops: regenerate from what's working",
    ],
    ctas: [{ label: "See campaigns", href: "#contact" }],
    icon: Sparkles,
    accent: "red",
    reverse: true,
  },
  {
    id: "blender",
    badge: "Animation · Blender",
    title: "3D animation that teaches and plays.",
    tagline: "Production-quality 3D in Blender, repurposed into games, ads and classrooms.",
    description:
      "Our Blender pipeline produces characters, sets and motion that flow into multiple products — most recently a kids' game where children learn the alphabet by drawing each letter alongside an animated Blender character that cheers them on.",
    features: [
      "Character modeling, rigging & animation",
      "Render pipelines feeding into Roblox / game engines",
      "Brand explainers and product motion",
      "Tablet-ready letter-drawing game in production",
    ],
    ctas: [{ label: "Commission a build", href: "#contact" }],
    icon: Brush,
    accent: "gold",
    extra: BlenderExtra,
  },
];

export function Products() {
  return (
    <section id="products" className="relative py-24 lg:py-32 bg-navy-deep">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="text-xs uppercase tracking-[0.3em] text-gold mb-4">
            Products & Solutions
          </div>
          <h2 className="text-4xl lg:text-6xl font-bold text-foreground">
            One ecosystem. <span className="gradient-text-gold">Seven engines</span> of impact.
          </h2>
          <p className="mt-6 text-lg text-muted-foreground">
            Technology, education, talent, immersive experiences and AI — designed for African
            context, built to global standards.
          </p>
        </motion.div>

        <div className="space-y-28 lg:space-y-36">
          {products.map((p) => {
            const Icon = p.icon;
            const accentBg =
              p.accent === "red"
                ? "bg-(--joat-red) text-primary-foreground glow-red"
                : "bg-(--joat-gold) text-(--joat-navy-deep) glow-gold";
            const accentText = p.accent === "red" ? "text-(--joat-red)" : "text-(--joat-gold)";
            return (
              <motion.div
                key={p.id}
                id={p.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7 }}
              >
                <div
                  className={`grid gap-10 lg:gap-16 items-center ${
                    p.image ? "lg:grid-cols-2" : "lg:grid-cols-1"
                  } ${p.reverse && p.image ? "lg:[&>*:first-child]:order-2" : ""}`}
                >
                  <div>
                    <div className="flex items-center gap-3">
                      {p.logoMark ? (
                        <img
                          src={p.logoMark}
                          alt={`${p.badge} logo`}
                          className="w-11 h-11 rounded-xl object-cover shadow-(--shadow-card) border border-(--glass-border)"
                          loading="lazy"
                        />
                      ) : p.logoLetter ? (
                        <div
                          aria-hidden="true"
                          className={`w-11 h-11 rounded-xl flex items-center justify-center font-display font-bold text-lg shadow-(--shadow-card) border border-(--glass-border) ${
                            p.accent === "red"
                              ? "bg-linear-to-br from-(--joat-red) to-(--joat-red)/70 text-primary-foreground"
                              : "bg-linear-to-br from-(--joat-gold) to-(--joat-gold)/70 text-(--joat-navy-deep)"
                          }`}
                        >
                          {p.logoLetter}
                        </div>
                      ) : null}
                      <div
                        className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold glass ${accentText}`}
                      >
                        <Icon className="w-3.5 h-3.5" /> {p.badge}
                      </div>
                    </div>
                    <h3 className="mt-5 text-3xl lg:text-5xl font-bold text-foreground leading-tight">
                      {p.title}
                    </h3>
                    <p className="mt-4 text-lg text-muted-foreground">{p.tagline}</p>
                    <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                      {p.description}
                    </p>
                    <ul className="mt-6 space-y-2">
                      {p.features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-sm text-foreground/90">
                          <Check className={`w-4 h-4 mt-0.5 shrink-0 ${accentText}`} />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-7 flex flex-wrap gap-3">
                      {p.ctas.map((c, idx) => {
                        const primary = idx === 0;
                        const external = c.href.startsWith("http");
                        return (
                          <a
                            key={c.label}
                            href={c.href}
                            target={external ? "_blank" : undefined}
                            rel={external ? "noreferrer" : undefined}
                            className={`inline-flex items-center gap-2 px-5 py-3 rounded-md font-semibold transition-all hover:brightness-110 ${
                              primary ? accentBg : "glass text-foreground hover:bg-white/8"
                            }`}
                          >
                            <CTAIcon kind={c.icon} />
                            {c.label}
                            {primary && <ArrowRight className="w-4 h-4" />}
                          </a>
                        );
                      })}
                    </div>
                  </div>

                  {p.image && (
                    <div className="relative">
                      <div className="absolute -inset-4 rounded-3xl bg-linear-to-br from-(--joat-gold)/20 via-transparent to-(--joat-red)/20 blur-2xl" />
                      <div className="relative glass rounded-3xl overflow-hidden border border-(--glass-border) shadow-(--shadow-card)">
                        <img
                          src={p.image}
                          alt={`${p.badge} preview`}
                          loading="lazy"
                          width={1200}
                          height={900}
                          className="w-full h-auto object-cover aspect-[4/3]"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {p.extra}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
