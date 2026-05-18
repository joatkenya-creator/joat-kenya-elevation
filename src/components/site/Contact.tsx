import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Linkedin, Twitter, Instagram, Calendar, Check } from "lucide-react";

const services = [
  "General Inquiry",
  "Talent Sourcing & Headhunting",
  "Staffing & Workforce Solutions",
  "Executive Search",
  "Talent Management & Representation",
  "Creative & Influencer Management",
  "Biobiz / Product Inquiry",
  "Digital Education & Training",
  "Game Development (Roblox)",
];

export function Contact() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ first: "", last: "", email: "", area: "General Inquiry", message: "" });
  const [errs, setErrs] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.first.trim()) e.first = "Required";
    if (!form.last.trim()) e.last = "Required";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) e.email = "Valid email required";
    if (form.message.trim().length < 10) e.message = "Tell us a bit more (10+ chars)";
    setErrs(e);
    return Object.keys(e).length === 0;
  };

  const submit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setSent(true);
  };

  return (
    <section id="contact" className="relative py-24 lg:py-32 bg-navy-deep">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl"
        >
          <div className="text-xs uppercase tracking-[0.3em] text-gold mb-4">Contact</div>
          <h2 className="text-4xl lg:text-6xl font-bold text-foreground">
            Let's build <span className="gradient-text-gold">something great.</span>
          </h2>
          <p className="mt-6 text-lg text-muted-foreground">
            Whether you're hiring top talent, exploring our products, or partnering on innovation —
            our team is ready to help.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-[1fr_1.1fr] gap-8 mt-12">
          {/* Info + Map */}
          <div className="space-y-6">
            <div className="glass rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-[var(--joat-red)]/15 flex items-center justify-center"><MapPin className="w-5 h-5 text-[var(--joat-gold)]" /></div>
                <div>
                  <div className="text-xs uppercase tracking-widest text-gold">Headquarters</div>
                  <div className="font-bold text-foreground mt-1">J.O.A.T. The Brick Mall, 2nd Floor</div>
                  <div className="text-sm text-muted-foreground">Kiambu Road, Thindigua, Kenya</div>
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="glass rounded-2xl p-6">
                <Phone className="w-5 h-5 text-[var(--joat-gold)] mb-2" />
                <div className="text-xs uppercase tracking-widest text-gold">Direct Line</div>
                <div className="font-bold text-foreground mt-1">+254 729 265 333</div>
              </div>
              <div className="glass rounded-2xl p-6">
                <Mail className="w-5 h-5 text-[var(--joat-gold)] mb-2" />
                <div className="text-xs uppercase tracking-widest text-gold">Email</div>
                <div className="font-bold text-foreground mt-1">hello@joatkenya.com</div>
              </div>
            </div>

            <div className="glass rounded-2xl overflow-hidden">
              <iframe
                title="JOAT Kenya HQ"
                src="https://www.google.com/maps?q=Kiambu+Road+Thindigua+Kenya&output=embed"
                className="w-full h-64 grayscale brightness-75 contrast-110"
                loading="lazy"
              />
            </div>

            <div className="glass rounded-2xl p-6 flex items-center gap-4">
              <Calendar className="w-5 h-5 text-[var(--joat-gold)]" />
              <div className="flex-1">
                <div className="font-bold text-foreground">Book a 30-min demo</div>
                <div className="text-sm text-muted-foreground">Talk to our team about a solution that fits.</div>
              </div>
              <a href="#" className="px-4 py-2 rounded-md bg-[var(--joat-gold)] text-[var(--joat-navy-deep)] font-semibold text-sm">Book</a>
            </div>

            <div className="flex gap-3">
              {[Linkedin, Twitter, Instagram].map((Icon, i) => (
                <a key={i} href="#" aria-label="Social" className="w-11 h-11 rounded-full glass flex items-center justify-center hover:bg-white/10 transition-colors">
                  <Icon className="w-4 h-4 text-foreground" />
                </a>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={submit} className="glass rounded-3xl p-6 lg:p-8 space-y-5">
            {sent ? (
              <div className="text-center py-10">
                <div className="w-14 h-14 rounded-full bg-[var(--joat-gold)] text-[var(--joat-navy-deep)] mx-auto flex items-center justify-center mb-4">
                  <Check className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">Message received</h3>
                <p className="text-muted-foreground mt-2">Our team will respond within one business day.</p>
                <button type="button" onClick={() => { setSent(false); setForm({ first:"",last:"",email:"",area:"General Inquiry",message:"" }); }} className="mt-6 text-sm text-gold underline">Send another message</button>
              </div>
            ) : (
              <>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="First Name" name="first" value={form.first} onChange={(v) => setForm({ ...form, first: v })} error={errs.first} />
                  <Field label="Last Name" name="last" value={form.last} onChange={(v) => setForm({ ...form, last: v })} error={errs.last} />
                </div>
                <Field label="Email Address" name="email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} error={errs.email} />
                <div>
                  <label className="text-xs uppercase tracking-widest text-gold">Service Area</label>
                  <select
                    value={form.area}
                    onChange={(e) => setForm({ ...form, area: e.target.value })}
                    className="mt-2 w-full px-4 py-3 rounded-md bg-white/5 border border-white/10 text-foreground focus:outline-none focus:border-[var(--joat-gold)]/50"
                  >
                    {services.map((s) => <option key={s} value={s} className="bg-[var(--joat-navy-deep)]">{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-gold">Your Message</label>
                  <textarea
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    rows={5}
                    className="mt-2 w-full px-4 py-3 rounded-md bg-white/5 border border-white/10 text-foreground focus:outline-none focus:border-[var(--joat-gold)]/50 resize-none"
                  />
                  {errs.message && <div className="text-xs text-[var(--joat-red)] mt-1">{errs.message}</div>}
                </div>
                <button type="submit" className="w-full py-3 rounded-md bg-[var(--joat-red)] text-primary-foreground font-bold glow-red hover:brightness-110 transition-all">
                  Send Message
                </button>
                <p className="text-xs text-muted-foreground text-center">By submitting, you agree to our privacy policy.</p>
              </>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}

function Field({ label, name, value, onChange, error, type = "text" }: {
  label: string; name: string; value: string; onChange: (v: string) => void; error?: string; type?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="text-xs uppercase tracking-widest text-gold">{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full px-4 py-3 rounded-md bg-white/5 border border-white/10 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[var(--joat-gold)]/50"
      />
      {error && <div className="text-xs text-[var(--joat-red)] mt-1">{error}</div>}
    </div>
  );
}
