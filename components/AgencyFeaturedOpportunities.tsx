"use client";
import Link from "next/link";
import {useState} from "react";
import {AGENCY_DEMO_OPPORTUNITIES} from "@/lib/agencyDemoOpportunities";

const featured=AGENCY_DEMO_OPPORTUNITIES.slice(0,4);
export default function AgencyFeaturedOpportunities(){
 const [open,setOpen]=useState<string|null>(null);
 return <div className="agencyFeatured">
  <h3>Opportunities & source attribution</h3>
  <p>Four featured <strong>fictional</strong> opportunities; each opens sample scope, dates, location and a single offered rate. No live jobs or selections.</p>
  <div className="featuredGrid" aria-label="Featured synthetic agency opportunities">{featured.map(op=><article key={op.id}>
   <small>{op.id} · {op.status}</small><h4>{op.project}</h4><p>{op.client} · {op.location}</p><strong>{op.dayRate}</strong>
   <div><button type="button" aria-expanded={open===op.id} aria-controls={"featured-"+op.id} onClick={()=>setOpen(current=>current===op.id?null:op.id)}>{open===op.id?"Close preview":"Preview Opportunity"}</button></div>
   {open===op.id&&<section id={"featured-"+op.id} aria-label={"Featured sample "+op.id} className="details">
    <p><b>Fictional client:</b> {op.client}</p><p><b>Vendor:</b> {op.vendor}</p><p><b>Site:</b> {op.site}</p><p><b>Expected dates:</b> {op.scheduled} · {op.duration}</p>
    <p><b>Equipment / skills:</b> {op.qualification}</p><p><b>Sample scope:</b> {op.scope}</p>
    <p><b>Sourcing:</b> {op.type}</p>
   </section>}
  </article>)}</div>
  <Link href="/demo/agency-opportunities" className="browseAll">View/Search all opportunities ({AGENCY_DEMO_OPPORTUNITIES.length} synthetic)</Link>
  <style jsx>{`
   .featuredGrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin:14px 0}
   .featuredGrid article{border:1px solid #ddd6fe;border-radius:12px;padding:14px;background:#faf8ff}
   .featuredGrid small{font-weight:850;color:#6d28d9}.featuredGrid h4{margin:5px 0;color:#2e1065}.featuredGrid p{font-size:.85rem;color:#475569}
   .featuredGrid strong{display:block;color:#4c1d95;margin:9px 0}
   button{border:1px solid #6d28d9;background:#6d28d9;color:#fff;padding:10px 12px;border-radius:8px;font-weight:800;cursor:pointer;min-height:42px}
   button:hover{background:#581c87}button:focus-visible,.browseAll:focus-visible{outline:3px solid #a78bfa;outline-offset:2px}
   .details{border-top:1px solid #ddd6fe;margin-top:14px;padding-top:8px}.details p{margin:5px 0}
   .browseAll{display:inline-block;border:1px solid #6d28d9;border-radius:8px;background:#f5f3ff;color:#4c1d95;font-weight:900;padding:12px}
   @media(max-width:700px){.featuredGrid{grid-template-columns:1fr}}
  `}</style>
 </div>;
}
