import { z } from "zod";
import { supabase } from "./supabase";
import { deliverConsultationBookingViaWeb3Forms } from "./web3forms";
import { AVAILABILITY } from "@/data/kenya-consultation";

/**
 * Booking engine for the Kenya consultation funnel (/kenya-consultation).
 *
 * Slots are generated from the AVAILABILITY config in Nairobi local time and
 * exposed as plain UTC Date objects, so the UI only ever formats them into the
 * visitor's own time zone. Taken slots come from the public
 * `consultation_booked_slots` view (start time + length only, no personal
 * data); the unique index on the table is what actually prevents a double
 * booking when two people click at once.
 */

export type Slot = { start: Date; minutes: number };
export type BookedSlot = { start: Date; minutes: number };

const DAY_MS = 86_400_000;

/** Nairobi is UTC+3 all year (no DST), so a Nairobi wall-clock time is just UTC-3. */
function nairobiToUtc(y: number, m: number, d: number, hour: number): Date {
  return new Date(Date.UTC(y, m - 1, d, hour - AVAILABILITY.utcOffsetHours, 0, 0, 0));
}

/** "2026-09-10" -> {y, m, d} */
export function parseDayKey(dayKey: string) {
  const [y, m, d] = dayKey.split("-").map(Number);
  return { y, m, d };
}

/** Date key ("2026-09-10") for the Nairobi calendar day a UTC instant falls in. */
export function nairobiDayKey(instant: Date): string {
  const shifted = new Date(instant.getTime() + AVAILABILITY.utcOffsetHours * 3600_000);
  return shifted.toISOString().slice(0, 10);
}

function nairobiWeekday(dayKey: string): number {
  const { y, m, d } = parseDayKey(dayKey);
  // Midday UTC keeps the weekday stable regardless of offset arithmetic.
  return new Date(Date.UTC(y, m - 1, d, 12)).getUTCDay();
}

function overlaps(aStart: number, aMin: number, bStart: number, bMin: number) {
  return aStart < bStart + bMin * 60_000 && aStart + aMin * 60_000 > bStart;
}

/**
 * Bookable start times for one Nairobi calendar day, for a session of
 * `minutes`. Filters out slots that run past the working day, fall inside the
 * lead-time window, or collide with an existing booking.
 */
export function slotsForDay(
  dayKey: string,
  minutes: number,
  booked: BookedSlot[] = [],
  now: Date = new Date(),
): Slot[] {
  if (!AVAILABILITY.weekdays.includes(nairobiWeekday(dayKey))) return [];

  const { y, m, d } = parseDayKey(dayKey);
  const earliest = now.getTime() + AVAILABILITY.leadTimeHours * 3600_000;
  const dayEndHour = AVAILABILITY.lastHour + 1; // last session must finish by then
  const slots: Slot[] = [];

  for (
    let hour = AVAILABILITY.firstHour;
    hour <= AVAILABILITY.lastHour;
    hour += AVAILABILITY.stepMinutes / 60
  ) {
    if (hour + minutes / 60 > dayEndHour) break;
    const start = nairobiToUtc(y, m, d, hour);
    if (start.getTime() < earliest) continue;
    const clash = booked.some((b) =>
      overlaps(start.getTime(), minutes, b.start.getTime(), b.minutes),
    );
    if (clash) continue;
    slots.push({ start, minutes });
  }
  return slots;
}

/** Nairobi day keys, from today forward, that have at least one open slot. */
export function availableDays(
  minutes: number,
  booked: BookedSlot[] = [],
  now: Date = new Date(),
): string[] {
  const days: string[] = [];
  for (let i = 0; i <= AVAILABILITY.horizonDays; i++) {
    const key = nairobiDayKey(new Date(now.getTime() + i * DAY_MS));
    if (slotsForDay(key, minutes, booked, now).length > 0) days.push(key);
  }
  return days;
}

/** Slots already taken, from the public view. Failure is non-fatal: the unique
 *  index still rejects a genuine collision at insert time. */
export async function fetchBookedSlots(): Promise<BookedSlot[]> {
  const { data, error } = await supabase
    .from("consultation_booked_slots")
    .select("start_at, duration_minutes");
  if (error || !data) {
    if (error) console.warn("Could not load booked slots", error.message);
    return [];
  }
  return data.map((r) => ({
    start: new Date(r.start_at as string),
    minutes: r.duration_minutes as number,
  }));
}

/* ─── Formatting ─────────────────────────────────────────────────────────── */

export const visitorTimeZone = () => Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

export function formatInZone(instant: Date, timeZone: string, opts: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("en-GB", { timeZone, ...opts }).format(instant);
}

