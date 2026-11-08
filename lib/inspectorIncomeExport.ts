import { buildDemoCsv } from "./demoClientDataExport";

export type SyntheticIncomeActivity = {
  id: string; year: number; client: string; project: string;
  type: "Contractor" | "Employee"; gross: number; paid: string;
};

export function exportSyntheticEarningsCsv(
  activities: readonly SyntheticIncomeActivity[], year: number, dataThrough: string
): string {
  const selected = activities.filter(activity => activity.year === year);
  return buildDemoCsv(
    ["Dataset", "Year", "Statement ID", "Client", "Project", "Engagement type", "Gross USD", "Paid date", "Data through"],
    selected.map(activity => [
      "SYNTHETIC DEMO - NOT VERIFIED", activity.year, activity.id,
      activity.client, activity.project, activity.type, activity.gross,
      activity.paid, dataThrough
    ])
  );
}
