"use client";

import { useMemo, useState } from "react";

const rows = [
  { inspection:"IS-10428", project:"Gulf Coast LNG Train 2", supplier:"Atlas Valve Works", country:"United States", commodity:"Valves", status:"Completed", planned:"2026-08-18", completed:"2026-08-18", ncr:"None", spend:4820 },
  { inspection:"IS-10451", project:"North Sea Compression Upgrade", supplier:"NordFab AS", country:"Norway", commodity:"Pressure Vessel", status:"Report submitted", planned:"2026-08-27", completed:"2026-08-28", ncr:"Documentation", spend:6150 },
  { inspection:"IS-10472", project:"Qatar Utilities Expansion", supplier:"Doha Electrical Systems", country:"Qatar", commodity:"Switchgear", status:"In progress", planned:"2026-09-06", completed:"", ncr:"None", spend:3880 },
  { inspection:"IS-10483", project:"Permian Water Infrastructure", supplier:"Mesa Pump & Fabrication", country:"United States", commodity:"Pump Package", status:"Pending approval", planned:"2026-09-12", completed:"", ncr:"Welding", spend:0 },
  { inspection:"IS-10491", project:"Singapore Refinery Turnaround", supplier:"Pacific Process Controls", country:"Singapore", commodity:"Instrumentation", status:"Scheduled", planned:"2026-09-15", completed:"", ncr:"None", spend:1260 },
];

