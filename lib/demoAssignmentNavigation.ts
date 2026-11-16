/** Fictional assignment navigation: skip additional days of the same project.
 * This is read-only and never modifies availability, credentials or calendar events.
 */
export type DemoAssignedDay = { date: string; state: string; project?: string };

export function adjacentDemoAssignmentDate(
  events: readonly DemoAssignedDay[],
  selectedDate: string,
  direction: "previous" | "next",
): string | undefined {
  const starts = new Map<string, string>();
  for (const event of events) {
    if (event.state !== "Assigned" || !event.project) continue;
    const earliest = starts.get(event.project);
    if (!earliest || event.date < earliest) starts.set(event.project, event.date);
  }
  const currentProject = events.find(event =>
    event.date === selectedDate && event.state === "Assigned" && event.project
  )?.project;
  const dates = [...starts].filter(([project, date]) =>
    project !== currentProject && (direction === "next" ? date > selectedDate : date < selectedDate)
  ).map(([, date]) => date).sort();
  return direction === "next" ? dates[0] : dates[dates.length - 1];
}
