"use client";

import Link from "next/link";
import { useState } from "react";
import ClientWorkspaceSidebar from "@/components/ClientWorkspaceSidebar";

const MAX_REQUEST_CHARS=10000;
const sampleRequest=`We need two API 570 inspectors for a refinery turnaround in Houston starting September 14 for approximately three weeks. API 570 certification, minimum 5 years refinery/petrochemical experience, current TWIC card, availability for 10-12 hour shifts, and local Houston inspectors preferred. Please send qualified CVs/resumes, availability, and rates.`;

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
    <section className="portfolioLinks">
      <div><strong>Explore the synthetic client portfolio</strong><span>60 global inspection records across three major projects, with example reports and approximately 2% NCR incidence.</span></div>
      <Link href="/demo/client-history">View inspection history</Link>
      <Link href="/demo/client-analytics">View analytics</Link>
    </section>
   </section>
   <style jsx>{`.shell{max-width:1440px;margin:auto;padding:18px 18px 70px;display:grid;grid-template-columns:250px minmax(0,1fr);gap:20px}.workspace{min-width:0}.requestHero,.portfolioLinks{background:#fff;border:1px solid #e2e8f0;border-radius:18px}.requestHero{padding:34px}.requestHero h1{font-size:2.4rem;margin:4px 0 8px}.eyebrow{font-size:.75rem;font-weight:800;letter-spacing:.12em;text-transform:uppercase}.requestIntro{max-width:820px;color:#64748b;font-size:1.05rem;line-height:1.55}.requestOptions{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:26px;align-items:stretch}.requestCard{border:1px solid #dbe3ee;border-radius:16px;padding:22px;display:flex;flex-direction:column;min-height:285px}.requestCardNatural{min-height:410px}.requestCard h2{font-size:1.15rem;margin:0 0 8px}.requestCard p{color:#64748b;line-height:1.55}.naturalInput{width:100%;box-sizing:border-box;resize:vertical;border:1px solid #cbd5e1;border-radius:10px;padding:12px;font:inherit;line-height:1.45;min-height:132px;margin-top:8px}.textMeta{margin-top:7px;text-align:right;color:#64748b;font-size:.78rem}.uploadHint{display:flex;align-items:center;gap:6px;margin:12px 0;color:#64748b;font-size:.82rem}.uploadIcon{display:inline-grid;place-items:center;width:20px;height:20px;border-radius:999px;background:#e0f2fe;color:#075985;font-weight:900}.primaryButton{display:block;text-align:center;text-decoration:none;background:#0f172a;color:#fff;border-radius:10px;padding:12px 14px;font-weight:700;margin-top:auto}.portfolioLinks{margin-top:16px;padding:16px 18px;display:grid;grid-template-columns:1fr auto auto;gap:12px;align-items:center}.portfolioLinks div{display:grid;gap:4px}.portfolioLinks span{color:#64748b;font-size:.9rem}.portfolioLinks :global(a){text-decoration:none;font-weight:800;padding:9px 12px;border:1px solid #cbd5e1;border-radius:9px;color:#0f172a}@media(max-width:980px){.shell{grid-template-columns:1fr}.requestOptions{grid-template-columns:1fr}.requestCard,.requestCardNatural{min-height:0}.portfolioLinks{grid-template-columns:1fr}}@media(max-width:620px){.requestHero{padding:22px}.requestHero h1{font-size:1.7rem}}`}</style>
  </main>
}
