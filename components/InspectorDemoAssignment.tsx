"use client";

import { useEffect, useRef, useState } from "react";

const DETAILS: Record<string, { status: string; client: string; vendor: string; location: string; dates: string; scope: string; po: string; completed: string[]; next: string; due: string }> = {
  "LNG Compressor Package": { status: "FAT evidence review", client: "Seabright LNG (synthetic)", vendor: "Bayport Rotating Equipment", location: "Houston, Texas · Test bay 3", dates: "November 12–13, 2026", scope: "Witness mechanical run test and verify compressor release dossier against ITP rev C.", po: "DEMO-PO-4102", completed: ["November 3 · Assignment accepted", "November 4 · FAT procedure and ITP rev C reviewed", "November 5 · Test bay and inspector travel readiness confirmed", "November 13 · Mechanical FAT witnessed; calibration documentation punch item recorded"], next: "Verify missing test-bay calibration certificates and submit the November 12–13 FAT witness report.", due: "November 13, 2026 · 17:00 CST" },
  "Gulf Horizon Refinery Upgrade": { status: "NCR follow-up", client: "Gulf Horizon Energy (synthetic)", vendor: "Coastal Piping Works", location: "Baytown, Texas · Fabrication shop A", dates: "November 9–10, 2026", scope: "Piping weld surveillance, material traceability and hydrotest witness for process spools.", po: "DEMO-PO-4118", completed: ["November 2 · Assignment accepted", "November 3 · Purchase order and scope reviewed", "November 10 · Piping surveillance completed; heat-number traceability NCR recorded"], next: "Verify corrected material-traceability evidence and hydrotest witness records; finalize the piping inspection report.", due: "November 10, 2026 · 12:00 CST" },
  "Orion Deepwater Platform": { status: "Travel pending", client: "Orion Offshore (synthetic)", vendor: "Hanul Package Systems", location: "Busan, South Korea · Compressor assembly hall", dates: "November 26–27, 2026", scope: "Witness compressor package FAT, review instrumentation calibration and record open punch items.", po: "DEMO-PO-4133", completed: ["November 2 · Assignment accepted", "November 3 · ITP and vendor drawings reviewed", "November 4 · Travel request submitted"], next: "Confirm itinerary and site access; vendor to supply final FAT procedure.", due: "November 18, 2026 · 09:00 KST" },
};

/** One fictional due-date source for the card and Open Assignment detail. */
export const getInspectorDemoAssignmentDue = (project: string): string => DETAILS[project]?.due ?? "Due date to be confirmed";

type AssignmentFinding = { id: string; kind: "NCR" | "Punch item"; status: string;
  observation: string; owner: string; responseDue: string; nextVerification: string };
const ACTION_SNAPSHOT_DATE = "2026-11-17"; // Fictional immutable demo snapshot, never live task status.
type AssignmentNextAction = { id: string; action: string; owner: string; due: string; dueIso: string;
  status: "Overdue" | "Awaiting evidence" | "Upcoming" };
