"use client";

import Link from "next/link";
import { useState } from "react";
import ClientWorkspaceSidebar from "@/components/ClientWorkspaceSidebar";

const MAX_REQUEST_CHARS=10000;
const sampleRequest=`We need two API 570 inspectors for a refinery turnaround in Houston starting September 14 for approximately three weeks. API 570 certification, minimum 5 years refinery/petrochemical experience, current TWIC card, availability for 10-12 hour shifts, and local Houston inspectors preferred. Please send qualified CVs/resumes, availability, and rates.`;

const portfolioAreas=[
 {title:"Inspection history",description:"Search completed work, reports, budgets, NCRs, suppliers, locations, and project history.",href:"/demo/client-history",cta:"View history"},
 {title:"Analytics",description:"Cross-filter spend, schedule, geography, commodity, project type, and non-conformance trends.",href:"/demo/client-analytics",cta:"Open analytics"},
 {title:"Billing, contracts & profile",description:"Review populated invoices, balances, approvals, contracts, roles, preferences, and account concepts.",href:"/demo/client-operations",cta:"Open operations"},
 {title:"Data & integrations",description:"Export synthetic client data and explore API, Excel, Power BI, ERP, and procurement connectivity.",href:"/demo/client-data",cta:"Explore integrations"},
];

export default function DemoShowcase(){
 const [requestText,setRequestText]=useState(sampleRequest);
 const continueHref=requestText.trim()?`/find-inspectors?demo=1&request=${encodeURIComponent(requestText.trim())}`:"/find-inspectors?demo=1";
 return <main className="shell">
   <ClientWorkspaceSidebar demo />
   <section className="workspace">
    <section className="requestHero">
     <p className="eyebrow">Client Demo · Synthetic data</p>
     <h1>Request your inspection</h1>
     <p className="requestIntro">Start the way you already work. Describe the requirement, email it to us, or use structured selection. This demo uses synthetic examples and mirrors the production client workflow.</p>
     <div className="requestOptions">
      <article className="requestCard requestCardNatural">
       <h2>Natural language request</h2>
       <p>Tell InspectSource what you need in plain English. Include the location, dates, equipment, certifications, scope, travel requirements, budget, or anything else you know.</p>
       <textarea className="naturalInput" rows={6} value={requestText} maxLength={MAX_REQUEST_CHARS} onChange={(event)=>setRequestText(event.target.value)} aria-label="Describe your inspection request" aria-describedby="demo-request-limit" />
       <div id="demo-request-limit" className="textMeta">Up to {MAX_REQUEST_CHARS.toLocaleString()} characters · {requestText.length.toLocaleString()} used</div>
       <div className="uploadHint"><span className="uploadIcon" aria-hidden="true">↑</span><strong>Upload Scope</strong><span> is available in the full natural-language request workspace.</span></div>
       <Link className="primaryButton" href={continueHref}>Find Inspectors</Link>
      </article>
      <article className="requestCard">
       <h2>Email Requirements</h2>
       <p>Keep using email. The guidance page shows the expected fields, attachment recommendations, a copy-ready example, and the InspectSource-prefixed subject before opening your email client.</p>
       <Link className="primaryButton" href="/email-requirements?demo=1">View Email Requirements</Link>
      </article>
      <article className="requestCard">
       <h2>Structured selection</h2>
       <p>Use the same standard fields as the production workflow. For this demo, the form is pre-populated to represent the same Houston refinery request.</p>
       <Link className="primaryButton" href="/inspectors?demo=1">Open pre-filled selection form</Link>
      </article>
     </div>
    </section>
    <section className="portfolio" aria-labelledby="client-demo-portfolio-heading">
      <div className="portfolioHeading">
        <div>
          <p className="eyebrow">Full client experience</p>
          <h2 id="client-demo-portfolio-heading">Explore the synthetic client portfolio</h2>
          <span>60 global inspection records across three major projects, with example reports and approximately 2% NCR incidence. Every area below is deterministic demo data and never writes synthetic records to production.</span>
        </div>
        <Link className="inspectorSwitch" href="/demo/inspector">Switch to Inspector Demo →</Link>
      </div>
      <div className="portfolioGrid">
       {portfolioAreas.map((area)=><article className="portfolioCard" key={area.href}>
        <h3>{area.title}</h3>
        <p>{area.description}</p>
        <Link href={area.href}>{area.cta} →</Link>
       </article>)}
      </div>
    </section>
   </section>
   <style jsx>{`.shell{max-width:1440px;margin:auto;padding:18px 18px 70px;display:grid;grid-template-columns:250px minmax(0,1fr);gap:20px}.workspace{min-width:0}.requestHero,.portfolio{background:#fff;border:1px solid #e2e8f0;border-radius:18px}.requestHero{padding:34px}.requestHero h1{font-size:2.4rem;margin:4px 0 8px}.eyebrow{font-size:.75rem;font-weight:800;letter-spacing:.12em;text-transform:uppercase}.requestIntro{max-width:820px;color:#64748b;font-size:1.05rem;line-height:1.55}.requestOptions{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:26px;align-items:stretch}.requestCard{border:1px solid #dbe3ee;border-radius:16px;padding:22px;display:flex;flex-direction:column;min-height:285px}.requestCardNatural{min-height:410px}.requestCard h2{font-size:1.15rem;margin:0 0 8px}.requestCard p{color:#64748b;line-height:1.55}.naturalInput{width:100%;box-sizing:border-box;resize:vertical;border:1px solid #cbd5e1;border-radius:10px;padding:12px;font:inherit;line-height:1.45;min-height:132px;margin-top:8px}.textMeta{margin-top:7px;text-align:right;color:#64748b;font-size:.78rem}.uploadHint{display:flex;align-items:center;gap:6px;margin:12px 0;color:#64748b;font-size:.82rem}.uploadIcon{display:inline-grid;place-items:center;width:20px;height:20px;border-radius:999px;background:#e0f2fe;color:#075985;font-weight:900}.primaryButton{display:block;text-align:center;text-decoration:none;background:#0f172a;color:#fff;border-radius:10px;padding:12px 14px;font-weight:700;margin-top:auto}.portfolio{margin-top:16px;padding:20px}.portfolioHeading{display:flex;justify-content:space-between;gap:18px;align-items:flex-start}.portfolioHeading h2{margin:4px 0 6px;font-size:1.3rem}.portfolioHeading span{display:block;max-width:800px;color:#64748b;line-height:1.5;font-size:.9rem}.inspectorSwitch{white-space:nowrap;text-decoration:none;font-weight:800;padding:10px 12px;border:1px solid #99f6e4;background:#f0fdfa;border-radius:10px;color:#115e59}.portfolioGrid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-top:16px}.portfolioCard{display:flex;flex-direction:column;min-height:176px;padding:16px;border:1px solid #dbe3ee;border-radius:14px;background:#f8fafc}.portfolioCard h3{margin:0;font-size:1rem;color:#0f172a}.portfolioCard p{margin:8px 0 16px;color:#64748b;line-height:1.45;font-size:.86rem}.portfolioCard :global(a){margin-top:auto;text-decoration:none;font-weight:800;color:#1d4ed8}@media(max-width:1120px){.portfolioGrid{grid-template-columns:repeat(2,1fr)}}@media(max-width:980px){.shell{grid-template-columns:1fr}.requestOptions{grid-template-columns:1fr}.requestCard,.requestCardNatural{min-height:0}.portfolioHeading{flex-direction:column}.inspectorSwitch{white-space:normal}}@media(max-width:620px){.requestHero{padding:22px}.requestHero h1{font-size:1.7rem}.portfolio{padding:16px}.portfolioGrid{grid-template-columns:1fr}.portfolioCard{min-height:0}}`}</style>
  </main>
}
