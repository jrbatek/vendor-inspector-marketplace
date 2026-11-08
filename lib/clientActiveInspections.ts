/** Fictional active work, deliberately separate from the completed portfolio. Never persist to live data. */
export type ActiveInspection = {
  id: string; client: string; project: string; vendor: string; site: string;
  contact: string; scope: string; po: string; equipment: string; inspector: string;
  stage: string; start: string; end: string;
  milestones: { name: string; date: string; status: string }[];
  reports: { id: string; title: string; date: string }[];
  ncrs: { id: string; finding: string; status: string }[];
  actions: { task: string; owner: string; due: string }[];
};

const scenarios = [
  { project: "Gulf Horizon Refinery Upgrade", vendor: "Bayou Vessel Works", site: "Houston, USA", inspector: "Inspector IS-1042", stage: "Kickoff", start: "2026-11-05", end: "2026-11-18", equipment: "Pressure vessel V-101", scope: "Review ITP and witness pressure vessel fabrication", task: "Approve inspection and test plan", owner: "Client quality lead" },
  { project: "North Sea Wind Array", vendor: "Seabreeze Fabrication", site: "Esbjerg, Denmark", inspector: "Inspector IS-1187", stage: "Document review", start: "2026-11-03", end: "2026-11-20", equipment: "Monopile MP-22", scope: "Verify welding procedures and material certificates", task: "Supply missing material certificates", owner: "Vendor document controller" },
  { project: "Desert Water Expansion", vendor: "Oasis Pump Systems", site: "Dammam, Saudi Arabia", inspector: "Inspector IS-1314", stage: "Fabrication", start: "2026-11-02", end: "2026-11-16", equipment: "Pump skid P-330", scope: "Witness fabrication and dimensional checks", task: "Confirm next witness point", owner: "Inspector IS-1314" },
  { project: "Atlantic LNG Terminal", vendor: "Coastal Valve Manufacturing", site: "Porto, Portugal", inspector: "Inspector IS-1420", stage: "Witness testing", start: "2026-11-04", end: "2026-11-12", equipment: "Cryogenic valves CV-10", scope: "Witness seat leakage and functional tests", task: "Confirm calibrated test equipment", owner: "Vendor test coordinator" },
  { project: "Pacific Hydrogen Hub", vendor: "Harbor Heat Exchange", site: "Busan, South Korea", inspector: "Inspector IS-1536", stage: "NCR follow-up", start: "2026-11-01", end: "2026-11-15", equipment: "Heat exchanger HX-45", scope: "Verify material traceability and corrective evidence", task: "Submit corrective traceability evidence", owner: "Vendor quality manager" },
  { project: "Highland Power Modernization", vendor: "Summit Turbine Services", site: "Glasgow, UK", inspector: "Inspector IS-1648", stage: "Report review", start: "2026-10-29", end: "2026-11-09", equipment: "Turbine rotor TR-08", scope: "Review balance test and dimensional report", task: "Review draft inspection report", owner: "Client engineering lead" },
  { project: "Coral Offshore Development", vendor: "Reef Controls", site: "Perth, Australia", inspector: "Inspector IS-1752", stage: "Release preparation", start: "2026-10-28", end: "2026-11-07", equipment: "Control panel CP-70", scope: "Verify FAT results and release dossier", task: "Approve final release dossier", owner: "Client procurement lead" },
];

export const ACTIVE_DEMO_INSPECTIONS: ActiveInspection[] = scenarios.map((row, index) => ({
  ...row, id: `DEMO-ACT-${index + 1}`, client: `Synthetic Client ${index + 1}`,
  contact: `Site coordinator ${index + 1} · site${index + 1}@example.com`, po: `SAMPLE-PO-${1001 + index}`,
  milestones: [
    { name: "Scope and kickoff", date: row.start, status: index === 0 ? "In progress" : "Complete" },
    { name: row.stage, date: "2026-11-06", status: "In progress" },
    { name: "Final review and release", date: row.end, status: "Upcoming" },
  ],
  reports: [{ id: `SAMPLE-ACT-${index + 1}`, title: index < 2 ? "Scope review sample" : "Interim inspection sample", date: row.start }],
  ncrs: index === 4 ? [{ id: "SAMPLE-NCR-001", finding: "Heat number absent from material traceability record", status: "Open - corrective evidence requested" }] : [],
  actions: [{ task: row.task, owner: row.owner, due: "2026-11-06" }],
}));

export type InspectionFilters = { stage: string; project: string; inspector: string; from: string; to: string };
export const EMPTY_INSPECTION_FILTERS: InspectionFilters = { stage: "", project: "", inspector: "", from: "", to: "" };

/** Date range includes inspections whose scheduled interval overlaps the requested interval. */
export function filterActiveInspections(rows: ActiveInspection[], filters: InspectionFilters) {
  if (filters.from && filters.to && filters.from > filters.to) return [];
  return rows.filter(row => (!filters.stage || row.stage === filters.stage)
    && (!filters.project || row.project === filters.project)
    && (!filters.inspector || row.inspector === filters.inspector)
    && (!filters.from || row.end >= filters.from)
    && (!filters.to || row.start <= filters.to));
}

export function activeInspectionReportHref(row: ActiveInspection, report: ActiveInspection["reports"][number]) {
  const query = new URLSearchParams({ id: report.id, project: row.project, supplier: row.vendor,
    location: row.site, date: report.date, commodity: row.equipment, inspection: row.scope,
    inspector: row.inspector, ncr: row.ncrs.length ? "1" : "0", download: "1" });
  return `/api/demo/report?${query}`;
}


/** Download-safe snapshot of filtered, fictional Client Demo in-progress inspections. */
export function exportActiveDemoInspectionsCsv(rows: ActiveInspection[]): string {
  const cell = (value: string | number) => {
    const raw = String(value);
    const safe = /^\s*[=+\-@]/.test(raw) ? "'" + raw : raw;
    return '"' + safe.replace(/"/g, '""') + '"';
  };
  const columns = [
    "Demo Only", "Inspection ID", "Client", "Project", "Vendor", "Site", "Inspector",
    "Status / Stage", "Start Date", "End Date", "Sample PO", "Scope", "Equipment",
    "Milestones", "Sample Reports", "NCR Examples", "Outstanding Actions", "Next Action",
    "Next Action Owner", "Next Action Due",
  ];
  const records = rows.map(row => [
    "SYNTHETIC - NOT VERIFIED", row.id, row.client, row.project, row.vendor, row.site, row.inspector,
    row.stage, row.start, row.end, row.po, row.scope, row.equipment, row.milestones.length,
    row.reports.length, row.ncrs.length, row.actions.length, row.actions[0]?.task ?? "",
    row.actions[0]?.owner ?? "", row.actions[0]?.due ?? "",
  ]);
  return "\uFEFF" + [columns, ...records].map(line => line.map(cell).join(",")).join("\r\n") + "\r\n";
}
