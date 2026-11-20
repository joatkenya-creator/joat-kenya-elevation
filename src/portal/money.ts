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
