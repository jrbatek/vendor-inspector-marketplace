"use client";

import Link from "next/link";
import { useState } from "react";
import ClientContinuousSidebar from "@/components/ClientContinuousSidebar";
import { ClientDemoEmbeddedContext } from "@/components/ClientDemoEmbeddedContext";
import ClientInspectionsDemo from "@/app/demo/client-inspections/page";
import ClientAnalyticsDemo from "@/app/demo/client-analytics/page";
import ClientAnalyticsEmbedBoundary from "@/components/ClientAnalyticsEmbedBoundary";
import ClientOperationsDemo from "@/app/demo/client-operations/page";
const MAX_REQUEST_CHARS=10000;
const MAX_UPLOAD_BYTES=256*1024;
const sampleRequest=`We need two API 570 inspectors for a refinery turnaround in Houston starting November 16 for approximately three weeks. API 570 certification, minimum 5 years refinery/petrochemical experience, current TWIC card, availability for 10-12 hour shifts, and local Houston inspectors preferred. Please send qualified CVs/resumes, availability, and rates.`;
const portfolioAreas=[
 {title:"Inspections in Progress",description:"Open seven synthetic inspections with schedules, milestones, sample reports, NCRs and client actions.",href:"/demo/client-inspections",cta:"Open inspections"},
 {title:"Contracted Agencies & sourcing",description:"Compare contracted agency coverage, capacity and commercial channels with eligible independent inspectors.",href:"/demo/client-agency-sourcing",cta:"Explore sourcing"},
 {title:"Analytics",description:"Explore completed inspection history, reports, supplier performance, budgets, NCRs, and project-level trends.",href:"/demo/client-analytics",cta:"Open analytics"},
 {title:"Billing, contracts & profile",description:"Review populated invoices, balances, approvals, contracts, roles, preferences, and account concepts.",href:"/demo/client-operations",cta:"Open operations"},
 {title:"Data & integrations",description:"Export synthetic client data and explore API, Excel, Power BI, ERP, and procurement connectivity.",href:"/demo/client-data",cta:"Explore integrations"},
];
export default function ClientDemo(){
 const [requestText,setRequestText]=useState(sampleRequest); const [uploadMessage,setUploadMessage]=useState("");
 const [emailCopyStatus,setEmailCopyStatus]=useState("");
 const [naturalPreview,setNaturalPreview]=useState("");
 const [criteria,setCriteria]=useState({region:"Gulf Coast",qualification:"API 570",start:"2026-11-16",experience:"5",source:"Both"});
 const [criteriaPreview,setCriteriaPreview]=useState("");
 const updateCriterion=(key:keyof typeof criteria,value:string)=>{
  setCriteria(current=>({...current,[key]:value}));
  setCriteriaPreview("");
 };
 async function copyEmailSample(){
  const message="Location: Houston, Texas\nStart: November 16, 2026\nDuration: 3 weeks\nScope: API 570 piping inspection\nQualification: API 570 and TWIC\nEquipment: refinery process piping\nBudget: USD 950/day\nTravel: local preferred";
  try{await navigator.clipboard.writeText(message);setEmailCopyStatus("Sample request copied.");}
  catch{setEmailCopyStatus("Clipboard unavailable. Copy the sample fields from this section.");}
 }
 async function loadScope(file?:File){
  if(!file)return;
  setNaturalPreview("");setUploadMessage("");
  const extension=file.name.split(".").pop()?.toLowerCase();
  if(!["txt","md","csv","json"].includes(extension||"")){
    setUploadMessage("This demo accepts TXT, MD, CSV, or JSON scope text. For PDF or Word scopes, paste the relevant text into the request box.");
    return;
  }
  if(file.size>MAX_UPLOAD_BYTES){
    setUploadMessage("Scope file is over the 256 KB browser-preview limit. Paste the relevant text instead; your existing request was preserved.");
    return;
  }
  try{
    const loaded=(await file.text()).slice(0,MAX_REQUEST_CHARS);
    setRequestText(loaded);
    setUploadMessage(`Loaded ${file.name}${loaded.length===MAX_REQUEST_CHARS?` (limited to ${MAX_REQUEST_CHARS.toLocaleString()} characters)`:""}. Demo uploads stay in this browser and are not sent to production.`);
  }catch{
    setUploadMessage("Unable to read this scope file in your browser. Paste the relevant text instead; your existing request was preserved.");
  }
 }
 function previewNaturalRequest(){
  const length=requestText.trim().length;
  if(length<20){
    setNaturalPreview("Enter at least 20 characters describing the inspection scope before previewing.");
    return;
  }
  setNaturalPreview(`Synthetic request preview: ${length.toLocaleString()} characters reviewed locally. No AI matching, external submission, or production record was created. The three fictional inspectors below are illustrative, not personalized to this request.`);
 }
 return <main className="shell"><ClientContinuousSidebar/><section className="workspace"><section id="request-inspectors" className="requestHero"><p className="eyebrow">Client Demo · Synthetic data</p><h1>Request your inspection</h1><p className="requestIntro">Start the way you already work. Describe the requirement, email it to us, or use structured selection. This demo is fully synthetic, never requires a production login, and never writes synthetic records to production.</p><div className="sourcePreview"><div><strong>Source of Inspectors</strong><span>Contracted agencies · Independent inspectors · Or both</span></div><Link href="/demo/client-agency-sourcing">Configure sourcing & compare agency channels →</Link></div><div className="requestOptions">
 <article id="natural-language" className="requestCard requestCardNatural"><h2>Natural Language – AI</h2><p>Natural language request: Tell InspectSource what you need in plain English. Include location, dates, equipment, certifications, scope, travel requirements and budget.</p><textarea className="naturalInput" rows={6} value={requestText} maxLength={MAX_REQUEST_CHARS} onChange={e=>{setRequestText(e.target.value);setNaturalPreview("");}} aria-label="Inspection requirement" aria-describedby="demo-request-limit demo-upload-status"/><div id="demo-request-limit" className="textMeta">Up to {MAX_REQUEST_CHARS.toLocaleString()} characters · {requestText.length.toLocaleString()} used</div><label className="uploadButton"><span className="uploadIcon" aria-hidden="true">↑</span><span><strong>Upload Scope</strong><em>TXT, MD, CSV or JSON · max 256 KB / 10,000 characters</em></span><input type="file" accept=".txt,.md,.csv,.json" onChange={e=>void loadScope(e.target.files?.[0])}/></label>{uploadMessage&&<p id="demo-upload-status" className="uploadStatus" role="status">{uploadMessage}</p>}<button type="button" className="primaryButton actionable" onClick={previewNaturalRequest}>Preview request (demo)</button>{naturalPreview&&<p className="naturalPreview" role="status" aria-live="polite">{naturalPreview}</p>}<Link className="quietLink" href="/demo/client-agency-sourcing">Find Inspectors</Link></article>
 <article id="email-requirements" className="requestCard"><h2>Email Requirements</h2>
 <p>Send requirements to <a href="mailto:inspectsource2026@gmail.com?subject=InspectSource%20-%20Inspection%20Request">inspectsource2026@gmail.com</a> with subject <strong>InspectSource - Inspection Request</strong>. Opening the email app does not send anything automatically.</p>
 <p>Describe project/vendor, inspection location and dates, equipment, scope, qualifications, day-rate expectations, travel and shifts. Attach relevant ITPs, drawings or specs (PDF, DOCX, XLSX, CSV, TXT, JPG, PNG; up to 20 MB total). Do not include unneeded personal data.</p>
 <p className="textMeta">A typical response takes about five minutes. Only available inspectors are returned. Emailing this real inbox is separate from the fictional demo.</p>
 <div className="sample"><strong>Sample scope</strong><span>Houston refinery, Nov 16, 2026, three weeks, API 570 piping inspection, TWIC, local preferred, USD 950/day</span><strong>Subject</strong><span>InspectSource - Inspection Request</span></div>
 <button type="button" className="primaryButton actionable" onClick={()=>void copyEmailSample()}>Copy Sample Request</button>
 <span className="textMeta" role="status" aria-live="polite">{emailCopyStatus}</span>
 <a className="quietLink" href="mailto:inspectsource2026@gmail.com?subject=InspectSource%20-%20Inspection%20Request">Open email app</a>
 <Link className="quietLink" href="/demo/email-requirements">Full email attachment guidance</Link></article>
 <article id="structured-selection" className="requestCard"><h2>Structured Selection</h2>
 <p>Structured selection uses standard fields for location, dates, discipline, certifications, experience, commodity, travel and rate. Enter criteria here to preview the selected fictional requirements without submitting them to production.</p>
 <form aria-label="Structured inspector criteria (demo)" onSubmit={e=>{e.preventDefault();setCriteriaPreview("Demo criteria preview: "+criteria.region+" · "+criteria.qualification+" · "+criteria.start+" · "+criteria.experience+"+ years · "+criteria.source+". No matching, commercial offer or production request was created.");}}>
 <div className="intakeFields">
 <label>Geography<select value={criteria.region} onChange={e=>updateCriterion("region",e.target.value)}><option>Gulf Coast</option><option>Middle East</option><option>Europe</option><option>All regions</option></select></label>
 <label>Required certification<select value={criteria.qualification} onChange={e=>updateCriterion("qualification",e.target.value)}><option>API 570</option><option>API 510</option><option>AWS CWI</option><option>Any qualification</option></select></label>
 <label>Inspection start<input type="date" required value={criteria.start} onChange={e=>updateCriterion("start",e.target.value)}/></label>
 <label>Minimum experience (years)<input type="number" min="0" max="40" required value={criteria.experience} onChange={e=>updateCriterion("experience",e.target.value)}/></label>
 <label>Inspector source<select value={criteria.source} onChange={e=>updateCriterion("source",e.target.value)}><option>Both</option><option>Agency</option><option>Independent</option></select></label></div>
 <button type="submit" className="primaryButton actionable">Preview selected criteria</button></form>
 {criteriaPreview&&<p role="status" className="criteriaNotice" aria-live="polite">{criteriaPreview}</p>}
 <Link className="quietLink" href="/demo/client-agency-sourcing">Explore synthetic sourcing channels and inspector examples</Link></article></div></section>
 <section id="demo-shortlist" className="shortlist"><div><p className="eyebrow">Synthetic shortlist</p><h2>Qualified inspectors identified</h2><p>Representative matches for the sample Houston refinery request.</p></div><div className="matches"><article><strong>Inspector IS-1042</strong><span>API 570 · AWS CWI · Houston</span><b>96% match</b></article><article><strong>Inspector IS-1187</strong><span>API 570 · 11 years refinery · Beaumont</span><b>92% match</b></article><article><strong>Inspector IS-1314</strong><span>API 570 · API 510 · Gulf Coast travel</span><b>89% match</b></article></div></section>
 <section className="portfolio"><div className="portfolioHeading"><div><p className="eyebrow">Full client experience</p><h2>Explore the synthetic client portfolio</h2><span>60 global inspection records across three major projects, sample reports, billing, contracts and analytics. The completed portfolio shows a 1.8% NCR rate versus a 2.1% global running average.</span></div><Link className="inspectorSwitch" href="/demo/agency">Switch to Agency Demo →</Link></div><section id="inspections-in-progress" className="embeddedDemoBlock" aria-label="Inspections in Progress"><ClientDemoEmbeddedContext.Provider value={true}><ClientInspectionsDemo/></ClientDemoEmbeddedContext.Provider></section>
 <section id="analytics" className="embeddedDemoBlock" aria-label="Analytics"><ClientDemoEmbeddedContext.Provider value={true}><ClientAnalyticsEmbedBoundary><ClientAnalyticsDemo/></ClientAnalyticsEmbedBoundary></ClientDemoEmbeddedContext.Provider></section>
 <ClientDemoEmbeddedContext.Provider value={true}><ClientOperationsDemo/></ClientDemoEmbeddedContext.Provider></section></section><style jsx>{`.shell{max-width:1440px;margin:auto;padding:18px 18px 70px;display:grid;grid-template-columns:250px minmax(0,1fr);gap:20px}.workspace{min-width:0}.requestHero,.shortlist,.portfolio{background:#fff;border:1px solid #e2e8f0;border-radius:18px}.requestHero{padding:30px}.requestHero h1{font-size:2.2rem;margin:4px 0 8px}.eyebrow{font-size:.75rem;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#0f766e}.requestIntro{max-width:820px;color:#64748b;line-height:1.55}.sourcePreview{display:flex;justify-content:space-between;gap:16px;align-items:center;padding:12px 14px;margin-top:14px;border:1px solid #99f6e4;background:#f0fdfa;border-radius:12px}.sourcePreview div{display:grid;gap:3px}.sourcePreview span{font-size:.82rem;color:#475569}.sourcePreview :global(a){font-weight:800;color:#115e59;text-decoration:none}.requestOptions{display:grid;grid-template-columns:minmax(0,1fr);gap:16px;margin-top:16px}.requestCard{border:1px solid #dbe3ee;border-radius:16px;padding:24px;display:flex;flex-direction:column;min-width:0;min-height:0;scroll-margin-top:24px}.requestCard h2{font-size:1.15rem;margin:0 0 8px}.requestCard p{color:#64748b;line-height:1.5}.naturalInput{width:100%;box-sizing:border-box;resize:vertical;border:1px solid #cbd5e1;border-radius:10px;padding:12px;font:inherit;line-height:1.45;min-height:132px;margin-top:8px}.textMeta{margin-top:7px;text-align:right;color:#64748b;font-size:.78rem}.uploadButton{display:flex;gap:9px;align-items:center;margin:10px 0;padding:10px 11px;border:1px dashed #94a3b8;border-radius:10px;color:#334155;font-size:.82rem;cursor:pointer;background:#f8fafc}.uploadButton span:nth-child(2){display:grid;gap:2px}.uploadButton em{font-style:normal;color:#64748b;font-size:.76rem;font-weight:500}.uploadButton:hover{border-color:#0f766e;background:#f0fdfa}.uploadButton:focus-within{outline:3px solid #0d9488;outline-offset:3px;background:#f0fdfa}.uploadButton input{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}.uploadIcon{display:inline-grid;place-items:center;width:26px;height:26px;border-radius:999px;background:#e0f2fe;color:#075985;font-weight:900}.uploadStatus{margin:0 0 10px;padding:9px 10px;border-radius:9px;background:#f1f5f9;color:#475569!important;font-size:.78rem}.naturalPreview{padding:12px;border:1px solid #0f766e;background:#f0fdfa;color:#115e59!important;border-radius:9px;line-height:1.5}.sample{display:grid;grid-template-columns:auto 1fr;gap:8px 10px;padding:12px;background:#f8fafc;border-radius:10px;font-size:.84rem}.sample span{color:#64748b}.primaryButton{display:block;text-align:center;text-decoration:none;background:#0f172a;color:#fff;border-radius:10px;padding:11px 14px;font-weight:700;margin-top:18px;align-self:flex-start;min-width:210px;min-height:44px}.shortlist,.portfolio{margin-top:16px;padding:20px}.shortlist h2{margin:3px 0}.shortlist p{color:#64748b}.matches{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:14px}.matches article{display:grid;gap:5px;padding:14px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px}.matches span{color:#64748b;font-size:.82rem}.matches b{color:#0f766e}.portfolioHeading{display:flex;justify-content:space-between;gap:18px}.portfolioHeading h2{margin:4px 0 6px}.portfolioHeading span{display:block;max-width:800px;color:#64748b;line-height:1.5;font-size:.9rem}.inspectorSwitch{white-space:nowrap;text-decoration:none;font-weight:800;padding:10px 12px;border:1px solid #bfdbfe;background:#eff6ff;border-radius:10px;color:#1d4ed8;height:max-content}.portfolioGrid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:12px;margin-top:16px}.portfolioCard{display:flex;flex-direction:column;min-height:170px;padding:16px;border:1px solid #dbe3ee;border-radius:14px;background:#f8fafc}.portfolioCard h3{margin:0}.portfolioCard p{color:#64748b;line-height:1.45;font-size:.86rem}.portfolioCard :global(a){margin-top:auto;text-decoration:none;font-weight:800;color:#1d4ed8}.workspace [id]{scroll-margin-top:24px}.embeddedDemoBlock{margin-top:24px;min-width:0}.portfolio{padding:18px}.portfolioHeading{margin-bottom:16px}.intakeFields{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-top:15px}.intakeFields label{display:grid;gap:5px;color:#334155;font-weight:750;font-size:.84rem}.intakeFields select,.intakeFields input{width:100%;min-width:0;min-height:44px;background:#fff;color:#0f172a;border:1px solid #94a3b8;border-radius:8px;padding:8px 10px;font:inherit}.intakeFields select:focus-visible,.intakeFields input:focus-visible{outline:3px solid #0d9488;outline-offset:2px}.actionable{border:0;cursor:pointer}.actionable:hover{background:#115e59}.actionable:focus-visible{outline:3px solid #0d9488;outline-offset:3px}.quietLink{color:#0f766e;text-decoration:underline;margin-top:12px;font-size:.85rem}.criteriaNotice{border:1px solid #99f6e4;background:#f0fdfa;padding:12px;border-radius:8px;color:#115e59!important}@media(max-width:620px){.intakeFields{grid-template-columns:1fr}}@media(max-width:1120px){.portfolioGrid{grid-template-columns:repeat(2,1fr)}}@media(max-width:980px){.shell{grid-template-columns:1fr}.matches{grid-template-columns:1fr}.portfolioHeading,.sourcePreview{flex-direction:column;align-items:flex-start}}@media(max-width:620px){.requestHero{padding:22px}.portfolioGrid{grid-template-columns:1fr}}`}</style></main>
}