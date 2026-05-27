import {
  Linkedin,
  Instagram,
  Youtube,
  Facebook,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  Leaf,
  Receipt,
} from "lucide-react";
import logo from "@/assets/joat-logo.png";
import { EXTERNAL, LEGAL_LINKS } from "@/lib/links";

const socials: { Icon: typeof Linkedin; href: string; label: string }[] = [
  {
    Icon: Linkedin,
    href: "https://www.linkedin.com/company/joat-kenya-jack-urban-services-ltd/posts/?feedView=all",
    label: "LinkedIn",
  },
  {
    Icon: Instagram,
    href: "https://www.instagram.com/joat.kenya?igsh=MXZraTR5enF4OTVpaQ==",
    label: "Instagram",
  },
  {
    Icon: Facebook,
    href: "https://www.facebook.com/profile.php?id=61581326003888",
    label: "Facebook",
  },
  {
    Icon: Youtube,
    href: "https://www.youtube.com/results?search_query=joat+kenya",
    label: "YouTube",
  },
];

const certs = [
  { icon: ShieldCheck, title: "ISO 9001" },
  { icon: Leaf, title: "NEMA NCA-1" },
  { icon: Receipt, title: "KRA Compliant" },
];

export function Footer() {
  return (
    <footer className="relative bg-navy-deep border-t border-white/5 pt-12 pb-10">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        {/* Certifications — titles only, top of footer */}
        <div className="flex flex-wrap items-center justify-center gap-3 pb-10 mb-10 border-b border-white/5">
          <span className="text-[11px] uppercase tracking-[0.3em] text-gold mr-1">Certified</span>
          {certs.map((c) => (
            <span
              key={c.title}
              className="inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-sm font-semibold text-foreground"
            >
              <c.icon className="w-4 h-4 text-(--joat-gold)" />
              {c.title}
            </span>
          ))}
        </div>

        <div className="grid lg:grid-cols-12 gap-8 lg:gap-10">
          <div className="lg:col-span-4">
            <div className="flex items-center gap-3">
              <img src={logo} alt="JOAT KENYA" className="h-10 sm:h-12 w-auto object-contain" />
              <div className="font-display font-bold text-xl sm:text-2xl md:text-3xl tracking-tight">
                <span className="text-white">J.O.A.T. </span>
                <span className="text-gold">KENYA</span>
              </div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed max-w-sm">
              Transforming the world through innovation and digital solutions. Since 1983.
            </p>
            <div className="mt-5 flex gap-3">
              {socials.map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-white/10 transition-colors"
                >
                  <Icon className="w-4 h-4 text-foreground" />
                </a>
              ))}
            </div>
          </div>

          {/* Company / Solutions / Contact: 3-up on mobile, flow into the 12-col grid on desktop */}
          <div className="grid grid-cols-3 gap-4 lg:contents">
            <FooterCol
              title="Company"
              links={[
                { l: "About Us", h: "/about" },
                { l: "Services", h: "/services" },
                { l: "Careers", h: "/careers" },
                { l: "News & Articles", h: "/news" },
                { l: "Contact", h: "/contact" },
                { l: "J.O.A.T. USA", h: EXTERNAL.joatUsa, external: true },
              ]}
            />

            <FooterCol
              title="Solutions"
              links={[
                { l: "BioBiz App", h: "#biobiz" },
                { l: "Software Development", h: "#software" },
                { l: "AI Marketing", h: "#ai-marketing" },
                { l: "Blender Animation", h: "#blender" },
              ]}
            />

            <div className="lg:col-span-3">
              <h4 className="font-bold text-foreground text-sm sm:text-base">Contact</h4>
              <ul className="mt-3 sm:mt-4 space-y-2 sm:space-y-3 text-xs sm:text-sm text-muted-foreground">
                <li className="flex gap-2 sm:gap-3">
                  <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gold shrink-0 mt-0.5" />
                  <span className="wrap-break-word">
                    Brick Mall, 2nd Floor, Kiambu Road, Thindigua, Kenya
                  </span>
                </li>
                <li className="flex gap-2 sm:gap-3">
                  <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gold shrink-0 mt-0.5" />
                  <span className="wrap-break-word">+254 142 378 150</span>
                </li>
                <li className="flex gap-2 sm:gap-3">
                  <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gold shrink-0 mt-0.5" />
                  <span className="break-all">joatkenya120@gmail.com</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <div>© {new Date().getFullYear()} J.O.A.T. Kenya. All rights reserved.</div>
          <div className="flex gap-5">
            <a href={LEGAL_LINKS.privacy} className="hover:text-gold transition-colors">
              Privacy
            </a>
            <a href={LEGAL_LINKS.terms} className="hover:text-gold transition-colors">
              Terms
            </a>
            <a href={LEGAL_LINKS.compliance} className="hover:text-gold transition-colors">
              Compliance
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { l: string; h: string; external?: boolean }[];
}) {
  return (
    <div className="lg:col-span-2">
      <h4 className="font-bold text-foreground text-sm sm:text-base">{title}</h4>
      <ul className="mt-3 sm:mt-4 space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
        {links.map((x) => (
          <li key={x.l}>
            <a
              href={x.h}
              target={x.external ? "_blank" : undefined}
              rel={x.external ? "noreferrer" : undefined}
              className="text-muted-foreground hover:text-gold transition-colors wrap-break-word"
            >
              {x.l}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
