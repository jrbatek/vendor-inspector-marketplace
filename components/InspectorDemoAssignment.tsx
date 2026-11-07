"use client";

const DETAILS: Record<string, { client: string; vendor: string; location: string; dates: string; scope: string; po: string; completed: string[]; next: string; due: string }> = {
  "LNG Compressor Package": { client: "Seabright LNG (synthetic)", vendor: "Bayport Rotating Equipment", location: "Houston, Texas · Test bay 3", dates: "November 12–13, 2026", scope: "Witness mechanical run test and verify compressor release dossier against ITP rev C.", po: "DEMO-PO-4102", completed: ["November 3 · Assignment accepted", "November 4 · FAT procedure and ITP rev C reviewed", "November 5 · Test bay and inspector travel readiness confirmed"], next: "Witness the mechanical run test and collect calibration evidence; submit FAT report after the November 12–13 witness.", due: "November 16, 2026 · 17:00 CST" },
  "Gulf Horizon Refinery Upgrade": { client: "Gulf Horizon Energy (synthetic)", vendor: "Coastal Piping Works", location: "Baytown, Texas · Fabrication shop A", dates: "November 9–10, 2026", scope: "Piping weld surveillance, material traceability and hydrotest witness for process spools.", po: "DEMO-PO-4118", completed: ["November 2 · Assignment accepted", "November 3 · Purchase order and scope reviewed"], next: "Review ITP revision D and confirm hydrotest witness point with site coordinator.", due: "November 6, 2026 · 12:00 CST" },
  "Orion Deepwater Platform": { client: "Orion Offshore (synthetic)", vendor: "Hanul Package Systems", location: "Busan, South Korea · Compressor assembly hall", dates: "November 26–27, 2026", scope: "Witness compressor package FAT, review instrumentation calibration and record open punch items.", po: "DEMO-PO-4133", completed: ["November 2 · Assignment accepted", "November 3 · ITP and vendor drawings reviewed", "November 4 · Travel request submitted"], next: "Confirm itinerary and site access; vendor to supply final FAT procedure.", due: "November 18, 2026 · 09:00 KST" },
};

export default function InspectorDemoAssignment({ project, onClose }: { project: string; onClose: () => void }) {
  const detail = DETAILS[project];
  if (!detail) return null;
  return <section className="panel" aria-label="Open assignment details">
    <button onClick={onClose}>Back to active assignments</button>
    <p className="eyebrow">Synthetic assignment · {detail.po}</p><h2>{project}</h2>
    <dl><dt>Client</dt><dd>{detail.client}</dd><dt>Vendor / site</dt><dd>{detail.vendor} · {detail.location}</dd><dt>Inspector</dt><dd>Demo profile inspector</dd><dt>Scheduled dates</dt><dd>{detail.dates}</dd><dt>Site contact</dt><dd>Alex Morgan · Vendor quality coordinator · alex.morgan@example.invalid</dd><dt>Commodity / equipment</dt><dd>{project === "Gulf Horizon Refinery Upgrade" ? "Process piping / fabricated spools" : "Rotating equipment / compressor package"}</dd><dt>Scope / purchase order</dt><dd>{detail.scope} · {detail.po}</dd></dl>
    <h3>Documents</h3><p>Synthetic scope, ITP and report example. Demonstration documents carry no contractual authority.</p>
    <a className="button secondary" href={`/api/demo/report?${new URLSearchParams({ project, supplier: detail.vendor, location: detail.location, id: detail.po, date: detail.dates, inspector: "Demo profile inspector" })}`} target="_blank" rel="noreferrer">Open synthetic report PDF</a>
    <h3>Action timeline · Completed actions</h3><ol>{detail.completed.map(action => <li key={action}>{action}</li>)}</ol>
    <h3>Outstanding items / next action</h3><p>{detail.next}</p><p><strong>Due:</strong> {detail.due}</p><p><strong>Owner:</strong> Inspector, with vendor quality coordinator providing evidence.</p>
    <h3>Findings & NCRs</h3><p>{project === "LNG Compressor Package" ? "One open documentation punch item: calibration certificate evidence. No formal NCR issued in this synthetic example." : "No NCR issued. Confirm acceptance criteria before recording inspection findings."}</p>
    <style jsx>{`.panel{padding:20px;border:1px solid #cbd5e1;border-radius:14px;background:#fff;color:#0f172a}dt{font-weight:800;margin-top:12px}dd{margin:4px 0;line-height:1.5}li{margin:8px 0}.eyebrow{color:#115e59;font-weight:800;margin-top:18px}`}</style>
  </section>;
}
