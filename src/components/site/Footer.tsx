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
  {
    icon: ShieldCheck,
    title: "ISO 9001",
    text: "Quality management certified across recruitment and digital delivery.",
  },
  {
    icon: Leaf,
    title: "NEMA NCA-1",
    text: "Environmental compliance under Kenya's National Environment Management Authority (Category 1).",
  },
  {
    icon: Receipt,
    title: "KRA Compliant",
    text: "Fully compliant with Kenya Revenue Authority — tax-clean and audit-ready.",
  },
];

export function Footer() {
  return (
    <footer className="relative bg-navy-deep border-t border-white/5 pt-16 pb-10">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4">
            <div className="flex items-center gap-3">
              <img src={logo} alt="JOAT KENYA" className="h-12 w-auto object-contain" />
              <div className="font-display font-bold text-2xl md:text-3xl tracking-tight">
                <span className="text-white">J.O.A.T. </span>
                <span className="text-gold">KENYA</span>
              </div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed max-w-sm">
              Transforming Africa through innovation, talent and digital solutions. Since 1983.
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

          <FooterCol
            title="Company"
            links={[
              { l: "About Us", h: "#about" },
              { l: "Services", h: "#services" },
              { l: "Careers", h: "#careers" },
              { l: "News & Articles", h: "#news" },
              { l: "J.O.A.T. USA", h: EXTERNAL.joatUsa, external: true },
            ]}
          />

          <FooterCol
            title="Solutions"
            links={[
              { l: "BioBiz App", h: "#biobiz" },
              { l: "Majobo Talent", h: "#majobo" },
              { l: "Software Development", h: "#software" },
              { l: "Amare's Big Planet", h: "#amare" },
              { l: "Roblox Game Dev", h: "#games" },
              { l: "AI Marketing", h: "#ai-marketing" },
              { l: "Blender Animation", h: "#blender" },
            ]}
          />

          <div className="lg:col-span-3">
            <h4 className="font-bold text-foreground">Contact</h4>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-3">
                <MapPin className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                Brick Mall, 2nd Floor, Kiambu Road, Thindigua, Kenya
              </li>
              <li className="flex gap-3">
                <Phone className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                +254 142 378 150
              </li>
              <li className="flex gap-3">
                <Mail className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                joatkenya120@gmail.com
              </li>
            </ul>
          </div>
        </div>

        {/* Certifications */}
        <div className="mt-12 pt-8 border-t border-white/5">
          <div className="text-xs uppercase tracking-[0.3em] text-gold mb-4 text-center md:text-left">
            Certifications & Compliance
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {certs.map((c) => (
              <div key={c.title} className="glass rounded-2xl p-5 flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-(--joat-gold)/15 flex items-center justify-center shrink-0">
                  <c.icon className="w-5 h-5 text-(--joat-gold)" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-sm">{c.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{c.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
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
      <h4 className="font-bold text-foreground">{title}</h4>
      <ul className="mt-4 space-y-2 text-sm">
        {links.map((x) => (
          <li key={x.l}>
            <a
              href={x.h}
              target={x.external ? "_blank" : undefined}
              rel={x.external ? "noreferrer" : undefined}
              className="text-muted-foreground hover:text-gold transition-colors"
            >
              {x.l}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