function csvEscape(value:string|number){
  const text=String(value);
  return /[",\n]/.test(text)?`"${text.replace(/"/g,'""')}"`:text;
}

export default function ClientDataDemoPage(){
  const [copied,setCopied]=useState(false);
  const csv=useMemo(()=>{
    const headers=["Inspection","Project","Supplier","Country","Commodity","Status","Planned date","Completed date","NCR type","Spend USD"];
    return [headers.join(","),...rows.map(r=>[r.inspection,r.project,r.supplier,r.country,r.commodity,r.status,r.planned,r.completed,r.ncr,r.spend].map(csvEscape).join(","))].join("\n");
  },[]);

  function downloadCsv(){
    const blob=new Blob([csv],{type:"text/csv;charset=utf-8"});
    const url=URL.createObjectURL(blob);
    const link=document.createElement("a");
    link.href=url;
    link.download="inspectsource-client-demo-data.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  async function copyEndpoint(){
    await navigator.clipboard.writeText("GET /api/v1/client/inspections");
    setCopied(true);
    window.setTimeout(()=>setCopied(false),1800);
  }

  return <main className="shell">
    <div className="demoBanner" role="status"><strong>Demo Mode</strong><span>Synthetic inspection data only — nothing on this page is read from or written to a live account.</span></div>

    <section className="hero">
      <p className="eyebrow">Client data & integrations</p>
      <h1>Your inspection data should travel with you.</h1>
      <p>Explore how InspectSource can support downloadable data, API access, Excel workflows, and Power BI reporting using the same normalized inspection records.</p>
      <button className="primary" type="button" onClick={downloadCsv}>Download synthetic client data (.CSV)</button>
    </section>

    <section className="integrationGrid" aria-label="Connectivity options">
      <article><span className="icon" aria-hidden="true">↧</span><h2>Excel & CSV</h2><p>Download inspection-level records for analysis, reconciliations, supplier reviews, or ad-hoc reporting.</p><strong>Available in this demo</strong></article>
      <article><span className="icon" aria-hidden="true">API</span><h2>InspectSource API</h2><p>Connect normalized inspection, report, finding, NCR, supplier, schedule, and commercial records to your systems.</p><button type="button" className="secondary" onClick={copyEndpoint}>Copy sample endpoint</button><small aria-live="polite">{copied?"Endpoint copied.":"GET /api/v1/client/inspections"}</small></article>
      <article><span className="icon" aria-hidden="true">BI</span><h2>Power BI</h2><p>Use the API or scheduled extracts as a governed source for dashboards, trend reporting, and cross-project analytics.</p><strong>Connectivity concept demo</strong></article>
      <article><span className="icon" aria-hidden="true">ERP</span><h2>ERP & procurement</h2><p>Bring inspection status, supplier performance, reports, invoices, and approval references into enterprise workflows.</p><strong>Integration-ready data model</strong></article>
    </section>

    <section className="dataPanel">
      <div className="panelHead"><div><p className="eyebrow">Synthetic export preview</p><h2>Inspection records</h2></div><span>{rows.length} demo records</span></div>
      <div className="tableWrap"><table><thead><tr><th>Inspection</th><th>Project</th><th>Supplier</th><th>Country</th><th>Commodity</th><th>Status</th><th>NCR</th><th>Spend</th></tr></thead><tbody>{rows.map(row=><tr key={row.inspection}><td><strong>{row.inspection}</strong></td><td>{row.project}</td><td>{row.supplier}</td><td>{row.country}</td><td>{row.commodity}</td><td>{row.status}</td><td>{row.ncr}</td><td>${row.spend.toLocaleString()}</td></tr>)}</tbody></table></div>
    </section>

    <section className="flow" aria-label="Power BI connection example">
      <div><span>1</span><strong>InspectSource</strong><small>Normalized client inspection data</small></div><b aria-hidden="true">→</b><div><span>2</span><strong>API or scheduled export</strong><small>Client-authorized data delivery</small></div><b aria-hidden="true">→</b><div><span>3</span><strong>Excel / Power BI / ERP</strong><small>Your existing reporting ecosystem</small></div>
    </section>

    <p className="securityNote"><strong>Demo boundary:</strong> this experience intentionally does not issue API credentials, connect to a live tenant, or expose production data. Live API authorization and credential management remain a reviewed security implementation.</p>

    <style jsx>{`
      .shell{max-width:1240px;margin:0 auto;padding:22px 18px 72px;color:#0f172a}.demoBanner{display:flex;gap:10px;align-items:center;padding:9px 12px;border:1px solid #99f6e4;background:#f0fdfa;border-radius:10px;font-size:.86rem;color:#115e59}.demoBanner strong{white-space:nowrap}.hero{padding:32px 0 24px}.eyebrow{margin:0 0 7px;color:#0f766e;font-size:.74rem;text-transform:uppercase;letter-spacing:.12em;font-weight:900}.hero h1{font-size:clamp(2rem,4vw,3.25rem);max-width:780px;margin:0 0 10px;line-height:1.04}.hero p{max-width:820px;color:#64748b;font-size:1.05rem}.primary,.secondary{border:0;border-radius:9px;font-weight:800;cursor:pointer}.primary{margin-top:9px;padding:12px 16px;background:#0f766e;color:white}.secondary{padding:8px 10px;background:#ccfbf1;color:#115e59}.integrationGrid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}.integrationGrid article{padding:19px;border:1px solid #dbe3ee;border-radius:14px;background:white;display:flex;flex-direction:column;gap:8px}.integrationGrid h2,.integrationGrid p{margin:0}.integrationGrid p{color:#64748b;font-size:.9rem;line-height:1.45}.integrationGrid strong,.integrationGrid small{margin-top:auto;color:#0f766e;font-size:.8rem}.icon{display:grid;place-items:center;width:40px;height:40px;border-radius:10px;background:#ecfeff;color:#0f766e;font-weight:900;font-size:.78rem}.dataPanel{margin-top:18px;border:1px solid #dbe3ee;background:white;border-radius:16px;overflow:hidden}.panelHead{display:flex;justify-content:space-between;align-items:end;padding:18px}.panelHead h2{margin:0}.panelHead span{color:#64748b;font-size:.84rem}.tableWrap{overflow-x:auto}table{width:100%;border-collapse:collapse;min-width:930px}th,td{text-align:left;padding:11px 13px;border-top:1px solid #e2e8f0;font-size:.84rem}th{background:#f8fafc;color:#475569;text-transform:uppercase;letter-spacing:.04em;font-size:.7rem}.flow{display:grid;grid-template-columns:1fr auto 1fr auto 1fr;align-items:center;gap:12px;margin-top:18px;padding:18px;background:#f8fafc;border-radius:14px}.flow div{display:grid;grid-template-columns:auto 1fr;column-gap:10px;align-items:center}.flow div>span{grid-row:1/3;width:30px;height:30px;display:grid;place-items:center;border-radius:50%;background:#0f766e;color:#fff;font-weight:900}.flow small{color:#64748b}.flow b{color:#94a3b8}.securityNote{margin-top:16px;padding:13px 15px;border-left:4px solid #0f766e;background:#f0fdfa;color:#334155}@media(max-width:900px){.integrationGrid{grid-template-columns:1fr 1fr}.flow{grid-template-columns:1fr}.flow b{transform:rotate(90deg);justify-self:center}}@media(max-width:580px){.integrationGrid{grid-template-columns:1fr}.demoBanner{align-items:flex-start;flex-direction:column}.hero{padding-top:24px}}
    `}</style>
  </main>;
}
