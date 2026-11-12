"use client";
import {useState} from "react";
import {AGENCY_DEMO_CONTRACTS,createAgencyDemoContractPdf} from "@/lib/agencyDemoContracts";

export default function AgencyContractsPanel(){
 const [opened,setOpened]=useState<string|null>(null);
 const [downloading,setDownloading]=useState<string|null>(null);
 const [error,setError]=useState("");
 const download=async(id:string)=>{
  const contract=AGENCY_DEMO_CONTRACTS.find(row=>row.id===id);
  if(!contract)return;
  setError("");setDownloading(id);
  try{
   const uri=await createAgencyDemoContractPdf(contract);
   const link=document.createElement("a");
   link.href=uri;link.download="inspectsource-fictional-"+contract.id+".pdf";
   document.body.append(link);link.click();link.remove();
  }catch{setError("The synthetic PDF could not be generated in this browser.");}
  finally{setDownloading(null);}
 };
 return <div className="contractsPanel">
  <h3>Contracts & Commercials</h3>
  <p>Three named <strong>FICTIONAL</strong> client-agency agreements illustrate duration, coverage, day rate, expense packages and renewal status. No acceptance or payment is possible.</p>
  <div className="agreementList" aria-label="Synthetic client-agency contracts">
   {AGENCY_DEMO_CONTRACTS.map(contract=><article className="agreementCard" key={contract.id}>
    <div className="agreementHeader">
     <div><strong>{contract.client}</strong><span>{contract.agreement}</span><small>{contract.id} · {contract.status}</small></div>
     <div className="meta"><b>{contract.dayRate}</b><span>{contract.effective} to {contract.expiry}</span><span>{contract.geography}</span></div>
    </div>
    <div className="actions">
     <button type="button" aria-expanded={opened===contract.id} aria-controls={"contract-details-"+contract.id}
      onClick={()=>setOpened(current=>current===contract.id?null:contract.id)}>{opened===contract.id?"Close contract details":"Open contract details"}</button>
     <button type="button" disabled={downloading===contract.id} onClick={()=>void download(contract.id)} aria-label={"Download fictional PDF "+contract.id}>
      {downloading===contract.id?"Generating sample PDF...":"Download fictional PDF"}
     </button>
    </div>
    {opened===contract.id&&<section id={"contract-details-"+contract.id} className="detail" aria-label={"Synthetic agreement "+contract.id}>
     <dl><div><dt>Client (fictional)</dt><dd>{contract.client}</dd></div><div><dt>Agreement</dt><dd>{contract.agreement}</dd></div>
      <div><dt>Agreement ID</dt><dd>{contract.id}</dd></div><div><dt>Effective / expiry</dt><dd>{contract.effective} / {contract.expiry}</dd></div>
      <div><dt>Contract status</dt><dd>{contract.status}</dd></div><div><dt>Scope</dt><dd>{contract.scope}</dd></div>
      <div><dt>Payment terms</dt><dd>{contract.paymentTerms}</dd></div><div><dt>Expenses</dt><dd>{contract.expenses}</dd></div>
      <div><dt>Overtime</dt><dd>{contract.overtime}</dd></div><div><dt>Demonstration note</dt><dd>{contract.notes}</dd></div></dl>
    </section>}
   </article>)}
  </div>
  {error&&<p role="alert" className="error">{error}</p>}
  <p className="disclaimer">SYNTHETIC SAMPLE ONLY · No verified clients, binding contracts, real terms, financial records, credentials or e-signatures.</p>
  <style jsx>{`
   .agreementList{display:grid;gap:12px;margin:14px 0}.agreementCard{border:1px solid #ddd6fe;border-radius:12px;background:#f9f7ff;padding:16px}
   .agreementHeader{display:flex;align-items:flex-start;justify-content:space-between;gap:18px}.agreementHeader strong,.agreementHeader span,.agreementHeader small,.meta b{display:block}
   .agreementHeader strong{color:#32125d;font-size:1rem}.agreementHeader span{color:#334155;font-size:.86rem;margin-top:4px}.agreementHeader small{color:#6d28d9;margin-top:5px;font-weight:800}
   .meta{text-align:right}.meta b{color:#32125d}.actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:12px}
   button{border:1px solid #6d28d9;border-radius:8px;background:#6d28d9;color:#fff;padding:10px 14px;font-size:.85rem;font-weight:750;cursor:pointer;min-height:42px}
   button:hover{background:#581c87}button:focus-visible{outline:3px solid #a78bfa;outline-offset:2px}button:disabled{background:#cbd5e1;color:#334155;border-color:#94a3b8;cursor:wait}
   .detail{margin-top:12px;border-top:1px solid #c4b5fd;padding-top:12px}.detail dl{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin:0}
   .detail dt{font-weight:800;color:#4c1d95;font-size:.75rem}.detail dd{margin:3px 0 0;color:#334155;font-size:.83rem}
   .disclaimer{font-weight:800;color:#581c87;font-size:.74rem}.error{color:#9f1239;font-weight:800}
   @media(max-width:700px){.agreementHeader{display:grid}.meta{text-align:left}.detail dl{grid-template-columns:1fr}}
  `}</style>
 </div>;
}
