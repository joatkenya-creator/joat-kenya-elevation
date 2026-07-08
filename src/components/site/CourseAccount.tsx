import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import {
  clearPendingRegistration,
  fetchCourseStudentRow,
  insertCourseStudentRow,
  readPendingRegistration,
  signOutStudent,
  updateCourseStudentRow,
  useSession,
  type CourseStatus,
  type CourseStudent,
  type PaymentPreference,
  type RegistrantType,
  type Tier,
} from "@/lib/auth";

const inputClass =
  "w-full rounded-md bg-black/5 border border-(--glass-border) px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-(--joat-gold)/50 transition-colors";

const TIER_LABEL: Record<Tier, string> = {
  builder: "Builder: KES 24,900",
  shipper: "Shipper: KES 44,900",
  pro: "Pro: KES 79,900",
};

const PAYMENT_LABEL: Record<PaymentPreference, string> = {
  full: "Pay in full",
  installments: "Installments",
  parent_pays: "Parent will pay",
};

function LoadingBlock() {
  return (
    <div className="flex items-center justify-center py-24 text-muted-foreground">
      <Loader2 className="w-5 h-5 animate-spin" />
    </div>
  );
}

function FinishRegistration({
  userId,
  email,
  onDone,
}: {
  userId: string;
  email: string;
  onDone: (row: CourseStudent) => void;
}) {
  const draft = readPendingRegistration();
  const [fullName, setFullName] = useState(draft?.full_name ?? "");
  const [phone, setPhone] = useState(draft?.phone ?? "");
  const [registrantType, setRegistrantType] = useState<RegistrantType>(
    draft?.registrant_type ?? "student",
  );
  const [college, setCollege] = useState(draft?.college ?? "");
  const [tier, setTier] = useState<Tier>(draft?.tier ?? "shipper");
  const [paymentPreference, setPaymentPreference] = useState<PaymentPreference>(
    draft?.payment_preference ?? "full",
  );
  const [howHeard, setHowHeard] = useState(draft?.how_heard ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoTried, setAutoTried] = useState(false);

  const save = async (ev?: React.FormEvent) => {
    ev?.preventDefault();
    if (saving) return;
    if (fullName.trim().length < 2 || phone.trim().length < 7) {
      setError("Enter your full name and a valid phone number.");
      return;
    }
    setSaving(true);
    setError(null);
    const { error: insErr } = await insertCourseStudentRow(userId, email, {
      full_name: fullName,
      phone,
      registrant_type: registrantType,
      college,
      tier,
      payment_preference: paymentPreference,
      how_heard: howHeard,
    });
    if (insErr) {
      setSaving(false);
      setError("Could not save your details. Please try again.");
      return;
    }
    clearPendingRegistration();
    const { data } = await fetchCourseStudentRow(userId);
    if (data) onDone(data);
  };

  // If a complete draft is already sitting in localStorage (the common case
  // right after sign-up), finish silently instead of showing the form.
  useEffect(() => {
    if (autoTried) return;
    setAutoTried(true);
    if (draft && draft.full_name.trim().length >= 2 && draft.phone.trim().length >= 7) {
      void save();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!autoTried || (saving && !error)) {
    return <LoadingBlock />;
  }

  return (
    <div className="max-w-lg mx-auto px-5 py-16 lg:py-20">
      <h1 className="text-3xl font-bold text-foreground">Finish your registration</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        You are logged in. A few more details and you are set.
      </p>

      <form onSubmit={save} className="mt-8 space-y-4">
        <div>
          <label className="text-xs text-muted-foreground">Full name *</label>
          <input
            className={inputClass}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Phone / WhatsApp *</label>
          <input className={inputClass} value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">I am a</label>
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
          <label className="text-xs text-muted-foreground">College / university (optional)</label>
          <input
            className={inputClass}
            value={college}
            onChange={(e) => setCollege(e.target.value)}
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Chosen tier</label>
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
          <label className="text-xs text-muted-foreground">Preferred payment</label>
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

        {error && (
          <p className="text-sm text-(--joat-red) bg-(--joat-red)/10 rounded-md px-3 py-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-md bg-(--joat-gold) text-(--joat-navy-deep) text-sm font-semibold hover:brightness-110 transition-all disabled:opacity-60"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
        </button>
      </form>
    </div>
  );
}

const STATUS_STEPS: { key: CourseStatus; label: string }[] = [
  { key: "registered", label: "Registered" },
  { key: "deposit_paid", label: "Deposit confirmed" },
  { key: "in_progress", label: "Cohort in progress" },
  { key: "completed", label: "Completed" },
];

const STATUS_NOTE: Record<CourseStatus, string> = {
  registered:
    "You are registered. Our team will reach out on WhatsApp or email with cohort dates and deposit instructions.",
  deposit_paid: "Your deposit is confirmed. We will let you know exactly when your cohort starts.",
  in_progress: "Your cohort is currently running. See you in class.",
  completed: "You have completed the cohort. Congratulations.",
};

// Real, DB-backed progress: the status column only advances when the JOAT
// team updates it (see the migration), so this never shows a stage the
// student has not actually reached.
function ProgressTracker({ status }: { status: CourseStatus }) {
  const currentIndex = STATUS_STEPS.findIndex((s) => s.key === status);
  return (
    <div className="mt-8 grid grid-cols-4 gap-1">
      {STATUS_STEPS.map((step, i) => {
        const reached = i <= currentIndex;
        return (
          <div key={step.key} className="flex flex-col items-center text-center">
            <div className="w-full flex items-center">
              <div
                className={`h-1 flex-1 rounded-full ${
                  i === 0 ? "invisible" : reached ? "bg-(--joat-gold)" : "bg-(--border)"
                }`}
              />
              <div
                className={`w-2.5 h-2.5 rounded-full shrink-0 mx-1 ${
                  reached ? "bg-(--joat-gold)" : "bg-(--border)"
                }`}
              />
              <div
                className={`h-1 flex-1 rounded-full ${
                  i === STATUS_STEPS.length - 1
                    ? "invisible"
                    : i < currentIndex
                      ? "bg-(--joat-gold)"
                      : "bg-(--border)"
                }`}
              />
            </div>
            <span
              className={`mt-2 text-[11px] leading-tight ${
                i === currentIndex ? "text-foreground font-semibold" : "text-muted-foreground"
              }`}
            >
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function EditDetails({
  userId,
  row,
  onCancel,
  onSaved,
}: {
  userId: string;
  row: CourseStudent;
  onCancel: () => void;
  onSaved: (row: CourseStudent) => void;
}) {
  const [fullName, setFullName] = useState(row.full_name);
  const [phone, setPhone] = useState(row.phone);
  const [registrantType, setRegistrantType] = useState<RegistrantType>(row.registrant_type);
  const [college, setCollege] = useState(row.college ?? "");
  const [paymentPreference, setPaymentPreference] = useState<PaymentPreference>(
    row.payment_preference,
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (saving) return;
    if (fullName.trim().length < 2 || phone.trim().length < 7) {
      setError("Enter your full name and a valid phone number.");
      return;
    }
    setSaving(true);
    setError(null);
    const { error: updErr } = await updateCourseStudentRow(userId, {
      full_name: fullName,
      phone,
      registrant_type: registrantType,
      college,
      payment_preference: paymentPreference,
    });
    if (updErr) {
      setSaving(false);
      setError("Could not save your changes. Please try again.");
      return;
    }
    const { data } = await fetchCourseStudentRow(userId);
    setSaving(false);
    if (data) onSaved(data);
  };

  return (
    <div className="max-w-lg mx-auto px-5 py-16 lg:py-20">
      <h1 className="text-3xl font-bold text-foreground">Edit your details</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Your tier and registration status are managed by our team. Everything else you can update
        here.
      </p>

      <form onSubmit={save} className="mt-8 space-y-4">
        <div>
          <label className="text-xs text-muted-foreground">Full name *</label>
          <input
            className={inputClass}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Phone / WhatsApp *</label>
          <input className={inputClass} value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">I am a</label>
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
          <label className="text-xs text-muted-foreground">College / university (optional)</label>
          <input
            className={inputClass}
            value={college}
            onChange={(e) => setCollege(e.target.value)}
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Preferred payment</label>
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

        {error && (
          <p className="text-sm text-(--joat-red) bg-(--joat-red)/10 rounded-md px-3 py-2">
            {error}
          </p>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-md bg-(--joat-gold) text-(--joat-navy-deep) text-sm font-semibold hover:brightness-110 transition-all disabled:opacity-60"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save changes"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-md glass text-foreground text-sm font-semibold hover:bg-black/5 transition-all disabled:opacity-60"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

function AccountSummary({
  email,
  row,
  onUpdate,
}: {
  email: string;
  row: CourseStudent;
  onUpdate: (row: CourseStudent) => void;
}) {
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);
  const [editing, setEditing] = useState(false);

  const logout = async () => {
    setLoggingOut(true);
    await signOutStudent();
    void navigate({ to: "/courses/login" });
  };

  if (editing) {
    return (
      <EditDetails
        userId={row.id}
        row={row}
        onCancel={() => setEditing(false)}
        onSaved={(updated) => {
          onUpdate(updated);
          setEditing(false);
        }}
      />
    );
  }

  return (
    <div className="max-w-lg mx-auto px-5 py-16 lg:py-20">
      <h1 className="text-3xl font-bold text-foreground">Your registration</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Thanks, {row.full_name.split(" ")[0]}. Here is what we have on file.
      </p>

      <ProgressTracker status={row.status} />

      <dl className="mt-10 divide-y divide-(--border) border-t border-b border-(--border)">
        {[
          ["Name", row.full_name],
          ["Email", email],
          ["Phone", row.phone],
          ["Registering as", row.registrant_type === "parent" ? "Parent" : "Student"],
          ["College", row.college || "Not provided"],
          ["Chosen tier", TIER_LABEL[row.tier]],
          ["Payment preference", PAYMENT_LABEL[row.payment_preference]],
        ].map(([label, value]) => (
          <div key={label} className="flex items-center justify-between gap-4 py-3 text-sm">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="text-foreground font-medium text-right">{value}</dd>
          </div>
        ))}
      </dl>

      <p className="mt-6 text-sm text-muted-foreground leading-relaxed">
        {STATUS_NOTE[row.status]}
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-md glass text-foreground text-sm font-semibold hover:bg-black/5 transition-all"
        >
          Edit details
        </button>
        <button
          type="button"
          onClick={logout}
          disabled={loggingOut}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-md glass text-foreground text-sm font-semibold hover:bg-black/5 transition-all disabled:opacity-60"
        >
          {loggingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          Log out
        </button>
      </div>
    </div>
  );
}

export function CourseAccount() {
  const navigate = useNavigate();
  const { session, loading } = useSession();
  const [row, setRow] = useState<CourseStudent | null | undefined>(undefined);

  useEffect(() => {
    if (loading) return;
    if (!session) {
      void navigate({ to: "/courses/login" });
      return;
    }
    let active = true;
    void fetchCourseStudentRow(session.user.id).then(({ data }) => {
      if (active) setRow(data ?? null);
    });
    return () => {
      active = false;
    };
  }, [loading, session, navigate]);

  if (loading || !session || row === undefined) {
    return <LoadingBlock />;
  }

  if (row === null) {
    return (
      <FinishRegistration
        userId={session.user.id}
        email={session.user.email ?? ""}
        onDone={setRow}
      />
    );
  }

  return <AccountSummary email={session.user.email ?? ""} row={row} onUpdate={setRow} />;
}
