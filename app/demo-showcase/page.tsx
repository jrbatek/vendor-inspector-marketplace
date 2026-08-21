"use client";

import Link from "next/link";
import { useState } from "react";

type Asset={id:string;asset_code:string;name:string;asset_type:string|null;manufacturer:string|null;criticality:string;metadata:any};
type Risk={id:string;severity:string;title:string;supplier_name:string|null;schedule_impact:string|null;status:string};
type Action={id:string;priority:string;recommendation:string;rationale:string|null;status:string};

const assets:Asset[]=[
{id:"project",asset_code:"GCRE-2027",name:"Gulf Coast Refinery Expansion",asset_type:"Project",manufacturer:null,criticality:"critical",metadata:{demo:"gulf-coast-expansion",progress:68,budget_musd:420,status:"active"}},
{id:"pv101",asset_code:"PV-101",name:"Hydrotreater Separator",asset_type:"Pressure Vessel",manufacturer:"Lone Star Process Equipment",criticality:"critical",metadata:{progress:61,status:"attention"}},
{id:"hx201",asset_code:"HX-201",name:"Feed/Effluent Exchanger",asset_type:"Heat Exchanger",manufacturer:"Gulf Thermal Systems",criticality:"high",metadata:{progress:79,status:"on_track"}},
{id:"tk301",asset_code:"TK-301",name:"Diesel Product Tank",asset_type:"Storage Tank",manufacturer:"Delta Tank & Steel",criticality:"high",metadata:{progress:72,status:"recovering"}},
{id:"p101",asset_code:"P-101A/B",name:"Charge Pump Package",asset_type:"Rotating Equipment",manufacturer:"Magnolia Rotating Equipment",criticality:"critical",metadata:{progress:84,status:"on_track"}},
{id:"vlv401",asset_code:"VLV-401",name:"Critical Isolation Valve Lot",asset_type:"Valve Package",manufacturer:"Red River Valve Works",criticality:"high",metadata:{progress:57,status:"attention"}},
{id:"pipe501",asset_code:"PIPE-501",name:"Alloy Piping Spools",asset_type:"Piping",manufacturer:"Lone Star Process Equipment",criticality:"critical",metadata:{progress:49,status:"late"}},
{id:"skid601",asset_code:"SKID-601",name:"Hydrogen Compressor Auxiliary Skid",asset_type:"Packaged Equipment",manufacturer:"Magnolia Rotating Equipment",criticality:"high",metadata:{progress:76,status:"on_track"}},
{id:"mcc701",asset_code:"MCC-701",name:"Motor Control Center",asset_type:"Electrical",manufacturer:"Bayou Electrical Systems",criticality:"high",metadata:{progress:88,status:"on_track"}},
{id:"pkg801",asset_code:"PKG-801",name:"Chemical Injection Package",asset_type:"Packaged Equipment",manufacturer:"Delta Process Systems",criticality:"medium",metadata:{progress:91,status:"on_track"}},
];

const risks:Risk[]=[
{id:"r1",severity:"critical",title:"Repeated traceability and alloy-control failures",supplier_name:"Lone Star Process Equipment",schedule_impact:"Piping release is on the hydrotreater mechanical-completion critical path.",status:"open"},
{id:"r2",severity:"high",title:"Hydrotest milestone at risk",supplier_name:"Lone Star Process Equipment",schedule_impact:"Potential four-to-seven-day impact to vessel shipment.",status:"monitoring"},
{id:"r3",severity:"high",title:"Tank weld repair requires enhanced follow-up",supplier_name:"Delta Tank & Steel",schedule_impact:"Low direct schedule impact if closed this week.",status:"monitoring"},
{id:"r4",severity:"low",title:"Exchanger supplier trending ahead of quality plan",supplier_name:"Gulf Thermal Systems",schedule_impact:"Opportunity to reduce routine surveillance and reallocate hours.",status:"open"},
];

const actions:Action[]=[
{id:"a1",priority:"critical",recommendation:"Increase Lone Star alloy-piping coverage from weekly surveillance to three visits per week",rationale:"Repeated traceability and PMI failures combined with critical-path delay justify temporary intensified coverage.",status:"proposed"},
{id:"a2",priority:"high",recommendation:"Add daily hydrotest readiness checks until the PV-101 hold point is released",rationale:"Vessel shipment is on the critical path and preparation is behind baseline.",status:"proposed"},
{id:"a3",priority:"high",recommendation:"Assign focused weld-repair verification on TK-301",rationale:"Known defect location allows inspection effort to concentrate on closure evidence.",status:"proposed"},
{id:"a4",priority:"normal",recommendation:"Reduce Gulf Thermal routine surveillance after final dimensional review",rationale:"Strong quality history supports reallocating inspection capacity to higher-risk suppliers.",status:"proposed"},
];

