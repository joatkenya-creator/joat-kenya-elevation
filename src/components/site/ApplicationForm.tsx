import { useState } from "react";
import { Upload, X, FileText, Loader2, CheckCircle2, ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
  APPLICATIONS_BUCKET,
  APPLY_EMAIL,
  folderFor,
  type Opening,
} from "@/lib/openings";

const MAX_FILES = 3;
const MAX_TOTAL_BYTES = 10 * 1024 * 1024; // 10 MB
const ACCEPTED = [".pdf", ".doc", ".docx"];

function acceptedFile(f: File) {
  const lower = f.name.toLowerCase();
  return ACCEPTED.some((ext) => lower.endsWith(ext));
}

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${Math.round(n / 102.4) / 10} KB`;
  return `${Math.round(n / (1024 * 102.4)) / 10} MB`;
}

type Status = "idle" | "sending" | "sent" | "error";

export function ApplicationForm({
  job,
  onBack,
}: {
  job: Opening;
  onBack: () => void;
}) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    portfolio: "",
    message: "",
  });
  const [trades, setTrades] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [serverError, setServerError] = useState<string | null>(null);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const toggleTrade = (t: string) =>
    setTrades((p) => (p.includes(t) ? p.filter((x) => x !== t) : [...p, t]));

  const addFiles = (incoming: FileList | null) => {
    if (!incoming || incoming.length === 0) return;
    const arr = Array.from(incoming);
    const bad = arr.find((f) => !acceptedFile(f));
    if (bad) {
      setErrs((p) => ({ ...p, files: `"${bad.name}" must be a PDF, DOC or DOCX.` }));
      return;
    }
    setFiles((prev) => [...prev, ...arr].slice(0, MAX_FILES));
    setErrs((p) => {
      const { files: _d, ...rest } = p;
      void _d;
      return rest;
    });
  };
  const removeFile = (i: number) => setFiles(files.filter((_, idx) => idx !== i));

  const validate = () => {
    const e: Record<string, string> = {};
    if (form.name.trim().length < 2) e.name = "Please enter your full name";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email.trim())) e.email = "Enter a valid email";
    if (form.phone.trim().length < 7) e.phone = "Enter a valid phone number";
    if (files.length === 0) e.files = "Attach your CV / resume";
    if (files.reduce((s, f) => s + f.size, 0) > MAX_TOTAL_BYTES)
      e.files = "Total file size must be 10 MB or less";
    setErrs(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (status === "sending") return;
    if (!validate()) return;
    setServerError(null);
    setStatus("sending");

    // 1. Upload files to the job's folder in the applications bucket, keeping
    //    the applicant's original file name. Every application gets its own
    //    subfolder named by the upload date + applicant name (e.g.
    //    "2026-06-10-Jane-Wanjiru"), matching the hyphenated format of the
    //    existing folders. Supabase creates folders on first upload.
    const jobFolder = folderFor(job.title);
    const uploadDate = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const baseDir = `${jobFolder}/${uploadDate}-${folderFor(form.name)}`;
    const uploaded: { name: string; path: string; url: string }[] = [];
    for (const file of files) {
      // Retain the original file name; only strip path separators that would
      // otherwise create unintended nested folders.
      const safeName = file.name.replace(/[\\/]+/g, "-").trim() || "file";
      const path = `${baseDir}/${safeName}`;
      const { error: upErr } = await supabase.storage
        .from(APPLICATIONS_BUCKET)
        .upload(path, file, { upsert: false, contentType: file.type || undefined });
      if (upErr) {
        console.error("Application upload failed", upErr);
        setStatus("error");
        setServerError(
          `We couldn't upload "${file.name}". Please try again, or email us at ${APPLY_EMAIL}.`,
        );
        return;
      }
      const {
        data: { publicUrl },
      } = supabase.storage.from(APPLICATIONS_BUCKET).getPublicUrl(path);
      uploaded.push({ name: file.name, path, url: publicUrl });
    }

    // 2. Insert the application. `status` is omitted so the table default
    //    applies (verified against the live schema).
    const { error: insErr } = await supabase.from("applications").insert({
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      job_title: job.title,
      trades,
      portfolio_link: form.portfolio.trim() || null,
      app_message: form.message.trim() || null,
      file_urls: uploaded,
    });
    if (insErr) {
      console.error("Application insert failed", insErr);
      setStatus("error");
      setServerError(
        `We couldn't submit your application just now. Please try again, or email us at ${APPLY_EMAIL}.`,
      );
      return;
    }

    setStatus("sent");
  };

  if (status === "sent") {
    return (
      <div className="text-center py-10 px-2">
        <div className="mx-auto w-14 h-14 rounded-full bg-(--joat-gold)/15 flex items-center justify-center">
          <CheckCircle2 className="w-7 h-7 text-(--joat-gold)" />
        </div>
        <h3 className="mt-4 text-xl font-bold text-foreground">Application received</h3>
        <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
          Thanks for applying to <span className="text-foreground font-semibold">{job.title}</span>.
          Our team will review your application and reach out if there's a match.
        </p>
        <button
          type="button"
          onClick={onBack}
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-md glass text-foreground text-sm font-semibold hover:bg-black/5 transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Back to role
        </button>
      </div>
    );
  }

  const inputClass =
    "w-full rounded-md bg-black/5 border border-(--glass-border) px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-(--joat-gold)/50 transition-colors";

  return (
    <form onSubmit={submit} className="space-y-4">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to job details
      </button>

      <div>
        <h3 className="text-lg font-bold text-foreground">Apply for {job.title}</h3>
        <p className="text-sm text-muted-foreground">
          Tell us about yourself and attach your CV. Fields marked * are required.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-muted-foreground">Full name *</label>
          <input className={inputClass} value={form.name} onChange={set("name")} placeholder="Jane Wanjiru" />
          {errs.name && <p className="mt-1 text-xs text-(--joat-red)">{errs.name}</p>}
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Email *</label>
          <input className={inputClass} value={form.email} onChange={set("email")} placeholder="you@email.com" />
          {errs.email && <p className="mt-1 text-xs text-(--joat-red)">{errs.email}</p>}
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Phone *</label>
          <input className={inputClass} value={form.phone} onChange={set("phone")} placeholder="+254 7xx xxx xxx" />
          {errs.phone && <p className="mt-1 text-xs text-(--joat-red)">{errs.phone}</p>}
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Portfolio (optional)</label>
          <input className={inputClass} value={form.portfolio} onChange={set("portfolio")} placeholder="https://…" />
        </div>
      </div>

      {job.trades.length > 0 && (
        <div>
          <label className="text-xs text-muted-foreground">Your relevant skills (optional)</label>
          <div className="mt-1.5 flex flex-wrap gap-2">
            {job.trades.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => toggleTrade(t)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  trades.includes(t)
                    ? "bg-(--joat-gold) text-(--joat-navy-deep) border-transparent font-semibold"
                    : "glass border-(--glass-border) text-foreground/85 hover:border-(--joat-gold)/40"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <label className="text-xs text-muted-foreground">Message / cover note (optional)</label>
        <textarea
          className={`${inputClass} min-h-24 resize-y`}
          value={form.message}
          onChange={set("message")}
          placeholder="A short note on why you're a great fit…"
        />
      </div>

      {/* CV upload */}
      <div>
        <label className="text-xs text-muted-foreground">CV / Resume * (PDF, DOC, DOCX; up to 3 files, 10 MB total)</label>
        <label className="mt-1.5 flex items-center justify-center gap-2 rounded-md border border-dashed border-(--glass-border) bg-black/5 px-4 py-6 text-sm text-muted-foreground cursor-pointer hover:border-(--joat-gold)/40 transition-colors">
          <Upload className="w-4 h-4" />
          Click to attach files
          <input
            type="file"
            multiple
            accept=".pdf,.doc,.docx"
            className="hidden"
            onChange={(e) => addFiles(e.target.files)}
          />
        </label>
        {errs.files && <p className="mt-1 text-xs text-(--joat-red)">{errs.files}</p>}
        {files.length > 0 && (
          <ul className="mt-2 space-y-1.5">
            {files.map((f, i) => (
              <li
                key={`${f.name}-${i}`}
                className="flex items-center justify-between gap-2 rounded-md bg-black/5 px-3 py-2 text-xs"
              >
                <span className="flex items-center gap-2 min-w-0 text-foreground">
                  <FileText className="w-3.5 h-3.5 text-gold shrink-0" />
                  <span className="truncate">{f.name}</span>
                  <span className="text-muted-foreground shrink-0">({formatBytes(f.size)})</span>
                </span>
                <button type="button" onClick={() => removeFile(i)} aria-label="Remove file">
                  <X className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {serverError && (
        <p className="text-sm text-(--joat-red) bg-(--joat-red)/10 rounded-md px-3 py-2">{serverError}</p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-md bg-(--joat-gold) text-(--joat-navy-deep) text-sm font-semibold hover:brightness-110 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {status === "sending" ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> Submitting…
          </>
        ) : (
          "Submit application"
        )}
      </button>
    </form>
  );
}
