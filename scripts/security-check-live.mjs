// Read-only check that the public (anon) key can't read private data on the
// live Supabase project. Run with `npm run security:live`. Sends only GETs and
// storage list calls — it never writes. Exits 1 if anything is exposed.

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;
if (!url || !key) {
  console.error("Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (in .env).");
  process.exit(2);
}
const headers = { apikey: key, Authorization: `Bearer ${key}` };

// Tables that hold personal data: the anon key must see no rows.
const PRIVATE_TABLES = [
  "applications",
  "contact_submissions",
  "consultation_bookings",
  "course_students",
  "newsletter_subscribers",
  "page_events",
  "leads",
];
// Buckets that hold uploads: the anon key must not be able to list them.
const BUCKETS = ["contact-attachments", "joatkenya-applications-and-bot"];

let failed = false;
const report = (ok, what, detail) => {
  if (!ok) failed = true;
  console.log(`${ok ? "PASS" : "FAIL"}  ${what}${detail ? `  (${detail})` : ""}`);
};

for (const t of PRIVATE_TABLES) {
  const res = await fetch(`${url}/rest/v1/${t}?select=*&limit=1`, { headers });
  const body = await res.json().catch(() => null);
  const rows = Array.isArray(body) ? body.length : 0;
  report(
    rows === 0,
    `table ${t} not readable`,
    rows ? `${rows} row(s) returned` : `HTTP ${res.status}`,
  );
}

for (const b of BUCKETS) {
  const res = await fetch(`${url}/storage/v1/object/list/${b}`, {
    method: "POST",
    headers: { ...headers, "content-type": "application/json" },
    body: JSON.stringify({ prefix: "", limit: 1 }),
  });
  const body = await res.json().catch(() => null);
  const entries = Array.isArray(body) ? body.length : 0;
  report(
    entries === 0,
    `bucket ${b} not listable`,
    entries ? "objects listed" : `HTTP ${res.status}`,
  );
}

const schema = await fetch(`${url}/rest/v1/`, { headers });
report(schema.status !== 200, "schema (OpenAPI) not public", `HTTP ${schema.status}`);

process.exit(failed ? 1 : 0);
