"use client";

import { useMemo, useState } from "react";
import ClientWorkspaceSidebar from "@/components/ClientWorkspaceSidebar";
import { buildDemoCsv, buildDemoJson } from "@/lib/demoClientDataExport";

const rows = [
  { inspection:"IS-10428", project:"Gulf Coast LNG Train 2", supplier:"Atlas Valve Works", country:"United States", commodity:"Valves", status:"Completed", planned:"2026-08-18", completed:"2026-08-18", ncr:"None", spend:4820 },
  { inspection:"IS-10451", project:"North Sea Compression Upgrade", supplier:"NordFab AS", country:"Norway", commodity:"Pressure Vessel", status:"Report submitted", planned:"2026-08-27", completed:"2026-08-28", ncr:"Documentation", spend:6150 },
  { inspection:"IS-10472", project:"Qatar Utilities Expansion", supplier:"Doha Electrical Systems", country:"Qatar", commodity:"Switchgear", status:"In progress", planned:"2026-09-06", completed:"", ncr:"None", spend:3880 },
  { inspection:"IS-10483", project:"Permian Water Infrastructure", supplier:"Mesa Pump & Fabrication", country:"United States", commodity:"Pump Package", status:"Pending approval", planned:"2026-09-12", completed:"", ncr:"Welding", spend:0 },
  { inspection:"IS-10491", project:"Singapore Refinery Turnaround", supplier:"Pacific Process Controls", country:"Singapore", commodity:"Instrumentation", status:"Scheduled", planned:"2026-09-15", completed:"", ncr:"None", spend:1260 },
];

export default function ClientDataDemoPage(){
  const [copyMessage,setCopyMessage]=useState("GET /api/v1/client/inspections · illustrative only");
  const csv=useMemo(()=>{
    const headers=["Inspection","Project","Supplier","Country","Commodity","Status","Planned date","Completed date","NCR type","Spend USD"];
    return buildDemoCsv(headers,rows.map(r=>[r.inspection,r.project,r.supplier,r.country,r.commodity,r.status,r.planned,r.completed,r.ncr,r.spend]));
  },[]);

  const json=useMemo(()=>buildDemoJson(rows),[]);

  function downloadFile(content:string,filename:string,mime:string){
 ...[truncated]