export const formatDayLabel = (dayKey: string) => {
  const { y, m, d } = parseDayKey(dayKey);
  return formatInZone(new Date(Date.UTC(y, m - 1, d, 12)), "UTC", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
};

export const formatTime = (instant: Date, timeZone: string) =>
  formatInZone(instant, timeZone, { hour: "2-digit", minute: "2-digit" });

export const formatFull = (instant: Date, timeZone: string) =>
  formatInZone(instant, timeZone, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

/* ─── Submission ─────────────────────────────────────────────────────────── */

export const BookingInput = z.object({
  fullName: z.string().trim().min(2, "Please enter your full name").max(120),
  email: z.string().trim().email("Enter a valid email address").max(160),
  phone: z.string().trim().min(6, "Enter a phone or WhatsApp number").max(40),
  country: z.string().trim().min(2, "Where are you based?").max(80),
  company: z.string().trim().max(120).optional().or(z.literal("")),
  website: z.string().trim().max(200).optional().or(z.literal("")),
  objectives: z.array(z.string()).min(1, "Pick at least one objective"),
  details: z.string().trim().min(20, "A sentence or two helps us prepare").max(4000),
  minutes: z.union([z.literal(60), z.literal(120)]),
  startAt: z.string().datetime(),
  timezone: z.string().min(1),
});

export type BookingPayload = z.infer<typeof BookingInput>;

export type BookingResult = { ok: true } | { ok: false; error: string; slotTaken?: boolean };

export async function submitBooking(p: BookingPayload): Promise<BookingResult> {
  const { error } = await supabase.from("consultation_bookings").insert({
    duration_minutes: p.minutes,
    start_at: p.startAt,
    client_timezone: p.timezone,
    full_name: p.fullName,
    email: p.email,
    phone: p.phone,
    country: p.country,
    company: p.company || null,
    website: p.website || null,
    objectives: p.objectives,
    details: p.details,
    source: "kenya-consultation",
  });

  if (error) {
    // 23505 = unique violation: somebody took this slot between our read and
    // this insert. Recoverable — send the visitor back to pick another time.
    if (error.code === "23505") {
      return {
        ok: false,
        slotTaken: true,
        error: "That time was just booked by someone else. Please choose another slot.",
      };
    }
    console.error("Consultation booking insert failed", error);
    return {
      ok: false,
      error:
        "We couldn't save that booking just now. Please try again, or email admin@joatkenya.com.",
    };
  }

  // Notify the team. Best-effort: the booking is already stored, so a failed
  // email must never look like a failed booking to the visitor.
  await deliverConsultationBookingViaWeb3Forms(p);

  // Optional client-confirmation transport. Web3Forms only delivers to the
  // account inbox, so the confirmation email to the CLIENT needs a sender the
  // business controls (a Supabase Edge Function, Resend, etc.). Point
  // VITE_BOOKING_CONFIRMATION_ENDPOINT at it and each booking is POSTed there.
  const endpoint = import.meta.env.VITE_BOOKING_CONFIRMATION_ENDPOINT as string | undefined;
  if (endpoint) {
    try {
      await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(p),
      });
    } catch (err) {
      console.warn("Confirmation endpoint failed", err);
    }
  }

  return { ok: true };
}

/* ─── Calendar file ──────────────────────────────────────────────────────── */

const icsStamp = (d: Date) =>
  d
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");

/** Minimal single-event .ics. Downloaded from the confirmation step so the
 *  visitor holds the time even before we email them. */
export function bookingIcs(p: { startAt: string; minutes: number; name: string }): string {
  const start = new Date(p.startAt);
  const end = new Date(start.getTime() + p.minutes * 60_000);
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//J.O.A.T. Kenya//Consultation//EN",
    "BEGIN:VEVENT",
    `UID:${start.getTime()}-joat-kenya-consultation`,
    `DTSTAMP:${icsStamp(new Date())}`,
    `DTSTART:${icsStamp(start)}`,
    `DTEND:${icsStamp(end)}`,
    `SUMMARY:${p.name} with J.O.A.T. Kenya`,
    "DESCRIPTION:Joining details will be emailed by J.O.A.T. Kenya. Questions: admin@joatkenya.com / +254 142 378 150",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

/* ─── Jumping into the booking widget ────────────────────────────────────── */

/** CTAs across the page preselect a session and scroll to the booking widget,
 *  which listens for this event — so page sections don't have to thread booking
 *  state through props. */
export const SELECT_CONSULTATION_EVENT = "joat:select-consultation";

export function startBooking(minutes: 60 | 120) {
  window.dispatchEvent(new CustomEvent(SELECT_CONSULTATION_EVENT, { detail: minutes }));
  document.getElementById("book")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function downloadIcs(filename: string, ics: string) {
  const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
