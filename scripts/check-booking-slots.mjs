// Self-check for the consultation slot logic (src/lib/booking.ts): weekday
// rules, lead time, session length fitting inside the working day, and
// collisions with existing bookings. Run it with `node scripts/check-booking-slots.mjs`.
//
// Uses Vite's SSR loader (same trick as prerender.mjs) so the TypeScript module
// runs as-is, with no test framework and no build step.

import assert from "node:assert/strict";
import { createServer } from "vite";

const vite = await createServer({
  server: { middlewareMode: true, hmr: false, watch: null },
  appType: "custom",
  logLevel: "error",
  optimizeDeps: { noDiscovery: true },
});

try {
  const { slotsForDay, availableDays, bookingIcs, nairobiDayKey } =
    await vite.ssrLoadModule("/src/lib/booking.ts");

  // Fixed "now": Mon 2026-09-07 06:00 UTC (09:00 EAT).
  const now = new Date("2026-09-07T06:00:00.000Z");
  const hhmmEAT = (d) =>
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Africa/Nairobi",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);

  // Lead time: nothing inside the next 24h, so Monday itself is closed.
  assert.equal(slotsForDay("2026-09-07", 60, [], now).length, 0, "same-day slots must be blocked");

  // Tuesday is fully open: 09:00–17:00 EAT starts for a 1-hour session.
  const tue = slotsForDay("2026-09-08", 60, [], now);
  assert.deepEqual(
    [hhmmEAT(tue[0].start), hhmmEAT(tue.at(-1).start)],
    ["09:00", "17:00"],
    "1-hour sessions run 09:00–17:00 EAT",
  );

  // A 2-hour session must finish by 18:00, so the last start is 16:00.
  const tue2h = slotsForDay("2026-09-08", 120, [], now);
  assert.equal(hhmmEAT(tue2h.at(-1).start), "16:00", "2-hour sessions cannot start after 16:00");

  // Weekends are closed (2026-09-12 is a Saturday).
  assert.equal(slotsForDay("2026-09-12", 60, [], now).length, 0, "weekends must be closed");

  // A booking blocks its own slot and any session that would overlap it.
  const booked = [{ start: new Date("2026-09-08T07:00:00.000Z"), minutes: 60 }]; // 10:00 EAT
  const after = slotsForDay("2026-09-08", 60, booked, now).map((s) => hhmmEAT(s.start));
  assert.ok(!after.includes("10:00"), "a booked slot must disappear");
  assert.ok(after.includes("11:00"), "the slot after a booking stays open");
  const after2h = slotsForDay("2026-09-08", 120, booked, now).map((s) => hhmmEAT(s.start));
  assert.ok(!after2h.includes("09:00"), "a 2-hour session overlapping a booking must disappear");
  assert.ok(after2h.includes("11:00"), "a 2-hour session clear of the booking stays open");

  // availableDays returns weekdays only, starting the day after the lead time.
  const days = availableDays(60, [], now).slice(0, 6);
  assert.deepEqual(
    days,
    ["2026-09-08", "2026-09-09", "2026-09-10", "2026-09-11", "2026-09-14", "2026-09-15"],
    "available days skip the weekend and the lead-time window",
  );

  // Nairobi day keys roll over at 21:00 UTC (00:00 EAT).
  assert.equal(nairobiDayKey(new Date("2026-09-08T21:30:00.000Z")), "2026-09-09");

  // The calendar file carries the right start and length.
  const ics = bookingIcs({ startAt: "2026-09-08T07:00:00.000Z", minutes: 120, name: "Test" });
  assert.match(ics, /DTSTART:20260908T070000Z/);
  assert.match(ics, /DTEND:20260908T090000Z/);

  console.log("✓ booking slot logic OK");
} finally {
  await vite.close();
}
