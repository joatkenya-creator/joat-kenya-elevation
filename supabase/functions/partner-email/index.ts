// partner-email: ambassador emails for sign-up (welcome), application received,
// approved / reinstated, rejected and suspended (the last two include the
// reviewer's reason).
//
// Called by a trigger on partner_audit_log (migration 20261125100000) with the
// new row's id. Anyone can call it, so it only acts on real, recent rows and
// sends once per event: it claims a key in partner_emails_sent before sending.
//
// Deploy: supabase functions deploy partner-email --no-verify-jwt
// Secrets: same as payout-details-notify (RESEND_API_KEY, EMAIL_FROM, optional EMAIL_REPLY_TO).

import { createClient } from "jsr:@supabase/supabase-js@2";
import { approvalHtml, shareLines } from "../_shared/approval-email.js";

const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
  auth: { persistSession: false },
});
const KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const FROM = Deno.env.get("EMAIL_FROM") ?? "";
const REPLY_TO = Deno.env.get("EMAIL_REPLY_TO") || undefined;
const PORTAL = "https://partners.joatkenya.com";
const SIGN_OFF = ["", "JOAT Global Partners"];

const reply = (status: number, msg: string) => new Response(msg, { status });

type Row = {
  id: number;
  at: string;
  action: string;
  program_id: string | null;
  subject_id: string | null;
  details: { reason?: string | null; from?: string; application_id?: string };
};

async function programNames(ids: string[]) {
  const { data } = await db.from("affiliate_programs").select("id, name").in("id", ids);
  return ids.map((id) => data?.find((p) => p.id === id)?.name ?? id).join(" and ");
}

type Highlight = { code: string | null; link: string };
type Message = { subject: string; lines: string[]; highlight?: Highlight | null };

async function shareFor(r: Row): Promise<{ lines: string[]; highlight: Highlight | null }> {
  const [{ data: prof }, { data: prog }] = await Promise.all([
    db
      .from("affiliate_memberships")
      .select("ref_code")
      .eq("profile_id", r.subject_id!)
      .eq("program_id", r.program_id!)
      .maybeSingle(),
    db
      .from("affiliate_programs")
      .select("site_url, shop_url")
      .eq("id", r.program_id!)
      .maybeSingle(),
  ]);
  if (!prof?.ref_code || !prog?.site_url) return { lines: [], highlight: null };
  const code = prof.ref_code as string;
  const s = shareLines({ code, siteUrl: prog.site_url, hasShop: !!prog.shop_url, portal: PORTAL });
  return { lines: s.lines, highlight: { code: prog.shop_url ? code : null, link: s.link } };
}

