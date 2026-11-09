/** Fictional Agency Reports & NCRs CSV, generated only from the visible synthetic selection. */
import { buildDemoCsv } from "./demoClientDataExport";

export type AgencyDemoReport = Readonly<{
  inspection: string;
  inspector: string;
  source: string;
  report: string;
  finding: string;
  findingStatus: string;
  next: string;
}>;

export function exportAgencyDemoReportsCsv(rows: readonly AgencyDemoReport[]): string {
  const headers = ["Dataset","Inspection","Inspector","Agency / source","Report","Finding","NCR status","Next action"];
  const entries = rows.map(row => [
    "SYNTHETIC - NOT VERIFIED", row.inspection, row.inspector, row.source,
    row.report, row.finding, row.findingStatus, row.next
  ]);
  return "\uFEFF" + buildDemoCsv(headers, entries) + "\r\n";
}
