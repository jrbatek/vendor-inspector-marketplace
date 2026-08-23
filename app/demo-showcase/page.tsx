"use client";

import Link from "next/link";
import { useState } from "react";

type DemoTab = "request" | "active" | "history";
type ActiveInspection = {
  id: string;
  title: string;
  clientRef: string;
  location: string;
  supplier: string;
  scope: string;
  inspector: string;
  status: "On Track" | "Attention" | "Awaiting Client";
  start: string;
  end: string;
  progress: number;
  latest: string;
  next: string;
  issues: string[];
  reports: number;
};

const sampleRequest = `We need two API 570 inspectors for a refinery turnaround in Houston starting September 14 for approximately three weeks. API 570 certification, minimum 5 years refinery/petrochemical experience, current TWIC card, availability for 10-12 hour shifts, and local Houston inspectors preferred. Please send qualified CVs/resumes, availability, and rates.`;

const sampleEmail = `Hi InspectSource,\n\nWe need two API 570 inspectors for a refinery turnaround in Houston starting September 14 for approximately three weeks.\n\nRequirements:\n• API 570 certification\n• Minimum 5 years refinery/petrochemical experience\n• Current TWIC card\n• Available for 10-12 hour shifts\n• Local Houston inspectors preferred\n\nPlease send qualified CVs/resumes, availability, and rates.\n\nThanks`;

const emailHref = `mailto:inspectsource2026@gmail.com?subject=${encodeURIComponent("Inspection Request - Houston Refinery Turnaround")}&body=${encodeURIComponent(sampleEmail)}`;

const activeInspections: ActiveInspection[] = [
  {
    id: "IS-260817-014",
    title: "Hydrotreater Pressure Vessel Fabrication",
    clientRef: "PO-78421 / PV-101",
    location: "Baytown, Texas, USA",
    supplier: "Lone Star Process Equipment",
    scope: "API 510 / pressure vessel fabrication surveillance, material traceability, welding and hydrotest witness",
    inspector: "Inspector #8A722E",
    status: "Attention",
    start: "Aug 17, 2026",
    end: "Sep 11, 2026",
    progress: 61,
    latest: "Aug 22 · PMI review identified two material-traceability records requiring supplier correction before hydrotest release.",
    next: "Inspector returns Aug 24 for traceability closeout and hydrotest readiness review.",
    issues: ["2 traceability records open", "Hydrotest release pending closure"],
    reports: 4,
  },
  {
    id: "IS-260819-022",
    title: "Feed / Effluent Heat Exchanger",
    clientRef: "PO-79108 / HX-201",
    location: "Tulsa, Oklahoma, USA",
    supplier: "Gulf Thermal Systems",
    scope: "Vendor surveillance, dimensional inspection, documentation review and final release",
    inspector: "Inspector #B02554",
    status: "On Track",
    start: "Aug 19, 2026",
    end: "Aug 28, 2026",
    progress: 79,
    latest: "Aug 22 · Dimensional inspection completed with no reportable deviations. MDR review is 80% complete.",
    next: "Final documentation review and release inspection scheduled Aug 26.",
    issues: [],
    reports: 3,
  },
  {
    id: "IS-260820-031",
    title: "Alloy Piping Spool Surveillance",
    clientRef: "PO-79944 / PIPE-501",
    location: "Baton Rouge, Louisiana, USA",
    supplier: "Delta Fabrication Services",
    scope: "Welding surveillance, PMI, NDE review, material control and final documentation",
    inspector: "Inspector #2DC9E6",
    status: "Awaiting Client",
    start: "Aug 20, 2026",
    end: "Sep 18, 2026",
    progress: 43,
    latest: "Aug 22 · Supplier proposed weld repair method uploaded for review following UT rejection on Spool 501-17.",
    next: "Client disposition of repair method required before supplier proceeds with repair welding.",
    issues: ["Client approval required: weld repair method"],
    reports: 2,
  },
];

