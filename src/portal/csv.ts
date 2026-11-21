// CSV export that is safe to open in Excel or Google Sheets: every cell is
// quoted, and cells starting with = + - @ (or tab/CR) get a leading apostrophe
// so an ambassador's name like "=HYPERLINK(...)" can't run as a formula.

type Cell = string | number | boolean | null | undefined;

export function csvCell(v: Cell) {
  let s = v == null ? "" : String(v);
  // Plain numbers (including negative clawbacks) can't be formulas.
  if (/^[=+\-@\t\r]/.test(s) && !/^-?\d+(\.\d+)?$/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

export function downloadCsv(filename: string, header: string[], rows: Cell[][]) {
  const text = [header, ...rows].map((r) => r.map(csvCell).join(",")).join("\r\n");
  const url = URL.createObjectURL(new Blob(["﻿" + text], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
