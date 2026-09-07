"use client";

import { useMemo, useState } from "react";

type Tab = "billing" | "contracts" | "profile";
type ContractTab = "InspectSource" | "Agencies" | "Individual Inspectors" | "Others";

const invoices = [
  { id: "INV-260901", project: "Gulf Coast Refinery Expansion", amount: 18420, balance: 0, status: "Paid", approved: "Sep 2, 2026", due: "Sep 15, 2026", po: "PO-78421" },
  { id: "INV-260914", project: "Hydrotreater Turnaround", amount: 12750, balance: 12750, status: "Awaiting approval", approved: "Pending", due: "Sep 28, 2026", po: "PO-78506" },
  { id: "INV-260922", project: "LNG Train 2 Fabrication", amount: 8960, balance: 8960, status: "Approved", approved: "Sep 6, 2026", due: "Oct 4, 2026", po: "PO-78561" },
  { id: "INV-260731", project: "Compressor Package FAT", amount: 6340, balance: 0, status: "Paid", approved: "Aug 1, 2026", due: "Aug 14, 2026", po: "PO-78198" },
];

const contracts: Record<ContractTab, Array<{name:string;type:string;status:string;effective:string;expires:string;owner:string;detail:string}>> = {
  InspectSource: [
    { name: "Master Services Agreement", type: "MSA", status: "Active", effective: "Jan 1, 2026", expires: "Dec 31, 2027", owner: "Global Procurement", detail: "Governs marketplace use, inspection coordination, reporting and commercial terms for the synthetic client account." },
    { name: "North America Inspection SOW", type: "Statement of Work", status: "Active", effective: "Apr 1, 2026", expires: "Mar 31, 2027", owner: "Inspection Services", detail: "Defines standard deliverables, reporting cadence, approval flow and client responsibilities for North American assignments." },
  ],
  Agencies: [
    { name: "Gulf Quality Services Framework", type: "Agency agreement", status: "Active", effective: "Jun 1, 2026", expires: "May 31, 2027", owner: "Supplier Management", detail: "Synthetic framework for overflow inspection support in the U.S. Gulf Coast region." },
    { name: "Asia Pacific Vendor Surveillance", type: "Regional agreement", status: "Review due", effective: "Oct 1, 2025", expires: "Sep 30, 2026", owner: "APAC Procurement", detail: "Synthetic regional agency arrangement covering China, Korea, Malaysia and Singapore supplier visits." },
  ],
  "Individual Inspectors": [
    { name: "Aisha Rahman — Assignment Terms", type: "Inspector assignment", status: "Active", effective: "Aug 18, 2026", expires: "Sep 30, 2026", owner: "Project Controls", detail: "Synthetic assignment terms for refinery turnaround inspection coverage. No real inspector identity or compensation data is used." },
    { name: "Miguel Santos — Assignment Terms", type: "Inspector assignment", status: "Completed", effective: "Jul 10, 2026", expires: "Aug 9, 2026", owner: "Project Controls", detail: "Synthetic completed assignment retained for document-history demonstration only." },
  ],
  Others: [
    { name: "Client NDA Template", type: "Confidentiality", status: "Active", effective: "Jan 1, 2026", expires: "Evergreen", owner: "Legal Operations", detail: "Synthetic template showing how ancillary client documents can be organized alongside inspection agreements." },
  ],
};

const profileFields = [
  ["Login email", "demo.client@inspectsource.example"],
  ["Phone / SMS", "+1 (713) 555-0148 · SMS enabled"],
  ["Preferred contact", "Email first, SMS for urgent inspection exceptions"],
  ["Suggested location", "Houston, Texas, USA · coarse city-level only"],
  ["Company", "Gulf Horizon Energy — Synthetic Client"],
  ["Title / department", "Inspection Manager · Capital Projects"],
  ["Timezone", "America/Chicago"],
  ["Language", "English (US)"],
  ["Notifications", "Assignment changes, report submissions, NCRs, invoice approvals"],
  ["Working hours", "Mon–Fri, 07:00–17:00 local"],
  ["Access level", "Client Administrator"],
  ["Roles", "Requester · Approver · Reporting Viewer"],
  ["Approval authority", "Inspection requests and invoices up to $25,000"],
  ["Account security", "SSO eligible · MFA concept · session/device review concept"],
];

