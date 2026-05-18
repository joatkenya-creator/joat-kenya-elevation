import { Linkedin, Twitter, Instagram, MapPin, Phone, Mail } from "lucide-react";
import logo from "@/assets/joat-logo.png";

export function Footer() {
  return (
    <footer className="relative bg-navy-deep border-t border-white/5 pt-16 pb-10">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4">
            <div className="flex items-center gap-3">
              <img src={logo} alt="JOAT KENYA" className="h-10 w-10 object-contain" />
              <div className="font-semibold text-lg">
                <span className="gradient-text-red">J.O.A.T</span> <span className="text-gold">KENYA</span>
              </div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed max-w-sm">
              Transforming Africa through innovation, talent and digital solutions. Since 1983.
            </p>
            <div className="mt-5 flex gap-3">
              {[Linkedin, Twitter, Instagram].map((Icon, i) => (
                <a key={i} href="#" aria-label="Social" className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-white/10">
                  <Icon className="w-4 h-4 text-foreground" />
                </a>
              ))}
            </div>
          </div>

          <FooterCol title="Company" links={[
            { l: "About Us", h: "#about" },
            { l: "Services", h: "#services" },
            { l: "Careers", h: "#careers" },
            { l: "News & Articles", h: "#news" },
          ]} />

          <FooterCol title="Solutions" links={[
            { l: "Biobiz App", h: "#products" },
            { l: "Majobo Talent", h: "#products" },
            { l: "Digital Education", h: "#products" },
            { l: "Amare's Big Planet", h: "#products" },
            { l: "Roblox Game Dev", h: "#products" },
          ]} />

          <div className="lg:col-span-3">
            <h4 className="font-bold text-foreground">Contact</h4>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-3"><MapPin className="w-4 h-4 text-gold shrink-0 mt-0.5" />Brick Mall, 2nd Floor, Kiambu Road, Thindigua, Kenya</li>
              <li className="flex gap-3"><Phone className="w-4 h-4 text-gold shrink-0 mt-0.5" />+254 729 265 333</li>
              <li className="flex gap-3"><Mail className="w-4 h-4 text-gold shrink-0 mt-0.5" />hello@joatkenya.com</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <div>© {new Date().getFullYear()} J.O.A.T. Kenya. All rights reserved.</div>
          <div className="flex gap-5">
            <a href="#" className="hover:text-gold">Privacy</a>
            <a href="#" className="hover:text-gold">Terms</a>
            <a href="#" className="hover:text-gold">Compliance</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { l: string; h: string }[] }) {
  return (
    <div className="lg:col-span-2">
      <h4 className="font-bold text-foreground">{title}</h4>
      <ul className="mt-4 space-y-2 text-sm">
        {links.map((x) => (
          <li key={x.l}><a href={x.h} className="text-muted-foreground hover:text-gold transition-colors">{x.l}</a></li>
        ))}
      </ul>
    </div>
  );
}
