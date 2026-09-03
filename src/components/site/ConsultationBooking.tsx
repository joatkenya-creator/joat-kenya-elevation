import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarCheck,
  CalendarPlus,
  Check,
  Clock,
  Globe,
  Loader2,
  Mail,
  Phone,
} from "lucide-react";
import {
  AVAILABILITY,
  CONSULTATIONS,
  EMAIL,
  OBJECTIVES,
  PHONE_DISPLAY,
  PHONE_HREF,
} from "@/data/kenya-consultation";
import {
  BookingInput,
  type BookedSlot,
  availableDays,
  bookingIcs,
  downloadIcs,
  fetchBookedSlots,
  formatDayLabel,
  formatFull,
  formatTime,
  slotsForDay,
  SELECT_CONSULTATION_EVENT,
  submitBooking,
  visitorTimeZone,
} from "@/lib/booking";
import { track } from "@/lib/analytics";
import { Honeypot } from "./Honeypot";

/**
 * The booking funnel: choose a session, pick a date and time in your own time
 * zone, give us your details, review, confirm. Everything is client-side
 * against Supabase — no new scheduling dependency.
 *
 * CTAs elsewhere on the page call `startBooking(minutes)` from lib/booking,
 * which fires SELECT_CONSULTATION_EVENT and scrolls here.
 */
type Step = 1 | 2 | 3 | 4 | 5;

const emptyForm = {
  fullName: "",
  email: "",
  phone: "",
  country: "",
  company: "",
  website: "",
  details: "",
};