export default function ClientOperationsDemo(){
  const [tab,setTab]=useState<Tab>("billing");
  const [contractTab,setContractTab]=useState<ContractTab>("InspectSource");
  const [expanded,setExpanded]=useState<string|null>(null);
  const total=useMemo(()=>invoices.reduce((sum,row)=>sum+row.amount,0),[]);
  const openBalance=useMemo(()=>invoices.reduce((sum,row)=>sum+row.balance,0),[]);
  const pending=invoices.filter(row=>row.status==="Awaiting approval").length;
  const paid=invoices.filter(row=>row.status==="Paid").reduce((sum,row)=>sum+row.amount,0);

  return <main className="page">
    <section className="demoBanner" aria-label="Synthetic demo notice"><strong>Client Demo · Synthetic data</strong><span>This experience is read-only, uses deterministic fictional records, and never writes to production.</span></section>
    <header className="hero"><p className="eyebrow">Client operations</p><h1>Manage the commercial and account side of your inspection program</h1><p>Explore billing, contracts and client-profile concepts with populated synthetic data. Live payment execution, legal execution, security policy changes and precise location are intentionally not enabled in this demo.</p></header>

    <nav className="tabs" aria-label="Client operations demo sections">
      <button className={tab==="billing"?"active":""} onClick={()=>setTab("billing")}>Billing & Payment</button>
      <button className={tab==="contracts"?"active":""} onClick={()=>setTab("contracts")}>Contracts</button>
      <button className={tab==="profile"?"active":""} onClick={()=>setTab("profile")}>Client Profile</button>
    </nav>

    {tab==="billing"&&<section className="section">
      <div className="sectionHead"><p className="eyebrow">Billing & Payment</p><h2>Invoices, balances, approvals and payment history</h2><p>All values below are synthetic. The demo shows the intended management experience without initiating any real charge, refund, transfer or payment-method change.</p></div>
      <div className="kpis"><Kpi label="Billed this sample period" value={money(total)}/><Kpi label="Open balance" value={money(openBalance)}/><Kpi label="Awaiting approval" value={String(pending)}/><Kpi label="Paid history" value={money(paid)}/></div>
      <div className="billingLayout">
        <section className="panel"><h3>Invoice register</h3>{invoices.map(row=>{const open=expanded===row.id;return <article className="invoice" key={row.id}><button className="invoiceSummary" onClick={()=>setExpanded(open?null:row.id)} aria-expanded={open}><div><strong>{row.id}</strong><span>{row.project}</span></div><b>{money(row.amount)}</b><Status value={row.status}/><span>{open?"−":"+"}</span></button>{open&&<div className="details"><Detail label="Purchase order" value={row.po}/><Detail label="Approval" value={row.approved}/><Detail label="Due date" value={row.due}/><Detail label="Remaining balance" value={money(row.balance)}/><p>Downloadable invoice PDF, supporting inspection records and approval audit trail would be available here in live mode.</p></div>}</article>})}</section>
        <aside className="panel sidePanel"><h3>Approval flow</h3><ol><li>Inspector or agency documentation received</li><li>InspectSource invoice assembled</li><li>Client PO and coding validated</li><li>Authorized client approver reviews</li><li>Payment status and history retained</li></ol><div className="callout"><strong>Demo safeguard</strong><span>No payment credentials, bank data or real financial account details are present.</span></div></aside>
      </div>
    </section>}

    {tab==="contracts"&&<section className="section">
      <div className="sectionHead"><p className="eyebrow">Contracts</p><h2>Structured agreements by relationship type</h2><p>Browse synthetic contract records and expandable details. No e-signature, legal acceptance or production contract mutation is performed.</p></div>
      <div className="contractTabs" role="tablist" aria-label="Contract categories">{(Object.keys(contracts) as ContractTab[]).map(name=><button key={name} role="tab" aria-selected={contractTab===name} className={contractTab===name?"active":""} onClick={()=>{setContractTab(name);setExpanded(null)}}>{name}</button>)}</div>
      <div className="contractList">{contracts[contractTab].map(row=>{const key=`${contractTab}-${row.name}`;const open=expanded===key;return <article className="contract" key={key}><button className="contractSummary" onClick={()=>setExpanded(open?null:key)} aria-expanded={open}><div><strong>{row.name}</strong><span>{row.type}</span></div><Status value={row.status}/><span>{row.expires}</span><b>{open?"−":"+"}</b></button>{open&&<div className="details contractDetails"><Detail label="Effective" value={row.effective}/><Detail label="Expiration" value={row.expires}/><Detail label="Owner" value={row.owner}/><p>{row.detail}</p><div className="documentRow"><span>Document preview</span><span>Approval history</span><span>Related assignments</span></div></div>}</article>})}</div>
    </section>}

    {tab==="profile"&&<section className="section">
      <div className="profileTop"><div className="avatar" aria-hidden="true">GH</div><div><p className="eyebrow">Client Profile</p><h2>Jordan Lee</h2><p>Inspection Manager · Gulf Horizon Energy — Synthetic Client</p></div><button type="button" className="editButton">Edit profile concept</button></div>
      <div className="profileGrid">{profileFields.map(([label,value])=><article key={label}><span>{label}</span><strong>{value}</strong></article>)}</div>
      <div className="profileColumns"><section className="panel"><h3>Notification & communication preferences</h3><p>Email summaries daily at 07:00 local. Immediate alerts for assignment changes, overdue reports, critical NCRs and invoices awaiting approval.</p><p><strong>Preferred escalation:</strong> Email → SMS for urgent exceptions.</p></section><section className="panel"><h3>Access & security concepts</h3><p>Client Administrator role with request, approval and reporting permissions. Future live controls may include SSO, MFA, session/device review and role-based approval limits.</p><p><strong>Privacy boundary:</strong> The demo shows only a coarse city-level suggested location and never requests precise geolocation.</p></section></div>
    </section>}

    <style jsx>{`.page{max-width:1240px;margin:auto;padding:22px 18px 80px}.demoBanner{display:flex;justify-content:space-between;gap:18px;align-items:center;background:#ecfeff;border:1px solid #99f6e4;border-radius:12px;padding:10px 14px;color:#134e4a;font-size:.86rem}.demoBanner span{color:#0f766e}.hero,.section,.panel{background:#fff;border:1px solid #dbe3ee}.hero{margin-top:14px;border-radius:16px;padding:24px}.hero h1,.sectionHead h2,.profileTop h2{margin:3px 0 7px}.hero p,.sectionHead p,.profileTop p,.details p,.panel p{color:#64748b;line-height:1.55}.eyebrow{margin:0;font-size:.72rem;letter-spacing:.12em;text-transform:uppercase;font-weight:900;color:#0f766e}.tabs,.contractTabs{display:flex;gap:8px;flex-wrap:wrap;margin:14px 0}.tabs button,.contractTabs button,.editButton{border:1px solid #cbd5e1;background:#fff;border-radius:9px;padding:9px 12px;font-weight:800;cursor:pointer}.tabs button.active,.contractTabs button.active{background:#0f172a;color:#fff;border-color:#0f172a}.section{border-radius:16px;padding:24px}.kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:18px 0}.kpi{padding:15px;border-radius:12px;background:#f8fafc;border:1px solid #e2e8f0}.kpi strong{display:block;font-size:1.35rem}.kpi span{color:#64748b;font-size:.76rem}.billingLayout{display:grid;grid-template-columns:minmax(0,1fr) 320px;gap:14px}.panel{border-radius:13px;padding:18px}.invoice,.contract{border-top:1px solid #e2e8f0}.invoiceSummary,.contractSummary{width:100%;border:0;background:#fff;cursor:pointer;padding:14px 4px;display:grid;align-items:center;text-align:left;gap:12px}.invoiceSummary{grid-template-columns:2fr .8fr 1fr auto}.contractSummary{grid-template-columns:2fr 1fr 1fr auto}.invoiceSummary div,.contractSummary div{display:grid}.invoiceSummary span,.contractSummary span{color:#64748b}.status{display:inline-flex;width:max-content;padding:5px 8px;border-radius:999px;background:#f1f5f9;color:#334155;font-size:.75rem}.status.Paid,.status.Active,.status.Approved,.status.Completed{background:#ecfdf5;color:#166534}.status.Awaitingapproval,.status.Reviewdue{background:#fff7ed;color:#9a3412}.details{padding:14px;background:#f8fafc;border-radius:10px;margin-bottom:12px;display:grid;grid-template-columns:repeat(2,1fr);gap:10px}.details p{grid-column:1/-1;margin:4px 0}.detail span{display:block;color:#64748b;font-size:.74rem}.sidePanel ol{padding-left:20px;color:#475569;line-height:1.8}.callout{display:grid;gap:4px;background:#f0fdfa;border-radius:10px;padding:12px;color:#115e59}.contractList{border:1px solid #e2e8f0;border-radius:12px;padding:0 14px}.documentRow{grid-column:1/-1;display:flex;gap:8px;flex-wrap:wrap}.documentRow span{padding:7px 9px;border-radius:8px;background:#e2e8f0;color:#475569;font-size:.8rem}.profileTop{display:grid;grid-template-columns:auto 1fr auto;gap:16px;align-items:center;margin-bottom:18px}.avatar{width:68px;height:68px;display:grid;place-items:center;border-radius:18px;background:#ccfbf1;color:#115e59;font-size:1.4rem;font-weight:900}.profileGrid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}.profileGrid article{padding:14px;border:1px solid #e2e8f0;border-radius:10px;background:#f8fafc}.profileGrid span{display:block;color:#64748b;font-size:.75rem;margin-bottom:4px}.profileColumns{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:14px}@media(max-width:900px){.kpis,.billingLayout,.profileColumns{grid-template-columns:1fr 1fr}.billingLayout .sidePanel{grid-column:1/-1}.invoiceSummary,.contractSummary{grid-template-columns:1fr auto}.invoiceSummary>:nth-child(2),.contractSummary>:nth-child(3){display:none}}@media(max-width:620px){.demoBanner,.profileTop{display:grid}.kpis,.profileGrid,.profileColumns,.billingLayout{grid-template-columns:1fr}.details{grid-template-columns:1fr}.details p{grid-column:auto}.section,.hero{padding:18px}.editButton{width:max-content}}`}</style>
  </main>
}

function Kpi({label,value}:{label:string;value:string}){return <div className="kpi"><strong>{value}</strong><span>{label}</span></div>}
function money(value:number){return new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0}).format(value)}
function Status({value}:{value:string}){return <span className={`status ${value.replaceAll(" ","")}`}>{value}</span>}
function Detail({label,value}:{label:string;value:string}){return <div className="detail"><span>{label}</span><strong>{value}</strong></div>}
