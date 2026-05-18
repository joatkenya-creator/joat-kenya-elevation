# JOAT KENYA — Backend Setup

This site is a TanStack Start app deployed on Cloudflare Workers. Most things work without any secrets — the AI chatbot falls back to scripted answers, and the contact form still validates and shows a success state. To take the site fully live, set the environment variables below.

## Environment variables

Set via `wrangler secret put <NAME>` (recommended for keys) or as `vars` in `wrangler.jsonc` for non-secret values.

| Var | Purpose | Required | Default |
|---|---|---|---|
| `ANTHROPIC_API_KEY` | Lets the website chatbot (JACK) call the Claude API. Without it, the chatbot uses scripted fallbacks. | No (recommended) | _falls back_ |
| `ANTHROPIC_MODEL` | Override the Claude model the chatbot uses. | No | `claude-haiku-4-5-20251001` |
| `RESEND_API_KEY` | Lets the contact form send the submission via Resend. | No | _logged only_ |
| `CONTACT_INBOX_EMAIL` | Where contact form submissions land (Resend `to:`). | No | `hello@joatkenya.com` |
| `CONTACT_FROM_EMAIL` | The verified Resend sender. Must be a verified domain in Resend. | No | `JOAT Website <noreply@joatkenya.com>` |
| `CONTACT_WEBHOOK_URL` | Optional extra POST target (Zapier, Make, Slack, internal CRM). Sends JSON of every submission. | No | _disabled_ |

### Setting secrets

```sh
# AI chatbot
npx wrangler secret put ANTHROPIC_API_KEY

# Contact form via Resend
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put CONTACT_INBOX_EMAIL
npx wrangler secret put CONTACT_FROM_EMAIL

# Optional webhook (Slack incoming webhook, Zapier, etc.)
npx wrangler secret put CONTACT_WEBHOOK_URL
```

After setting secrets, redeploy:

```sh
npm run build
npx wrangler deploy
```

## Calendly link

The "Book a 30-min demo" button points to `https://calendly.com/joatkenya/30min-discovery`. Update [src/lib/links.ts](../src/lib/links.ts) (`EXTERNAL.calendly`) if the JOAT team uses a different Calendly URL or another scheduler entirely.

## Social URLs

LinkedIn / Twitter / Instagram / YouTube handles are also centralised in [src/lib/links.ts](../src/lib/links.ts) under `SOCIAL_LINKS`. Swap them with the verified account URLs once confirmed with JOAT.

## Local development

```sh
npm install
npm run dev
```

The dev server reads env vars from your shell — set `ANTHROPIC_API_KEY` etc. in your terminal before running `npm run dev` if you want to test against the real APIs.
