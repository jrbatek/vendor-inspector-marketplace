"use client";

const DETAILS: Record<string, { status: string; client: string; vendor: string; location: string; dates: string; scope: string; po: string; completed: string[]; next: string; due: string }> = {
  "LNG Compressor Package": { status: "FAT scheduled", client: "Seabright LNG (synthetic)", vendor: "Bayport Rotating Equipment", location: "Houston, Texas · Test bay 3", dates: "November 12–13, 2026", scope: "Witness mechanical run test and verify compressor release dossier against ITP rev C.", po: "DEMO-PO-4102", completed: ["November 3 · Assignment accepted", "November 4 · FAT procedure and ITP rev C reviewed", "November 5 · Test bay and inspector travel readiness confirmed"], next: "Witness the mechanical run test and collect calibration evidence; submit FAT report after the November 12–13 witness.", due: "November 16, 2026 · 17:00 CST" },
  "Gulf Horizon Refinery Upgrade": { status: "Scheduled", client: "Gulf Horizon Energy (synthetic)", vendor: "Coastal Piping Works", location: "Baytown, Texas · Fabrication shop A", dates: "November 9–10, 2026", scope: "Piping weld surveillance, material traceability and hydrotest witness for process spools.", po: "DEMO-PO-4118", completed: ["November 2 · Assignment accepted", "November 3 · Purchase order and scope reviewed"], next: "Review ITP revision D and confirm hydrotest witness point with site coordinator.", due: "November 6, 2026 · 12:00 CST" },
  "Orion Deepwater Platform": { status: "Travel pending", client: "Orion Offshore (synthetic)", vendor: "Hanul Package Systems", location: "Busan, South Korea · Compressor assembly hall", dates: "November 26–27, 2026", scope: "Witness compressor package FAT, review instrumentation calibration and record open punch items.", po: "DEMO-PO-4133", completed: ["November 2 · Assignment accepted", "November 3 · ITP and vendor drawings reviewed", "November 4 · Travel request submitted"], next: "Confirm itinerary and site access; vendor to supply final FAT procedure.", due: "November 18, 2026 · 09:00 KST" },
};

/** One fictional due-date source for the card and Open Assignment detail. */
export const getInspectorDemoAssignmentDue = (project: string): string => DETAILS[project]?.due ?? "Due date to be confirmed";

type AssignmentWorkflow = { siteContact: string; equipment: string;
  milestones: { name: string; date: string; status: string }[];
  documents: { name: string; status: string }[];
};
/** Scenario-specific synthetic operational evidence. Never connected to an actual inspector or client. */
const WORKFLOWS: Record<string, AssignmentWorkflow> = {
  "LNG Compressor Package": {
    siteContact: "Taylor Lane · FAT coordinator · taylor.lane@example.invalid",
    equipment: "Centrifugal compressor train C-410 · mechanical run test",
    milestones: [
      { name: "Assignment and scope confirmed", date: "November 3", status: "Complete" },
      { name: "ITP revision C reviewed", date: "November 4", status: "Complete" },
      { name: "Witness mechanical FAT", date: "November 12–13", status: "Scheduled" },
      { name: "Submit FAT report and release evidence", date: "November 16", status: "Upcoming" },
    ],
    documents: [
      { name: "Purchase order DEMO-PO-4102", status: "Received" },
      { name: "Inspection and test plan, revision C", status: "Reviewed" },
      { name: "Mechanical FAT procedure and calibration evidence", status: "Evidence requested" },
    ],
  },
  "Gulf Horizon Refinery Upgrade": {
    siteContact: "Jordan Ellis · vendor QA lead · jordan.ellis@example.invalid",
    equipment: "Fabricated process piping spools S-17 and S-18 · hydrotest",
    milestones: [
      { name: "Assignment accepted", date: "November 2", status: "Complete" },
      { name: "Confirm ITP revision D and witness hold point", date: "November 6", status: "Overdue" },
      { name: "Weld surveillance and hydrotest witness", date: "November 9–10", status: "Scheduled" },
      { name: "Submit piping inspection report", date: "November 11", status: "Upcoming" },
    ],
    documents: [
      { name: "Purchase order DEMO-PO-4118", status: "Received" },
      { name: "Inspection and test plan, revision D", status: "Awaiting update" },
      { name: "WPS/PQR and material traceability register", status: "Under review" },
    ],
  },
  "Orion Deepwater Platform": {
    siteContact: "Samira Park · package quality engineer · samira.park@example.invalid",
    equipment: "Gas compression module CK-77 · instrumentation and control skid",
    milestones: [
      { name: "Assignment accepted", date: "November 2", status: "Complete" },
      { name: "Vendor drawings and ITP reviewed", date: "November 3", status: "Complete" },
      { name: "Confirm travel and site access", date: "November 18", status: "Pending" },
      { name: "Witness package FAT", date: "November 26–27", status: "Scheduled" },
    ],
    documents: [
      { name: "Purchase order DEMO-PO-4133", status: "Received" },
      { name: "Vendor ITP and drawing register", status: "Reviewed" },
      { name: "FAT procedure and site access instructions", status: "Awaiting vendor" },
    ],
  },
};

