import type { ContactPayload } from "./contact.functions";

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
export async function deliverViaWeb3Forms(p: ContactPayload): Promise<boolean> {
  const key = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY;
  if (!key) {
    console.warn("VITE_WEB3FORMS_ACCESS_KEY not set — skipping Web3Forms delivery");
    return false;
  }

  try {
    const res = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        access_key: key,
        from_name: "JOAT KENYA Website",
        subject: `JOAT contact · ${p.area} · ${p.first} ${p.last}`,
        name: `${p.first} ${p.last}`,
        email: p.email,
        replyto: p.email,
        message: p.message,
        service_area: p.area,
        source: p.source ?? "website",
      }),
    });

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
