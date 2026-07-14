import { useState } from "react";
import { m, AnimatePresence } from "framer-motion";
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
  ChevronDown,
  Search,
  MapPin,
  MessageSquare,
  Workflow,
  BarChart3,
} from "lucide-react";
import biobiz from "@/assets/biobiz-mock.webp";
import biobizShare from "@/assets/biobiz-share.webp";
import biobizFeatures from "@/assets/biobiz-features.webp";
import biobizRecordings from "@/assets/biobiz-recordings.webp";
import biobizLogo from "@/assets/biobiz-logo.webp";
import { GermanSampleAudio } from "./GermanSampleAudio";
import amare from "@/assets/amare-planet.webp";
import roblox from "@/assets/roblox-world.webp";
import talent from "@/assets/talent.webp";
import majoboLogo from "@/assets/majobo-logo.webp";
import { realEstateVAProducts } from "@/data/real-estate-va";
import type { CTA, Product } from "@/lib/product-types";

const BIOBIZ_PLAY_STORE = "https://play.google.com/store/apps/details?id=com.biobiz.biobiz_mobile";
const BIOBIZ_APP_STORE = "https://apps.apple.com/ke/app/biobiz/id6762440603";

// Detect the visitor's platform and open the matching BioBiz store listing.
// iOS → Apple App Store; Android and desktop → Google Play.
function downloadBioBiz() {
  if (typeof navigator === "undefined") return;
  const ua = navigator.userAgent || navigator.vendor || "";
  const isIOS =
    /iPad|iPhone|iPod/.test(ua) ||
    // iPadOS 13+ reports as a Mac; disambiguate via touch points
    (/Macintosh/.test(ua) && typeof document !== "undefined" && "ontouchend" in document);
  const url = isIOS ? BIOBIZ_APP_STORE : BIOBIZ_PLAY_STORE;
  window.open(url, "_blank", "noreferrer");
}

function CTAIcon({ kind }: { kind?: CTA["icon"] }) {
  if (kind === "download") return <Download className="w-4 h-4" />;
  if (kind === "apple") return <Apple className="w-4 h-4" />;
  if (kind === "external") return <ExternalLink className="w-4 h-4" />;
  return null;
}

