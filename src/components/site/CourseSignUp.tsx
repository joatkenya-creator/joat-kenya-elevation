import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import {
  fetchCourseStudentRow,
  insertCourseStudentRow,
  savePendingRegistration,
  signUpStudent,
  type PaymentPreference,
  type RegistrantType,
  type Tier,
} from "@/lib/auth";

const inputClass =
  "w-full rounded-md bg-black/5 border border-(--glass-border) px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-(--joat-gold)/50 transition-colors";

type Status = "idle" | "sending" | "check-email" | "error";

export function CourseSignUp({ initialTier }: { initialTier?: Tier }) {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [registrantType, setRegistrantType] = useState<RegistrantType>("student");
  const [college, setCollege] = useState("");
  const [tier, setTier] = useState<Tier>(initialTier ?? "shipper");
  const [paymentPreference, setPaymentPreference] = useState<PaymentPreference>("full");
  const [howHeard, setHowHeard] = useState("");
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [serverError, setServerError] = useState<string | null>(null);

  const validate = () => {
    const e: Record<string, string> = {};
    if (fullName.trim().length < 2) e.fullName = "Enter your full name";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) e.email = "Enter a valid email";
    if (password.length < 8) e.password = "Password must be at least 8 characters";
    if (phone.trim().length < 7) e.phone = "Enter a valid phone number";
    setErrs(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (status === "sending") return;
    if (!validate()) return;
    setServerError(null);
    setStatus("sending");

    const pending = {
      full_name: fullName,
      phone,
      registrant_type: registrantType,
      college,
      tier,
      payment_preference: paymentPreference,
      how_heard: howHeard,
    };
    savePendingRegistration(pending);

    const { data, error } = await signUpStudent(email.trim(), password);
    if (error) {
      setStatus("error");
      setServerError(error.message || "We could not create your account. Please try again.");
      return;
    }

    if (!data.session || !data.user) {
      // Email confirmation is required before a session exists. The pending
      // registration is already saved to localStorage — it's picked up on
      // the account page once the user confirms and logs in.
      setStatus("check-email");
      return;
    }

    // Session came back immediately — finish the profile now.
    const { data: existing } = await fetchCourseStudentRow(data.user.id);
    if (!existing) {
      const { error: insErr } = await insertCourseStudentRow(data.user.id, email.trim(), pending);
      if (insErr) {
        setStatus("error");
        setServerError(
          "Your account was created, but we could not save your registration details. Please log in and try again.",
        );
        return;
      }
    }

    void navigate({ to: "/courses/account" });
  };

  if (status === "check-email") {
    return (
      <div className="text-center py-16 px-4 max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-foreground">Check your email</h1>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
          We sent a confirmation link to <span className="text-foreground">{email}</span>. Once you
          confirm, come back and log in to finish your registration.
        </p>
        <Link
          to="/courses/login"
          className="mt-6 inline-flex items-center justify-center px-5 py-2.5 rounded-md bg-(--joat-gold) text-(--joat-navy-deep) text-sm font-semibold hover:brightness-110 transition-all"
        >
          Go to log in
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-5 py-16 lg:py-20">
      <h1 className="text-3xl font-bold text-foreground">Register for the cohort</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Create your account. Fields marked * are required.
      </p>

      <form onSubmit={submit} className="mt-8 space-y-4">
        <div>
          <label className="text-xs text-muted-foreground">Full name *</label>
          <input
            className={inputClass}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Jane Wanjiru"
          />
          {errs.fullName && <p className="mt-1 text-xs text-(--joat-red)">{errs.fullName}</p>}
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted-foreground">Email *</label>
            <input
              className={inputClass}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
            />
            {errs.email && <p className="mt-1 text-xs text-(--joat-red)">{errs.email}</p>}
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Password *</label>
            <input
              className={inputClass}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
            />
            {errs.password && <p className="mt-1 text-xs text-(--joat-red)">{errs.password}</p>}
          </div>
        </div>

        <div>
          <label className="text-xs text-muted-foreground">Phone / WhatsApp *</label>
          <input
            className={inputClass}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+254 7xx xxx xxx"
          />
          {errs.phone && <p className="mt-1 text-xs text-(--joat-red)">{errs.phone}</p>}
        </div>

        <div>
          <label className="text-xs text-muted-foreground">I am a *</label>
          <select
            className={inputClass}
            value={registrantType}
            onChange={(e) => setRegistrantType(e.target.value as RegistrantType)}
          >
            <option value="student">Prospective student</option>
            <option value="parent">Parent registering my child</option>
          </select>
        </div>

        <div>
          <label className="text-xs text-muted-foreground">
            College / university attended (optional)
          </label>
          <input
            className={inputClass}
            value={college}
            onChange={(e) => setCollege(e.target.value)}
            placeholder="e.g. JKUAT"
          />
        </div>

        <div>
          <label className="text-xs text-muted-foreground">Chosen tier *</label>
          <select
            className={inputClass}
            value={tier}
            onChange={(e) => setTier(e.target.value as Tier)}
          >
            <option value="builder">Builder: KES 24,900</option>
            <option value="shipper">Shipper: KES 44,900</option>
            <option value="pro">Pro: KES 79,900</option>
          </select>
        </div>

        <div>
          <label className="text-xs text-muted-foreground">Preferred payment *</label>
          <select
            className={inputClass}
            value={paymentPreference}
            onChange={(e) => setPaymentPreference(e.target.value as PaymentPreference)}
          >
            <option value="full">Pay in full</option>
            <option value="installments">Installments</option>
            <option value="parent_pays">Parent will pay</option>
          </select>
        </div>

        <div>
          <label className="text-xs text-muted-foreground">
            How did you hear about us? (optional)
          </label>
          <input
            className={inputClass}
            value={howHeard}
            onChange={(e) => setHowHeard(e.target.value)}
            placeholder=""
          />
        </div>

        {serverError && (
          <p className="text-sm text-(--joat-red) bg-(--joat-red)/10 rounded-md px-3 py-2">
            {serverError}
          </p>
        )}

        <button
          type="submit"
          disabled={status === "sending"}
          className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-md bg-(--joat-gold) text-(--joat-navy-deep) text-sm font-semibold hover:brightness-110 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {status === "sending" ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Creating account…
            </>
          ) : (
            "Create account"
          )}
        </button>

        <p className="text-center text-sm text-muted-foreground">
          Already registered?{" "}
          <Link
            to="/courses/login"
            className="text-foreground underline underline-offset-2 hover:text-gold"
          >
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
}
