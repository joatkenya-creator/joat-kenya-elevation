import type { ContactPayload } from "./contact";

/**
 * Submit the contact form directly from the browser to Web3Forms.
 *
 * Why client-side: Web3Forms' free plan rejects server-originated requests
 * ("This method is not allowed. Use our API in client side…"). Their access
 * keys are designed to be public — abuse is rate-limited per IP/domain inside
 * Web3Forms, not by hiding the key.
 *
 * Set `VITE_WEB3FORMS_ACCESS_KEY` in `.env.local` for local development and as
 * a Cloudflare environment variable (not a secret — it's a public key) for
 * production.
 */
export async function deliverViaWeb3Forms(p: ContactPayload, files: File[] = []): Promise<boolean> {
  const key = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY;
  if (!key) {
    console.warn("VITE_WEB3FORMS_ACCESS_KEY not set — skipping Web3Forms delivery");
    return false;
  }

  const fields = {
    access_key: key,
    from_name: "JOAT Website",
    subject: `JOAT contact · ${p.area} · ${p.first} ${p.last}`,
    name: `${p.first} ${p.last}`,
    email: p.email,
    replyto: p.email,
    message: p.message,
    service_area: p.area,
    source: p.source ?? "website",
  };

  try {
    // When the visitor attached files, submit as multipart/form-data so
    // Web3Forms can carry them through as email attachments. Otherwise the
    // JSON path is lighter.
    const init: RequestInit =
      files.length > 0
        ? (() => {
            const fd = new FormData();
            for (const [k, v] of Object.entries(fields)) fd.append(k, v);
            files.forEach((f, i) => fd.append(`attachment_${i + 1}`, f, f.name));
            return {
              method: "POST",
              headers: { accept: "application/json" },
              body: fd,
            };
          })()
        : {
            method: "POST",
            headers: {
              "content-type": "application/json",
              accept: "application/json",
            },
            body: JSON.stringify(fields),
          };

    const res = await fetch("https://api.web3forms.com/submit", init);

    const json = (await res.json().catch(() => null)) as {
      success?: boolean;
      message?: string;
    } | null;

    if (!res.ok || !json?.success) {
      console.error("Web3Forms rejected the submission", res.status, json?.message);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Web3Forms request failed", err);
    return false;
  }
}

/**
 * Notify the team by email when a job application is submitted. Reuses the same
 * Web3Forms access key as the contact form, so the email lands in the same inbox
 * (the address configured on the Web3Forms key — admin@joatkenya.com). The
 * uploaded CV/files are listed as public Storage URLs in the body, the same way
 * the contact form surfaces its attachments. Best-effort: the application is
 * already saved in Supabase, so a failed email never blocks the applicant.
 */
export async function deliverApplicationViaWeb3Forms(app: {
  jobTitle: string;
  name: string;
  email: string;
  phone: string;
  trades: string[];
  portfolio?: string | null;
  message?: string | null;
  files: { name: string; url: string }[];
  appliedAt: string;
}): Promise<boolean> {
  const key = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY;
  if (!key) {
    console.warn("VITE_WEB3FORMS_ACCESS_KEY not set — application email skipped");
    return false;
  }

  // Build a "View in dashboard" link to the applications table from the
  // project ref embedded in the Supabase URL (already public).
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const ref = supabaseUrl?.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
  const dashboardUrl = ref
    ? `https://supabase.com/dashboard/project/${ref}/editor`
    : "https://supabase.com/dashboard";

  const filesBlock = app.files.length
    ? app.files.map((f) => `  ${f.name}: ${f.url}`).join("\n")
    : "  None";

  const message = [
    "You have a new job application.",
    "",
    `Role: ${app.jobTitle}`,
    `Name: ${app.name}`,
    `Email: ${app.email}`,
    `Phone: ${app.phone}`,
    `Skills: ${app.trades.length ? app.trades.join(", ") : "Not specified"}`,
    ...(app.portfolio ? [`Portfolio: ${app.portfolio}`] : []),
    ...(app.message ? [`Message: "${app.message}"`] : []),
    "CV / files:",
    filesBlock,
    `Applied: ${app.appliedAt}`,
    "",
    `View in dashboard: ${dashboardUrl}`,
  ].join("\n");

  const fields = {
    access_key: key,
    from_name: "JOAT Careers",
    subject: `New application: ${app.jobTitle} - ${app.name}`,
    name: app.name,
    email: app.email,
    replyto: app.email,
    message,
  };

  try {
    const res = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify(fields),
    });
    const json = (await res.json().catch(() => null)) as {
      success?: boolean;
      message?: string;
    } | null;
    if (!res.ok || !json?.success) {
      console.error("Web3Forms rejected the application email", res.status, json?.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Web3Forms application email failed", err);
    return false;
  }
}

const TIER_LABEL: Record<string, string> = {
  builder: "Builder (KES 24,900)",
  shipper: "Shipper (KES 44,900)",
  pro: "Pro (KES 79,900)",
};

const PAYMENT_LABEL: Record<string, string> = {
  full: "Pay in full",
  installments: "Installments",
  parent_pays: "Parent will pay",
};

/**
 * Notify the team by email when someone finishes a course registration
 * (Supabase Auth account created + their course_students row saved). This is
 * the "where do leads get routed" step from the course brief — reuses the
 * same Web3Forms key and destination inbox as the contact form and job
 * applications, so registrations land in the same place the team already
 * checks. Best-effort: the registration is already saved in Supabase, so a
 * failed email never blocks the student.
 */
export async function deliverCourseRegistrationViaWeb3Forms(reg: {
  fullName: string;
  email: string;
  phone: string;
  registrantType: "student" | "parent";
  college?: string | null;
  tier: string;
  paymentPreference: string;
  howHeard?: string | null;
  registeredAt: string;
}): Promise<boolean> {
  const key = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY;
  if (!key) {
    console.warn("VITE_WEB3FORMS_ACCESS_KEY not set — course registration email skipped");
    return false;
  }

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const ref = supabaseUrl?.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
  const dashboardUrl = ref
    ? `https://supabase.com/dashboard/project/${ref}/editor`
    : "https://supabase.com/dashboard";

  const message = [
    "New course registration.",
    "",
    `Name: ${reg.fullName}`,
    `Email: ${reg.email}`,
    `Phone: ${reg.phone}`,
    `Registering as: ${reg.registrantType === "parent" ? "Parent" : "Student"}`,
    ...(reg.college ? [`College: ${reg.college}`] : []),
    `Tier: ${TIER_LABEL[reg.tier] ?? reg.tier}`,
    `Payment preference: ${PAYMENT_LABEL[reg.paymentPreference] ?? reg.paymentPreference}`,
    ...(reg.howHeard ? [`How they heard about us: ${reg.howHeard}`] : []),
    `Registered: ${reg.registeredAt}`,
    "",
    `View in dashboard: ${dashboardUrl}`,
  ].join("\n");

  const fields = {
    access_key: key,
    from_name: "JOAT Courses",
    subject: `New course registration: ${TIER_LABEL[reg.tier] ?? reg.tier} — ${reg.fullName}`,
    name: reg.fullName,
    email: reg.email,
    replyto: reg.email,
    message,
  };

  try {
    const res = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify(fields),
    });
    const json = (await res.json().catch(() => null)) as {
      success?: boolean;
      message?: string;
    } | null;
    if (!res.ok || !json?.success) {
      console.error("Web3Forms rejected the course registration email", res.status, json?.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Web3Forms course registration email failed", err);
    return false;
  }
}

/**
 * Notify the Director/team when a Kenya consultation is booked on
 * /kenya-consultation. Same access key and inbox as every other form on the
 * site (admin@joatkenya.com). Best-effort: the booking row is already in
 * Supabase, so a failed email never blocks the visitor.
 *
 * Only what the team needs to prepare and reply is included — no extra
 * personal data beyond what the visitor submitted.
 */
export async function deliverConsultationBookingViaWeb3Forms(b: {
  fullName: string;
  email: string;
  phone: string;
  country: string;
  company?: string;
  website?: string;
  objectives: string[];
  details: string;
  minutes: number;
  startAt: string;
  timezone: string;
}): Promise<boolean> {
  const key = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY;
  if (!key) {
    console.warn("VITE_WEB3FORMS_ACCESS_KEY not set — consultation email skipped");
    return false;
  }

  const start = new Date(b.startAt);
  const inZone = (tz: string) =>
    new Intl.DateTimeFormat("en-GB", {
      timeZone: tz,
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(start);

  const sessionName =
    b.minutes === 120
      ? "Kenya Market Entry Strategy Session (2h)"
      : "Kenya Discovery Consultation (1h)";

  const message = [
    "New Kenya consultation booking.",
    "",
    `Session: ${sessionName}`,
    `When (Nairobi): ${inZone("Africa/Nairobi")} EAT`,
    `When (client): ${inZone(b.timezone)} (${b.timezone})`,
    "",
    `Name: ${b.fullName}`,
    `Email: ${b.email}`,
    `Phone / WhatsApp: ${b.phone}`,
    `Country: ${b.country}`,
    ...(b.company ? [`Company: ${b.company}`] : []),
    ...(b.website ? [`Website: ${b.website}`] : []),
    "",
    `Objectives: ${b.objectives.join(", ")}`,
    "What they want to discuss:",
    b.details,
    "",
    "Action: reply to this email (reply-to is the client's address) to confirm",
    "the slot and send the joining link and fee details.",
  ].join("\n");

  const fields = {
    access_key: key,
    from_name: "JOAT Consultations",
    subject: `Consultation booked: ${sessionName} — ${b.fullName} (${b.country})`,
    name: b.fullName,
    email: b.email,
    replyto: b.email,
    message,
  };

  try {
    const res = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify(fields),
    });
    const json = (await res.json().catch(() => null)) as {
      success?: boolean;
      message?: string;
    } | null;
    if (!res.ok || !json?.success) {
      console.error("Web3Forms rejected the consultation email", res.status, json?.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Web3Forms consultation email failed", err);
    return false;
  }
}