export default function DemoShowcase() {
  const [tab, setTab] = useState<DemoTab>("request");
  const [requestText, setRequestText] = useState(sampleRequest);
  const continueHref = requestText.trim() ? `/find-inspectors?request=${encodeURIComponent(requestText.trim())}` : "/find-inspectors";

  return (
    <main className="page">
      <section className="demoHeader">
        <div>
          <p className="eyebrow">InspectSource Client Demo</p>
          <h1>Client inspection workspace</h1>
          <p>Request inspection support, follow work currently in progress, and access completed inspection history from one client workspace.</p>
        </div>
      </section>

      <nav className="tabs" aria-label="Client demo sections">
        <button className={tab === "request" ? "activeTab" : ""} onClick={() => setTab("request")}>1. Request Inspection</button>
        <button className={tab === "active" ? "activeTab" : ""} onClick={() => setTab("active")}><span>2. Inspections in Progress</span><b>{activeInspections.length}</b></button>
        <button className={tab === "history" ? "activeTab" : ""} onClick={() => setTab("history")}>3. Inspection History</button>
      </nav>

      {tab === "request" && (
        <section className="tabContent">
          <div className="sectionIntro">
            <p className="eyebrow">Request Inspection</p>
            <h2>Start the way you already work</h2>
            <p>Describe the requirement, email it to InspectSource, or select the requirements through a structured interface.</p>
          </div>
          <div className="requestOptions">
            <article className="requestCard">
              <span className="step">1</span>
              <h3>Natural language request</h3>
              <p>Tell InspectSource what you need in plain English. Include any details you already know.</p>
              <textarea rows={7} value={requestText} onChange={(event) => setRequestText(event.target.value)} aria-label="Describe your inspection request" />
              <Link className="primaryButton" href={continueHref}>Find qualified inspectors</Link>
            </article>
            <article className="requestCard">
              <span className="step">2</span>
              <h3>Email your requirements</h3>
              <p>Keep using email. The AI Project Coordinator turns the email into the same structured staffing request.</p>
              <div className="emailSample"><strong>Sample email</strong><pre>{sampleEmail}</pre></div>
              <a className="primaryButton" href={emailHref}>Open sample email</a>
            </article>
            <article className="requestCard">
              <span className="step">3</span>
              <h3>Select via an interface</h3>
              <p>Use standard client fields and dropdowns to define the assignment and identify qualified inspectors.</p>
              <div className="structuredPreview">
                <span>Location</span><span>Dates</span><span>Discipline</span><span>Certification</span><span>Experience</span><span>Industry</span>
              </div>
              <Link className="primaryButton" href="/inspectors?demo=1">Open pre-filled selection form</Link>
            </article>
          </div>
        </section>
      )}

      {tab === "active" && (
        <section className="tabContent">
          <div className="sectionIntro withSummary">
            <div>
              <p className="eyebrow">Inspections in Progress</p>
              <h2>What is happening right now</h2>
              <p>See current assignments, latest inspector activity, open items and what happens next.</p>
            </div>
            <div className="portfolioStats">
              <div><strong>3</strong><span>Active</span></div>
              <div><strong>1</strong><span>Needs attention</span></div>
              <div><strong>1</strong><span>Awaiting client</span></div>
              <div><strong>9</strong><span>Reports received</span></div>
            </div>
          </div>

          <div className="activeList">
            {activeInspections.map((inspection) => (
              <article className="inspectionCard" key={inspection.id}>
                <div className="inspectionTop">
                  <div>
                    <div className="idRow"><span>{inspection.id}</span><Status status={inspection.status} /></div>
                    <h3>{inspection.title}</h3>
                    <p>{inspection.supplier} · {inspection.location}</p>
                  </div>
                  <div className="progressCircle"><strong>{inspection.progress}%</strong><span>complete</span></div>
                </div>

                <div className="keyFacts">
                  <Fact label="Client reference" value={inspection.clientRef} />
                  <Fact label="Assigned inspector" value={inspection.inspector} />
                  <Fact label="Inspection period" value={`${inspection.start} – ${inspection.end}`} />
                  <Fact label="Reports" value={`${inspection.reports} submitted`} />
                </div>

                <div className="scope"><strong>Scope</strong><p>{inspection.scope}</p></div>

                <div className="activityGrid">
                  <div className="updateBox">
                    <span className="boxLabel">Latest update</span>
                    <p>{inspection.latest}</p>
                  </div>
                  <div className="nextBox">
                    <span className="boxLabel">What happens next</span>
                    <p>{inspection.next}</p>
                  </div>
                </div>

                {inspection.issues.length > 0 && (
                  <div className={inspection.status === "Awaiting Client" ? "issueBanner clientAction" : "issueBanner"}>
                    <strong>{inspection.status === "Awaiting Client" ? "Your action is needed" : "Open items"}</strong>
                    <ul>{inspection.issues.map((issue) => <li key={issue}>{issue}</li>)}</ul>
                  </div>
                )}

                <div className="cardActions">
                  <button type="button">View inspection details</button>
                  <button type="button" className="secondary">View reports ({inspection.reports})</button>
                  <button type="button" className="secondary">Message coordinator</button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {tab === "history" && (
        <section className="tabContent">
          <div className="sectionIntro">
            <p className="eyebrow">Inspection History</p>
            <h2>Completed inspections</h2>
            <p>This will become the searchable client record of completed inspections, reports, findings, suppliers, equipment and inspectors.</p>
          </div>
          <div className="historyPlaceholder">
            <strong>Next build</strong>
            <p>We’ll build this tab after we review and approve the Inspections in Progress experience.</p>
          </div>
        </section>
      )}

      <style jsx>{`
        .page{max-width:1180px;margin:0 auto;padding:30px 18px 80px}.demoHeader,.tabContent{background:#fff;border:1px solid #e2e8f0}.demoHeader{border-radius:18px;padding:30px}.eyebrow{margin:0 0 6px;font-size:.75rem;font-weight:900;letter-spacing:.12em;text-transform:uppercase;color:#475569}.demoHeader h1{margin:0;font-size:2.1rem}.demoHeader p:not(.eyebrow),.sectionIntro>p,.sectionIntro div>p{max-width:820px;color:#64748b;line-height:1.6}.tabs{display:grid;grid-template-columns:repeat(3,1fr);margin:18px 0 0;border:1px solid #cbd5e1;border-radius:14px 14px 0 0;overflow:hidden;background:#f8fafc}.tabs button{border:0;border-right:1px solid #cbd5e1;background:transparent;padding:16px 18px;text-align:left;font:inherit;font-weight:800;cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:10px}.tabs button:last-child{border-right:0}.tabs button b{display:grid;place-items:center;min-width:25px;height:25px;border-radius:999px;background:#e2e8f0;font-size:.76rem}.tabs .activeTab{background:#0f172a;color:#fff}.tabs .activeTab b{background:#fff;color:#0f172a}.tabContent{border-top:0;border-radius:0 0 18px 18px;padding:30px}.sectionIntro h2{margin:0;font-size:1.7rem}.withSummary{display:flex;justify-content:space-between;gap:24px;align-items:flex-start}.portfolioStats{display:grid;grid-template-columns:repeat(4,minmax(90px,1fr));gap:8px}.portfolioStats div{border:1px solid #e2e8f0;border-radius:12px;padding:12px 14px;min-width:90px}.portfolioStats strong{display:block;font-size:1.35rem}.portfolioStats span{display:block;color:#64748b;font-size:.76rem;margin-top:2px}.requestOptions{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:24px}.requestCard{border:1px solid #dbe3ee;border-radius:16px;padding:22px;display:flex;flex-direction:column;min-height:390px}.requestCard h3{margin:14px 0 8px}.requestCard p{color:#64748b;line-height:1.5}.step{height:34px;width:34px;border-radius:50%;display:grid;place-items:center;background:#0f172a;color:#fff;font-weight:800}.requestCard textarea{width:100%;box-sizing:border-box;resize:vertical;border:1px solid #cbd5e1;border-radius:10px;padding:12px;font:inherit;line-height:1.45;margin:8px 0 14px}.emailSample{border:1px solid #cbd5e1;border-radius:10px;background:#f8fafc;padding:12px;margin:8px 0 14px}.emailSample strong{display:block;font-size:.75rem;text-transform:uppercase;letter-spacing:.08em;margin-bottom:7px}.emailSample pre{white-space:pre-wrap;margin:0;font:inherit;font-size:.78rem;line-height:1.38;color:#475569}.structuredPreview{display:flex;flex-wrap:wrap;gap:7px;margin:18px 0}.structuredPreview span{background:#f1f5f9;border-radius:999px;padding:7px 9px;font-size:.78rem}.primaryButton{display:block;text-align:center;text-decoration:none;background:#0f172a;color:#fff;border-radius:10px;padding:12px 14px;font-weight:800;margin-top:auto}.activeList{display:grid;gap:18px;margin-top:24px}.inspectionCard{border:1px solid #dbe3ee;border-radius:16px;padding:24px}.inspectionTop{display:flex;justify-content:space-between;gap:24px}.idRow{display:flex;align-items:center;gap:10px}.idRow>span{font-size:.76rem;font-weight:900;letter-spacing:.08em;color:#64748b}.inspectionTop h3{font-size:1.35rem;margin:9px 0 5px}.inspectionTop p{margin:0;color:#64748b}.status{border-radius:999px;padding:5px 9px;font-size:.72rem;font-weight:900}.onTrack{background:#dcfce7;color:#166534}.attention{background:#fef3c7;color:#92400e}.awaiting{background:#dbeafe;color:#1d4ed8}.progressCircle{width:82px;height:82px;border:4px solid #e2e8f0;border-radius:50%;display:flex;flex-direction:column;justify-content:center;align-items:center;flex:0 0 auto}.progressCircle strong{font-size:1.15rem}.progressCircle span{font-size:.66rem;color:#64748b}.keyFacts{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:22px 0}.fact{background:#f8fafc;border-radius:10px;padding:11px}.fact span{display:block;font-size:.69rem;font-weight:900;text-transform:uppercase;letter-spacing:.05em;color:#64748b}.fact strong{display:block;margin-top:4px;font-size:.88rem}.scope{border-top:1px solid #e2e8f0;padding-top:17px}.scope p{color:#475569;margin:5px 0;line-height:1.5}.activityGrid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:16px}.updateBox,.nextBox{border-radius:12px;padding:15px;background:#f8fafc}.nextBox{background:#f1f5f9}.boxLabel{font-size:.72rem;font-weight:900;text-transform:uppercase;letter-spacing:.07em}.updateBox p,.nextBox p{margin:7px 0 0;line-height:1.5;color:#334155}.issueBanner{margin-top:14px;padding:13px 15px;border-radius:10px;background:#fff7ed;border:1px solid #fed7aa;color:#9a3412}.clientAction{background:#eff6ff;border-color:#bfdbfe;color:#1e40af}.issueBanner ul{margin:7px 0 0;padding-left:19px}.cardActions{display:flex;gap:9px;flex-wrap:wrap;margin-top:18px}.cardActions button{border:0;background:#0f172a;color:#fff;border-radius:9px;padding:10px 13px;font-weight:800;cursor:pointer}.cardActions .secondary{background:#fff;color:#0f172a;border:1px solid #cbd5e1}.historyPlaceholder{margin-top:24px;border:1px dashed #94a3b8;border-radius:14px;padding:30px;text-align:center;color:#475569;background:#f8fafc}.historyPlaceholder p{margin:7px 0 0}@media(max-width:940px){.requestOptions{grid-template-columns:1fr}.requestCard{min-height:0}.withSummary{display:block}.portfolioStats{margin-top:18px}.keyFacts{grid-template-columns:repeat(2,1fr)}}@media(max-width:680px){.tabs{grid-template-columns:1fr}.tabs button{border-right:0;border-bottom:1px solid #cbd5e1}.tabs button:last-child{border-bottom:0}.tabContent{padding:20px}.portfolioStats{grid-template-columns:repeat(2,1fr)}.inspectionTop{align-items:flex-start}.keyFacts,.activityGrid{grid-template-columns:1fr}.progressCircle{width:68px;height:68px}.demoHeader h1{font-size:1.65rem}}
      `}</style>
    </main>
  );
}

function Status({ status }: { status: ActiveInspection["status"] }) {
  const className = status === "On Track" ? "status onTrack" : status === "Attention" ? "status attention" : "status awaiting";
  return <span className={className}>{status}</span>;
}

function Fact({ label, value }: { label: string; value: string }) {
  return <div className="fact"><span>{label}</span><strong>{value}</strong></div>;
}
