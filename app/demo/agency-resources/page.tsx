"use client";

import Link from "next/link";
import {useMemo,useState} from "react";
import {AGENCY_RESOURCE_POOL,AGENCY_SYNTHETIC_RESOURCE_TOTAL,filterAgencyResources} from "@/lib/agencyDemoResources";

const PAGE_SIZE=25;
const regions=["All regions",...Array.from(new Set(AGENCY_RESOURCE_POOL.map(row=>row.region)))];
const statuses=["All statuses",...Array.from(new Set(AGENCY_RESOURCE_POOL.map(row=>row.affiliation)))];
const relationships=["All relationships","Employee","Subcontractor","Affiliate"];
export default function AgencyResourcePoolDemo(){
  const [query,setQuery]=useState("");
  const [region,setRegion]=useState("All regions");
  const [status,setStatus]=useState("All statuses");
  const [relationship,setRelationship]=useState("All relationships");
  const [page,setPage]=useState(0);
  const [detail,setDetail]=useState<string|null>(null);
  const results=useMemo(()=>filterAgencyResources(AGENCY_RESOURCE_POOL,{query,region,affiliation:status,relationship}),[query,region,status,relationship]);
  const totalPages=Math.max(1,Math.ceil(results.length/PAGE_SIZE));
  const safePage=Math.min(page,totalPages-1);
  const visible=results.slice(safePage*PAGE_SIZE,(safePage+1)*PAGE_SIZE);
  const current=AGENCY_RESOURCE_POOL.find(r=>r.id===detail);
  const reset=()=>{setQuery("");setRegion("All regions");setStatus("All statuses");setRelationship("All relationships");setPage(0);setDetail(null)};
  return <main className="resourceShell">
    <div className="heading"><div><p className="eyebrow">Agency Demo · Fictional data</p><h1>Search all {AGENCY_SYNTHETIC_RESOURCE_TOTAL.toLocaleString("en-US")} resources</h1><p>Northstar Inspection Partners · Synthetic sample pool. No real profiles, locations, credentials or production affiliations are loaded.</p></div><Link className="backLink" href="/demo/agency#resource-pool">Back to Agency Workspace</Link></div>
    <section className="summary" aria-label="Synthetic resource pool summary"><strong>{AGENCY_SYNTHETIC_RESOURCE_TOTAL.toLocaleString("en-US")}</strong><span>Fictional resources across multiple regions. Five featured examples also appear in the Agency Workspace.</span></section>
    <section className="filters" aria-label="Search synthetic agency resources">
      <label>Search name, ID, location or expertise<input aria-label="Search all fictional agency resources" type="search" value={query} onChange={e=>{setQuery(e.target.value);setPage(0);setDetail(null)}} placeholder="Try Maya, API 570 or IS-20418"/></label>
      <label>Region<select value={region} onChange={e=>{setRegion(e.target.value);setPage(0);setDetail(null)}}>{regions.map(r=><option key={r}>{r}</option>)}</select></label>
      <label>Affiliation status<select value={status} onChange={e=>{setStatus(e.target.value);setPage(0);setDetail(null)}}>{statuses.map(r=><option key={r}>{r}</option>)}</select></label>
      <label>Relationship<select value={relationship} onChange={e=>{setRelationship(e.target.value);setPage(0);setDetail(null)}}>{relationships.map(r=><option key={r}>{r}</option>)}</select></label>
      <button type="button" className="reset" onClick={reset} disabled={!query&&region==="All regions"&&status==="All statuses"&&relationship==="All relationships"}>Reset filters</button>
    </section>
    <div className="resultHeader"><p role="status" aria-live="polite">Showing {results.length?((safePage*PAGE_SIZE)+1):0}–{Math.min((safePage+1)*PAGE_SIZE,results.length)} of {results.length.toLocaleString("en-US")} matching synthetic resources.</p><span>Page {safePage+1} of {totalPages}</span></div>
    {results.length===0&&<p className="empty">No fictional resources match. Reset the filters to see the pool.</p>}
    <section className="cards" aria-label="Matching fictional inspectors">
      {visible.map(r=><article key={r.id} className="resource"><div><p className="eyebrow">{r.id} · {r.relationship}</p><h2>{r.name}</h2><p>{r.expertise} · {r.coverage}</p><p><strong>{r.affiliation}</strong> · {r.capacity}</p><span>{r.dayRate} · {r.terms}</span></div><button type="button" aria-expanded={detail===r.id} onClick={()=>setDetail(v=>v===r.id?null:r.id)}>{detail===r.id?"Close resource":"View fictional resource"}</button></article>)}
    </section>
    {current&&<section className="detail" aria-label="Fictional resource preview"><div><h2>{current.name} · {current.id}</h2><p><strong>Qualification:</strong> {current.expertise}</p><p><strong>Coverage:</strong> {current.coverage} ({current.region})</p><p><strong>Affiliation:</strong> {current.affiliation} · {current.relationship}</p><p><strong>Availability:</strong> {current.capacity}</p><p><strong>Indicative agency rate:</strong> {current.dayRate} · {current.terms}</p><p><strong>Commercial package:</strong> {current.commercialPackage}</p><p className="privacy">Synthetic preview only. Verification and inspector confirmation remain required; no live booking or contact actions.</p></div><button type="button" onClick={()=>setDetail(null)}>Close preview</button></section>}
    <nav className="pages" aria-label="Results pagination"><button type="button" disabled={safePage===0} onClick={()=>{setPage(safePage-1);setDetail(null)}}>Previous page</button><span>Page {safePage+1} of {totalPages}</span><button type="button" disabled={safePage>=totalPages-1} onClick={()=>{setPage(safePage+1);setDetail(null)}}>Next page</button></nav>
    <p className="privacy">Demo simulation: resource data are generated deterministically in memory, never read from or written to the live marketplace. Matching, agency claims and production credentials are intentionally disabled.</p>
    <style jsx>{`.resourceShell{max-width:1260px;margin:auto;padding:24px;color:#1e1b4b}.heading{display:flex;justify-content:space-between;gap:16px;align-items:flex-start}.heading h1{font-size:clamp(1.4rem,3vw,2.3rem);margin:.2rem 0}.heading p{color:#475569}.eyebrow{text-transform:uppercase;font-size:.71rem;letter-spacing:.1em;font-weight:900;color:#6d28d9}.backLink{color:#5b21b6;font-weight:800}.summary{display:flex;align-items:center;gap:18px;padding:18px;background:#f5f3ff;border:1px solid #ddd6fe;border-radius:12px;margin:14px 0}.summary strong{font-size:1.8rem}.summary span{color:#475569}.filters{display:grid;grid-template-columns:2fr repeat(3,minmax(0,1fr));gap:12px;padding:16px;background:#f8fafc;border:1px solid #cbd5e1;border-radius:12px;align-items:end}.filters label{display:grid;gap:6px;color:#1e293b;font-weight:800}.filters input,.filters select{min-height:44px;min-width:0;width:100%;padding:9px;border:2px solid #64748b;border-radius:8px;background:#fff;color:#0f172a;font:inherit}.filters input:focus-visible,.filters select:focus-visible,button:focus-visible{outline:3px solid #7c3aed;outline-offset:3px}.filters button,.resource button,.detail button,.pages button{min-height:44px;padding:9px 13px;border-radius:9px;background:#5b21b6;border:2px solid #5b21b6;color:#fff;cursor:pointer;font:inherit;font-weight:800}.filters button:hover,.resource button:hover,.detail button:hover,.pages button:hover{background:#6d28d9;color:#fff}.filters button:disabled,.pages button:disabled{background:#e2e8f0;border-color:#94a3b8;color:#334155;cursor:not-allowed}.resultHeader{display:flex;justify-content:space-between;gap:10px;align-items:center;margin:12px 0;color:#475569;font-weight:700}.cards{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.resource{display:flex;flex-direction:column;align-items:flex-start;justify-content:space-between;gap:16px;padding:16px;border:1px solid #cbd5e1;border-radius:12px;background:#fff;min-width:0}.resource h2{margin:.25rem 0;font-size:1.2rem}.resource p{margin:.4rem 0;color:#334155}.resource span{font-weight:800;color:#5b21b6}.detail{margin:16px 0;padding:18px;background:#f5f3ff;border:2px solid #8b5cf6;border-radius:12px;display:flex;justify-content:space-between;gap:12px}.detail h2{margin:0 0 9px}.privacy{margin-top:16px;color:#475569;font-size:.9rem}.pages{display:flex;justify-content:center;align-items:center;gap:16px;margin:18px 0}.empty{padding:20px;background:#fff7ed;border:1px solid #fdba74;border-radius:9px;color:#9a3412}@media(max-width:880px){.filters{grid-template-columns:1fr 1fr}.heading,.detail{flex-wrap:wrap}.cards{grid-template-columns:1fr}}@media(max-width:550px){.resourceShell{padding:12px}.filters{grid-template-columns:1fr}.summary,.resultHeader{flex-wrap:wrap}.pages{gap:8px}.pages button{padding:8px}}`}</style>
  </main>;
}
