import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Calendar, Check, Loader2, AlertCircle } from "lucide-react";
import { type ContactPayload } from "@/lib/contact";
import { deliverViaWeb3Forms } from "@/lib/web3forms";
import { SOCIAL_LINKS } from "@/lib/links";
import { openCalendly } from "@/lib/calendly";

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
  "AI Marketing",
  "Animation / Blender",
];

type Status = "idle" | "sending" | "sent" | "error";

export function Contact() {
  const [status, setStatus] = useState<Status>("idle");
  const [serverError, setServerError] = useState<string | null>(null);
  const [form, setForm] = useState({
    first: "",
    last: "",
    email: "",
    area: "General Inquiry",
    message: "",
  });
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

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate() || status === "sending") return;
    setServerError(null);
    setStatus("sending");

    const payload: ContactPayload = {
      first: form.first.trim(),
      last: form.last.trim(),
      email: form.email.trim(),
      area: form.area,
      message: form.message.trim(),
      source: "website",
    };

    // Web3Forms direct from the browser — no server needed.
    const ok = await deliverViaWeb3Forms(payload);
    if (ok) {
      setStatus("sent");
      return;
    }

    setStatus("error");
    setServerError(
      "We couldn't send that just now. Please try again, or email us directly at joatkenya120@gmail.com.",
    );
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
            Whether you're hiring top talent, exploring our products, or partnering on innovation,
            our team is ready to help.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-[1fr_1.1fr] gap-8 mt-12">
          {/* Info + Map */}
          <div className="space-y-6">
            <div className="glass rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-(--joat-red)/15 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-(--joat-gold)" />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-widest text-gold">Headquarters</div>
                  <div className="font-bold text-foreground mt-1">
                    J.O.A.T. The Brick Mall, 2nd Floor
                  </div>
                  <div className="text-sm text-muted-foreground">Kiambu Road, Thindigua, Kenya</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <a
                href="tel:+254142378150"
                className="glass rounded-2xl p-4 sm:p-6 hover:border-(--joat-gold)/40 transition-colors"
              >
                <Phone className="w-5 h-5 text-(--joat-gold) mb-2" />
                <div className="text-[10px] sm:text-xs uppercase tracking-widest text-gold">
                  Direct Line
                </div>
                <div className="font-bold text-foreground mt-1 text-xs sm:text-base break-words">
                  +254 142 378150
                </div>
              </a>
              <a
                href="mailto:joatkenya120@gmail.com"
                className="glass rounded-2xl p-4 sm:p-6 hover:border-(--joat-gold)/40 transition-colors"
              >
                <Mail className="w-5 h-5 text-(--joat-gold) mb-2" />
                <div className="text-[10px] sm:text-xs uppercase tracking-widest text-gold">
                  Email
                </div>
                <div className="font-bold text-foreground mt-1 text-xs sm:text-base break-all">
                  joatkenya120@gmail.com
                </div>
              </a>
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
              <Calendar className="w-5 h-5 text-(--joat-gold)" />
              <div className="flex-1">
                <div className="font-bold text-foreground">Book a 30-min demo</div>
                <div className="text-sm text-muted-foreground">
                  Talk to our team about a solution that fits.
                </div>
              </div>
              <button
                type="button"
                onClick={() => void openCalendly()}
                className="px-4 py-2 rounded-md bg-(--joat-gold) text-(--joat-navy-deep) font-semibold text-sm hover:brightness-110 transition-all cursor-pointer"
              >
                Book
              </button>
            </div>
          </div>

          {/* Form */}
          <form
            onSubmit={submit}
            className="glass rounded-3xl p-4 sm:p-6 lg:p-8 space-y-3 sm:space-y-5"
            noValidate
          >
            {status === "sent" ? (
              <div className="text-center py-10">
                <div className="w-14 h-14 rounded-full bg-(--joat-gold) text-(--joat-navy-deep) mx-auto flex items-center justify-center mb-4">
                  <Check className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">Message received</h3>
                <p className="text-muted-foreground mt-2">
                  Our team will respond within one business day.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setStatus("idle");
                    setServerError(null);
                    setForm({
                      first: "",
                      last: "",
                      email: "",
                      area: "General Inquiry",
                      message: "",
                    });
                  }}
                  className="mt-6 text-sm text-gold underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <Field
                    label="First Name"
                    name="first"
                    value={form.first}
                    onChange={(v) => setForm({ ...form, first: v })}
                    error={errs.first}
                  />
                  <Field
                    label="Last Name"
                    name="last"
                    value={form.last}
                    onChange={(v) => setForm({ ...form, last: v })}
                    error={errs.last}
                  />
                </div>
                <Field
                  label="Email Address"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={(v) => setForm({ ...form, email: v })}
                  error={errs.email}
                />
                <div>
                  <label htmlFor="area" className="text-xs uppercase tracking-widest text-gold">
                    Service Area
                  </label>
                  <select
                    id="area"
                    value={form.area}
                    onChange={(e) => setForm({ ...form, area: e.target.value })}
                    className="mt-1.5 sm:mt-2 w-full px-4 py-2.5 sm:py-3 rounded-md bg-white/5 border border-white/10 text-foreground focus:outline-none focus:border-(--joat-gold)/50"
                  >
                    {services.map((s) => (
                      <option key={s} value={s} className="bg-(--joat-navy-deep)">
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="message" className="text-xs uppercase tracking-widest text-gold">
                    Your Message
                  </label>
                  <textarea
                    id="message"
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    rows={4}
                    className="mt-2 w-full px-4 py-2.5 sm:py-3 rounded-md bg-white/5 border border-white/10 text-foreground focus:outline-none focus:border-(--joat-gold)/50 resize-none"
                  />
                  {errs.message && (
                    <div className="text-xs text-(--joat-red) mt-1">{errs.message}</div>
                  )}
                </div>

                {status === "error" && serverError && (
                  <div
                    role="alert"
                    className="flex items-start gap-2 rounded-md border border-(--joat-red)/40 bg-(--joat-red)/10 px-4 py-3 text-sm text-foreground"
                  >
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-(--joat-red)" />
                    <span>{serverError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="w-full py-3 rounded-md bg-(--joat-red) text-primary-foreground font-bold glow-red hover:brightness-110 transition-all disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                >
                  {status === "sending" ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending…
                    </>
                  ) : (
                    "Send Message"
                  )}
                </button>
                <p className="text-xs text-muted-foreground text-center">
                  By submitting, you agree to our{" "}
                  <a href="/privacy" className="text-gold hover:underline">
                    privacy policy
                  </a>
                  .
                </p>
              </>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  error,
  type = "text",
}: {
  label: string;
  name: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  type?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="text-xs uppercase tracking-widest text-gold">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 sm:mt-2 w-full px-4 py-2.5 sm:py-3 rounded-md bg-white/5 border border-white/10 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-(--joat-gold)/50"
      />
      {error && <div className="text-xs text-(--joat-red) mt-1">{error}</div>}
    </div>
  );
}