type AssignmentWorkflow = { siteContact: string; equipment: string;
  milestones: { name: string; date: string; status: string }[];
  documents: { name: string; status: string }[];
  findings: AssignmentFinding[];
  nextActions: AssignmentNextAction[];
};
/** Scenario-specific synthetic operational evidence. Never connected to an actual inspector or client. */
const WORKFLOWS: Record<string, AssignmentWorkflow> = {
  "LNG Compressor Package": {
    siteContact: "Taylor Lane · FAT coordinator · taylor.lane@example.invalid",
    equipment: "Centrifugal compressor train C-410 · mechanical run test",
    milestones: [
      { name: "Assignment and scope confirmed", date: "November 3", status: "Complete" },
      { name: "ITP revision C reviewed", date: "November 4", status: "Complete" },
      { name: "Mechanical FAT witnessed; calibration evidence incomplete", date: "November 12–13", status: "Complete" },
      { name: "Submit FAT report and release evidence", date: "November 16", status: "Overdue" },
    ],
    documents: [
      { name: "Purchase order DEMO-PO-4102", status: "Received" },
      { name: "Inspection and test plan, revision C", status: "Reviewed" },
      { name: "Mechanical FAT procedure and calibration evidence", status: "Evidence requested" },
    ],
    nextActions: [
      { id: "LNG-A1", action: "Provide serial-matched test-bay calibration certificates", owner: "Bayport Rotating Equipment quality coordinator", due: "Nov 13, 2026", dueIso: "2026-11-13", status: "Awaiting evidence" },
      { id: "LNG-A2", action: "Verify calibration evidence and submit FAT release report", owner: "Assigned inspector", due: "Nov 16, 2026", dueIso: "2026-11-16", status: "Overdue" },
    ],
    findings: [{
      id: "DEMO-PUNCH-4102", kind: "Punch item", status: "Open · Not a formal NCR",
      observation: "The test-bay calibration certificate is outstanding in the fictional FAT document register.",
      owner: "Bayport Rotating Equipment quality coordinator", responseDue: "November 13, 2026",
      nextVerification: "Inspector confirms certificate serials and validity before final FAT report release.",
    }],
  },
  "Gulf Horizon Refinery Upgrade": {
    siteContact: "Jordan Ellis · vendor QA lead · jordan.ellis@example.invalid",
    equipment: "Fabricated process piping spools S-17 and S-18 · hydrotest",
    milestones: [
      { name: "Assignment accepted", date: "November 2", status: "Complete" },
      { name: "Confirm ITP revision D and witness hold point", date: "November 6", status: "Overdue" },
      { name: "Weld surveillance and hydrotest evidence collected", date: "November 9–10", status: "Complete" },
      { name: "Submit piping inspection report", date: "November 11", status: "Overdue" },
    ],
    documents: [
      { name: "Purchase order DEMO-PO-4118", status: "Received" },
      { name: "Inspection and test plan, revision D", status: "Awaiting update" },
      { name: "WPS/PQR and material traceability register", status: "Under review" },
    ],
    nextActions: [
      { id: "GULF-A1", action: "Submit corrected spool S-18 heat-number traceability index", owner: "Coastal Piping Works vendor QA lead", due: "Nov 10, 2026", dueIso: "2026-11-10", status: "Overdue" },
      { id: "GULF-A2", action: "Verify updated ITP revision D and hydrotest witness evidence", owner: "Assigned inspector", due: "Nov 11, 2026", dueIso: "2026-11-11", status: "Overdue" },
    ],
    findings: [{
      id: "DEMO-NCR-4118", kind: "NCR", status: "Open · Minor (fictional)",
      observation: "Spool S-18 heat-number reference does not match the vendor material traceability index.",
      owner: "Coastal Piping Works vendor QA lead", responseDue: "November 10, 2026",
      nextVerification: "Check corrected heat-number index against the physical spool stamping and mill certificates before ITP hold-point release.",
    }],
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
    nextActions: [
      { id: "ORION-A1", action: "Confirm Busan travel itinerary and fabrication-site access", owner: "Assigned inspector", due: "Nov 18, 2026", dueIso: "2026-11-18", status: "Upcoming" },
      { id: "ORION-A2", action: "Upload final FAT procedure and instrument calibration list", owner: "Hanul Package Systems quality engineer", due: "Nov 20, 2026", dueIso: "2026-11-20", status: "Upcoming" },
    ],
    findings: [], // FAT not yet witnessed: never manufacture a finding as if inspection occurred.
  },
};