export default function InspectorDemoAssignment({ project, inspector, onClose }: { project: string; inspector: string; onClose: () => void }) {
  const detail = DETAILS[project];
  const workflow = WORKFLOWS[project];
  if (!detail || !workflow) return null;
  return <section className="panel" aria-label="Open assignment details">
    <button type="button" className="backButton" onClick={onClose}>← Back to active assignments</button>
    <p className="eyebrow">Synthetic assignment · {detail.po}</p><h2>{project}</h2><p className="stageBadge">Stage · {detail.status}</p>
    <dl><dt>Client</dt><dd>{detail.client}</dd><dt>Vendor / site</dt><dd>{detail.vendor} · {detail.location}</dd><dt>Inspector</dt><dd>{inspector} · synthetic demo profile</dd><dt>Scheduled dates</dt><dd>{detail.dates}</dd><dt>Site contact</dt><dd>{workflow.siteContact}</dd><dt>Commodity / equipment</dt><dd>{workflow.equipment}</dd><dt>Scope / purchase order</dt><dd>{detail.scope} · {detail.po}</dd></dl>
    <h3>Milestones</h3>
    <ol className="milestones">{workflow.milestones.map(item => <li key={item.name}><strong>{item.name}</strong> · {item.date} <span className="milestoneStatus">{item.status}</span></li>)}</ol>
    <h3>Documents</h3><p>Fictional document-register statuses only; no live evidence is opened or retrieved.</p>
    <ul className="documents">{workflow.documents.map(doc => <li key={doc.name}><strong>{doc.name}</strong> · {doc.status}</li>)}</ul>
    <p>Synthetic scope, ITP and report example. Demonstration documents carry no contractual authority.</p>
    <a className="reportLink" href={`/api/demo/report?${new URLSearchParams({ project, supplier: detail.vendor, location: detail.location, id: detail.po, date: detail.dates, inspector })}`} target="_blank" rel="noreferrer">Open synthetic report PDF</a>
    <h3>Action timeline · Completed actions</h3><ol>{detail.completed.map(action => <li key={action}>{action}</li>)}</ol>
    <h3>Outstanding items / next action</h3><p>{detail.next}</p><p><strong>Due:</strong> {detail.due}</p><p><strong>Owner:</strong> Inspector, with vendor quality coordinator providing evidence.</p>
    <h3>Findings & NCRs</h3><p>{project === "LNG Compressor Package" ? "One open documentation punch item: calibration certificate evidence. No formal NCR issued in this synthetic example." : "No NCR issued. Confirm acceptance criteria before recording inspection findings."}</p>
    <style jsx>{`.panel{padding:20px;border:1px solid #cbd5e1;border-radius:14px;background:#fff;color:#0f172a}dt{font-weight:800;margin-top:12px}dd{margin:4px 0;line-height:1.5}li{margin:8px 0}.eyebrow{color:#115e59;font-weight:800;margin-top:18px}.stageBadge{display:inline-flex;padding:6px 10px;border-radius:999px;background:#dbeafe;color:#1e40af;font-weight:800}.milestoneStatus{display:inline-flex;margin-left:6px;padding:3px 8px;background:#f0fdfa;color:#115e59;border:1px solid #99f6e4;border-radius:999px;font-weight:800}.milestones,.documents{padding-left:24px}.milestones li,.documents li{line-height:1.6}.backButton,.reportLink{display:inline-flex;align-items:center;justify-content:center;width:max-content;max-width:100%;border-radius:9px;padding:10px 12px;font-weight:800;text-decoration:none;border:1px solid #0f766e;cursor:pointer}.backButton{background:#0f766e;color:#fff}.reportLink{background:#f0fdfa;color:#115e59}.backButton:hover{background:#115e59;color:#fff}.reportLink:hover{background:#ccfbf1;color:#064e3b}.backButton:focus-visible,.reportLink:focus-visible{outline:3px solid #0d9488;outline-offset:2px}`}</style>
  </section>;
}
