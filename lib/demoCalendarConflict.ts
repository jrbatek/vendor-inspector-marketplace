/** Browser-local safeguard for fictional linked personal calendar events. */
export function overlapsPrivateDemoEvent(
  events: readonly { date: string; state: string; external?: boolean }[],
  selectedDates: readonly string[],
): boolean {
  const selected = new Set(selectedDates);
  return events.some(event => event.external === true && event.state === "Busy" && selected.has(event.date));
}

/** Remove only inspector-added browser-local blocks, restoring original fictional fixtures.
 * Imported personal events and assigned inspections are guarded in the calendar UI first.
 */
export function clearInspectorAddedDemoAvailability<T extends {date:string;manuallySet?:boolean}>(
  current: readonly T[], baseline: readonly T[], selectedDates: readonly string[],
): {events:T[];cleared:number} {
  const selected=new Set(selectedDates);
  const cleared=current.filter(event=>event.manuallySet===true&&selected.has(event.date)).length;
  if(!cleared)return {events:[...current],cleared:0};
  const kept=current.filter(event=>!(event.manuallySet===true&&selected.has(event.date)));
  const restore=baseline.filter(event=>selected.has(event.date)&&!kept.some(existing=>existing.date===event.date));
  return {events:[...kept,...restore],cleared};
}

/** Count unique protected fictional dates, not event rows. An inspection and a
 * linked private appointment may coexist on the same date; that day is one
 * non-editable date even though two separate conflicts are present.
 */
export function countProtectedDemoAvailabilityDays(
  events: readonly {date:string;state:string;external?:boolean}[],
  selectedDates: readonly string[],
): number {
  const selected=new Set(selectedDates);
  return new Set(events.filter(event=>selected.has(event.date) &&
    (event.state==="Assigned" || (event.external===true && event.state==="Busy")))
    .map(event=>event.date)).size;
}