export default function InspectorDemoAssignment({ project, inspector, onClose }: { project: string; inspector: string; onClose: () => void }) {
  const [actionFilter, setActionFilter] = useState<"all" | "overdue" | "upcoming">("all");
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => { headingRef.current?.focus({ preventScroll: true }); }, [project]);
  const detail = DETAILS[project];
  const workflow = WORKFLOWS[project];
  if (!detail || !workflow) return null;
  // Frozen fictional snapshot: filtering is browser-local and cannot modify live assignments.
  const overdueCount = workflow.nextActions.filter(item => item.dueIso < ACTION_SNAPSHOT_DATE).length;
  const upcomingCount = workflow.nextActions.length - overdueCount;
  const filteredActions = workflow.nextActions.filter(item => actionFilter === "all" ||
    (actionFilter === "overdue" ? item.dueIso < ACTION_SNAPSHOT_DATE : item.dueIso >= ACTION_SNAPSHOT_DATE));
  return <section className="panel" aria-label="Open assignment details">
    <button type="button" className="backButton" onClick={onClose}>← Back to active assignments</button>
    <p className="eyebrow">Synthetic assignment · {detail.po}</p><h2 ref={headingRef} tabIndex={-1}>{project}</h2><p className="stageBadge">Stage · {detail.status}</p>
    <dl><dt>Client</dt><dd>{detail.client}</dd><dt>Vendor / site</dt><dd>{detail.vendor} · {detail.location}</dd><dt>Inspector</dt><dd>{inspector} · synthetic demo profile</dd><dt>Scheduled dates</dt><dd>{detail.dates}</dd><dt>Site contact</dt><dd>{workflow.siteContact}</dd><dt>Commodity / equipment</dt><dd>{workflow.equipment}</dd><dt>Scope / purchase order</dt><dd>{detail.scope} · {detail.po}</dd></dl>
    <h3>Milestones</h3>
    <ol className="milestones">{workflow.milestones.map(item => <li key={item.name}><strong>{item.name}</strong> · {item.date} <span className={`milestoneStatus ${item.status === "Complete" ? "complete" : item.status === "Overdue" ? "overdue" : item.status === "Scheduled" ? "scheduled" : "upcoming"}`}>{item.status}</span></li>)}</ol>
    <h3>Documents</h3><p>Fictional document-register statuses only; no live evidence is opened or retrieved.</p>
    <ul className="documents">{workflow.documents.map(doc => <li key={doc.name}><strong>{doc.name}</strong> · {doc.status}</li>)}</ul>
    <p>Synthetic scope, ITP and report example. Demonstration documents carry no contractual authority.</p>
    <a className="reportLink" href={`/api/demo/report?${new URLSearchParams({ project, supplier: detail.vendor, location: detail.location, id: detail.po, date: detail.dates, inspector })}`} target="_blank" rel="noreferrer">Open synthetic report PDF</a>
    <h3>Action timeline · Completed actions</h3><ol>{detail.completed.map(action => <li key={action}>{action}</li>)}</ol>
    <h3>Outstanding items / next action</h3>
    <p>{detail.next}</p><p><strong>Next overall due:</strong> {detail.due}</p>
    <p className="demoAsOf">Fictional action register · status snapshot as of November 17, 2026. Nothing is saved or sent.</p>
    <div className="actionFilters" role="group" aria-label="Filter synthetic outstanding actions">
      <button type="button" aria-pressed={actionFilter === "all"} onClick={() => setActionFilter("all")}>All actions ({workflow.nextActions.length})</button>
      <button type="button" aria-pressed={actionFilter === "overdue"} onClick={() => setActionFilter("overdue")}>Overdue ({overdueCount})</button>
      <button type="button" aria-pressed={actionFilter === "upcoming"} onClick={() => setActionFilter("upcoming")}>Upcoming ({upcomingCount})</button>
    </div>
    <p className={filteredActions.length === 0 ? "actionEmpty" : "demoAsOf"} role="status" aria-atomic="true">
      {filteredActions.length === 0 ? <>No {actionFilter === "overdue" ? "overdue" : "upcoming"} actions in this fictional assignment as of November 17, 2026.</> :
        <>Showing {filteredActions.length} of {workflow.nextActions.length} fictional outstanding actions · {actionFilter === "all" ? "All actions" : actionFilter === "overdue" ? "Overdue" : "Upcoming"}.</>}
    </p>
    <ul className="nextActions" aria-label="Synthetic assignment outstanding action register">
      {filteredActions.map(item => {
        // Keep disposition and lateness distinct: awaiting evidence after its due date is overdue.
        const late = item.dueIso < ACTION_SNAPSHOT_DATE;
        const urgency = late ? "overdue" : item.status === "Upcoming" ? "upcoming" : "awaiting";
        const visibleStatus = late && item.status === "Awaiting evidence" ? "Overdue · awaiting evidence" : late ? "Overdue" : item.status;
        return <li key={item.id}>
        <strong>{item.action}</strong><span className={`actionStatus ${urgency}`}>{visibleStatus}</span>
        <dl><dt>Action owner</dt><dd>{item.owner}</dd><dt>Due date</dt><dd>{item.due}</dd><dt>Reference</dt><dd>{item.id}</dd></dl>
      </li>;})}
    </ul>
    <h3>Findings & NCRs</h3>
    <p>Fictional inspection-quality tracking only. Viewing this register does not create or resolve a live NCR.</p>
    {workflow.findings.length ? <ul className="findings">{workflow.findings.map(item=>
      <li key={item.id}><strong>{item.kind} · {item.id}</strong><span className="findingStatus">{item.status}</span>
        <dl><dt>Observation</dt><dd>{item.observation}</dd><dt>Action owner</dt><dd>{item.owner}</dd>
          <dt>Response due</dt><dd>{item.responseDue}</dd><dt>Verification / next action</dt><dd>{item.nextVerification}</dd></dl>
      </li>)}</ul> :
      <p>No NCR issued. This fictional assignment has not yet reached its scheduled FAT witness; confirm acceptance criteria before documenting findings.</p>}
    <style jsx>{`.panel{padding:20px;border:1px solid #cbd5e1;border-radius:14px;background:#fff;color:#0f172a}dt{font-weight:800;margin-top:12px}dd{margin:4px 0;line-height:1.5}li{margin:8px 0}.eyebrow{color:#115e59;font-weight:800;margin-top:18px}.stageBadge{display:inline-flex;padding:6px 10px;border-radius:999px;background:#dbeafe;color:#1e40af;font-weight:800}.milestoneStatus{display:inline-flex;margin-left:6px;padding:3px 8px;background:#fef3c7;color:#92400e;border:1px solid #fcd34d;border-radius:999px;font-weight:800}.milestoneStatus.complete{background:#dcfce7;color:#166534;border-color:#86efac}.milestoneStatus.overdue{background:#fee2e2;color:#991b1b;border-color:#fca5a5}.milestoneStatus.scheduled{background:#dbeafe;color:#1e40af;border-color:#93c5fd}.milestones,.documents,.findings,.nextActions{padding-left:24px}.milestones li,.documents li,.findings li,.nextActions li{line-height:1.6}.nextActions li{padding:12px;border:1px solid #cbd5e1;border-radius:9px;margin-top:10px}.demoAsOf{color:#334155;font-size:.85rem}.actionFilters{display:flex;gap:8px;flex-wrap:wrap;margin:14px 0}.actionFilters button{min-height:44px;padding:8px 14px;border:1px solid #64748b;border-radius:9px;background:#fff;color:#0f172a;cursor:pointer;font-weight:800}.actionFilters button[aria-pressed=true]{background:#115e59;color:#fff;border-color:#115e59}.actionFilters button:hover:not([aria-pressed=true]){background:#f1f5f9;color:#0f172a}.actionFilters button:focus-visible{outline:3px solid #0d9488;outline-offset:2px}.actionEmpty{padding:12px;background:#f1f5f9;color:#334155;border-radius:8px}.actionStatus{display:inline-block;margin-left:8px;padding:3px 8px;border-radius:7px;font-size:.82rem;font-weight:800}.actionStatus.overdue{background:#fee2e2;color:#991b1b}.actionStatus.awaiting{background:#fef3c7;color:#92400e}.actionStatus.upcoming{background:#dbeafe;color:#1e40af}.findings li{padding:12px;border:1px solid #cbd5e1;border-radius:9px;margin-top:10px}.findingStatus{display:inline-flex;margin-left:8px;padding:3px 8px;border-radius:7px;background:#fef3c7;color:#92400e;font-size:.82rem;font-weight:800}.backButton,.reportLink{min-height:44px;box-sizing:border-box;display:inline-flex;align-items:center;justify-content:center;width:max-content;max-width:100%;border-radius:9px;padding:10px 12px;font-weight:800;text-decoration:none;border:1px solid #0f766e;cursor:pointer}.backButton{background:#0f766e;color:#fff}.reportLink{background:#f0fdfa;color:#115e59}.backButton:hover{background:#115e59;color:#fff}.reportLink:hover{background:#ccfbf1;color:#064e3b}.panel h2:focus-visible,.backButton:focus-visible,.reportLink:focus-visible{outline:3px solid #0d9488;outline-offset:2px}`}</style>
  </section>;
}
