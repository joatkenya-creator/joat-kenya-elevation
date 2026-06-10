import { useState } from "react";
import { m } from "framer-motion";
import {
  MapPin,
  Phone,
  Mail,
  Calendar,
  Check,
  Loader2,
  AlertCircle,
  Paperclip,
  X,
} from "lucide-react";
import { type ContactPayload } from "@/lib/contact";
import { deliverViaWeb3Forms } from "@/lib/web3forms";
import { SOCIAL_LINKS } from "@/lib/links";
import { openCalendly } from "@/lib/calendly";
import { supabase, UPLOADS_BUCKET } from "@/lib/supabase";

const services = [
  "General Inquiry",
  "Software Development",
  "Digital Marketing",
  "Media & Content Production",
  "Children's Digital Education",
  "AI Solutions",
  "Biobiz / Product Inquiry",
  "Animation / Blender",
  "Other",
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
    areaOther: "",
    message: "",
  });
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [files, setFiles] = useState<File[]>([]);

  // Attachments: PDF only, up to 5 files, 10 MB total.
  const MAX_FILES = 5;
  const MAX_TOTAL_BYTES = 10 * 1024 * 1024;
  const isPdf = (f: File) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf");

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.first.trim()) e.first = "Required";
    if (!form.last.trim()) e.last = "Required";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) e.email = "Valid email required";
    if (form.area === "Other" && !form.areaOther.trim())
      e.areaOther = "Please describe your inquiry";
    if (form.message.trim().length < 10) e.message = "Tell us a bit more (10+ chars)";
    if (files.length > MAX_FILES) e.files = `Up to ${MAX_FILES} PDFs allowed`;
    if (files.reduce((s, f) => s + f.size, 0) > MAX_TOTAL_BYTES)
      e.files = "Total attachment size must be 10 MB or less";
    if (files.some((f) => !isPdf(f))) e.files = "Only PDF files are accepted";
    setErrs(e);
    return Object.keys(e).length === 0;
  };

  const addFiles = (incoming: FileList | null) => {
    if (!incoming || incoming.length === 0) return;
    const incomingArr = Array.from(incoming);
    const nonPdf = incomingArr.find((f) => !isPdf(f));
    if (nonPdf) {
      setErrs((prev) => ({
        ...prev,
        files: `"${nonPdf.name}" is not a PDF. Only PDF documents are accepted.`,
      }));
      return;
    }
    const merged = [...files, ...incomingArr].slice(0, MAX_FILES);
    setFiles(merged);
    setErrs((prev) => {
      const { files: _drop, ...rest } = prev;
      void _drop;
      return rest;
    });
  };
  const removeFile = (idx: number) => setFiles(files.filter((_, i) => i !== idx));

  const formatBytes = (n: number) => {
    if (n < 1024) return `${n} B`;
    if (n < 1024 * 1024) return `${Math.round(n / 102.4) / 10} KB`;
    return `${Math.round(n / (1024 * 102.4)) / 10} MB`;
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate() || status === "sending") return;
    setServerError(null);
    setStatus("sending");

    const effectiveArea = form.area === "Other" ? `Other: ${form.areaOther.trim()}` : form.area;

    // 1. Upload PDFs to Supabase Storage (public bucket; URLs use random UUIDs
    //    so they're not enumerable). We collect public URLs to embed in both
    //    the database row and the notification email.
    const uploadedUrls: { name: string; url: string }[] = [];
    for (const file of files) {
      const safeName = file.name.replace(/[^\w.-]+/g, "_");
      const objectPath = `${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}-${safeName}`;
      const { error: uploadError } = await supabase.storage
        .from(UPLOADS_BUCKET)
        .upload(objectPath, file, {
          contentType: "application/pdf",
          upsert: false,
        });
      if (uploadError) {
        console.error("Supabase upload failed", uploadError);
        setStatus("error");
        setServerError(
          `We couldn't upload "${file.name}". Please try again, or email us directly at joatkenya120@gmail.com.`,
        );
        return;
      }
      const {
        data: { publicUrl },
      } = supabase.storage.from(UPLOADS_BUCKET).getPublicUrl(objectPath);
      uploadedUrls.push({ name: file.name, url: publicUrl });
    }

    // 2. Persist the submission to the database (form metadata + file URLs).
    const { error: insertError } = await supabase.from("contact_submissions").insert({
      first_name: form.first.trim(),
      last_name: form.last.trim(),
      email: form.email.trim(),
      service_area: effectiveArea,
      message: form.message.trim(),
      source: "website",
      attachment_paths: uploadedUrls,
    });
    if (insertError) {
      console.error("Supabase insert failed", insertError);
      // Don't block the user — still try the email so the team gets notified.
    }

    // 3. Send notification email via Web3Forms. Files were uploaded to storage,
    //    so we embed URLs in the message body (no email attachments).
    const messageWithUrls =
      uploadedUrls.length === 0
        ? form.message.trim()
        : `${form.message.trim()}\n\n──── Attached PDFs ────\n${uploadedUrls
            .map((u, i) => `${i + 1}. ${u.name}\n   ${u.url}`)
            .join("\n")}`;

    const payload: ContactPayload = {
      first: form.first.trim(),
      last: form.last.trim(),
      email: form.email.trim(),
      area: effectiveArea,
      message: messageWithUrls,
      source: "website",
    };

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
    <section id="contact" className="relative py-14 lg:py-20 bg-navy-deep">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <m.div
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
            Whether you need software development, are exploring our products, or partnering on
            innovation, our team is ready to help.
          </p>
        </m.div>

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
                <div className="font-bold text-foreground mt-1 text-xs sm:text-base wrap-break-word">
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

            {/* Career interest — how to apply to JOAT roles */}
            <div className="glass rounded-2xl p-6">
              <div className="text-xs uppercase tracking-widest text-gold mb-3">
                Want to work with JOAT?
              </div>
              <ol className="space-y-3 text-sm text-foreground/90">
                <li className="flex gap-3">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-(--joat-gold) text-(--joat-navy-deep) font-bold flex items-center justify-center text-xs">
                    1
                  </span>
                  <span>
                    Browse open roles on our{" "}
                    <a href="/careers" className="text-gold hover:underline">
                      Careers page
                    </a>{" "}
                    and apply directly to the position that fits you.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-(--joat-gold) text-(--joat-navy-deep) font-bold flex items-center justify-center text-xs">
                    2
                  </span>
                  <span>
                    Download{" "}
                    <a href="/products#biobiz" className="text-gold hover:underline">
                      BioBiz
                    </a>{" "}
                    and create your digital business card to share your profile with our team.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-(--joat-gold) text-(--joat-navy-deep) font-bold flex items-center justify-center text-xs">
                    3
                  </span>
                  <span>We&apos;ll reach out when a role matches your skills.</span>
                </li>
              </ol>
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
                      areaOther: "",
                      message: "",
                    });
                    setFiles([]);
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
                    className="mt-1.5 sm:mt-2 w-full px-4 py-2.5 sm:py-3 rounded-md bg-black/5 border border-(--border) text-foreground focus:outline-none focus:border-(--joat-gold)/50"
                  >
                    {services.map((s) => (
                      <option key={s} value={s} className="bg-(--joat-navy-deep)">
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                {form.area === "Other" && (
                  <Field
                    label="Tell us what your inquiry is about"
                    name="areaOther"
                    value={form.areaOther}
                    onChange={(v) => setForm({ ...form, areaOther: v })}
                    error={errs.areaOther}
                  />
                )}
                <div>
                  <label htmlFor="message" className="text-xs uppercase tracking-widest text-gold">
                    Your Message
                  </label>
                  <textarea
                    id="message"
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    rows={4}
                    className="mt-2 w-full px-4 py-2.5 sm:py-3 rounded-md bg-black/5 border border-(--border) text-foreground focus:outline-none focus:border-(--joat-gold)/50 resize-none"
                  />
                  {errs.message && (
                    <div className="text-xs text-(--joat-red) mt-1">{errs.message}</div>
                  )}

                  {/* Attachments — PDF only */}
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <input
                      id="attachments"
                      type="file"
                      multiple
                      accept=".pdf,application/pdf"
                      onChange={(e) => {
                        addFiles(e.target.files);
                        e.target.value = "";
                      }}
                      className="hidden"
                    />
                    <label
                      htmlFor="attachments"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-black/5 border border-(--border) text-xs font-semibold text-foreground hover:border-(--joat-gold)/50 cursor-pointer"
                    >
                      <Paperclip className="w-3.5 h-3.5 text-(--joat-gold)" />
                      Attach files
                    </label>
                    <span className="text-[11px] text-muted-foreground">
                      PDF only · up to {MAX_FILES} files · 10 MB total
                    </span>
                  </div>
                  {files.length > 0 && (
                    <ul className="mt-2 flex flex-wrap gap-2">
                      {files.map((f, i) => (
                        <li
                          key={`${f.name}-${i}`}
                          className="inline-flex items-center gap-1.5 rounded-md bg-black/5 border border-(--border) px-2 py-1 text-xs text-foreground/90"
                        >
                          <Paperclip className="w-3 h-3 text-(--joat-gold) shrink-0" />
                          <span className="max-w-40 truncate">{f.name}</span>
                          <span className="text-muted-foreground">{formatBytes(f.size)}</span>
                          <button
                            type="button"
                            onClick={() => removeFile(i)}
                            aria-label={`Remove ${f.name}`}
                            className="ml-1 text-muted-foreground hover:text-foreground"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                  {errs.files && <div className="text-xs text-(--joat-red) mt-1">{errs.files}</div>}
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
        className="mt-1.5 sm:mt-2 w-full px-4 py-2.5 sm:py-3 rounded-md bg-black/5 border border-(--border) text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-(--joat-gold)/50"
      />
      {error && <div className="text-xs text-(--joat-red) mt-1">{error}</div>}
    </div>
  );
}
