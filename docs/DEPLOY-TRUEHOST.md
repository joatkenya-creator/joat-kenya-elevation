# Deploying joat-kenya-elevation to Truehost (or any Apache shared host)

This project is now a **static SPA**. The build emits plain HTML, JS, CSS and assets — no server runtime is needed. Truehost (cPanel + Apache) serves it like a static site, and React Router handles all in-page navigation client-side.

---

## 1. Build locally

```sh
npm install            # only the first time
npm run build
```

Output lands in `dist/`. After a build, the folder should contain:

```
dist/
├── index.html
├── .htaccess               ← Apache config (SPA fallback + caching + compression)
├── assets/                 ← hashed JS, CSS, images
│   ├── index-*.js
│   ├── index-*.css
│   ├── joat-logo-*.png
│   └── …
└── videos/
    ├── abyss.mp4
    └── amares-big-planet.mp4
```

> If `.htaccess` is missing from `dist/`, confirm `public/.htaccess` exists in the repo — Vite copies everything inside `public/` to the root of `dist/` during build.

---

## 2. Upload to Truehost

### Option A — via cPanel **File Manager**

1. Log in to Truehost cPanel → **File Manager**.
2. Navigate to `public_html/` (or the docroot of `joatkenya.com`).
3. **Delete the existing contents** of that folder (old WordPress / HTML, etc.).
4. Compress `dist/` into a zip locally:
   - Windows: select all files inside `dist/` (not the folder itself), right-click → "Send to → Compressed (zipped) folder". Important: zip the **contents**, not the parent folder.
5. Upload the zip into `public_html/` via File Manager.
6. Right-click the zip → **Extract** → confirm to `public_html/`.
7. Delete the zip when done.
8. **Show hidden files** in File Manager (Settings → tick "Show Hidden Files") and confirm `.htaccess` is present.

### Option B — via FTP/SFTP (FileZilla, WinSCP)

1. Get FTP credentials from Truehost cPanel → **FTP Accounts**.
2. Connect with your FTP client.
3. Navigate to `public_html/` on the server.
4. Clear it out.
5. Upload the **contents** of your local `dist/` folder (every file and folder under `dist/`, including `.htaccess`).

### Option C — single command (rsync, if you have SSH on your Truehost plan)

```sh
rsync -avz --delete dist/ user@joatkenya.com:public_html/
```

---

## 3. Point the domain (only if not already set up)

- In Truehost cPanel → **Domains** → confirm `joatkenya.com` points to the same `public_html/` you uploaded to.
- If you use a CDN (Cloudflare, etc.), purge cache after deploy.

---

## 4. Verify

Visit each route directly (deep-linking is the canary for `.htaccess` working):

- `https://joatkenya.com/` — homepage
- `https://joatkenya.com/work-with-us` — Work With Us page
- `https://joatkenya.com/privacy` — Privacy policy
- `https://joatkenya.com/terms` — Terms of use

All four should load without a 404. If `/work-with-us` shows Apache's default 404 page, `.htaccess` isn't being read — see troubleshooting.

Also verify:
- BioBiz product card screenshots load
- Roblox gameplay videos autoplay (muted) — they live in `/videos/`
- Chatbot opens and responds (calls the public Supabase JACK endpoint directly from the browser — no server needed)
- Contact form submits and an email arrives at `joatkenya120@gmail.com` (Web3Forms key is baked into the bundle via `.env.local` at build time)

---

## 5. SSL

Truehost includes free Let's Encrypt SSL on most plans. In cPanel → **SSL/TLS Status** → Run AutoSSL for `joatkenya.com`. Once the cert is provisioned, uncomment the bottom block in `dist/.htaccess` (and locally in `public/.htaccess`) to force HTTPS:

```apache
<IfModule mod_rewrite.c>
  RewriteCond %{HTTPS} off
  RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
</IfModule>
```

Rebuild + reupload.

---

## 6. Updating the site

Every time you change code:

```sh
npm run build
```

Re-upload the contents of `dist/` (overwrite everything in `public_html/`). Because all JS/CSS filenames are content-hashed (`index-Ce55rcBL.js`), browsers will fetch the new bundle immediately. `index.html` is set to `no-cache` in `.htaccess` so it never serves a stale shell.

---

## 7. Environment variables for production

The contact form's Web3Forms key is currently in `.env.local` (gitignored). For production, either:

- Keep using `.env.local` locally — Vite bakes it into the bundle at build time. Whatever you build with locally is what ships.
- Or, on a CI/build server, set `VITE_WEB3FORMS_ACCESS_KEY=<key>` before running `npm run build`.

The Supabase JACK key and anon keys are public (designed to be embedded) — no env work needed.

---

## 8. What's gone

The following ran on Cloudflare Workers before and **no longer exists**:

- TanStack Start server functions (`createServerFn`) — all replaced by direct browser → Supabase / Web3Forms calls
- `src/server.ts` — Cloudflare Worker entry
- `src/start.ts` — TanStack Start config
- `wrangler.jsonc` — Cloudflare config
- The Resend/webhook fallback paths in the contact form — Web3Forms is now the only delivery channel (it already worked client-side)

If you ever want SSR back, restore those files from git history. Until then, the site runs on any static host (Truehost, GitHub Pages, Netlify, S3, Cloudflare Pages, etc.) with zero server.

---

## Troubleshooting

**Refresh on `/privacy` shows a 404.**
`.htaccess` isn't being applied. Check:
- `mod_rewrite` is enabled (Truehost ticks this by default; if not, contact support).
- File is named exactly `.htaccess` (leading dot, no extension) and lives in the same folder as `index.html`.
- The `AllowOverride` directive on Truehost's Apache config allows `.htaccess` rewrites. Free Truehost plans sometimes restrict this — open a support ticket if needed.

**Videos won't play / 404.**
Confirm `dist/videos/` was uploaded and that the files are exactly `abyss.mp4` and `amares-big-planet.mp4` (no spaces — the originals had spaces in the filename and Vite renamed them on copy).

**Contact form says "Message received" but no email arrives.**
- Open browser DevTools → Network tab → submit form → look at the request to `api.web3forms.com`. If you see a Cloudflare challenge HTML or a 403, the access key was wrong or Web3Forms blocked the request.
- Re-check `VITE_WEB3FORMS_ACCESS_KEY` matches the one registered against `joatkenya120@gmail.com`.

**Chatbot replies are scripted/generic instead of conversational.**
- The site is falling back to the heuristic regex replies because the JACK Supabase Edge Function couldn't be reached. Check DevTools → Network → POST to `prkdfkkhqncxkyehokop.supabase.co/functions/v1/jack`. If it's blocked, contact support.

**Vite build error: "missing module @tanstack/react-start" or similar.**
- That was deleted in the refactor. If the error shows up, search the codebase: `grep -r react-start src/` should return no results. If something still imports it, that file was missed.
