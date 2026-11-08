"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { exportSyntheticEarningsCsv } from "@/lib/inspectorIncomeExport";

type Year = 2024 | 2025 | 2026;
type Engagement = "Contractor" | "Employee";
type Activity = {id:string;year:Year;client:string;project:string;type:Engagement;gross:number;paid:string};
const DATA_THROUGH="2026-11-01T23:59:59-06:00"; // Immutable fictional YTD snapshot.
const ACTIVITIES:Activity[]=[
 {id:"S-2601",year:2026,client:"Synthetic Northstar Energy",project:"Piping Surveillance",type:"Contractor",gross:9200,paid:"2026-09-28"},
 {id:"S-2602",year:2026,client:"Synthetic Meridian Power",project:"Transformer FAT",type:"Employee",gross:6700,paid:"2026-08-29"},
 {id:"S-2603",year:2026,client:"Synthetic Bluewater LNG",project:"Cryogenic Valve Inspection",type:"Contractor",gross:8100,paid:"2026-06-02"},
 {id:"S-2604",year:2026,client:"Synthetic Atlas Petrochem",project:"Mechanical Inspection",type:"Employee",gross:5500,paid:"2026-04-10"},
 {id:"S-2501",year:2025,client:"Synthetic Northstar Energy",project:"Pressure Vessel Surveillance",type:"Contractor",gross:12500,paid:"2025-10-01"},
 {id:"S-2502",year:2025,client:"Synthetic Meridian Power",project:"Pump FAT",type:"Employee",gross:10200,paid:"2025-07-28"},
 {id:"S-2503",year:2025,client:"Synthetic Aurora Renewables",project:"Welding Witness",type:"Contractor",gross:8900,paid:"2025-05-08"},
 {id:"S-2401",year:2024,client:"Synthetic Bluewater LNG",project:"Compressor FAT",type:"Contractor",gross:9800,paid:"2024-09-03"},
 {id:"S-2402",year:2024,client:"Synthetic Atlas Petrochem",project:"QA Coverage",type:"Employee",gross:7300,paid:"2024-06-10"},
];
function money(n:number){return "USD "+n.toLocaleString("en-US");}
function sampleDocument(title:string,year:Year,lines:string[]){
 const content=["INSPECTSOURCE - FICTIONAL DEMO SAMPLE",title,"Year: "+year,"",...lines,"",
  "SIMULATED DATA ONLY. NOT TAX, CREDIT, PAYROLL, BANK OR EMPLOYMENT EVIDENCE.",
  "No independent verification, filing, account update or real payment has occurred."].join("\n");
 return "data:text/plain;charset=utf-8,"+encodeURIComponent(content);
}
export default function InspectorIncomeDemo(){
 const [year,setYear]=useState<Year>(2026);
 const [pdfBusy,setPdfBusy]=useState(false);
 const [paymentOpen,setPaymentOpen]=useState(false);
 const [method,setMethod]=useState("Synthetic direct deposit preference");
 const [draft,setDraft]=useState(method);
 const [message,setMessage]=useState("");
 const paymentTrigger=useRef<HTMLButtonElement>(null);
 const paymentCancel=useRef<HTMLButtonElement>(null);
 useEffect(()=>{if(paymentOpen)paymentCancel.current?.focus();},[paymentOpen]);
 const closePayment=()=>{setPaymentOpen(false);paymentTrigger.current?.focus();};
 const data=useMemo(()=>ACTIVITIES.filter(a=>a.year===year),[year]);
 const gross=data.reduce((s,a)=>s+a.gross,0);
 const contract=data.filter(a=>a.type==="Contractor").reduce((s,a)=>s+a.gross,0);
 const employed=data.filter(a=>a.type==="Employee").reduce((s,a)=>s+a.gross,0);
 const reportLines=data.map(a=>a.id+" | "+a.project+" | "+a.client+" | "+money(a.gross)+" | "+a.type);
 const documentLink=(title:string,lines:string[])=>sampleDocument(title,year,lines);
 const downloadSyntheticPdf=async()=>{
   setPdfBusy(true);
   setMessage("");
   try {
     const { createSyntheticIncomeReportPdf } = await import("@/lib/inspectorIncomePdf");
     const dataUri=await createSyntheticIncomeReportPdf(ACTIVITIES,year,DATA_THROUGH);
     const anchor=document.createElement("a");
     anchor.href=dataUri;
     anchor.download="inspectsource-synthetic-income-report-"+year+".pdf";
     document.body.appendChild(anchor);
     anchor.click();
     anchor.remove();
   } catch {
     setMessage("The fictional income PDF could not be prepared. Try again or use the sample text report.");
   } finally {
     setPdfBusy(false);
   }
 };
 return <main className="incomePage">
   <header className="hero"><p className="eyebrow">InspectorHub · Demo Mode</p><h1>Income &amp; Tax Center</h1>
    <p>Explore fictional earnings, work verification, tax-document summaries and sample income reports. No personal, payroll, tax or banking records are connected.</p>
    <p><strong>Current-year YTD data through:</strong> {DATA_THROUGH} (fixed synthetic snapshot; not live)</p>
    <a href="/demo/inspector">Back to Inspector Demo</a>
   </header>
   <section className="yearBar"><label>Tax and earnings year <select aria-label="Tax and earnings year" value={year} onChange={e=>setYear(Number(e.target.value) as Year)}><option value={2026}>2026 · YTD</option><option value={2025}>2025</option><option value={2024}>2024</option></select></label><span>{year===2026?"Current-year YTD":"Completed fictional tax year"}</span></section>
   <section className="stats"><div><strong>{money(gross)}</strong><span>{year===2026?"YTD gross":"Annual gross"}</span></div><div><strong>{money(contract)}</strong><span>Independent contractor</span></div><div><strong>{money(employed)}</strong><span>Employee work</span></div><div><strong>{data.length}</strong><span>Assignments paid</span></div></section>
   <section className="card"><p className="eyebrow">Earnings Statements</p><h2>Assignment earnings</h2><p>Gross synthetic amounts, prior to deductions or reimbursements; amounts do not represent actual pay.</p>
    <p className="csvNotice"><a className="csvDownload" href={"data:text/csv;charset=utf-8,"+encodeURIComponent(exportSyntheticEarningsCsv(data,year,DATA_THROUGH))} download={"inspectsource-synthetic-earnings-"+year+".csv"}>Download selected-year synthetic earnings CSV</a> · Includes only {year} fictional statements, with the fixed data-through timestamp.</p>
    <div className="records">{data.map(a=><article key={a.id}><div><strong>{a.project}</strong><span>{a.client} · {a.type} · Paid {a.paid}</span></div><strong>{money(a.gross)}</strong><a download={a.id+"-sample.txt"} href={documentLink("Sample earnings statement "+a.id,[a.client,a.project,a.type,money(a.gross),"Paid "+a.paid])}>Download sample statement</a></article>)}</div>
   </section>
   <div className="cards">
    <section className="card"><p className="eyebrow">Employment / Work Verification</p><h2>Work verification</h2><p>Illustrative assignment activity letter; not signed or independently verified.</p><a download={"sample-work-verification-"+year+".txt"} href={documentLink("Work Verification SAMPLE",reportLines)}>Download sample verification</a></section>
    <section className="card"><p className="eyebrow">Verified Income Reports</p><h2>Income report preview</h2><p>Sample report layout only. No income was independently verified.</p><a download={"sample-income-report-"+year+".txt"} href={documentLink("Income Verification SAMPLE",["Gross "+money(gross),"Contractor "+money(contract),"Employee "+money(employed),...reportLines])}>Download sample income report (text)</a><button type="button" disabled={pdfBusy} onClick={downloadSyntheticPdf}>{pdfBusy?"Preparing fictional PDF...":"Download synthetic income report PDF"}</button><p>PDF preview is marked SAMPLE / NOT VERIFIED. It is not usable as income or employment evidence.</p></section>
    <section className="card"><p className="eyebrow">Tax documents</p><h2>Applicable 1099-NEC / W-2</h2>
      {year===2026?<p>Current-year tax statements are not yet issued. Select a completed year to preview sample summaries.</p>:<><p>Informational sample summaries, not official IRS forms or tax documents for filing.</p><div className="downloads">
        {contract>0&&<a download={"sample-1099-nec-"+year+".txt"} href={documentLink("1099-NEC informational SAMPLE",["Fictional independent contractor gross: "+money(contract)])}>Sample 1099-NEC</a>}
        {employed>0&&<a download={"sample-w2-"+year+".txt"} href={documentLink("W-2 informational SAMPLE",["Fictional employee gross: "+money(employed)])}>Sample W-2</a>}
      </div></>}
    </section>
    <section className="card"><p className="eyebrow">Payment details</p><h2>Update Direct Deposit / Payment Details</h2><p>Demo setting: {method}. No bank account, routing, card number or payment credentials are requested or stored.</p><button ref={paymentTrigger} type="button" onClick={()=>{setDraft(method);setMessage("");setPaymentOpen(true)}}>Preview payment details update</button></section>
   </div>
   {message&&<p role="status" className="notice">{message}</p>}
   {paymentOpen&&<div className="overlay"><section className="modal" role="dialog" aria-modal="true" aria-label="Payment preference demo" aria-describedby="payment-demo-note" onKeyDown={e=>{if(e.key==="Escape"){e.preventDefault();closePayment();}else if(e.key==="Tab"){const items=Array.from(e.currentTarget.querySelectorAll<HTMLElement>("select,button"));if(!items.length)return;const first=items[0];const last=items[items.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}}}><h2>Payment details · simulated</h2><p id="payment-demo-note">Choose a fictional preference only. No actual payment method is created. Press Escape to cancel.</p><label>Demo payment preference<select value={draft} onChange={e=>setDraft(e.target.value)}><option>Synthetic direct deposit preference</option><option>Synthetic manual payment preference</option></select></label><div className="downloads"><button type="button" onClick={()=>{setMethod(draft);closePayment();setMessage("Demo payment preference changed in this page only. No bank details were collected.");}}>Save demo preference</button><button ref={paymentCancel} type="button" className="secondary" onClick={closePayment}>Cancel</button></div></section></div>}
   <p className="footnote">Entirely synthetic demo: no real financial statements, legal tax forms, verification, bank transfers, official employment attestations or production data.</p>
   <style jsx>{`.incomePage{max-width:1120px;margin:auto;padding:24px 18px 70px;color:#0f172a}.hero,.yearBar,.stats>div,.card{background:#fff;border:1px solid #dbe4e8;border-radius:16px}.hero{padding:24px;background:#f0fdfa}.hero h1{margin:5px 0}.hero p{color:#334155}.hero a{color:#115e59;font-weight:800}.eyebrow{font-weight:900;text-transform:uppercase;letter-spacing:.1em;color:#115e59;font-size:.72rem;margin:0}.yearBar{padding:14px 20px;margin:14px 0;display:flex;align-items:center;justify-content:space-between;gap:10px}.yearBar label,.modal label{display:grid;gap:5px;font-weight:800}.yearBar span{font-weight:700;color:#475569}.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:14px}.stats>div{padding:15px;display:grid;gap:6px}.stats strong{color:#115e59;font-size:1.35rem}.stats span,.records span{color:#475569}.card{padding:19px;margin-bottom:12px}.card h2{margin:5px 0}.card p{color:#475569}.csvNotice{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.csvDownload{background:#f0fdfa!important;color:#115e59!important}.csvDownload:hover{background:#ccfbf1!important}.records{display:grid;gap:9px}.records article{display:grid;grid-template-columns:1fr auto auto;align-items:center;gap:12px;padding:12px;border:1px solid #cbd5e1;border-radius:9px}.records article>div{display:grid;gap:5px}.cards{display:grid;grid-template-columns:1fr 1fr;gap:12px}.cards .card{margin-bottom:0}.downloads{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}button,.card a{display:inline-block;padding:10px 12px;border:1px solid #115e59;border-radius:9px;background:#115e59;color:#fff;text-decoration:none;font-weight:800;cursor:pointer}button:hover,.card a:hover{background:#064e3b}button:disabled,button:disabled:hover{background:#e2e8f0;color:#334155;border-color:#94a3b8;opacity:1;cursor:wait}.secondary{background:#fff;color:#115e59}.secondary:hover{background:#f0fdfa;color:#115e59}a:focus-visible,button:focus-visible,select:focus-visible{outline:3px solid #0d9488;outline-offset:2px}select{padding:10px;border:1px solid #64748b;background:#fff;color:#0f172a;border-radius:8px;font:inherit}.overlay{position:fixed;inset:0;z-index:1200;background:#0f172a99;display:grid;place-items:center;padding:20px}.modal{background:#fff;padding:24px;border-radius:18px;width:min(520px,95vw)}.notice{background:#ecfdf5;color:#115e59;padding:12px;border-radius:10px}.footnote{margin-top:18px;color:#475569;font-size:.87rem}@media(max-width:850px){.stats{grid-template-columns:1fr 1fr}.records article{grid-template-columns:1fr}.cards{grid-template-columns:1fr}}@media(max-width:550px){.stats{grid-template-columns:1fr}.yearBar{display:block}}`}</style>
 </main>;
}
