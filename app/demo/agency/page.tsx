"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import AgencyContractsPanel from "@/components/AgencyContractsPanel";
import AgencyFeaturedOpportunities from "@/components/AgencyFeaturedOpportunities";
import { AGENCY_SYNTHETIC_RESOURCE_TOTAL } from "@/lib/agencyDemoResources";
import { exportAgencyDemoReportsCsv } from "@/lib/agencyDemoReports";
import { previewAgencyRosterCsv, type AgencyRosterCsvPreview } from "@/lib/agencyRosterCsvPreview";

const AgencyActiveInspections = dynamic(() => import("./ActiveInspectionsClient"), {
  ssr: false,
  loading: () => <p className="agencyInspectionLoading" role="status">Preparing three fictional inspection examples…</p>,
});

const resources = [
  ["IS-20418", "Maya Chen", "Employee", "Verified", "Houston / Gulf Coast", "Available Nov 12, 2026", "USD 1,080/day", "Net 45", "Mileage capped; lodging separate"],
  ["IS-11742", "Omar Haddad", "Subcontractor", "Verified", "UAE / Qatar", "Available Nov 14, 2026", "USD 1,240/day", "Net 30", "Per diem included; airfare separate"],
  ["IS-33091", "Elena Rossi", "Affiliate", "Expiring", "Italy / Central Europe", "Available Nov 16, 2026", "EUR 980/day", "Net 45", "Local travel included; OT +25%"],
  ["IS-28106", "Daniel Okafor", "Subcontractor", "Confirmation pending", "West Africa", "Available Nov 19, 2026", "USD 900/day", "Net 30", "Travel time separately billable"],
  ["IS-44127", "Priya Nair", "Affiliate", "Disputed", "India / Middle East", "Blocked", "USD 860/day", "Net 60", "Commercials held pending dispute"],
];

const syntheticRoster = "Inspector ID,Name,Relationship,Country,Affiliation Status\r\nSYN-1001,Sample Inspector A,Employee,USA,Pending\r\nSYN-1002,Sample Inspector B,Subcontractor,Mexico,Pending\r\n";
const syntheticRosterHref = `data:text/csv;charset=utf-8,${encodeURIComponent(syntheticRoster)}`;

const sampleReports = [
  { inspection:"Gulf Coast LNG", inspector:"Maya Chen", source:"Northstar · Employee", report:"Draft due Nov 16, 2026", finding:"None", findingStatus:"No NCR", next:"Agency review" },
  { inspection:"Qatar compression package", inspector:"Omar Haddad", source:"Northstar · Subcontractor", report:"Submitted", finding:"NCR-204 · Open", findingStatus:"Open", next:"Supplier response due" },
  { inspection:"Italian valve package", inspector:"Elena Rossi", source:"Northstar · Affiliate", report:"Accepted", finding:"NCR-198 · Follow-up", findingStatus:"Follow-up", next:"Reinspection Nov 20, 2026" }
] as const;
const nav = ["Overview", "Resource Pool", "Mass Resource Connect", "Opportunities", "Active Inspections", "Reports & NCRs", "Contracts & Commercials"];
const anchorFor = (item: string) => item.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g, "");