export function ConsultationBooking() {
  const [step, setStep] = useState<Step>(1);
  const [minutes, setMinutes] = useState<60 | 120>(60);
  const [booked, setBooked] = useState<BookedSlot[]>([]);
  const [day, setDay] = useState<string | null>(null);
  const [slot, setSlot] = useState<Date | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [objectives, setObjectives] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [startedForm, setStartedForm] = useState(false);
  const honeypotRef = useRef<HTMLInputElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const tz = useMemo(visitorTimeZone, []);
  const option = CONSULTATIONS.find((c) => c.minutes === minutes)!;

  useEffect(() => {
    void fetchBookedSlots().then(setBooked);
  }, []);

  // CTAs across the page preselect a session and jump here.
  useEffect(() => {
    const onSelect = (e: Event) => {
      const value = (e as CustomEvent<60 | 120>).detail;
      chooseSession(value);
      setStep(2);
    };
    window.addEventListener(SELECT_CONSULTATION_EVENT, onSelect);
    return () => window.removeEventListener(SELECT_CONSULTATION_EVENT, onSelect);
  }, []);

  const days = useMemo(() => availableDays(minutes, booked), [minutes, booked]);
  const slots = useMemo(
    () => (day ? slotsForDay(day, minutes, booked) : []),
    [day, minutes, booked],
  );

  function chooseSession(value: 60 | 120) {
    setMinutes(value);
    setDay(null);
    setSlot(null);
    track(value === 60 ? "consultation_1hr_selected" : "consultation_2hr_selected", {
      duration_minutes: value,
    });
  }

  function goto(next: Step) {
    setStep(next);
    // Move focus to the step heading so keyboard and screen-reader users land
    // in the new step rather than at the top of the document.
    requestAnimationFrame(() => headingRef.current?.focus());
  }

  function toggleObjective(value: string) {
    setObjectives((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  }

  function onFieldChange(key: keyof typeof emptyForm, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    if (!startedForm) {
      setStartedForm(true);
      track("booking_form_started", { duration_minutes: minutes });
    }
  }

  function validateDetails() {
    if (!slot) return false;
    const parsed = BookingInput.safeParse({
      ...form,
      objectives,
      minutes,
      startAt: slot.toISOString(),
      timezone: tz,
    });
    if (parsed.success) {
      setErrors({});
      return true;
    }
    const next: Record<string, string> = {};
    for (const issue of parsed.error.issues) next[String(issue.path[0])] = issue.message;
    setErrors(next);
    return false;
  }

  async function confirm() {
    if (!slot || sending) return;
    if (honeypotRef.current?.value) {
      // Bot filled the hidden field — show success, write nothing.
      goto(5);
      return;
    }
    setSending(true);
    setServerError(null);
    track("booking_form_submitted", { duration_minutes: minutes });

    const result = await submitBooking({
      ...form,
      objectives,
      minutes,
      startAt: slot.toISOString(),
      timezone: tz,
    });
    setSending(false);

    if (result.ok) {
      track("booking_completed", { duration_minutes: minutes, country: form.country });
      goto(5);
      return;
    }
    setServerError(result.error);
    if (result.slotTaken) {
      setBooked(await fetchBookedSlots());
      setSlot(null);
      goto(2);
    }
  }

  const stepLabels = ["Session", "Date & time", "Your details", "Review"];

  return (
    <section id="book" className="py-16 lg:py-24 scroll-mt-20 bg-navy-deep">
      <div className="max-w-4xl mx-auto px-5 lg:px-8">
        <div className="text-center mb-8">
          <div className="text-xs uppercase tracking-[0.3em] text-gold mb-3">Book</div>
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
            Book your Kenya consultation
          </h2>
          <p className="mt-3 text-muted-foreground">
            Pick a session, choose a time in your own time zone, and tell us what you want to cover.
          </p>
        </div>

        {/* Progress */}
        {step < 5 && (
          <ol
            className="flex items-center justify-center gap-2 sm:gap-3 mb-8"
            aria-label="Booking steps"
          >
            {stepLabels.map((label, i) => {
              const n = (i + 1) as Step;
              const state = n === step ? "current" : n < step ? "done" : "todo";
              return (
                <li key={label} className="flex items-center gap-2">
                  <span
                    aria-current={state === "current" ? "step" : undefined}
                    className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
                      state === "todo"
                        ? "bg-black/5 text-muted-foreground"
                        : "bg-(--joat-gold) text-(--joat-navy-deep)"
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full bg-black/15 flex items-center justify-center text-[10px]">
                      {state === "done" ? <Check className="w-3 h-3" /> : n}
                    </span>
                    <span className="hidden sm:inline">{label}</span>
                  </span>
                </li>
              );
            })}
          </ol>
        )}

        <div className="glass rounded-3xl p-5 sm:p-8">
          <h3 ref={headingRef} tabIndex={-1} className="sr-only">
            {step === 5 ? "Booking confirmed" : stepLabels[step - 1]}
          </h3>

          {/* ── Step 1: session ─────────────────────────────────────────── */}
          {step === 1 && (
            <fieldset>
              <legend className="text-lg font-bold text-foreground mb-4">
                Which session do you need?
              </legend>
              <div className="grid sm:grid-cols-2 gap-4">
                {CONSULTATIONS.map((c) => (
                  <label
                    key={c.minutes}
                    className={`cursor-pointer rounded-2xl border p-5 transition-colors ${
                      minutes === c.minutes
                        ? "border-(--joat-gold) bg-(--joat-gold)/10"
                        : "border-(--border) hover:border-(--joat-gold)/50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="session"
                      className="sr-only"
                      checked={minutes === c.minutes}
                      onChange={() => chooseSession(c.minutes)}
                    />
                    <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-gold">
                      <Clock className="w-3.5 h-3.5" />
                      {c.minutes === 60 ? "1 hour" : "2 hours"}
                    </div>
                    <div className="mt-2 font-bold text-foreground">{c.name}</div>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                      {c.bestFor}
                    </p>
                    <div className="mt-3 text-sm font-semibold text-foreground">
                      {c.price ?? "Fee shared when we confirm your booking"}
                    </div>
                  </label>
                ))}
              </div>
              <button
                type="button"
                onClick={() => {
                  track("booking_started", { duration_minutes: minutes });
                  goto(2);
                }}
                className="mt-6 w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md bg-(--joat-red) text-primary-foreground font-bold hover:brightness-110 transition-all"
              >
                Choose a date &amp; time
                <ArrowRight className="w-4 h-4" />
              </button>
            </fieldset>
          )}

          {/* ── Step 2: date & time ─────────────────────────────────────── */}
          {step === 2 && (
            <div>
              <div className="flex flex-wrap items-baseline justify-between gap-2 mb-4">
                <h4 className="text-lg font-bold text-foreground">
                  Pick a date and time for your {minutes === 60 ? "1-hour" : "2-hour"} session
                </h4>
                <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Globe className="w-3.5 h-3.5 text-(--joat-gold)" />
                  Times shown in {tz}
                </span>
              </div>

              <div className="text-xs uppercase tracking-widest text-gold mb-2">Date</div>
              <div
                className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1"
                role="group"
                aria-label="Available dates"
              >
                {days.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => {
                      setDay(d);
                      setSlot(null);
                      track("calendar_selected", { day: d });
                    }}
                    aria-pressed={day === d}
                    className={`shrink-0 rounded-xl border px-4 py-3 text-sm font-semibold transition-colors ${
                      day === d
                        ? "border-(--joat-gold) bg-(--joat-gold) text-(--joat-navy-deep)"
                        : "border-(--border) text-foreground hover:border-(--joat-gold)/50"
                    }`}
                  >
                    {formatDayLabel(d)}
                  </button>
                ))}
                {days.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No open slots right now. Please{" "}
                    <a href={PHONE_HREF} className="text-gold underline">
                      call us
                    </a>{" "}
                    and we will arrange a time.
                  </p>
                )}
              </div>

              {day && (
                <>
                  <div className="text-xs uppercase tracking-widest text-gold mt-6 mb-2">Time</div>
                  <div
                    className="grid grid-cols-2 sm:grid-cols-4 gap-2"
                    role="group"
                    aria-label="Available times"
                  >
                    {slots.map((s) => {
                      const active = slot?.getTime() === s.start.getTime();
                      return (
                        <button
                          key={s.start.toISOString()}
                          type="button"
                          onClick={() => setSlot(s.start)}
                          aria-pressed={active}
                          className={`rounded-xl border px-3 py-3 text-sm font-semibold transition-colors ${
                            active
                              ? "border-(--joat-gold) bg-(--joat-gold) text-(--joat-navy-deep)"
                              : "border-(--border) text-foreground hover:border-(--joat-gold)/50"
                          }`}
                        >
                          {formatTime(s.start, tz)}
                        </button>
                      );
                    })}
                    {slots.length === 0 && (
                      <p className="col-span-full text-sm text-muted-foreground">
                        Nothing left on that day. Try another date.
                      </p>
                    )}
                  </div>
                </>
              )}

              <p className="mt-4 text-xs text-muted-foreground">
                Sessions run {AVAILABILITY.firstHour}:00–{AVAILABILITY.lastHour + 1}:00 Nairobi time
                (EAT, UTC+3), Tuesday to Friday, with at least {AVAILABILITY.leadTimeHours}{" "}
                hours&apos; notice.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => goto(1)}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-md border border-(--border) text-foreground font-semibold hover:bg-black/5 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                <button
                  type="button"
                  disabled={!slot}
                  onClick={() => goto(3)}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-(--joat-red) text-primary-foreground font-bold hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ── Step 3: details ─────────────────────────────────────────── */}
          {step === 3 && (
            <form
              noValidate
              onSubmit={(e) => {
                e.preventDefault();
                if (validateDetails()) goto(4);
              }}
            >
              <Honeypot ref={honeypotRef} />
              <h4 className="text-lg font-bold text-foreground mb-4">Your details</h4>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field
                  label="Full name"
                  name="fullName"
                  autoComplete="name"
                  value={form.fullName}
                  onChange={(v) => onFieldChange("fullName", v)}
                  error={errors.fullName}
                  required
                />
                <Field
                  label="Email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={(v) => onFieldChange("email", v)}
                  error={errors.email}
                  required
                />
                <Field
                  label="Phone / WhatsApp"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  value={form.phone}
                  onChange={(v) => onFieldChange("phone", v)}
                  error={errors.phone}
                  required
                />
                <Field
                  label="Country you are based in"
                  name="country"
                  autoComplete="country-name"
                  value={form.country}
                  onChange={(v) => onFieldChange("country", v)}
                  error={errors.country}
                  required
                />
                <Field
                  label="Company / business name (optional)"
                  name="company"
                  autoComplete="organization"
                  value={form.company}
                  onChange={(v) => onFieldChange("company", v)}
                  error={errors.company}
                />
                <Field
                  label="Website (optional)"
                  name="website"
                  autoComplete="url"
                  value={form.website}
                  onChange={(v) => onFieldChange("website", v)}
                  error={errors.website}
                />
              </div>

              <fieldset className="mt-6">
                <legend className="text-xs uppercase tracking-widest text-gold mb-2">
                  What are you hoping to accomplish?
                </legend>
                <div className="flex flex-wrap gap-2">
                  {OBJECTIVES.map((o) => (
                    <label
                      key={o}
                      className={`cursor-pointer rounded-full border px-4 py-2 text-sm transition-colors ${
                        objectives.includes(o)
                          ? "border-(--joat-gold) bg-(--joat-gold) text-(--joat-navy-deep) font-semibold"
                          : "border-(--border) text-foreground hover:border-(--joat-gold)/50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={objectives.includes(o)}
                        onChange={() => toggleObjective(o)}
                      />
                      {o}
                    </label>
                  ))}
                </div>
                {errors.objectives && (
                  <div role="alert" className="text-xs text-(--joat-red) mt-2">
                    {errors.objectives}
                  </div>
                )}
              </fieldset>

              <div className="mt-6">
                <label htmlFor="details" className="text-xs uppercase tracking-widest text-gold">
                  Tell us briefly what you want to discuss
                </label>
                <textarea
                  id="details"
                  rows={5}
                  value={form.details}
                  required
                  aria-invalid={Boolean(errors.details)}
                  aria-describedby={errors.details ? "details-error" : undefined}
                  onChange={(e) => onFieldChange("details", e.target.value)}
                  placeholder="Your plans for Kenya, the business or idea, where you are in the process, and the questions you most want answered."
                  className="mt-2 w-full px-4 py-3 rounded-md bg-black/5 border border-(--border) text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-(--joat-gold)/50 resize-y"
                />
                {errors.details && (
                  <div id="details-error" role="alert" className="text-xs text-(--joat-red) mt-1">
                    {errors.details}
                  </div>
                )}
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => goto(2)}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-md border border-(--border) text-foreground font-semibold hover:bg-black/5 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-(--joat-red) text-primary-foreground font-bold hover:brightness-110 transition-all"
                >
                  Review booking
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* ── Step 4: review ──────────────────────────────────────────── */}
          {step === 4 && slot && (
            <div>
              <h4 className="text-lg font-bold text-foreground mb-4">Review your booking</h4>
              <dl className="space-y-3 text-sm">
                <Row
                  label="Session"
                  value={`${option.name} (${minutes === 60 ? "1 hour" : "2 hours"})`}
                />
                <Row label="Your time" value={`${formatFull(slot, tz)} · ${tz}`} />
                <Row
                  label="Nairobi time"
                  value={`${formatFull(slot, AVAILABILITY.timeZone)} EAT`}
                />
                <Row
                  label="Meeting method"
                  value="Video call (link emailed) or phone, your choice"
                />
                <Row label="Fee" value={option.price ?? "Shared when we confirm your booking"} />
                <Row label="Name" value={form.fullName} />
                <Row label="Email" value={form.email} />
                <Row label="Phone / WhatsApp" value={form.phone} />
                <Row label="Country" value={form.country} />
                {form.company && <Row label="Company" value={form.company} />}
                {form.website && <Row label="Website" value={form.website} />}
                <Row label="Objectives" value={objectives.join(", ")} />
                <Row label="To discuss" value={form.details} />
              </dl>

              {serverError && (
                <div
                  role="alert"
                  className="mt-5 rounded-md border border-(--joat-red)/40 bg-(--joat-red)/10 px-4 py-3 text-sm text-foreground"
                >
                  {serverError}
                </div>
              )}

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => goto(3)}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-md border border-(--border) text-foreground font-semibold hover:bg-black/5 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Edit details
                </button>
                <button
                  type="button"
                  onClick={() => void confirm()}
                  disabled={sending}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-(--joat-red) text-primary-foreground font-bold hover:brightness-110 transition-all disabled:opacity-60"
                >
                  {sending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Confirming…
                    </>
                  ) : (
                    <>
                      <CalendarCheck className="w-4 h-4" />
                      Confirm booking
                    </>
                  )}
                </button>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                By booking you agree to our{" "}
                <a href="/privacy" className="text-gold hover:underline">
                  privacy policy
                </a>
                . Consultations are strategic and commercial guidance, not legal, immigration, tax
                or investment advice.
              </p>
            </div>
          )}

          {/* ── Step 5: confirmation ────────────────────────────────────── */}
          {step === 5 && slot && (
            <div>
              <div className="w-14 h-14 rounded-full bg-(--joat-gold) text-(--joat-navy-deep) flex items-center justify-center mb-4">
                <Check className="w-7 h-7" />
              </div>
              <h4 className="text-2xl font-bold text-foreground">
                Your Kenya consultation is confirmed
              </h4>
              <p className="mt-2 text-muted-foreground">
                We have your booking and the Director has your notes. We will confirm this slot and
                send joining details by email to {form.email}, usually within one business day.
              </p>

              <dl className="mt-6 space-y-3 text-sm">
                <Row
                  label="Session"
                  value={`${option.name} (${minutes === 60 ? "1 hour" : "2 hours"})`}
                />
                <Row label="Date & time" value={formatFull(slot, tz)} />
                <Row label="Time zone" value={tz} />
                <Row
                  label="Nairobi time"
                  value={`${formatFull(slot, AVAILABILITY.timeZone)} EAT`}
                />
                <Row
                  label="Meeting method"
                  value="Video call (link emailed) or phone, your choice"
                />
              </dl>

              <button
                type="button"
                onClick={() =>
                  downloadIcs(
                    "joat-kenya-consultation.ics",
                    bookingIcs({ startAt: slot.toISOString(), minutes, name: option.name }),
                  )
                }
                className="mt-5 inline-flex items-center gap-2 px-5 py-3 rounded-md bg-(--joat-gold) text-(--joat-navy-deep) font-bold hover:brightness-110 transition-all"
              >
                <CalendarPlus className="w-4 h-4" />
                Add to calendar
              </button>

              <div className="mt-8 grid sm:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-(--border) p-5">
                  <div className="text-xs uppercase tracking-widest text-gold mb-2">
                    What happens next
                  </div>
                  <ol className="space-y-2 text-sm text-muted-foreground list-decimal pl-4">
                    <li>We review your notes and confirm the slot by email.</li>
                    <li>You receive the joining link and the fee details.</li>
                    <li>We meet at your chosen time and work through your plans.</li>
                  </ol>
                </div>
                <div className="rounded-2xl border border-(--border) p-5">
                  <div className="text-xs uppercase tracking-widest text-gold mb-2">
                    How to prepare
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Be ready to explain what you want to accomplish in Kenya, your business or idea,
                    who you think your customer is, and the questions or concerns weighing on you
                    most. The more specific you are, the more useful the session.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-4 text-sm">
                <a
                  href={PHONE_HREF}
                  className="inline-flex items-center gap-2 text-foreground hover:text-gold"
                >
                  <Phone className="w-4 h-4 text-(--joat-gold)" />
                  {PHONE_DISPLAY}
                </a>
                <a
                  href={`mailto:${EMAIL}`}
                  className="inline-flex items-center gap-2 text-foreground hover:text-gold"
                >
                  <Mail className="w-4 h-4 text-(--joat-gold)" />
                  {EMAIL}
                </a>
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                Need to reschedule or cancel? Reply to the confirmation email or call us at least 24
                hours before the session and we will move it.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:gap-4 border-b border-(--border) pb-3">
      <dt className="sm:w-44 shrink-0 text-xs uppercase tracking-widest text-gold pt-0.5">
        {label}
      </dt>
      <dd className="text-foreground wrap-break-word">{value}</dd>
    </div>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  error,
  type = "text",
  autoComplete,
  required,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  type?: string;
  autoComplete?: string;
  required?: boolean;
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
        required={required}
        autoComplete={autoComplete}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${name}-error` : undefined}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full px-4 py-3 rounded-md bg-black/5 border border-(--border) text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-(--joat-gold)/50"
      />
      {error && (
        <div id={`${name}-error`} role="alert" className="text-xs text-(--joat-red) mt-1">
          {error}
        </div>
      )}
    </div>
  );
}
