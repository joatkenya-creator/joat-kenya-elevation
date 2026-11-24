// payout-details-notify: emails an ambassador when their payout details change,
// so a hijacked account can't quietly redirect payouts (new details are only
// used after 7 days, which gives the real owner time to react).
//
// Called by a database trigger on affiliate_payout_details (migration
// 20261124100000). Sends at most one email per change: only when updated_at is
// newer than notified_at, so repeat or outside calls send nothing.
//
// Deploy: supabase functions deploy payout-details-notify --no-verify-jwt
// Secrets: RESEND_API_KEY, EMAIL_FROM (e.g. "JOAT Global Partners <partners@joatkenya.com>",
//          on a domain verified in Resend), optional EMAIL_REPLY_TO.

import { createClient } from "jsr:@supabase/supabase-js@2";

const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
  auth: { persistSession: false },
});
const KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const FROM = Deno.env.get("EMAIL_FROM") ?? "";
const REPLY_TO = Deno.env.get("EMAIL_REPLY_TO") || undefined;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

const reply = (status: number, msg: string) => new Response(msg, { status });

Deno.serve(async (req) => {
  if (req.method !== "POST") return reply(405, "method");
  const body = await req.json().catch(() => null);
  const id = String(body?.profile_id ?? "");
  if (!UUID.test(id)) return reply(400, "bad request");
  if (!KEY || !FROM) {
    console.error("RESEND_API_KEY or EMAIL_FROM not set");
    return reply(503, "email not configured");
  }

  const { data: d } = await db
    .from("affiliate_payout_details")
    .select("method, mpesa_phone, bank_name, account_number, updated_at, notified_at")
    .eq("profile_id", id)
    .maybeSingle();
  if (!d || (d.notified_at && d.notified_at >= d.updated_at)) return reply(200, "nothing to send");

  const { data: u, error } = await db.auth.admin.getUserById(id);
  if (error || !u.user?.email) return reply(200, "no email");

  const last4 = String(d.method === "mpesa" ? d.mpesa_phone : d.account_number).slice(-4);
  const where =
    d.method === "mpesa"
      ? `M-Pesa number ending ${last4}`
      : `${d.bank_name} account ending ${last4}`;
  const when = new Date(d.updated_at).toUTCString();
  const text = [
    "Hello,",
    "",
    `The payout details on your JOAT Global ambassador account were changed on ${when}.`,
    `Payouts will now go to: ${where}.`,
    "",
    "For your security, new details are only used for payouts at least 7 days after a change.",
    "",
    "If you didn't make this change, reply to this email right away so we can hold your payouts,",
    "and change your password at https://partners.joatkenya.com/login.",
    "",
    "JOAT Global Partners",
  ].join("\n");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { authorization: `Bearer ${KEY}`, "content-type": "application/json" },
    body: JSON.stringify({
      from: FROM,
      to: [u.user.email],
      reply_to: REPLY_TO,
      subject: "Your payout details were changed",
      text,
    }),
  });
  if (!res.ok) {
    console.error("Resend refused the email", res.status, await res.text());
    return reply(502, "send failed");
  }
  await db
    .from("affiliate_payout_details")
    .update({ notified_at: d.updated_at })
    .eq("profile_id", id);
  return reply(200, "sent");
});
