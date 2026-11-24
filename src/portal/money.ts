import { useQuery } from "@tanstack/react-query";

// Money arrives from the database as exact decimal strings ("100.10").
// Totals are computed in SQL; the browser only formats them for display.

export function formatMoney(amount: string | number | null | undefined, currency: string | null) {
  const value = Number(amount ?? 0);
  if (!currency) return value.toFixed(2);
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(value);
  } catch {
    return `${value.toFixed(2)} ${currency}`;
  }
}

/** A positive amount with at most two decimals, kept as a string for the database. */
export const MONEY_PATTERN = /^\d{1,12}(\.\d{1,2})?$/;

/** "Held until 20 Dec 2026" while a commission's hold period is running. */
export const holdNote = (holdUntil: string | null) =>
  holdUntil && new Date(holdUntil) > new Date() ? `Held until ${formatDay(holdUntil)}` : null;

export const formatDay = (iso: string | null) =>
  iso ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(iso)) : "–";

// Commission is in US dollars. Ambassadors outside the US also see a rough
// local-currency figure, for display only; payouts convert at the day's rate.
// ponytail: short country list; add a line here for any new market.
const LOCAL_CURRENCY: Record<string, string> = {
  kenya: "KES",
  ke: "KES",
  uganda: "UGX",
  ug: "UGX",
  tanzania: "TZS",
  tz: "TZS",
  rwanda: "RWF",
  rw: "RWF",
  nigeria: "NGN",
  ng: "NGN",
  ghana: "GHS",
  gh: "GHS",
  "south africa": "ZAR",
  za: "ZAR",
  "united kingdom": "GBP",
  uk: "GBP",
  gb: "GBP",
  canada: "CAD",
  ca: "CAD",
  australia: "AUD",
  au: "AUD",
  india: "INR",
  in: "INR",
  "united arab emirates": "AED",
  uae: "AED",
  ae: "AED",
  ireland: "EUR",
  germany: "EUR",
  france: "EUR",
  netherlands: "EUR",
  spain: "EUR",
  italy: "EUR",
};

/** The ambassador's local currency and today's USD rate, or null (US, unknown country, or rates unavailable). */
export function useLocalRate(country: string | null | undefined) {
  const currency = LOCAL_CURRENCY[(country ?? "").trim().toLowerCase().replace(/\.$/, "")];
  const rates = useQuery({
    queryKey: ["usd-rates"],
    enabled: !!currency,
    staleTime: 12 * 3_600_000,
    retry: 1,
    queryFn: async () => {
      const res = await fetch("https://open.er-api.com/v6/latest/USD");
      const json = (await res.json()) as { rates?: Record<string, number> };
      return json.rates ?? {};
    },
  });
  const rate = currency ? rates.data?.[currency] : undefined;
  return currency && rate ? { currency, rate } : null;
}

/** "≈ KES 1,290" for a USD amount, or "" when there's no local rate. */
export const approxLocal = (usd: number, local: { currency: string; rate: number } | null) =>
  local ? `≈ ${formatMoney(Math.round(usd * local.rate), local.currency)}` : "";