export default function AgencyDemoPage() {
  const [activeSection, setActiveSection] = useState("overview");
  const [agencyPageReady, setAgencyPageReady] = useState(false);
  useEffect(() => { setAgencyPageReady(true); }, []);
  useEffect(()=>{
    if(!agencyPageReady)return;
    const sectionIds=nav.map(anchorFor);
    const elements=sectionIds.map(id=>document.getElementById(id)).filter((el):el is HTMLElement=>Boolean(el));
    if(!elements.length)return;
    const updateActive=()=>{
      const threshold=Math.min(220,Math.max(100,window.innerHeight*0.25));
      let current=elements[0].id;
      for(const element of elements)if(element.getBoundingClientRect().top<=threshold)current=element.id;
      // The final short section may be fully visible while its heading cannot reach
      // the ordinary 220px threshold. Select it once it meaningfully enters view;
      // this also keeps sidebar clicks and scrollspy consistent on short screens.
      const lastSection=elements[elements.length-1];
      if(lastSection.getBoundingClientRect().top<=Math.max(threshold,window.innerHeight-16))
        current=lastSection.id;
      if(window.scrollY+window.innerHeight>=document.documentElement.scrollHeight-4)
        current=lastSection.id;
      setActiveSection(current);
    };
    const onHash=()=>{const hash=window.location.hash.slice(1);if(sectionIds.includes(hash)){document.getElementById(hash)?.scrollIntoView({behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",block:"start"});}updateActive();};
    const frame=window.requestAnimationFrame(()=>{if(window.location.hash)onHash();else updateActive();});
    window.addEventListener("scroll",updateActive,{passive:true});
    window.addEventListener("resize",updateActive);
    window.addEventListener("hashchange",onHash);
    window.addEventListener("popstate",onHash);
    return()=>{window.cancelAnimationFrame(frame);window.removeEventListener("scroll",updateActive);window.removeEventListener("resize",updateActive);window.removeEventListener("hashchange",onHash);window.removeEventListener("popstate",onHash)};
  },[agencyPageReady]);
  // Keep native copy-link/modified-click behavior. Ordinary sidebar activation
  // updates same-document history and smoothly scrolls the visible section.
  // Back/Forward and direct-hash entry are handled by onHash; reduced-motion
  // users jump immediately. Scrollspy still follows manual scrolling.
  const scrollToSection=(event:React.MouseEvent<HTMLAnchorElement>,id:string)=>{
    if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
    const target=document.getElementById(id);
    if(!target)return;
    event.preventDefault();
    if(window.location.hash!=="#"+id)window.history.pushState(null,"","#"+id);
    setActiveSection(id);
    target.scrollIntoView({
      behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",
      block:"start"
    });
  };
  const [claimOpen, setClaimOpen] = useState(false);
  const [apiGuideOpen,setApiGuideOpen]=useState(false);
  const [apiSource,setApiSource]=useState("Generic REST API");
  const [apiPreview,setApiPreview]=useState(false);
  const [rosterPreview,setRosterPreview]=useState<AgencyRosterCsvPreview|null>(null);
  const [rosterError,setRosterError]=useState("");
  const previewRoster=async(file?:File)=>{
    setRosterPreview(null);setRosterError("");
    if(!file)return;
    if(!/\.csv$/i.test(file.name)){setRosterError("This browser-only demo previews CSV files. Export XLSX as CSV first.");return;}
    if(file.size>512_000){setRosterError("This demo previews CSV files up to 500 KB.");return;}
    try{const content=await file.text();setRosterPreview(previewAgencyRosterCsv(content));}
    catch(error){setRosterError(error instanceof Error?error.message:"Could not preview CSV roster.");}
  };
  
  const [reportFocus,setReportFocus]=useState("All findings");
  const [rosterStatus,setRosterStatus]=useState("All statuses");
  const [rosterQuery,setRosterQuery]=useState("");
  const rosterWords=rosterQuery.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  const visibleResources=resources.filter(row=>(rosterStatus==="All statuses"||row[3]===rosterStatus)
    && rosterWords.every(word=>row.slice(0,5).join(" ").toLocaleLowerCase().includes(word)));
  const visibleSampleReports=reportFocus==="All findings"?sampleReports:sampleReports.filter(row=>row.findingStatus===reportFocus);
  const sampleReportsCsvHref=`data:text/csv;charset=utf-8,${encodeURIComponent(exportAgencyDemoReportsCsv(visibleSampleReports))}`;
  
  
  
  // Stable server/client loading state prevents hydration divergence before interactive Agency UI mounts.
  if (!agencyPageReady) return <main className="shell" aria-label="Synthetic Agency Demo"><section role="status" aria-live="polite">Preparing fictional Agency Workspace examples. No login is required.</section></main>;
  return <main className="shell">
    <aside className="side" aria-label="Agency Workspace navigation">
      <div><span className="eyebrow">Synthetic Agency Demo</span><h1>Agency Workspace</h1><p>Northstar Inspection Partners</p></div>
      <nav>{nav.map((item) => { const anchor = anchorFor(item); return <a key={item} href={`#${anchor}`} onClick={(event) => scrollToSection(event,anchor)} aria-current={activeSection === anchor ? "page" : undefined}>{item}</a>; })}</nav>
    </aside>
    <section className="content">
      <div className="notice"><strong>Demo Mode</strong> — fictional records only. Nothing on this page reads from or writes to production.</div>
      <header id="overview"><div><span className="eyebrow">Three-sided marketplace</span><h2>Agency operations at a glance</h2><p>Manage your own resources, fulfill contracted client work, and recruit marketplace inspectors without losing agency identity or commercial provenance.</p></div><button type="button" aria-expanded={claimOpen} aria-controls="agency-claim-preview" onClick={() => setClaimOpen(current => !current)}>+ Add / claim resource</button></header>
      <section id="agency-claim-preview" className="card" hidden={!claimOpen} aria-label="Synthetic affiliation claim preview"><h3>Preview an affiliation claim</h3><p>This demo does not collect personal details or submit agency claims. A claim is pending until the inspector confirms and verification is completed.</p><p><strong>Example:</strong> SYN-1001 · Sample Inspector A · Employee · Pending confirmation</p><a className="actionLink" href="/demo/agency-affiliations">Explore the affiliation lifecycle</a></section>
      <div className="kpis"><article><b>{AGENCY_SYNTHETIC_RESOURCE_TOTAL.toLocaleString("en-US")}</b><span>Synthetic resources</span></article><article><b>83%</b><span>30-day capacity booked</span></article><article><b>18</b><span>Open opportunities</span></article><article><b>41</b><span>Active inspections</span></article><article><b>7</b><span>Open NCRs</span></article><article><b>$428k</b><span>90-day awarded value</span></article></div>
      <section id="resource-pool" className="card"><div className="sectionHead"><div><h3>Resource Pool & Affiliations</h3><p>One InspectSource inspector identity; agency relationships are separate, dual-confirmed affiliation records.</p></div><span className="pill">Permanent Inspector ID matching</span></div><div className="legend"><span>Agency Claimed</span><span>Inspector Confirmation Pending</span><span>Verified</span><span>Expiring</span><span>Expired / Ended</span><span>Disputed</span></div><div className="rosterTools">
        <label>Affiliation status<select aria-label="Affiliation status" value={rosterStatus} onChange={e=>setRosterStatus(e.target.value)}>
          <option>All statuses</option>{Array.from(new Set(resources.map(row=>row[3]))).map(status=><option key={status}>{status}</option>)}
        </select></label>
        <label>Search fictional resources<input type="search" aria-label="Search fictional resources" placeholder="Name, inspector ID, location or relationship" value={rosterQuery} onChange={e=>setRosterQuery(e.target.value)}/></label>
        <button type="button" disabled={rosterStatus==="All statuses"&&!rosterQuery} onClick={()=>{setRosterStatus("All statuses");setRosterQuery("");}}>Reset resource filters</button>
        <span role="status" aria-live="polite">Showing {visibleResources.length} of {AGENCY_SYNTHETIC_RESOURCE_TOTAL.toLocaleString("en-US")} resources (synthetic).</span><a className="actionLink" href="/demo/agency-resources">Search all {AGENCY_SYNTHETIC_RESOURCE_TOTAL.toLocaleString("en-US")} resources</a>
      </div>
      {visibleResources.length===0&&<p role="status">No fictional resources match these filters. Reset to see all sample resources.</p>}
      <div className="tableWrap"><table><thead><tr><th>Inspector</th><th>Relationship</th><th>Affiliation</th><th>Coverage</th><th>Capacity</th><th>Agency rate</th><th>Terms</th><th>Commercial package</th></tr></thead><tbody>{visibleResources.map(r => <tr key={r[0]}><td><b>{r[1]}</b><small>{r[0]}</small></td>{r.slice(2).map((v,i)=><td key={i}>{v}</td>)}</tr>)}</tbody></table></div><p className="fine">Claims use name, email/phone, country, agency internal resource ID and InspectSource Inspector ID after matching — never SSN, passport, national ID or other government identifiers. Inspector confirmation or dispute is required before an affiliation becomes Verified.</p></section>
      <section id="mass-resource-connect" className="card" aria-label="Mass Resource Connect">
        <h3>Mass Resource Connect</h3><p>Preview-first resource connection for employees, subcontractors and affiliates. All records and API responses here are fictional; no production systems are contacted.</p>
        <div className="upload"><label htmlFor="agency-roster-upload"><strong>Preview CSV resource roster</strong><small>Validate records → preview affiliation claims. Export XLSX spreadsheets as CSV before previewing.</small></label><input id="agency-roster-upload" type="file" accept=".csv,text/csv" aria-describedby="agency-roster-privacy" onChange={event=>void previewRoster(event.target.files?.[0])}/><p id="agency-roster-privacy">Browser-local preview only; no data is uploaded, sent to an agency, or written to production. Use fictional samples only.</p></div>
        {rosterError&&<p role="alert" id="agency-roster-error" className="rosterPreviewError">{rosterError}</p>}
        {rosterPreview&&<p role="status" id="agency-roster-preview" className="rosterPreviewResult">Synthetic roster preview: {rosterPreview.totalRows} rows · {rosterPreview.validRows} complete unique records · {rosterPreview.reviewRows} need review · {rosterPreview.duplicateIds} duplicate IDs. No records submitted.</p>}
        <div className="resourceConnectActions">
          <a className="actionLink" download="inspectsource-agency-synthetic-roster.csv" href={syntheticRosterHref}>Download synthetic template</a>
          <button type="button" className="apiConnect" aria-expanded={apiGuideOpen} aria-controls="agency-api-connection-guide" onClick={()=>{setApiGuideOpen(v=>!v);setApiPreview(false)}}>{apiGuideOpen?"Close API walkthrough":"Connect API"}</button>
        </div>
        <div id="agency-api-connection-guide" className="apiWalkthrough" hidden={!apiGuideOpen}>
          <h4>Connect API · Synthetic setup walkthrough</h4>
          <p><strong>Step 1:</strong> Choose a fictional agency source. This demonstration never requests tokens, passwords, endpoints or real inspector records.</p>
          <label htmlFor="agency-api-source">Example source
            <select id="agency-api-source" value={apiSource} onChange={e=>{setApiSource(e.target.value);setApiPreview(false)}}>
              <option>Generic REST API</option><option>Agency HRIS</option><option>Procurement ERP</option>
            </select>
          </label>
          <p><strong>Step 2:</strong> Map source resource ID → agency resource ID, name → inspector lookup name, country → coverage, and relationship → affiliation type. InspectSource matching remains preview-only until inspector confirmation and verification.</p>
          <button type="button" className="apiConnect" onClick={()=>setApiPreview(true)}>Preview synthetic mapping</button>
          {apiPreview&&<p className="apiPreview" role="status"><strong>Step 3 · Dry run complete ({apiSource}):</strong> 5 fictional resources parsed; 3 matched, 2 need inspector confirmation; 0 records submitted. No external API call or affiliation write occurred.</p>}
          <p className="fine">Real API credentials, OAuth, webhooks, production matching rules and synchronization require a separate security-reviewed integration.</p>
        </div>
      </section>
      <section id="opportunities" className="card"><AgencyFeaturedOpportunities/></section>
      <section id="active-inspections" className="card"><h3>Active Inspections</h3><p><b>41 active</b> • 6 reports due • 7 open NCRs</p><progress max="100" value="83"/><small>83% on schedule</small><p className="fine">Three detailed synthetic examples from this fictional agency portfolio. The examples are not the entire 41-inspection portfolio.</p>
        <AgencyActiveInspections />
        </section>
      <section id="reports-ncrs" className="card"><div className="sectionHead"><div><h3>Reports & NCRs</h3><p>Operational queue connects assignments to report delivery and non-conformance follow-up while preserving the agency/source attribution.</p></div><span className="pill">7 open NCRs · fictional agency portfolio</span></div>
        <div className="reportTools">
          <label>Sample NCR status<select aria-label="Sample NCR status" value={reportFocus} onChange={e=>setReportFocus(e.target.value)}>
            <option>All findings</option><option>Open</option><option>Follow-up</option><option>No NCR</option>
          </select></label>
          <button type="button" disabled={reportFocus==="All findings"} onClick={()=>setReportFocus("All findings")}>Reset NCR filter</button>
          {visibleSampleReports.length > 0 && <a className="reportDownload" download="inspectsource-synthetic-agency-reports-ncrs.csv" href={sampleReportsCsvHref} aria-label={`Download ${visibleSampleReports.length} filtered synthetic agency report and NCR examples as CSV`}>Download filtered reports & NCRs (CSV)</a>}
          <span role="status" aria-live="polite">Showing {visibleSampleReports.length} of {sampleReports.length} fictional report/NCR examples.</span>
        </div>
        <div className="tableWrap"><table><thead><tr><th>Inspection</th><th>Inspector</th><th>Source</th><th>Report</th><th>NCR</th><th>Next action</th></tr></thead><tbody>{visibleSampleReports.map(row=><tr key={row.inspection} data-sample-ncr={row.findingStatus}><td>{row.inspection}</td><td>{row.inspector}</td><td>{row.source}</td><td>{row.report}</td><td>{row.finding}</td><td>{row.next}</td></tr>)}</tbody></table></div>
        <p className="fine">These three synthetic examples are a subset, not the full seven open NCRs shown in fictional portfolio KPIs. No actual client reports or case records are read or updated.</p>
      </section>
      <section id="contracts-commercials" className="card"><AgencyContractsPanel/></section>
      <p className="fine">Affiliation history, begin/end dates and award/source attribution are audit concepts: ending a relationship does not silently rewrite historical awards. Production affiliation verification, notifications, authorization and sourcing enforcement remain review-gated.</p>
    </section>
    <style>{`.upload{display:grid;gap:9px;text-align:left}.upload label{display:grid;gap:4px;font-weight:800;color:#312e81}.upload label small{font-weight:500;color:#475569}.upload input{font:inherit;padding:10px;border:2px solid #6d28d9;border-radius:8px;background:#fff;color:#0f172a;max-width:100%}.upload input:focus-visible{outline:3px solid #7c3aed;outline-offset:3px}.upload p{font-size:.8rem;color:#475569;margin:0}.rosterPreviewResult,.rosterPreviewError{padding:12px;border-radius:9px;font-weight:700}.rosterPreviewResult{background:#ecfdf5;border:1px solid #059669;color:#065f46}.rosterPreviewError{background:#fff1f2;border:1px solid #e11d48;color:#9f1239}.apiWalkthrough[hidden]{display:none}.apiWalkthrough{display:grid;gap:10px;margin-top:12px;border:1px solid #c4b5fd;border-radius:12px;padding:14px;background:#f5f3ff;color:#312e81}.apiWalkthrough h4,.apiWalkthrough p{margin:0}.apiWalkthrough label{display:grid;gap:5px;max-width:320px;font-weight:800}.apiWalkthrough select{min-height:42px;padding:9px;border:2px solid #6d28d9;border-radius:8px;background:#fff;color:#312e81}.apiWalkthrough select:focus-visible,.apiConnect:focus-visible{outline:3px solid #7c3aed;outline-offset:3px}.apiPreview{padding:12px;background:#ede9fe;border-radius:9px}.resourceConnectActions{display:flex;flex-wrap:wrap;gap:12px;align-items:center;margin-top:12px}.apiConnect{padding:10px 14px;background:#6d28d9;color:#fff;border:2px solid #5b21b6;border-radius:9px;font:inherit;font-weight:800;cursor:pointer}.apiConnect:hover{background:#5b21b6;color:#fff}.rosterTools{display:flex;gap:12px;align-items:end;flex-wrap:wrap;margin:16px 0;padding:12px;border:1px solid #99f6e4;border-radius:10px;background:#f0fdfa;color:#115e59}.rosterTools label{display:grid;gap:6px;font-size:.9rem;font-weight:800}.rosterTools input,.rosterTools select,.rosterTools button{padding:9px 11px;font:inherit;font-weight:700;border:2px solid #0f766e;border-radius:8px;background:#fff;color:#0f172a;min-height:44px}.rosterTools input{min-width:260px}.rosterTools button{cursor:pointer;background:#115e59;color:#fff}.rosterTools button:hover{background:#064e3b;color:#fff}.rosterTools button:disabled{background:#e2e8f0;border-color:#94a3b8;color:#334155;opacity:1;cursor:default}.rosterTools input:focus-visible,.rosterTools select:focus-visible,.rosterTools button:focus-visible{outline:3px solid #0d9488;outline-offset:3px}.rosterTools input:hover,.rosterTools select:hover{border-color:#115e59}.rosterTools [role=status]{flex-basis:100%;color:#115e59;font-weight:800}@media(max-width:640px){.rosterTools label{width:100%}.rosterTools input{min-width:0;width:100%}}.capacityTools{display:flex;flex-wrap:wrap;align-items:center;gap:9px;margin:14px 0;padding:12px;border:1px solid #c4b5fd;border-radius:10px;background:#faf5ff;color:#4c1d95}.capacityTools label{font-weight:800}.capacityTools select,.capacityTools button{padding:8px 10px;background:#fff;color:#4c1d95;border:2px solid #7c3aed;border-radius:8px;font-weight:700}.capacityTools button{cursor:pointer}.capacityTools button:disabled{opacity:1;border-color:#94a3b8;background:#f1f5f9;color:#475569;cursor:default}.capacityTools select:focus-visible,.capacityTools button:focus-visible{outline:3px solid #5b21b6;outline-offset:3px}.capacityTools [role=status]{flex-basis:100%;font-size:.84rem;color:#4c1d95;font-weight:600}.capacityTools .capacityExport{display:inline-block;padding:9px 11px;background:#5b21b6;color:#fff;border:2px solid #5b21b6;border-radius:8px;font-weight:800;text-decoration:none}.capacityTools .capacityExport:hover{background:#4c1d95;color:#fff}.capacityTools .capacityExport:focus-visible{outline:3px solid #7c3aed;outline-offset:3px}.reportTools{display:flex;align-items:end;gap:9px;flex-wrap:wrap;margin:14px 0;padding:12px;border:1px solid #c4b5fd;border-radius:10px;background:#faf5ff;color:#4c1d95}.reportTools label{display:grid;gap:5px;font-weight:800}.reportTools select,.reportTools button{min-height:42px;padding:8px 11px;background:#fff;color:#4c1d95;border:2px solid #7c3aed;border-radius:8px;font:inherit;font-weight:800}.reportTools select:hover,.reportTools button:hover{background:#ede9fe;color:#4c1d95}.reportTools select:focus-visible,.reportTools button:focus-visible{outline:3px solid #5b21b6;outline-offset:2px}.reportTools button:disabled{opacity:1;background:#f1f5f9;color:#475569;border-color:#94a3b8;cursor:not-allowed}.reportTools [role=status]{font-size:.83rem;color:#4c1d95;font-weight:700}
.reportTools a.reportDownload{display:inline-flex;align-items:center;justify-content:center;min-height:42px;padding:8px 11px;background:#4c1d95;color:#fff;border:2px solid #4c1d95;border-radius:8px;text-decoration:none;font:inherit;font-weight:800}
.reportTools a.reportDownload:hover{background:#6d28d9;color:#fff;border-color:#6d28d9}
.reportTools a.reportDownload:focus-visible{outline:3px solid #5b21b6;outline-offset:3px}*{box-sizing:border-box}.shell{max-width:1500px;margin:0 auto;display:grid;grid-template-columns:250px 1fr;gap:22px;padding:18px}.side{position:sticky;top:12px;height:calc(100vh - 24px);padding:18px;border:1px solid #ddd6fe;border-radius:16px;background:#faf5ff}.side h1{margin:5px 0;font-size:1.35rem}.side p{margin:0 0 15px;color:#475569}.side nav{display:grid;gap:3px;margin-bottom:14px}.side a{padding:8px;border-radius:8px;text-decoration:none;color:#4c1d95;font-size:.86rem;border:1px solid transparent}.side a:hover{background:#ede9fe;color:#5b21b6}.side a:focus-visible{outline:3px solid #c4b5fd;outline-offset:2px}.side a[aria-current=page]{background:#6d28d9;color:#fff;border-color:#5b21b6;font-weight:700}.content{min-width:0}.notice{padding:10px 14px;background:#faf5ff;border:1px solid #ddd6fe;border-radius:10px;color:#5b21b6;margin-bottom:14px}.content [id]{scroll-margin-top:24px}header,.sectionHead{display:flex;justify-content:space-between;gap:16px;align-items:flex-start}header h2{font-size:2rem;margin:5px 0}header p{max-width:850px;color:#475569}button,.actionLink{display:inline-block;border:1px solid #5b21b6;border-radius:9px;background:#6d28d9;color:white;padding:10px 14px;font-weight:700;cursor:pointer;text-decoration:none}button:hover,.actionLink:hover{background:#5b21b6;color:#fff}button:focus-visible,.actionLink:focus-visible{outline:3px solid #c4b5fd;outline-offset:2px} .recruitingResults{margin:12px 0;padding:14px;border:1px solid #c4b5fd;border-radius:12px;background:#faf5ff;color:#4c1d95}.recruitingResults p{color:#475569}.eyebrow{text-transform:uppercase;letter-spacing:.08em;font-size:.7rem;font-weight:800;color:#7c3aed}.kpis{display:grid;grid-template-columns:repeat(6,1fr);gap:10px;margin:18px 0}.kpis article,.card{border:1px solid #e2e8f0;border-radius:14px;background:white;padding:16px}.kpis b{display:block;font-size:1.45rem}.kpis span,.card p,.card li{color:#475569}.card{margin-bottom:14px}.card h3{margin-top:0}.pill,.legend span{display:inline-block;background:#f1f5f9;border:1px solid #e2e8f0;border-radius:999px;padding:5px 9px;font-size:.72rem;font-weight:700;color:#334155}.legend{display:flex;flex-wrap:wrap;gap:6px;margin:12px 0}.tableWrap{overflow:auto}table{border-collapse:collapse;width:100%;font-size:.8rem}th,td{text-align:left;padding:10px;border-top:1px solid #e2e8f0;white-space:nowrap}th{color:#64748b}td small{display:block;color:#64748b}.fine{font-size:.76rem!important;color:#64748b!important}.grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}.upload{border:2px dashed #c4b5fd;border-radius:12px;padding:28px;text-align:center;background:#faf5ff;margin:12px 0}.opps{display:grid;grid-template-columns:1fr 1fr;gap:10px}.opps article,.callout{padding:14px;border-radius:12px;background:#f8fafc;border:1px solid #e2e8f0}.opps span{display:block;color:#64748b;font-size:.8rem;margin-top:5px}.opps strong{color:#166534;font-size:.8rem}.callout{background:#fffbeb;border-color:#fde68a}.bars{display:grid;gap:8px}.bars span{display:block;min-width:240px;padding:8px;background:#ede9fe;border-radius:7px;color:#4c1d95;font-weight:700;font-size:.8rem}.capacityGrid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-top:12px}.capacityGrid article{display:grid;gap:5px;padding:12px;border:1px solid #e2e8f0;border-radius:10px;background:#f8fafc}.capacityGrid strong{font-size:1.05rem}.capacityGrid span,.miniList span{font-size:.78rem;color:#64748b}.agencyInspectionLoading{margin-top:12px;padding:14px;border:1px solid #c4b5fd;border-radius:10px;background:#faf5ff;color:#4c1d95;font-weight:800}.agencyInspectionTools{display:flex;align-items:end;flex-wrap:wrap;gap:10px;margin:12px 0}.agencyInspectionTools label{display:grid;gap:5px;font-weight:800;font-size:.85rem;color:#4c1d95}.agencyInspectionTools select{min-height:44px;border:2px solid #6d28d9;border-radius:8px;padding:8px;background:#fff;color:#0f172a}.agencyInspectionTools select:focus-visible{outline:3px solid #a78bfa;outline-offset:3px}.agencyInspectionTools button:disabled{background:#f1f5f9;color:#334155;border-color:#94a3b8;opacity:1;cursor:not-allowed}.agencyInspectionTools [role=status]{font-size:.8rem;color:#334155}.agencyInspectionList{display:grid;gap:9px;margin-top:12px}.agencyInspection{padding:12px;border:1px solid #c4b5fd;border-radius:10px;background:#faf5ff}.agencyInspectionSummary{display:flex;align-items:center;justify-content:space-between;gap:10px}.agencyInspectionSummary>div{display:grid;gap:4px}.agencyInspectionSummary strong{color:#4c1d95}.agencyInspectionSummary span,.agencyInspectionSummary small{color:#475569}.agencyInspectionSummary button{min-width:146px}.agencyInspectionDetail{margin-top:10px;padding:13px;background:#fff;border:1px solid #a78bfa;border-radius:8px;color:#0f172a}.agencyInspectionDetail h4{margin:8px 0}.agencyInspectionDetail dl{display:grid;grid-template-columns:max-content 1fr;gap:5px 10px}.agencyInspectionDetail dt{font-weight:900;color:#4c1d95}.agencyInspectionDetail dd{margin:0;overflow-wrap:anywhere}.agencyInspectionDetail p{margin:8px 0}.agencyInspectionDetail p strong{color:#4c1d95}@media(max-width:680px){.agencyInspectionSummary{display:grid}.agencyInspectionDetail dl{grid-template-columns:1fr}.agencyInspectionDetail dt{margin-top:8px}}.miniList{display:grid;gap:5px;margin-top:12px}.miniList span{padding:7px;background:#f8fafc;border-radius:7px}progress{width:100%;height:12px}@media(max-width:1100px){.kpis{grid-template-columns:repeat(3,1fr)}.capacityGrid{grid-template-columns:1fr 1fr}}@media(max-width:800px){.shell{display:block}.side{position:static;height:auto;margin-bottom:14px}.side nav{grid-template-columns:1fr 1fr}.grid,.opps,.capacityGrid{grid-template-columns:1fr}.kpis{grid-template-columns:1fr 1fr}header,.sectionHead{display:block}header button,.sectionHead button{margin-bottom:10px}}`}</style>
  </main>;
}