const BiobizExtra = (
  <div className="mt-10 grid grid-cols-2 gap-2 sm:gap-5">
    {/* AI summary of recordings */}
    <div className="glass rounded-2xl p-3 sm:p-6">
      <div className="flex items-center gap-2 sm:gap-3 mb-3">
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-(--joat-gold)/15 flex items-center justify-center shrink-0">
          <Mic className="w-4 h-4 sm:w-5 sm:h-5 text-(--joat-gold)" />
        </div>
        <div>
          <div className="text-[10px] sm:text-xs uppercase tracking-widest text-gold">
            AI Meeting Notes
          </div>
          <div className="text-sm sm:text-base font-semibold text-foreground">
            Record → Summarize → Action
          </div>
        </div>
      </div>
      <p className="text-xs sm:text-sm text-muted-foreground">
        BioBiz records meetings, transcribes them, and returns a clean summary with key insights of
        the recordings.
      </p>
      <div className="mt-3 sm:mt-4 rounded-xl bg-muted border border-(--border) p-3 sm:p-4 text-sm">
        <div className="flex items-center gap-2 text-[10px] sm:text-xs text-muted-foreground mb-2">
          <span className="w-2 h-2 rounded-full bg-(--joat-red) animate-pulse" />
          Sample summary
        </div>
        <p className="text-[11px] sm:text-sm text-foreground/90 leading-relaxed">
          <span className="text-gold font-semibold">Topic:</span> Q3 inventory sync with Westlands
          branch. <span className="text-gold font-semibold">Decisions:</span> reorder cycle
          shortened to weekly; M-Pesa float increased.
        </p>
        <ul className="mt-3 space-y-1.5 text-[11px] sm:text-xs text-foreground/80">
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
    <div className="glass rounded-2xl p-3 sm:p-6">
      <div className="flex items-center gap-2 sm:gap-3 mb-3">
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-(--joat-red)/15 flex items-center justify-center shrink-0">
          <Languages className="w-4 h-4 sm:w-5 sm:h-5 text-(--joat-red)" />
        </div>
        <div>
          <div className="text-[10px] sm:text-xs uppercase tracking-widest text-gold">
            Live Translation
          </div>
          <div className="text-sm sm:text-base font-semibold text-foreground">
            Speak any language → read English
          </div>
        </div>
      </div>
      <p className="text-xs sm:text-sm text-muted-foreground">
        Capture a conversation in German, French, Swahili, Mandarin or any supported language. Get a
        clean English transcript instantly.
      </p>
      <div className="mt-3 sm:mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
        <div className="rounded-xl bg-muted border border-(--border) p-3">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
            Recording · German
          </div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-(--joat-red) animate-pulse" />
            <span className="text-xs text-foreground/80">00:42</span>
            <GermanSampleAudio />
          </div>
          <p className="text-[11px] sm:text-xs text-foreground/90 italic leading-relaxed">
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
          <p className="text-[11px] sm:text-xs text-foreground/95 leading-relaxed">
            "We need to expand our distribution to the coastal region before the holiday season."
          </p>
        </div>
      </div>
    </div>

    {/* Screenshots straight from the Play Store listing */}
    <div className="col-span-2 mt-2">
      <div className="mb-5">
        <div className="text-xs uppercase tracking-widest text-gold">Inside the BioBiz app</div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-5">
        {[
          {
            src: biobiz,
            label: "My Card",
            note: "Your digital business card; live views, shares and saves.",
          },
          {
            src: biobizShare,
            label: "Share Card",
            note: "QR + Copy link, Text, Email, WhatsApp, LinkedIn; share anywhere.",
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
            <div className="aspect-square sm:aspect-[3/4] bg-(--joat-navy-deep) flex items-center justify-center overflow-hidden">
              <img
                src={s.src}
                alt={`BioBiz · ${s.label} screen`}
                loading="lazy"
                className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-[1.03]"
              />
            </div>
            <div className="p-3 sm:p-4">
              <div className="text-[11px] sm:text-xs font-semibold text-gold uppercase tracking-wider">
                {s.label}
              </div>
              <p className="text-[11px] sm:text-sm text-muted-foreground mt-1 sm:mt-1.5 leading-relaxed">
                {s.note}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Sample rows shown in the preview placeholder before the live site is loaded.
const majoboJobs = [
  { t: "Web Developer", loc: "Thindigua", tag: "Tech" },
  { t: "Professional Photographer", loc: "Thindigua", tag: "Creative" },
  { t: "Brand Ambassador", loc: "Nairobi", tag: "Marketing" },
  { t: "House Cleaning Services", loc: "Nairobi", tag: "Services" },
];

// Open Majobo in a centered first-party popup window. Login cookies work here
// even in browsers that block third-party cookies inside iframes, while the
// JOAT tab stays open behind the popup.
function openMajoboLogin() {
  if (typeof window === "undefined") return;
  const w = 480;
  const h = 720;
  const left = window.screenX + Math.max(0, (window.outerWidth - w) / 2);
  const top = window.screenY + Math.max(0, (window.outerHeight - h) / 2);
  window.open(
    "https://www.majobokenya.com/",
    "majobo-login",
    `popup,noreferrer,width=${w},height=${h},left=${left},top=${top}`,
  );
}

// Majobo embedded inside JOAT. The live iframe is click-to-load (a facade) so the
// heavy Majobo app never auto-loads on page visit. Until the visitor clicks, we
// show a lightweight static job-board mock. Sign-in routes through a popup
// (openMajoboLogin) because cross-origin iframes can't keep a login session.
function MajoboLiveFrame() {
  const [active, setActive] = useState(false);
  return (
    <div className="relative glass rounded-2xl overflow-hidden border border-(--glass-border)">
      <div className="px-2 sm:px-4 py-2 bg-(--joat-navy-deep) flex items-center gap-1.5 border-b border-(--border)">
        <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-(--joat-red)" />
        <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-(--joat-gold)" />
        <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-foreground/30" />
        <span className="ml-2 sm:ml-3 text-[9px] sm:text-xs text-muted-foreground truncate">
          majobokenya.com
        </span>
        <button
          type="button"
          onClick={openMajoboLogin}
          className="ml-auto shrink-0 text-[10px] sm:text-xs font-semibold text-(--joat-gold) hover:underline"
        >
          Sign in
        </button>
      </div>

      {active ? (
        <iframe
          src="https://www.majobokenya.com/"
          title="Majobo Kenya live"
          referrerPolicy="no-referrer"
          className="w-full h-72 sm:h-[440px] bg-white"
        />
      ) : (
        <button
          type="button"
          onClick={() => setActive(true)}
          aria-label="Load the live Majobo Kenya site"
          className="relative block w-full text-left"
        >
          <div className="p-3 sm:p-4 space-y-2" aria-hidden="true">
            <div className="flex items-center gap-2 rounded-md bg-black/5 px-3 py-2 text-[11px] sm:text-xs text-muted-foreground">
              <Search className="w-3 h-3 shrink-0" /> Search 1,177 opportunities…
            </div>
            {majoboJobs.map((j) => (
              <div
                key={j.t}
                className="rounded-md bg-black/5 px-3 py-2 flex items-center justify-between gap-2 text-[11px] sm:text-xs"
              >
                <div className="min-w-0">
                  <div className="font-semibold text-foreground truncate">{j.t}</div>
                  <div className="flex items-center gap-1 text-muted-foreground mt-0.5">
                    <MapPin className="w-2.5 h-2.5 shrink-0" /> {j.loc}
                  </div>
                </div>
                <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-gold shrink-0">
                  {j.tag}
                </span>
              </div>
            ))}
          </div>
          <span className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-(--joat-navy-deep)/90 text-center px-5">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-(--joat-gold) text-(--joat-navy-deep) text-sm font-semibold">
              <Play className="w-4 h-4 fill-current" /> Open live Majobo
            </span>
            <span className="text-[11px] text-foreground/85 max-w-[16rem] leading-relaxed">
              Loads only when you click, so this page stays fast.
            </span>
          </span>
        </button>
      )}
    </div>
  );
}

const MajoboExtra = (
  <div className="mt-10 grid lg:grid-cols-5 gap-5 lg:items-stretch">
    <div className="lg:col-span-3 glass rounded-2xl p-4 sm:p-6">
      <div className="text-xs uppercase tracking-widest text-gold mb-2">How AI powers Majobo</div>
      <h4 className="text-lg sm:text-xl font-bold text-foreground leading-tight">
        From free-form posts to structured opportunity.
      </h4>
      {/* talent.jpg floats inside the paragraph on mobile/tablet so the text wraps around it */}
      <img
        src={talent}
        alt="Majobo talent"
        loading="lazy"
        className="lg:hidden float-right w-2/5 ml-3 mb-2 rounded-xl object-cover aspect-square border border-(--glass-border)"
      />
      <p className="text-sm text-muted-foreground mt-2 sm:mt-3 leading-relaxed">
        Anyone can post work (cleaning, photography, web dev, brand ambassadorship) in plain
        language. Majobo's AI reads each post, infers the role, skills required and location, then
        auto-classifies it into the right category and surfaces it to nearby workers. The result:
        1,000+ active opportunities, searchable like a structured job board, with no manual tagging.
      </p>
      <ul className="clear-both mt-3 sm:mt-4 grid sm:grid-cols-2 gap-1.5 sm:gap-2 text-[11px] sm:text-sm">
        {[
          "AI-driven category inference",
          "Hyper-local matching",
          "Flexible: gig, contract, permanent",
        ].map((f) => (
          <li key={f} className="flex items-start gap-2 text-foreground/90">
            <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 mt-0.5 shrink-0 text-(--joat-red)" />
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <div className="mt-4 sm:mt-5 flex flex-wrap gap-2">
        {[
          "Cleaning & Laundry",
          "Events & Entertainment",
          "Gardening & Landscaping",
          "Professional Services",
          "Tech & Web",
          "Property Management",
        ].map((c) => (
          <span
            key={c}
            className="text-[11px] sm:text-xs px-2.5 sm:px-3 py-1 rounded-full glass text-foreground/80"
          >
            {c}
          </span>
        ))}
      </div>
    </div>

    <div className="lg:col-span-2 relative">
      <MajoboLiveFrame />
    </div>
  </div>
);

const AmareVideos = [
  {
    id: "Vz0nkXFQ6Xg",
    label: "Featured episode",
    note: "Learn Letter Y with Yak, Yacht & Yo-Yo, an ABC phonics adventure.",
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
    <div className="mb-4">
      <div className="text-xs uppercase tracking-widest text-gold">Featured on YouTube</div>
      <h4 className="text-xl font-bold text-foreground">Watch Amare's Big Planet</h4>
    </div>
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5">
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
      "Explore a vast world to collect all 26 letters of the alphabet while dodging deadly energy waves and mysterious Collectors. Use safe zones, earn fly charges, and climb the all-time leaderboard. Full mobile support included.",
  },
  {
    src: "/videos/abyss.mp4",
    title: "Abyss",
    tag: "Roblox · Underwater exploration",
    description:
      "Dive through evolving underwater zones (bright Coral Reefs, eerie Kelp Forests, the haunting Deep Sea and ancient Sunken Ruins) where each unlocked level reveals deeper, more dangerous waters. Collect items, manage oxygen and uncover what lies beneath the surface.",
  },
];

function RobloxBuilds() {
  // Each card tracks its own open state so the arrows act independently —
  // expanding one build never opens or resizes the other.
  const [open, setOpen] = useState<Record<number, boolean>>({});
  return (
    <div className="mt-10">
      <div className="flex items-center gap-3 mb-4">
        <Gamepad2 className="w-5 h-5 text-gold" />
        <h4 className="text-xl font-bold text-foreground">Selected Roblox builds</h4>
      </div>
      <div className="grid grid-cols-2 items-start gap-3 sm:gap-5">
        {featuredGames.map((g, idx) => {
          const isOpen = !!open[idx];
          return (
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
                  Live build
                </div>
              </div>
              <div className="p-3 sm:p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-bold text-foreground text-sm sm:text-lg leading-tight">
                      {g.title}
                    </div>
                    <div className="text-[10px] sm:text-xs text-(--joat-gold) uppercase tracking-wider mt-0.5">
                      {g.tag}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOpen((o) => ({ ...o, [idx]: !o[idx] }))}
                    aria-expanded={isOpen}
                    aria-label={isOpen ? `Hide ${g.title} description` : `Read about ${g.title}`}
                    className="shrink-0 w-7 h-7 rounded-full glass flex items-center justify-center text-(--joat-gold) hover:bg-black/5"
                  >
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                </div>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <m.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <p className="text-[11px] sm:text-sm text-muted-foreground mt-2 leading-relaxed">
                        {g.description}
                      </p>
                    </m.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const BlenderExtra = (
  <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-5">
    <div className="glass rounded-2xl p-3 sm:p-6">
      <div className="text-[10px] sm:text-xs uppercase tracking-widest text-gold mb-2">
        3D pipeline
      </div>
      <h4 className="text-sm sm:text-xl font-bold text-foreground leading-tight">
        Animations built in Blender
      </h4>
      <p className="text-[11px] sm:text-sm text-muted-foreground mt-2 leading-relaxed">
        We use Blender end-to-end (modeling, rigging, lighting, render) to deliver film-quality
        assets that double as game characters, classroom explainers, and brand identity systems.
      </p>
    </div>
    <div className="glass rounded-2xl p-3 sm:p-6">
      <div className="text-[10px] sm:text-xs uppercase tracking-widest text-gold mb-2">
        In production
      </div>
      <h4 className="text-sm sm:text-xl font-bold text-foreground leading-tight">
        Drawalette: a kids' drawing game
      </h4>
      <p className="text-[11px] sm:text-sm text-muted-foreground mt-2 leading-relaxed">
        A game we're building from Blender assets: children learn the alphabet by tracing each
        letter, the character cheers them on, and progress unlocks new worlds. Built for tablets,
        designed for early-years curricula worldwide.
      </p>
      <ul className="mt-3 sm:mt-4 space-y-1.5 text-[11px] sm:text-sm">
        {[
          "Stroke-order recognition (A–Z)",
          "Voice cues",
          "Reward system tied to literacy milestones",
        ].map((f) => (
          <li key={f} className="flex items-start gap-2 text-foreground/90">
            <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 mt-0.5 shrink-0 text-(--joat-gold)" />
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
    title: "Your business card, reimagined, with AI in your pocket.",
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
    ctas: [{ label: "Download BioBiz", href: "#", icon: "download", action: "download-biobiz" }],
    image: biobiz,
    accent: "gold",
    extra: BiobizExtra,
    logoMark: biobizLogo,
  },
  /* Majobo Kenya (talent outsourcing) — disabled; kept for easy re-enabling.
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
    hideImageOnMobile: true,
  },
  */
  {
    id: "software",
    badge: "Software Development",
    title: "Built by an engineering team that delivers.",
    tagline: "Production-grade mobile, web and AI products, built in-house.",
    description:
      "BioBiz is a proof point of how we work: real product, real users, real delivery cadence. From native mobile (Flutter, React Native) to AI integrations (Claude, OpenRouter) to backend (Supabase, Cloudflare Workers), we build software the way modern tech companies do, and we partner with organizations who want the same engineering culture without hiring a full team.",
    features: [
      "Native mobile + web with shared design systems",
      "AI integrations: transcription, translation, agentic flows",
      "Edge backends on Cloudflare Workers + Supabase",
      "From discovery to launch in weeks, not quarters",
    ],
    ctas: [{ label: "Talk to Engineering Team", href: "/contact" }],
    icon: Boxes,
    accent: "gold",
  },
  /* Amare's Big Planet — repositioned as a "Selected client" section (see render below); full product card disabled.
     Game Development · Roblox — disabled; kept for easy re-enabling.
  {
    id: "amare",
    badge: "Amare's Big Planet · Digital Education",
    title: "A story-driven world where African kids learn to dream big.",
    tagline: "Animated YouTube series for ages 1–8 celebrating African culture & curiosity.",
    description:
      "Amare's Big Planet is our flagship educational property, a colorful, story-led YouTube universe that turns reading, science and life skills into adventures rooted in African identity. Watch on YouTube; the production pipeline feeds directly into our games and classroom programs.",
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
    mobileInlineImage: true,
  },
  {
    id: "games",
    badge: "Game Development · Roblox",
    title: "Professional game studios, built using Roblox.",
    tagline: "Original Roblox titles and bespoke worlds, delivered end-to-end by the tech team.",
    description:
      "We are professional game developers. Our Roblox studio designs, builds and launches original titles, brand-activated worlds and custom multiplayer experiences, from concept and 3D art through scripting, monetization and live ops.",
    features: [
      "Original Roblox titles + bespoke client builds",
      "Full studio pipeline: 3D art, scripting, FX, audio",
      "Multiplayer architecture and live operations",
      "Brand-activated immersive worlds for partners",
    ],
    ctas: [{ label: "Commission a build", href: "/contact" }],
    image: roblox,
    icon: Gamepad2,
    accent: "gold",
    extra: <RobloxBuilds />,
    mobileInlineImage: true,
  },
  */
  {
    id: "ai-marketing",
    badge: "AI Marketing",
    title: "Campaigns at the speed of prompts.",
    tagline: "Generative imagery and copy pipelines powered by Claude + OpenRouter.",
    description:
      "We orchestrate Claude, OpenRouter and image models into production marketing pipelines: brand-consistent posts, multi-format campaigns and on-trend creative, generated in hours rather than weeks. Perfect for product launches, social-first brands and budget-conscious growth teams.",
    features: [
      "Brand-tuned image generation",
      "AI-written captions, hooks & ad variants",
      "Multi-platform output (IG, TikTok, LinkedIn, X)",
      "Performance loops: regenerate from what's working",
    ],
    ctas: [{ label: "See campaigns", href: "/contact" }],
    accent: "red",
    reverse: true,
  },
  {
    id: "blender",
    badge: "Animation · Blender",
    title: "3D animation that teaches and plays.",
    tagline: "Production-quality 3D in Blender, repurposed into games, ads and classrooms.",
    description:
      "Our Blender pipeline produces characters, sets and motion that flow into multiple products, most recently a kids' game where children learn the alphabet by drawing each letter alongside an animated Blender character that cheers them on.",
    features: [
      "Character modeling, rigging & animation",
      "Render pipelines feeding into Roblox / game engines",
      "Brand explainers and product motion",
      "Tablet-ready letter-drawing game in production",
    ],
    ctas: [{ label: "Commission a build", href: "/contact" }],
    accent: "gold",
    extra: BlenderExtra,
  },
  ...realEstateVAProducts,
  {
    id: "ai-content-studio",
    badge: "AI Content & Copy Studio",
    title: "Your team, drafting at the speed of a prompt.",
    tagline: "Self-serve AI content generation, tuned to your brand voice.",
    description:
      "Where AI Marketing is us running the campaign for you, Content Studio is the tool itself, handed to your team: brand-tuned prompts that turn a rough idea into blog posts, ad copy and landing pages in minutes, ready to edit and publish.",
    features: [
      "Prompt-tuned to your brand voice",
      "Blog posts, ad copy & landing pages in minutes",
      "Multi-language output",
      "Editable exports to your CMS",
    ],
    ctas: [{ label: "Try Content Studio", href: "/contact" }],
    icon: Sparkles,
    accent: "red",
  },
  {
    id: "ai-chatbot",
    badge: "AI Support Chatbot",
    title: "A support agent that never sleeps.",
    tagline: "Claude-powered chat for customer support and lead qualification.",
    description:
      "We train a Claude-powered chatbot on your docs, FAQs and product catalog, then embed it on your website or WhatsApp. It answers customer questions on-brand, qualifies leads, and hands off to your team the moment a conversation needs a human.",
    features: [
      "Trained on your docs & FAQs",
      "Lead qualification with handoff to sales",
      "Embeds on your website or WhatsApp",
      "Built on Claude for accurate, on-brand answers",
    ],
    ctas: [{ label: "Deploy a chatbot", href: "/contact" }],
    icon: MessageSquare,
    accent: "gold",
    reverse: true,
  },
  {
    id: "ai-automation",
    badge: "AI Workflow Automation",
    title: "The busywork, running itself.",
    tagline: "Automating data entry, invoicing and email triage across your stack.",
    description:
      "We map your repetitive back-office work, data entry, invoicing, email triage, report generation, and automate it with custom integrations across the tools you already use, with human-in-the-loop checkpoints wherever a decision still needs a person.",
    features: [
      "Data entry, invoicing & email triage automated",
      "Custom integrations across your existing tools",
      "Human-in-the-loop approval checkpoints",
      "Built to cut operational hours, not just tasks",
    ],
    ctas: [{ label: "Automate a workflow", href: "/contact" }],
    icon: Workflow,
    accent: "red",
  },
  {
    id: "ai-meeting-agent",
    badge: "AI Meeting & Notes Agent",
    title: "Every meeting, captured, summarized, actioned.",
    tagline: "The recording, transcription and translation engine behind BioBiz, standalone.",
    description:
      "For teams that don't need a full BioBiz card but want the AI behind it: record any meeting, get an instant summary with action items, and read foreign-language conversations translated into English in real time.",
    features: [
      "Record, transcribe & summarize any meeting",
      "Foreign-language → English live translation",
      "Action items extracted automatically",
      "The same engine that powers BioBiz, standalone",
    ],
    ctas: [{ label: "Bring AI notes to your team", href: "/contact" }],
    icon: Mic,
    accent: "gold",
  },
  {
    id: "ai-analytics",
    badge: "AI Analytics & Insights",
    title: "Dashboards that tell you what to do next.",
    tagline: "Predictive reporting and plain-language insights from your existing data.",
    description:
      "We turn the data you already have, sales, ops, marketing, into dashboards that go beyond charts: predictive trend detection and plain-language summaries, delivered as a digest so your team acts on insight instead of hunting for it.",
    features: [
      "Custom dashboards from your existing data",
      "Predictive reporting & trend detection",
      "Plain-language summaries, not just charts",
      "Automated weekly or monthly digest",
    ],
    ctas: [{ label: "Get analytics for your data", href: "/contact" }],
    icon: BarChart3,
    accent: "red",
    reverse: true,
  },
];

/** Renders a single product entry — the hero, badge, feature list and CTAs.
 * Exported so standalone landing pages (e.g. /real-estate-virtual-assistant)
 * can reuse the exact same card for a product line that also lives here. */
export function ProductCard({ p }: { p: Product }) {
  const Icon = p.icon;
  const accentBg =
    p.accent === "red"
      ? "bg-(--joat-red) text-primary-foreground glow-red"
      : "bg-(--joat-gold) text-(--joat-navy-deep) glow-gold";
  const accentText = p.accent === "red" ? "text-(--joat-red)" : "text-(--joat-gold)";
  return (
    <m.div
      id={p.id}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.7 }}
    >
      <div
        className={`grid gap-8 lg:gap-16 items-start lg:items-center ${
          p.image ? "lg:grid-cols-2" : "lg:grid-cols-1"
        } ${p.reverse && p.image ? "lg:[&>*:first-child]:order-2" : ""}`}
      >
        <div>
          {/* Floated image so the paragraph wraps around it (mobile/tablet only) */}
          {p.image && p.mobileInlineImage && (
            <img
              src={p.image}
              alt={`${p.badge} preview`}
              loading="lazy"
              className="lg:hidden float-right w-2/5 ml-3 mb-2 rounded-xl object-cover aspect-square border border-(--glass-border) shadow-(--shadow-card)"
            />
          )}
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
                    ? "bg-(--joat-red) text-primary-foreground"
                    : "bg-(--joat-gold) text-(--joat-navy-deep)"
                }`}
              >
                {p.logoLetter}
              </div>
            ) : null}
            <div
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold glass ${accentText}`}
            >
              {Icon ? <Icon className="w-3.5 h-3.5" /> : null}
              {p.badge}
            </div>
          </div>
          <h3 className="mt-5 text-2xl sm:text-3xl lg:text-5xl font-bold text-foreground leading-tight">
            {p.title}
          </h3>
          <p className="mt-3 sm:mt-4 text-base sm:text-lg text-muted-foreground">{p.tagline}</p>
          <p className="mt-3 sm:mt-4 text-sm text-muted-foreground leading-relaxed">
            {p.description}
          </p>
          <ul className="clear-both mt-6 space-y-2">
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
              const cls = `inline-flex items-center gap-2 rounded-md font-semibold transition-all hover:brightness-110 cursor-pointer ${
                p.mobileInlineImage ? "px-4 py-2 text-sm sm:px-5 sm:py-3 sm:text-base" : "px-5 py-3"
              } ${primary ? accentBg : "glass text-foreground hover:bg-black/5"}`;
              if (c.action === "download-biobiz") {
                return (
                  <button key={c.label} type="button" onClick={downloadBioBiz} className={cls}>
                    <CTAIcon kind={c.icon} />
                    {c.label}
                    {primary && <ArrowRight className="w-4 h-4" />}
                  </button>
                );
              }
              return (
                <a
                  key={c.label}
                  href={c.href}
                  target={external ? "_blank" : undefined}
                  rel={external ? "noreferrer" : undefined}
                  className={cls}
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
          <div
            className={`relative ${
              p.hideImageOnMobile || p.mobileInlineImage ? "hidden lg:block" : ""
            }`}
          >
            <div className="relative glass rounded-2xl sm:rounded-3xl overflow-hidden border border-(--glass-border) shadow-(--shadow-card)">
              <img
                src={p.image}
                alt={`${p.badge} preview`}
                loading="lazy"
                width={1200}
                height={900}
                className={`w-full h-auto object-cover ${
                  p.mobileInlineImage ? "aspect-square sm:aspect-[4/3]" : "aspect-[4/3]"
                }`}
              />
            </div>
          </div>
        )}
      </div>

      {p.extra}
    </m.div>
  );
}

export function Products() {
  return (
    <section id="products" className="relative pt-24 lg:pt-32 pb-14 lg:pb-20 bg-navy-deep">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <m.div
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
            One ecosystem. <span className="gradient-text-gold">Many engines</span> of impact.
          </h2>
          <p className="mt-6 text-lg text-muted-foreground">
            Software, AI, digital marketing and media content, engineered to global standards.
          </p>
        </m.div>

        <div className="space-y-28 lg:space-y-36">
          {products.map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>

        {/* Selected client — Amare's Big Planet (compact) */}
        <m.div
          id="amare"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-24 lg:mt-32 max-w-3xl mx-auto"
        >
          <div className="text-center mb-6">
            <div className="text-xs uppercase tracking-[0.3em] text-gold mb-2">Selected Client</div>
            <h3 className="text-2xl lg:text-3xl font-bold text-foreground">Amare's Big Planet</h3>
          </div>
          <div className="glass rounded-2xl p-5 sm:p-6 flex items-center gap-4 sm:gap-6">
            <img
              src={amare}
              alt="Amare's Big Planet"
              loading="lazy"
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover border border-(--glass-border) shrink-0"
            />
            <div className="min-w-0">
              <div className="text-[11px] uppercase tracking-wider text-gold">
                Children's Digital Education
              </div>
              <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                An animated children's series we partner with on content and production.
              </p>
              <a
                href="https://www.youtube.com/@amaresbigplanet/featured"
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-(--joat-gold) hover:underline"
              >
                Watch on YouTube <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </m.div>
      </div>
    </section>
  );
}
