/** Synthetic assignment navigation. Consecutive calendar days of one project
 * are a single visit; a later return visit to that same project is distinct.
 * Read-only: no availability, credential, or production records are modified.
 */
export type DemoAssignedDay = { date: string; state: string; project?: string };

const nextIsoDay = (day: string): string => {
  const date = new Date(day + "T00:00:00Z");
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
};

type AssignmentVisit = { project: string; start: string; end: string };

export function adjacentDemoAssignmentDate(
  events: readonly DemoAssignedDay[],
  selectedDate: string,
  direction: "previous" | "next",
): string | undefined {
  const assignedByProject = new Map<string, Set<string>>();
  for (const event of events) {
    if (event.state !== "Assigned" || !event.project) continue;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(event.date)) continue;
    const dates = assignedByProject.get(event.project) || new Set<string>();
    dates.add(event.date);
    assignedByProject.set(event.project, dates);
  }

  const visits: AssignmentVisit[] = [];
  for (const [project, dates] of Array.from(assignedByProject.entries())) {
    let latest: AssignmentVisit | undefined;
    for (const date of Array.from(dates).sort()) {
      if (latest && date === nextIsoDay(latest.end)) {
        latest.end = date;
      } else {
        latest = { project, start: date, end: date };
        visits.push(latest);
      }
    }
  }
  // Staying on day two of an assignment must not navigate to its day one.
  const current = visits.find(visit => visit.start <= selectedDate && selectedDate <= visit.end);
  const candidates = visits
    .filter(visit => visit !== current && (direction === "next" ? visit.start > selectedDate : visit.start < selectedDate))
    .map(visit => visit.start)
    .sort();
  return direction === "next" ? candidates[0] : candidates[candidates.length - 1];
}
