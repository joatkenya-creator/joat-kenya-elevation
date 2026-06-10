import { useEffect, useState } from "react";
import { m, AnimatePresence } from "framer-motion";
import { X, MapPin, Clock, Briefcase, Share2, ArrowRight, Banknote } from "lucide-react";
import { ABOUT_JOAT, type Opening } from "@/lib/openings";
import { ApplicationForm } from "./ApplicationForm";

function Bullets({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div>
      <h4 className="text-sm font-bold text-foreground uppercase tracking-wide">{title}</h4>
      <ul className="mt-2 space-y-2">
        {items.map((it, i) => (
          <li key={i} className="flex gap-2.5 text-sm text-muted-foreground leading-relaxed">
            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-(--joat-gold) shrink-0" />
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function JobDetailModal({ job, onClose }: { job: Opening | null; onClose: () => void }) {
  const [mode, setMode] = useState<"detail" | "apply">("detail");

  // Reset to the detail view whenever a different job is opened.
  useEffect(() => {
    setMode("detail");
  }, [job?.slug]);

  // Lock body scroll + close on Escape while open.
  useEffect(() => {
    if (!job) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [job, onClose]);

  const refer = () => {
    if (!job) return;
    const url = "https://joatkenya.com/careers";
    const subject = `Job opening at J.O.A.T. Kenya: ${job.title}`;
    const body = `I thought you'd be a great fit for this role at J.O.A.T. Kenya:\n\n${job.title}, ${job.location} (${job.type})\n\nSee details and apply here: ${url}`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <AnimatePresence>
      {job && (
        <m.div
          className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="absolute inset-0 bg-black/70" onClick={onClose} />

          <m.div
            role="dialog"
            aria-modal="true"
            aria-label={`${job.title} job details`}
            className="relative w-full sm:max-w-2xl max-h-[92vh] sm:max-h-[88vh] flex flex-col glass-panel rounded-t-2xl sm:rounded-2xl border border-(--glass-border) overflow-hidden"
            initial={{ y: 30, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 30, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            {/* Header */}
            <div className="shrink-0 px-5 sm:px-7 pt-5 pb-4 border-b border-(--glass-border) bg-muted">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-gold">
                    <Briefcase className="w-3 h-3" />
                    {job.category}
                  </div>
                  <h2 className="mt-1 text-xl sm:text-2xl font-bold text-foreground">{job.title}</h2>
                  <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" /> {job.location}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" /> {job.type}
                    </span>
                    {job.pay && (
                      <span className="inline-flex items-center gap-1.5 text-gold">
                        <Banknote className="w-3.5 h-3.5" /> {job.pay}
                      </span>
                    )}
                  </div>
                  {job.postedNote && (
                    <div className="mt-1 text-xs text-muted-foreground">{job.postedNote}</div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close"
                  className="shrink-0 w-9 h-9 rounded-full glass flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto px-5 sm:px-7 py-5">
              {mode === "detail" ? (
                <div className="space-y-6">
                  <p className="text-sm text-muted-foreground leading-relaxed">{ABOUT_JOAT}</p>

                  <div>
                    <h3 className="text-base font-bold text-foreground">Job Description</h3>
                    <div className="mt-3 space-y-4">
                      <div>
                        <h4 className="text-sm font-bold text-foreground uppercase tracking-wide">
                          Main purpose of the job
                        </h4>
                        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                          {job.mainPurpose}
                        </p>
                      </div>
                      <Bullets title="What you will do" items={job.whatYouWillDo} />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-foreground">Qualifications</h3>
                    <div className="mt-3 space-y-4">
                      <Bullets title="Required Qualifications" items={job.requiredQualifications} />
                      <Bullets title="Behavioural Competencies" items={job.behaviouralCompetencies} />
                      <Bullets title="Technical Competencies" items={job.technicalCompetencies} />
                    </div>
                  </div>
                </div>
              ) : (
                <ApplicationForm job={job} onBack={() => setMode("detail")} />
              )}
            </div>

            {/* Sticky action bar (detail mode only) */}
            {mode === "detail" && (
              <div className="shrink-0 px-5 sm:px-7 py-4 border-t border-(--glass-border) bg-muted flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setMode("apply")}
                  className="flex-1 min-w-40 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-md bg-(--joat-gold) text-(--joat-navy-deep) text-sm font-semibold hover:brightness-110 transition-all"
                >
                  Apply now <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={refer}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-md glass text-foreground text-sm font-semibold hover:bg-black/5 transition-all"
                >
                  <Share2 className="w-4 h-4" /> Refer a friend
                </button>
              </div>
            )}
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
