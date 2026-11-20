/** Strict fictional calendar date selection; browser-local, no persistence. */
const MS_PER_DAY = 86_400_000;

function parseIsoDay(value: string): number | null {
  if (!/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(value)) return null;
  const timestamp = Date.parse(value + "T00:00:00Z");
  if (!Number.isFinite(timestamp) || new Date(timestamp).toISOString().slice(0, 10) !== value) return null;
  return timestamp;
}

/** Inclusive range of up to 62 real UTC calendar days; invalid or reversed dates yield no days. */
export function demoCalendarDateRange(start: string, end: string): string[] {
  const first = parseIsoDay(start);
  const last = parseIsoDay(end);
  if (first === null || last === null) return [];
  const count = (last - first) / MS_PER_DAY + 1;
  if (!Number.isInteger(count) || count < 1 || count > 62) return [];
  return Array.from({length:count},(_,i)=>new Date(first + i * MS_PER_DAY).toISOString().slice(0, 10));
}