async function compose(r: Row): Promise<Message | null> {
  const reason = r.details.reason?.trim() || "No reason was given.";
  switch (r.action) {
    case "account.created":
      return {
        subject: "Welcome to JOAT Global Partners",
        lines: [
          "Welcome, and thanks for creating your JOAT Global Partners account.",
          "",
          "As an ambassador you earn commission when people you refer buy from JOAT Global",
          "or Amare's Big Planet. If you haven't applied yet, you can do it here:",
          `${PORTAL}/apply`,
          "",
          `Questions? Have a look at ${PORTAL}/faq or just reply to this email.`,
        ],
      };
    case "application.submitted": {
      const { data: app } = await db
        .from("affiliate_applications")
        .select("programs")
        .eq("id", r.details.application_id ?? "")
        .maybeSingle();
      const names = await programNames(app?.programs ?? [r.program_id!]);
      return {
        subject: "We've received your ambassador application",
        lines: [
          `Thanks for applying to the ${names} ambassador program.`,
          "",
          "Our team will review your application and email you once a decision is made.",
          `You can check its status any time at ${PORTAL}/dashboard.`,
        ],
      };
    }
    case "membership.approved": {
      const name = await programNames([r.program_id!]);
      const share = await shareFor(r);
      return r.details.from === "suspended"
        ? {
            subject: `Your ${name} ambassador account is active again`,
            lines: [
              `Good news: your ${name} ambassador account has been reinstated.`,
              "Your referral links work again from now on.",
              ...share.lines,
              "",
              `Sign in at ${PORTAL}/login to pick up where you left off.`,
            ],
            highlight: share.highlight,
          }
        : {
            subject: `You're approved as a ${name} ambassador`,
            lines: [
              `Congratulations! Your application to the ${name} ambassador program has been approved.`,
              ...share.lines,
              "",
              `Sign in at ${PORTAL}/login to find marketing resources (${PORTAL}/resources)`,
              "and add your payout details.",
            ],
            highlight: share.highlight,
          };
    }
    case "membership.rejected": {
      const name = await programNames([r.program_id!]);
      return {
        subject: `Your ${name} ambassador application`,
        lines: [
          `Thank you for your interest in the ${name} ambassador program.`,
          "After reviewing your application, we're unable to approve it at this time.",
          "",
          "Reason:",
          reason,
          "",
          `You're welcome to apply again later at ${PORTAL}/apply.`,
          "If you have questions, just reply to this email.",
        ],
      };
    }
    case "membership.suspended": {
      const name = await programNames([r.program_id!]);
      return {
        subject: `Your ${name} ambassador account has been suspended`,
        lines: [
          `Your ${name} ambassador account has been suspended.`,
          "",
          "Reason:",
          reason,
          "",
          "While suspended, your referral links stop tracking and any commission you've already",
          "earned is held until the suspension is lifted.",
          "If you think this is a mistake or want to discuss it, reply to this email.",
        ],
      };
    }
  }
  return null;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return reply(405, "method");
  const body = await req.json().catch(() => null);
  const id = Number(body?.audit_id);
  if (!Number.isSafeInteger(id) || id <= 0) return reply(400, "bad request");
  if (!KEY || !FROM) {
    console.error("RESEND_API_KEY or EMAIL_FROM not set");
    return reply(503, "email not configured");
  }

  const { data: r } = await db
    .from("partner_audit_log")
    .select("id, at, action, program_id, subject_id, details")
    .eq("id", id)
    .maybeSingle<Row>();
  // Old rows (including everything logged before this function existed) never send.
  if (!r?.subject_id || Date.now() - Date.parse(r.at) > 3600_000)
    return reply(200, "nothing to send");

  const msg = await compose(r);
  if (!msg) return reply(200, "nothing to send");

  const { data: u, error } = await db.auth.admin.getUserById(r.subject_id);
  if (error || !u.user?.email) return reply(200, "no email");

  // One email per application (it logs a row per program), otherwise one per row.
  const key =
    r.action === "application.submitted" && r.details.application_id
      ? `app:${r.details.application_id}`
      : `audit:${r.id}`;
  const claim = await db.from("partner_emails_sent").insert({ key });
  if (claim.error)
    return reply(200, claim.error.code === "23505" ? "already sent" : "claim failed");

  const { data: p } = await db
    .from("affiliate_profiles")
    .select("full_name")
    .eq("id", r.subject_id)
    .maybeSingle();
  const hello = p?.full_name ? `Hello ${p.full_name.split(/\s+/)[0]},` : "Hello,";

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { authorization: `Bearer ${KEY}`, "content-type": "application/json" },
    body: JSON.stringify({
      from: FROM,
      to: [u.user.email],
      reply_to: REPLY_TO,
      subject: msg.subject,
      text: [hello, "", ...msg.lines, ...SIGN_OFF].join("\n"),
      html: msg.highlight
        ? approvalHtml({ hello, lines: msg.lines, signOff: SIGN_OFF, ...msg.highlight })
        : undefined,
    }),
  });
  if (!res.ok) {
    console.error("Resend refused the email", res.status, await res.text());
    await db.from("partner_emails_sent").delete().eq("key", key); // let a retry send it
    return reply(502, "send failed");
  }
  return reply(200, "sent");
});