const sampleRequest=`We need one Welding Inspection inspector in Singapore starting October 5 for two weeks. Minimum 10 years experience. Available for 8 hour shifts. Local Singapore inspector preferred. Please send qualified CVs/resumes, availability, and rates.`;

const sampleEmail=`Hi InspectSource,\n\nWe need one Welding Inspection inspector in Singapore starting October 5 for two weeks.\n\nRequirements:\n• Minimum 10 years experience\n• Available for 8 hour shifts\n• Local Singapore inspector preferred\n\nPlease send qualified CVs/resumes, availability, and rates.\n\nThanks`;

const emailHref=`mailto:inspectsource2026@gmail.com?subject=${encodeURIComponent("Inspection Request - Singapore Welding Inspection")}&body=${encodeURIComponent(sampleEmail)}`;

export default function DemoShowcase(){
 const [requestText,setRequestText]=useState(sampleRequest);
 const project=assets.find(a=>a.asset_code==="GCRE-2027");
 const equipment=assets.filter(a=>a.asset_code!=="GCRE-2027");
 const attention=equipment.filter(a=>["attention","late"].includes(a.metadata?.status));
 const continueHref=requestText.trim()?`/find-inspectors?request=${encodeURIComponent(requestText.trim())}`:"/find-inspectors";
 return <main className="page">
  <section className="requestHero">
   <p className="eyebrow">InspectSource</p>
   <h1>Request your inspection</h1>
   <p className="requestIntro">Start the way you already work. Describe the requirement, email it to us, or select inspectors through the interface.</p>
   <div className="requestOptions">
    <article className="requestCard requestCardNatural">
     <span className="step">1</span>
     <h2>Natural language request here</h2>
     <p>Tell InspectSource what you need in plain English. Include the location, dates, equipment, certifications, scope, travel requirements, budget, or anything else you know.</p>
     <textarea className="naturalInput" rows={6} value={requestText} onChange={(event)=>setRequestText(event.target.value)} aria-label="Describe your inspection request" />
     <Link className="primaryButton" href={continueHref}>Find qualified inspectors</Link>
    </article>
    <article className="requestCard requestCardEmail">
     <span className="step">2</span>
     <h2>Email your requirements</h2>
     <p>Keep using email. Send the scope, request, or requirements to our inspection-request inbox and the AI Project Coordinator can turn it into a staffing request.</p>
     <div className="emailSample"><strong>Sample email</strong><pre>{sampleEmail}</pre></div>
     <a className="primaryButton" href={emailHref}>Open sample email</a>
    </article>
    <article className="requestCard">
     <span className="step">3</span>
     <h2>Select via an interface</h2>
     <p>Use the same standard dropdowns a client would use. For this demo, the fields are pre-populated to represent the same Singapore welding-inspection request shown in Options 1 and 2.</p>
     <Link className="primaryButton" href="/inspectors?demo=1">Open pre-filled selection form</Link>
    </article>
   </div>
  </section>

  <div className="sectionDivider"><span>What happens after the request</span></div>

  <section className="hero"><p className="eyebrow">Synthetic demonstration environment</p><h1>Gulf Coast Refinery Expansion</h1><p>A fictional $420M refinery expansion showing how InspectSource can continuously focus inspection resources on quality, supplier performance and critical-path risk.</p></section>
  <section className="demoNotice"><strong>Demo mode:</strong> This page uses built-in synthetic data so it is always available and never depends on production client data.</section>
  {project&&<>
   <section className="stats"><Stat n="68%" l="Project fabrication progress"/><Stat n={String(equipment.length)} l="Tracked assets/packages"/><Stat n={String(attention.length)} l="Assets needing attention"/><Stat n={String(risks.filter(r=>r.severity==="high"||r.severity==="critical").length)} l="High/critical risk signals"/></section>
   <section className="card"><h2>Asset portfolio</h2><div className="table">{equipment.map(a=><article key={a.id}><div><strong>{a.asset_code}</strong><span>{a.name}</span></div><span>{a.manufacturer||"—"}</span><span>{a.metadata?.progress||0}% complete</span><b className={a.metadata?.status}>{String(a.metadata?.status||"active").replaceAll("_"," ")}</b></article>)}</div></section>
   <div className="cols"><section className="card"><h2>What the system is seeing</h2>{risks.map(r=><article className="item" key={r.id}><b>{r.severity.toUpperCase()}</b><div><strong>{r.title}</strong><p>{r.supplier_name}</p><small>{r.schedule_impact}</small></div></article>)}</section><section className="card"><h2>Coordinator feedback loop</h2>{actions.map(a=><article className="item" key={a.id}><b>{a.priority.toUpperCase()}</b><div><strong>{a.recommendation}</strong><p>{a.rationale}</p></div></article>)}</section></div>
   <section className="story"><h2>Demo story</h2><p><strong>Lone Star Process Equipment</strong> has repeated material-traceability and alloy-control failures on critical-path piping. InspectSource therefore proposes increasing surveillance to three visits per week and adding daily hydrotest readiness checks on PV-101.</p><p>At the same time, <strong>Gulf Thermal Systems</strong> has four clean surveillance visits and strong documentation performance, so the coordinator can reduce routine coverage there and reallocate inspection hours to the weak supplier.</p><p>This is the recursive loop: <strong>inspect → capture evidence → identify risk → change the inspection plan → inspect again.</strong></p></section>
  </>}
  <style jsx>{`.page{max-width:1160px;margin:auto;padding:30px 18px 80px}.requestHero,.hero,.card,.story,.stat,.demoNotice{background:#fff;border:1px solid #e2e8f0;border-radius:18px}.requestHero{padding:34px}.requestHero h1{font-size:2.4rem;margin:4px 0 8px}.requestIntro{max-width:760px;color:#64748b;font-size:1.05rem;line-height:1.55}.requestOptions{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:26px;align-items:stretch}.requestCard{border:1px solid #dbe3ee;border-radius:16px;padding:22px;display:flex;flex-direction:column;min-height:285px}.requestCardNatural,.requestCardEmail{min-height:390px}.requestCard h2{font-size:1.15rem;margin:14px 0 8px}.requestCard p{color:#64748b;line-height:1.55}.naturalInput{width:100%;box-sizing:border-box;resize:vertical;border:1px solid #cbd5e1;border-radius:10px;padding:12px;font:inherit;line-height:1.45;min-height:132px;margin-top:8px}.naturalInput:focus{outline:2px solid #94a3b8;outline-offset:1px}.emailSample{border:1px solid #cbd5e1;border-radius:10px;background:#f8fafc;padding:12px;margin:8px 0 14px}.emailSample strong{display:block;font-size:.78rem;text-transform:uppercase;letter-spacing:.08em;margin-bottom:8px}.emailSample pre{white-space:pre-wrap;margin:0;font:inherit;font-size:.82rem;line-height:1.42;color:#475569}.step{height:34px;width:34px;border-radius:50%;display:grid;place-items:center;background:#0f172a;color:#fff;font-weight:800}.primaryButton{display:block;text-align:center;text-decoration:none;background:#0f172a;color:#fff;border-radius:10px;padding:12px 14px;font-weight:700;margin-top:auto}.primaryButton:hover{background:#1e293b}.sectionDivider{display:flex;align-items:center;gap:14px;margin:34px 0 18px;color:#64748b;font-size:.8rem;font-weight:800;letter-spacing:.1em;text-transform:uppercase}.sectionDivider:before,.sectionDivider:after{content:"";height:1px;background:#cbd5e1;flex:1}.hero{padding:30px}.eyebrow{font-size:.75rem;font-weight:800;letter-spacing:.12em;text-transform:uppercase}.hero h1{margin:4px 0;font-size:2rem}.hero p,.item p,small{color:#64748b}.demoNotice{padding:14px 18px;margin:16px 0;background:#f8fafc}.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:16px 0}.stat{padding:18px}.stat strong{font-size:1.8rem;display:block}.stat span{color:#64748b}.card,.story{padding:22px;margin-bottom:16px}.table article{display:grid;grid-template-columns:2fr 2fr 1fr 1fr;gap:12px;padding:13px 0;border-top:1px solid #e2e8f0}.table article div{display:grid}.table article div span{color:#64748b}.table b{text-transform:capitalize}.late,.attention{color:#b45309}.on_track,.recovering{color:#166534}.cols{display:grid;grid-template-columns:1fr 1fr;gap:16px}.item{display:grid;grid-template-columns:auto 1fr;gap:12px;padding:14px 0;border-top:1px solid #e2e8f0}.item p{margin:4px 0}.story p{line-height:1.65}@media(max-width:900px){.requestOptions{grid-template-columns:1fr}.requestCard,.requestCardNatural,.requestCardEmail{min-height:0}}@media(max-width:760px){.stats,.cols{grid-template-columns:1fr 1fr}.table article{grid-template-columns:1fr}.hero h1,.requestHero h1{font-size:1.6rem}}@media(max-width:480px){.stats,.cols{grid-template-columns:1fr}.requestHero{padding:24px}}`}</style>
 </main>
}
function Stat({n,l}:{n:string;l:string}){return <div className="stat"><strong>{n}</strong><span>{l}</span></div>}
