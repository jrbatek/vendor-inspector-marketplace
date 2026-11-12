"use client";
import Link from "next/link";
import {useMemo,useState} from "react";
import {AGENCY_DEMO_OPPORTUNITIES,filterAgencyDemoOpportunities} from "@/lib/agencyDemoOpportunities";

const distinct=(field:"region"|"status"|"discipline")=>Array.from(new Set(AGENCY_DEMO_OPPORTUNITIES.map(row=>row[field]))).sort();
export default function AgencyOpportunitiesDemo(){
 const [query,setQuery]=useState("");
 const [region,setRegion]=useState("All regions");
 const [status,setStatus]=useState("All statuses");
 const [discipline,setDiscipline]=useState("All disciplines");
 const [opened,setOpened]=useState<string|null>(null);
 const [interest,setInterest]=useState("");
 const rows=useMemo(()=>filterAgencyDemoOpportunities(AGENCY_DEMO_OPPORTUNITIES,{query,region,status,discipline}),[query,region,status,discipline]);
 const reset=()=>{setQuery("");setRegion("All regions");setStatus("All statuses");setDiscipline("All disciplines");setOpened(null);setInterest("");};
 return <main className="wrap">
  <div className="banner"><strong>DEMO MODE · 100% FICTIONAL OPPORTUNITIES</strong><span>No real inspection, matching, agency offer, selection, submission or external request happens here.</span></div>
  <header><div><small>Agency Workspace · Opportunity browser</small><h1>Search all synthetic opportunities</h1><p>Browse {AGENCY_DEMO_OPPORTUNITIES.length} imaginary agency inspection opportunities across regions and expertise. Offered rates are fixed fictional examples, never advertised live jobs.</p></div><Link href="/demo/agency#opportunities">Return to Agency Opportunities</Link></header>
  <section className="filters" aria-label="Filter fictional agency opportunities">
    <label>Search projects, vendors or equipment<input type="search" aria-label="Search synthetic opportunities" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Project, vendor, qualification or location"/></label>
    <label>Region<select aria-label="Opportunity region" value={region} onChange={e=>setRegion(e.target.value)}><option>All regions</option>{distinct("region").map(x=><option key={x}>{x}</option>)}</select></label>
    <label>Status<select aria-label="Opportunity status" value={status} onChange={e=>setStatus(e.target.value)}><option>All statuses</option>{distinct("status").map(x=><option key={x}>{x}</option>)}</select></label>
    <label>Discipline<select aria-label="Opportunity discipline" value={discipline} onChange={e=>setDiscipline(e.target.value)}><option>All disciplines</option>{distinct("discipline").map(x=><option key={x}>{x}</option>)}</select></label>
    <button type="button" onClick={reset}>Reset filters</button>
  </section>
  <p role="status" aria-live="polite" className="results">Showing {rows.length} of {AGENCY_DEMO_OPPORTUNITIES.length} synthetic opportunities.</p>
  {rows.length===0&&<section className="empty"><strong>No synthetic opportunities match these filters.</strong><button type="button" onClick={reset}>Show all fictional opportunities</button></section>}
  <section className="list" aria-label="Searchable fictional opportunities">{rows.map(op=><article key={op.id} className="opportunity">
   <div className="top"><div><small>{op.id} · {op.status}</small><h2>{op.project}</h2><p>{op.client} · {op.location} · {op.discipline}</p></div><div className="rate"><strong>{op.dayRate}</strong><span>{op.scheduled} · {op.duration}</span></div></div>
   <p>Source: {op.type} · Qualification: {op.qualification}</p>
   <div className="actions"><button type="button" aria-expanded={opened===op.id} aria-controls={"opportunity-details-"+op.id} onClick={()=>setOpened(x=>x===op.id?null:op.id)}>{opened===op.id?"Close Opportunity":"Preview Opportunity"}</button></div>
   {opened===op.id&&<section className="details" id={"opportunity-details-"+op.id} aria-label={"Synthetic opportunity details "+op.id}>
    <dl><div><dt>Fictional client</dt><dd>{op.client}</dd></div><div><dt>Vendor</dt><dd>{op.vendor}</dd></div><div><dt>Site</dt><dd>{op.site}</dd></div><div><dt>Inspection scope</dt><dd>{op.scope}</dd></div><div><dt>Offered rate (fictional)</dt><dd>{op.dayRate}</dd></div><div><dt>Schedule</dt><dd>{op.scheduled} · {op.duration}</dd></div><div><dt>Budget</dt><dd>{op.budget}</dd></div><div><dt>Sourcing</dt><dd>{op.type}</dd></div></dl>
    <button type="button" onClick={()=>setInterest(op.id)}>Preview agency interest (demo only)</button>
    {interest===op.id&&<p className="interest" role="status">Sample interest preview prepared for {op.id}. Nothing was submitted or sent; this fictional opportunity has no live client.</p>}
   </section>}
  </article>)}</section>
  <footer>All 24 opportunities, vendors, projects, rates and dates are synthetic. No client records or production API calls.</footer>
  <style jsx>{`
   .wrap{max-width:1330px;margin:0 auto;padding:24px 18px 60px;color:#0f172a}.banner{background:#f5f3ff;color:#4c1d95;border:1px solid #a78bfa;border-radius:12px;padding:12px 16px;display:grid;gap:3px;font-size:.86rem}
   header{display:flex;justify-content:space-between;gap:20px;align-items:center;margin:18px 0}header small{color:#6d28d9;font-weight:900;text-transform:uppercase;letter-spacing:.06em}header h1{margin:4px 0;font-size:1.8rem}header p{color:#475569}header :global(a){color:#4c1d95;font-weight:800}
   .filters{display:grid;grid-template-columns:2fr repeat(3,1fr) auto;gap:10px;border:1px solid #e2e8f0;background:#fff;border-radius:12px;padding:15px}
   label{font-size:.78rem;color:#334155;font-weight:800;display:grid;gap:5px}select,input{min-width:0;width:100%;border:1px solid #64748b;padding:10px;border-radius:8px;color:#0f172a;background:#fff}
   button{min-height:42px;align-self:end;padding:10px 14px;border-radius:8px;border:1px solid #6d28d9;background:#6d28d9;color:#fff;font-weight:800;cursor:pointer}button:hover{background:#581c87}button:focus-visible,input:focus-visible,select:focus-visible{outline:3px solid #a78bfa;outline-offset:2px}
   .results{font-weight:800;color:#334155}.list{display:grid;gap:14px}.opportunity{background:#fff;border:1px solid #e2e8f0;border-radius:14px;padding:18px}.top{display:flex;justify-content:space-between;gap:12px}.top h2{font-size:1.13rem;margin:4px 0}.top small{font-weight:900;color:#6d28d9}.top p,.opportunity p,.rate span{color:#475569}.rate{text-align:right}.rate strong{display:block;font-size:1.2rem;color:#4c1d95}.rate span{font-size:.8rem}.details{border-top:1px solid #ddd6fe;margin-top:14px;padding-top:14px}.details dl{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.details dt{font-weight:850;font-size:.78rem;color:#581c87}.details dd{margin:2px 0;color:#334155;font-size:.88rem}.interest{background:#f0fdfa;border:1px solid #5eead4;border-radius:8px;padding:10px}.empty{background:#fff7ed;padding:18px;display:flex;gap:20px;align-items:center}.empty button{align-self:center}.wrap footer{margin-top:20px;color:#64748b;font-size:.8rem}
   @media(max-width:900px){.filters{grid-template-columns:repeat(2,minmax(0,1fr))}header{display:grid}}@media(max-width:600px){.filters{grid-template-columns:1fr}.top{display:grid}.rate{text-align:left}.details dl{grid-template-columns:1fr}}
  `}</style>
 </main>;
}
