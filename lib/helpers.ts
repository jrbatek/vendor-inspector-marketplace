export function splitCsv(value: string): string[] {
  return value.split(",").map((x) => x.trim()).filter(Boolean);
}

export function joinCsv(value?: string[] | null): string {
  return Array.isArray(value) ? value.join(", ") : "";
}

export function money(value?: number | null): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return `$${Number(value).toLocaleString()}`;
}
