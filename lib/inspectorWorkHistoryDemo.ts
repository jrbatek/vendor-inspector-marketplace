export type InspectionWorkHistory = {
  id: string;
  client: string;
  project: string;
  vendor: string;
  industry: string;
  commodity: string;
  location: string;
  assignmentType: string;
  start: string;
  completed: string;
  status: "Closed" | "Client reviewed";
  reportId: string;
  submitted: string;
  finding: string;
  ncr: boolean;
};

export type WorkHistoryFilters = {
  client: string;
  industry: string;
  commodity: string;
  status: string;
  from: string;
  to: string;
};

export const EMPTY_WORK_HISTORY_FILTERS: WorkHistoryFilters = {
  client: "", industry: "", commodity: "", status: "", from: "", to: "",
};

// All names, schedules, references, and results are fictional; no live records are loaded.
export const INSPECTOR_DEMO_WORK_HISTORY: InspectionWorkHistory[] = [
  {id:"WH-260918",client:"Northstar Energy",project:"Gulf Star Refinery Reliability Upgrade",vendor:"Seabrook Fabrication",industry:"Refining",commodity:"Piping",location:"Houston, USA",assignmentType:"Welding and piping surveillance",start:"2026-09-14",completed:"2026-09-18",status:"Client reviewed",reportId:"IR-260918",submitted:"2026-09-18",finding:"Materials and weld traceability verified; no open actions.",ncr:false},
  {id:"WH-260914",client:"Bluewater LNG",project:"Coastal Liquefaction Train 3",vendor:"Korea Precision Compressors",industry:"LNG",commodity:"Compressors",location:"Busan, South Korea",assignmentType:"FAT witness and documentation review",start:"2026-09-09",completed:"2026-09-14",status:"Closed",reportId:"IR-260914",submitted:"2026-09-15",finding:"FAT accepted subject to a minor document index correction.",ncr:true},
  {id:"WH-260909",client:"Aurora Renewables",project:"Helios Offshore Wind",vendor:"North Sea Steelworks",industry:"Offshore Wind",commodity:"Structural Steel",location:"Newcastle, UK",assignmentType:"Structural welding surveillance",start:"2026-09-03",completed:"2026-09-09",status:"Client reviewed",reportId:"IR-260909",submitted:"2026-09-10",finding:"NDT witness points completed; accepted for next fabrication stage.",ncr:false},
  {id:"WH-260902",client:"Northstar Energy",project:"West Basin Crude Expansion",vendor:"Texas Vessel Systems",industry:"Refining",commodity:"Pressure Vessels",location:"Baytown, USA",assignmentType:"Final inspection and release review",start:"2026-08-31",completed:"2026-09-02",status:"Closed",reportId:"IR-260902",submitted:"2026-09-03",finding:"An incomplete material certificate was reported for closeout.",ncr:true},
  {id:"WH-260827",client:"Meridian Power",project:"Grid Resilience Program",vendor:"Frontera Electric Works",industry:"Power",commodity:"Transformers",location:"Monterrey, Mexico",assignmentType:"Transformer FAT",start:"2026-08-24",completed:"2026-08-27",status:"Client reviewed",reportId:"IR-260827",submitted:"2026-08-28",finding:"Routine and dielectric test records met acceptance criteria.",ncr:false},
  {id:"WH-260821",client:"Bluewater LNG",project:"Coastal Liquefaction Train 3",vendor:"Alpine Valve Manufacturing",industry:"LNG",commodity:"Valves",location:"Milan, Italy",assignmentType:"Cryogenic valve inspection",start:"2026-08-19",completed:"2026-08-21",status:"Client reviewed",reportId:"IR-260821",submitted:"2026-08-22",finding:"Pressure test, marking and certificate checks accepted.",ncr:false},
  {id:"WH-260815",client:"Atlas Petrochem",project:"Orion Chemicals Modernization",vendor:"Rotterdam Thermal Equipment",industry:"Petrochemical",commodity:"Heat Exchangers",location:"Rotterdam, Netherlands",assignmentType:"Final inspection and MDR review",start:"2026-08-12",completed:"2026-08-15",status:"Closed",reportId:"IR-260815",submitted:"2026-08-16",finding:"MDR revisions required before final dossier acceptance.",ncr:true},
  {id:"WH-260808",client:"Meridian Power",project:"Riverbend Peaking Station",vendor:"Gulf Rotating Machinery",industry:"Power",commodity:"Rotating Equipment",location:"Houston, USA",assignmentType:"Pump performance FAT",start:"2026-08-05",completed:"2026-08-08",status:"Client reviewed",reportId:"IR-260808",submitted:"2026-08-09",finding:"Performance and preservation requirements verified.",ncr:false},
  {id:"WH-260731",client:"Harbor Offshore",project:"Northern Shelf Brownfield Program",vendor:"Granite Lifting Systems",industry:"Offshore",commodity:"Lifting Equipment",location:"Aberdeen, UK",assignmentType:"Lifting gear inspection",start:"2026-07-28",completed:"2026-07-31",status:"Closed",reportId:"IR-260731",submitted:"2026-08-01",finding:"Functional test and lifting certification completed.",ncr:false},
  {id:"WH-260724",client:"Atlas Petrochem",project:"Orion Chemicals Modernization",vendor:"Deccan Process Piping",industry:"Petrochemical",commodity:"Piping",location:"Pune, India",assignmentType:"Shop piping surveillance",start:"2026-07-20",completed:"2026-07-24",status:"Client reviewed",reportId:"IR-260724",submitted:"2026-07-25",finding:"Weld maps and NDT packages verified.",ncr:false},
];

export function filterInspectorWorkHistory(
  rows: InspectionWorkHistory[],
  filters: WorkHistoryFilters,
): InspectionWorkHistory[] {
  if (filters.from && filters.to && filters.from > filters.to) return [];
  return rows.filter(row =>
    (!filters.client || row.client === filters.client) &&
    (!filters.industry || row.industry === filters.industry) &&
    (!filters.commodity || row.commodity === filters.commodity) &&
    (!filters.status || row.status === filters.status) &&
    (!filters.from || row.completed >= filters.from) &&
    (!filters.to || row.completed <= filters.to)
  );
}

export function inspectorWorkReportHref(row: InspectionWorkHistory, download = false): string {
  const q = new URLSearchParams({
    id: row.reportId, project: row.project, supplier: row.vendor,
    location: row.location, date: row.completed, commodity: row.commodity,
    inspection: row.assignmentType, inspector: "Synthetic inspector (demo)",
    ncr: row.ncr ? "1" : "0", download: download ? "1" : "0",
  });
  return "/api/demo/report?" + q.toString();
}
