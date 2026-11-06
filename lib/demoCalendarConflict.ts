/** Browser-local safeguard for fictional linked personal calendar events. */
export function overlapsPrivateDemoEvent(
  events: readonly { date: string; state: string; external?: boolean }[],
  selectedDates: readonly string[],
): boolean {
  const selected = new Set(selectedDates);
  return events.some(event => event.external === true && event.state === "Busy" && selected.has(event.date));
}
