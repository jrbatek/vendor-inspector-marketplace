/** Browser-only exports of fictional client demo records; never reads production data. */
export type DemoCsvValue = string | number | boolean | null | undefined;

export function safeDemoCsvCell(value: DemoCsvValue): string {
  const original = String(value ?? "");
  // Prevent spreadsheet formula execution even after leading whitespace/control characters.
  const escaped = /^[\s\u0000-\u001f]*[=+@-]/.test(original) ? "'" + original : original;
  return '"' + escaped.replace(/"/g, '""') + '"';
}

export function buildDemoCsv(
  headers: readonly string[],
  rows: readonly (readonly DemoCsvValue[])[]
): string {
  if (rows.some(row => row.length !== headers.length)) {
    throw new Error("Synthetic CSV rows must match the header length");
  }
  return [headers, ...rows].map(row => row.map(safeDemoCsvCell).join(",")).join("\r\n");
}

export function buildDemoJson<T extends Record<string, unknown>>(rows: readonly T[]): string {
  return JSON.stringify({
    dataset: "SYNTHETIC DEMO - NOT VERIFIED",
    liveIntegration: false,
    count: rows.length,
    inspections: rows,
  }, null, 2);
}
