import { Linkedin, Twitter, Instagram, Youtube, MapPin, Phone, Mail } from "lucide-react";
import logo from "@/assets/joat-logo.png";
import { SOCIAL_LINKS, EXTERNAL, LEGAL_LINKS } from "@/lib/links";

const socials: { Icon: typeof Linkedin; href: string; label: string }[] = [
  { Icon: Linkedin, href: SOCIAL_LINKS.linkedin, label: "LinkedIn" },
  { Icon: Twitter, href: SOCIAL_LINKS.twitter, label: "Twitter / X" },
  { Icon: Instagram, href: SOCIAL_LINKS.instagram, label: "Instagram" },
  { Icon: Youtube, href: SOCIAL_LINKS.youtube, label: "YouTube" },
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
