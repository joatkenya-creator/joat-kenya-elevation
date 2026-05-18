import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const ContactInput = z.object({
  first: z.string().trim().min(1).max(80),
  last: z.string().trim().min(1).max(80),
  email: z.string().trim().email().max(160),
  area: z.string().trim().min(1).max(120),
  message: z.string().trim().min(10).max(4000),
  source: z.string().trim().max(80).optional(),
});

export type ContactPayload = z.infer<typeof ContactInput>;

function renderEmailHtml(p: ContactPayload) {
  const safe = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return `
    <div style="font-family:Inter,system-ui,sans-serif;line-height:1.55;color:#0f172a">
      <h2 style="margin:0 0 12px">New JOAT KENYA contact form submission</h2>
      <p><strong>Name:</strong> ${safe(p.first)} ${safe(p.last)}</p>
      <p><strong>Email:</strong> ${safe(p.email)}</p>
      <p><strong>Area:</strong> ${safe(p.area)}</p>
      <p><strong>Source:</strong> ${safe(p.source ?? "website")}</p>
      <hr/>
      <p style="white-space:pre-wrap">${safe(p.message)}</p>
    </div>
  `;
}

async function dispatchResend(p: ContactPayload): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;
  const to = process.env.CONTACT_INBOX_EMAIL ?? "hello@joatkenya.com";
  const from = process.env.CONTACT_FROM_EMAIL ?? "JOAT Website <noreply@joatkenya.com>";
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from,
        to,
        reply_to: p.email,
        subject: `JOAT contact · ${p.area} · ${p.first} ${p.last}`,
        html: renderEmailHtml(p),
      }),
    });
    if (!res.ok) {
      console.error("Resend error", res.status, await res.text().catch(() => ""));
      return false;
    }
    return true;
  } catch (err) {
    console.error("Resend transport error", err);
    return false;
  }
}

async function dispatchWebhook(p: ContactPayload): Promise<boolean> {
  const url = process.env.CONTACT_WEBHOOK_URL;
  if (!url) return false;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...p, receivedAt: new Date().toISOString() }),
    });
    if (!res.ok) {
      console.error("Contact webhook error", res.status, await res.text().catch(() => ""));
      return false;
    }
    return true;
  } catch (err) {
    console.error("Contact webhook transport error", err);
    return false;
  }
}

export const submitContact = createServerFn({ method: "POST" })
  .inputValidator(ContactInput)
  .handler(async ({ data }) => {
    const deliveredVia: string[] = [];
    if (await dispatchResend(data)) deliveredVia.push("resend");
    if (await dispatchWebhook(data)) deliveredVia.push("webhook");

    console.log("[contact] submission", {
      from: `${data.first} ${data.last} <${data.email}>`,
      area: data.area,
      messagePreview: data.message.slice(0, 120),
      deliveredVia,
    });

    return {
      ok: true as const,
      delivered: deliveredVia.length > 0,
      channels: deliveredVia,
    };
  });
