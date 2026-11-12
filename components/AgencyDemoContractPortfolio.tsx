"use client";

import { useState } from "react";
import { AGENCY_DEMO_CONTRACTS, createAgencySyntheticContractPdf, type AgencyDemoContract } from "@/lib/agencyDemoContracts";

/** Embedded commercial overview for the one-page Agency Demo. No real agreement actions. */
export default function AgencyDemoContractPortfolio() {
  const [selected,setSelected]=useState<string|null>(null);
  const [status,setStatus]=useState("");
  const [downloading,setDownloading]=useState<string|null>(null);
  const open=AGENCY_DEMO_CONTRACTS.find(contract=>contract.id===selected);
  async function download(contract:AgencyDemoContract){
    setDownloading(contract.id);setStatus("");
    try{
      const uri=await createAgencySyntheticContractPdf(contract);
      const link=document.createElement("a");
      link.href=uri;link.download="FICTIONAL-InspectSource-"+contract.id+".pdf";
      document.body.appendChild(link);link.click();link.remove();
      setStatus("Fictional sample PDF prepared for "+contract.id+". No production contract accessed.");
    }catch{
      setStatus("Unable to prepare the fictional sample PDF. No changes were made.");
    }finally{setDownloading(null);}
  }
  return <div className="agencyContracts" aria-label="Synthetic named client-agency contracts">
    <p className="boundary"><strong>Fictional sample agreements.</strong> These invented records are not valid legal contracts and cannot be accepted or signed here.</p>
    <div className="list" role="list">
      {AGENCY_DEMO_CONTRACTS.map(contract=><article className="contract" role="listitem" key={contract.id}>
        <div className="overview"><div>
          <p className="ref">{contract.id} · {contract.status}</p>
          <h4>{contract.client}</h4>
          <p>{contract.agreement}</p>
          <p><strong>{contract.effective}</strong> – <strong>{contract.expires}</strong></p>
          <p>{contract.dayRate} · {contract.paymentTerms}</p>
        </div><button type="button" aria-expanded={selected===contract.id}
          aria-controls={"agency-contract-"+contract.id}
          onClick={()=>{setSelected(current=>current===contract.id?null:contract.id);setStatus("");}}>
          {selected===contract.id?"Hide contract details":"View contract"}
        </button></div>
        {open?.id===contract.id&&<section className="detail" id={"agency-contract-"+contract.id}
          aria-label={"Fictional contract details "+contract.id}>
          <dl>
            <dt>Client</dt><dd>{contract.client}</dd>
            <dt>Agency</dt><dd>{contract.agency}</dd>
            <dt>Agreement ID</dt><dd>{contract.id}</dd>
            <dt>Title</dt><dd>{contract.agreement}</dd>
            <dt>Region</dt><dd>{contract.region}</dd>
            <dt>Dates</dt><dd>{contract.effective} through {contract.expires}</dd>
            <dt>Status</dt><dd>{contract.status}</dd>
            <dt>Fictional scope</dt><dd>{contract.scope}</dd>
            <dt>Day rate</dt><dd>{contract.dayRate}</dd>
            <dt>Payment</dt><dd>{contract.paymentTerms}</dd>
            <dt>Expenses</dt><dd>{contract.travel}</dd>
            <dt>Overtime</dt><dd>{contract.overtime}</dd>
            <dt>Approval</dt><dd>{contract.approval}</dd>
          </dl>
          <button type="button" disabled={downloading===contract.id}
            onClick={()=>void download(contract)}>
            {downloading===contract.id?"Preparing fictional PDF…":"Download fictional contract PDF"}
          </button>
          <p className="disclaimer">SAMPLE ONLY. No signature, authorization, legal or commercial commitment.</p>
        </section>}
      </article>)}
    </div>
    <p role="status" aria-live="polite" className="downloadNotice">{status}</p>
    <style jsx>{`
      .agencyContracts{display:grid;gap:12px}.boundary{padding:12px;background:#faf5ff;
        border:1px solid #c4b5fd;border-radius:10px;color:#4c1d95}
      .list{display:grid;gap:12px}.contract{border:1px solid #cbd5e1;border-radius:12px;
        padding:16px;background:#fff;min-width:0}.overview{display:flex;justify-content:space-between;
        gap:12px;align-items:flex-start}.overview h4{margin:2px 0 8px;font-size:1.1rem;color:#1e1b4b}
      .overview p{margin:5px 0;color:#475569}.overview .ref{font-weight:800;color:#5b21b6}
      button{background:#5b21b6;color:white;border:2px solid #5b21b6;padding:10px 13px;
        min-height:44px;border-radius:9px;font:inherit;font-weight:800;cursor:pointer}
      button:hover{background:#4c1d95;color:white}button:focus-visible{outline:3px solid #a78bfa;
        outline-offset:3px}button:disabled{background:#e2e8f0;border-color:#94a3b8;color:#334155}
      .detail{margin-top:15px;border-top:1px solid #ddd6fe;padding:16px 0 0}
      .detail dl{display:grid;grid-template-columns:160px minmax(0,1fr);gap:9px 14px;margin:0 0 18px}
      .detail dt{font-weight:800;color:#4c1d95}.detail dd{margin:0;color:#334155;overflow-wrap:anywhere}
      .disclaimer{font-weight:700;color:#7c2d12}.downloadNotice{min-height:1.4rem;color:#334155}
      @media(max-width:680px){.overview{flex-direction:column}.detail dl{grid-template-columns:1fr;
        gap:4px}.detail dt:not(:first-child){margin-top:8px}}
    `}</style>
  </div>;
}
