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
    from_name: "JOAT KENYA Website",
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
 * (the address configured on the Web3Forms key — joatkenya120@gmail.com). The
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
    from_name: "JOAT KENYA Careers",
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
