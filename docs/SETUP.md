# JOAT KENYA — Backend Setup

This site is a TanStack Start app deployed on Cloudflare Workers. Most things work without any secrets — the AI chatbot falls back to JOAT's own JACK Supabase endpoint, and the contact form still validates and shows a success state. To make the contact form actually deliver emails, follow the **Contact form: Web3Forms (recommended)** section below.

---

## Contact form: Web3Forms (recommended)

Web3Forms is the fastest path to a working contact form. It's free for 250 submissions/month, requires no DNS records or domain verification, and forwards every submission as a normal email to the inbox you register.

### Step 1 — Get an access key

1. Go to [https://web3forms.com](https://web3forms.com).
2. Enter `joatkenya120@gmail.com` and click **Get Access Key**.
3. Check your Gmail — Web3Forms sends a one-time email with your access key (a UUID-like string).
4. Click the **Activate** link in that email. Done — you don't need a password or account dashboard.

### Step 2 — Wire it in locally for testing

Create a `.dev.vars` file at the repo root (gitignored — never commit secrets):

```sh
# .dev.vars
WEB3FORMS_ACCESS_KEY=paste-your-key-here
```

Then run `npm run dev` and submit the contact form. The email arrives in `joatkenya120@gmail.com` within a few seconds.

### Step 3 — Wire it in for production

Once deployed to Cloudflare, store the key as a Workers secret:

```sh
npx wrangler secret put WEB3FORMS_ACCESS_KEY
# paste the key when prompted, press Enter
npm run build
npx wrangler deploy
```

That's it — the contact form is live.

---

## Environment variables

All optional. The site degrades gracefully if any are missing.

| Var | Purpose | Default |
|---|---|---|
| **`WEB3FORMS_ACCESS_KEY`** | Web3Forms access key (see above). Submissions arrive in the email you registered with Web3Forms. | _none — submissions logged only_ |
| `RESEND_API_KEY` | Alternative: send via Resend. Free 3,000/month. Requires a verified sender domain. | _none_ |
| `CONTACT_INBOX_EMAIL` | Where Resend sends `to:`. | `hello@joatkenya.com` |
| `CONTACT_FROM_EMAIL` | Resend `from:` (must be verified in Resend). | `JOAT Website <noreply@joatkenya.com>` |
| `CONTACT_WEBHOOK_URL` | Alternative: POST the submission as JSON to any URL (Zapier, Make, Slack incoming webhook, etc.). | _none_ |
| `ANTHROPIC_API_KEY` | Optional secondary fallback for the chatbot if JACK is down. Without it, the chatbot uses JOAT's own JACK Supabase endpoint (same as original site). | _falls back_ |
| `ANTHROPIC_MODEL` | Override the Claude model the chatbot uses. | `claude-haiku-4-5-20251001` |

If multiple email channels are set, **all of them fire** — useful to e.g. send via Web3Forms _and_ POST to a Slack webhook simultaneously.

---

## Calendly link

The Book buttons open Calendly's popup widget pointed at `https://calendly.com/joatkenya120/30min` (matches the original joatkenya.com site). Update [src/lib/links.ts](../src/lib/links.ts) (`EXTERNAL.calendly`) if the booking URL ever changes.

## Social URLs

LinkedIn / Twitter / Instagram / YouTube handles live in [src/lib/links.ts](../src/lib/links.ts) under `SOCIAL_LINKS`.

## Local development

```sh
npm install
npm run dev
```

Env vars come from `.dev.vars` at the repo root. Cloudflare's `wrangler dev` and Vite's dev server both pick that file up automatically.

## Deploying to Cloudflare

```sh
npm run build
npx wrangler deploy
```

Secrets must be set via `npx wrangler secret put <NAME>` once per environment — they don't live in `.dev.vars` for production.
