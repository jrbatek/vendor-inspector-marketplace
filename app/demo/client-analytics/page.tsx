"use client";

import { useMemo, useState } from "react";
import ClientWorkspaceSidebar from "@/components/ClientWorkspaceSidebar";
import { DEMO_INSPECTIONS, type DemoInspection } from "@/lib/clientDemoInspections";

type FilterKey="project"|"projectType"|"country"|"commodity"|"timing"|"ncrType";
const ALL="All";

const money=(value:number)=>new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0}).format(value);
const unique=(key:FilterKey)=>[ALL,...Array.from(new Set(DEMO_INSPECTIONS.map(row=>row[key]))).sort()];

export default function ClientAnalyticsDemo(){
  const [project,setProject]=useState(ALL);
  const [projectType,setProjectType]=useState(ALL);
  const [country,setCountry]=useState(ALL);
  const [commodity,setCommodity]=useState(ALL);
  const [timing,setTiming]=useState(ALL);
  const [ncr,setNcr]=useState(ALL);
  const [ncrType,setNcrType]=useState(ALL);

  const filtered=useMemo(()=>DEMO_INSPECTIONS.filter(row=>(
    (project===ALL||row.project===project)&&
    (projectType===ALL||row.projectType===projectType)&&
    (country===ALL||row.country===country)&&
    (commodity===ALL||row.commodity===commodity)&&
    (timing===ALL||row.timing===timing)&&
    (ncr===ALL||(ncr==="With NCR"?row.ncr:!row.ncr))&&
    (ncrType===ALL||row.ncrType===ncrType)
  )),[project,projectType,country,commodity,timing,ncr,ncrType]);

  const completed=filtered.filter(row=>row.status==="Completed");
  const totalSpend=filtered.reduce((sum,row)=>sum+row.spendUsd,0);
  const onTime=completed.filter(row=>row.timing==="On time").length;
  const onTimeRate=completed.length?onTime/completed.length*100:0;
  const projectsWithNcr=new Set(filtered.filter(row=>row.ncr).map(row=>row.project)).size;

  const monthly=group(filtered,row=>row.date.slice(0,7),row=>row.spendUsd);
  const geography=group(filtered,row=>row.country);
  const byCommodity=group(filtered,row=>row.commodity);
  const byProjectType=group(filtered,row=>row.projectType);
  const byNcrType=group(filtered.filter(row=>row.ncr),row=>row.ncrType);

  function reset(){
    setProject(ALL);setProjectType(ALL);setCountry(ALL);setCommodity(ALL);setTiming(ALL);setNcr(ALL);setNcrType(ALL);
  }
  function download(){
    const headers=["ID","Project","Project Type","Supplier","City","Country","Commodity","Inspection Type","Inspector","Date","Status","Timing","Spend USD","NCR","NCR Type","Report ID"];
    const rows=filtered.map(row=>[row.id,row.project,row.projectType,row.supplier,row.city,row.country,row.commodity,row.inspectionType,row.inspector,row.date,row.status,row.timing,row.spendUsd,row.ncr?"Yes":"No",row.ncrType,row.reportId]);
    const csv=[headers,...rows].map(row=>row.map(value=>`"${String(value).replaceAll('"','""')}"`).join(",")).join("\n");
    const url=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8"}));
    const link=document.createElement("a");link.href=url;link.download="inspectsource-client-demo-inspections.csv";link.click();URL.revokeObjectURL(url);
  }

  return <main className="shell"><ClientWorkspaceSidebar demo/><section className="workspace">
    <section className="demoBanner" role="status"><strong>Client Demo · Synthetic data</strong><span>Deterministic analytics only. No production client records are read or written.</span></section>
    <header className="head"><div><p className="eyebrow">Client Analytics</p><h1>Inspection performance</h1><p>Cross-filter spend, timing, geography, project type, commodity and non-conformance performance.</p></div><div className="actions"><button type="button" onClick={reset}>Reset filters</button><button type="button" className="download" onClick={download}>↓ Download data</button></div></header>

    <section className="filters" aria-label="Analytics slicers">
      <Filter label="Project" value={project} values={unique("project")} setValue={setProject}/>
      <Filter label="Project Type" value={projectType} values={unique("projectType")} setValue={setProjectType}/>
      <Filter label="Country" value={country} values={unique("country")} setValue={setCountry}/>
      <Filter label="Commodity" value={commodity} values={unique("commodity")} setValue={setCommodity}/>
      <Filter label="Timing" value={timing} values={unique("timing")} setValue={setTiming}/>
      <Filter label="Non-conformance" value={ncr} values={[ALL,"With NCR","No NCR"]} setValue={setNcr}/>
      <Filter label="NCR Type" value={ncrType} values={unique("ncrType")} setValue={setNcrType}/>
    </section>

    <section className="kpis" aria-label="Analytics KPIs">
      <Kpi label="Inspection spend" value={money(totalSpend)}/>
      <Kpi label="Inspections in view" value={String(filtered.length)}/>
      <Kpi label="On-time performance" value={`${onTimeRate.toFixed(1)}%`}/>
      <Kpi label="Projects with NCRs" value={String(projectsWithNcr)}/>
    </section>

    <section className="grid">
      <Panel title="Monthly spend trend" subtitle="Synthetic inspection spend by month"><Bars rows={monthly} moneyValues/></Panel>
      <Panel title="Geography / map view" subtitle="Countries represented in the current selection"><Bars rows={geography} onSelect={setCountry}/></Panel>
      <Panel title="Project type" subtitle="Inspection mix by project type"><Bars rows={byProjectType} onSelect={setProjectType}/></Panel>
      <Panel title="Commodity" subtitle="Inspection mix by equipment / commodity"><Bars rows={byCommodity} onSelect={setCommodity}/></Panel>
      <Panel title="NCR type" subtitle="Non-conformance mix in the current selection"><Bars rows={byNcrType} onSelect={setNcrType} empty="No NCRs in this selection."/></Panel>
      <article className="panel quality"><p className="eyebrow">Quality & timing</p><h2>Cross-filter summary</h2><dl><div><dt>Completed inspections</dt><dd>{completed.length}</dd></div><div><dt>Late completed inspections</dt><dd>{completed.filter(row=>row.timing==="Late").length}</dd></div><div><dt>NCRs</dt><dd>{filtered.filter(row=>row.ncr).length}</dd></div><div><dt>Countries</dt><dd>{new Set(filtered.map(row=>row.country)).size}</dd></div></dl></article>
    </section>

    <section className="panel records"><div className="recordHead"><div><p className="eyebrow">Inspection detail</p><h2>Cross-filtered inspection records</h2></div><span>{filtered.length} records</span></div><div className="tableWrap"><table><thead><tr><th>ID</th><th>Project</th><th>Project type</th><th>Country</th><th>Commodity</th><th>Timing</th><th>Spend</th><th>NCR type</th><th>Status</th></tr></thead><tbody>{filtered.slice(0,30).map(row=><tr key={row.id}><td><strong>{row.id}</strong></td><td>{row.project}</td><td>{row.projectType}</td><td>{row.city}, {row.country}</td><td>{row.commodity}</td><td>{row.timing}</td><td>{money(row.spendUsd)}</td><td>{row.ncrType}</td><td>{row.status}</td></tr>)}</tbody></table></div>{filtered.length>30&&<p className="tableNote">Showing 30 of {filtered.length} filtered records. Download data for the complete selection.</p>}</section>

    <section className="connectivity"><div><p className="eyebrow">Take the data with you</p><h2>API, Excel & Power BI connectivity</h2><p>The same normalized client dataset can feed governed API integrations, CSV/Excel analysis and Power BI reporting.</p></div><a href="/demo/client-data">Open Data & Integrations Demo →</a></section>
  </section>
  <style jsx>{`
    .shell{max-width:1440px;margin:auto;padding:18px 18px 70px;display:grid;grid-template-columns:250px minmax(0,1fr);gap:20px}.workspace{min-width:0}.demoBanner,.head,.filters,.kpi,.panel,.connectivity{background:#fff;border:1px solid #dbe3ee}.demoBanner{display:flex;justify-content:space-between;gap:12px;padding:10px 14px;border-radius:12px;background:#f0fdfa;color:#115e59}.head{margin-top:14px;border-radius:16px;padding:22px;display:flex;justify-content:space-between;gap:20px}.head h1,.panel h2,.connectivity h2{margin:3px 0 8px}.head p,.panel p,.connectivity p{color:#64748b}.eyebrow{margin:0;font-size:.72rem;letter-spacing:.12em;text-transform:uppercase;font-weight:900;color:#0f766e}.actions{display:flex;gap:8px;align-items:flex-start}.actions button{border:1px solid #cbd5e1;background:#f8fafc;color:#334155;border-radius:9px;padding:10px 13px;font-weight:800;cursor:pointer}.actions .download{background:#0f766e;color:#fff;border-color:#0f766e}.filters{margin:14px 0;padding:14px;border-radius:14px;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}.filter{display:grid;gap:5px;font-size:.74rem;font-weight:800}.filter select{min-width:0;padding:9px;border:1px solid #cbd5e1;border-radius:8px;background:#fff}.kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:14px}.kpi{padding:15px;border-radius:12px}.kpi strong{display:block;font-size:1.45rem}.kpi span{font-size:.75rem;color:#64748b}.grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}.panel{border-radius:16px;padding:20px;min-width:0}.bars{display:grid;gap:9px;margin-top:14px}.barRow{display:grid;grid-template-columns:minmax(130px,210px) 1fr auto;gap:10px;align-items:center;border:0;background:transparent;text-align:left;padding:3px;width:100%}.barRow.clickable{cursor:pointer}.barLabel{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:700}.track{height:9px;background:#e2e8f0;border-radius:99px;overflow:hidden}.fill{display:block;height:100%;background:#0f766e;border-radius:99px}.empty{color:#64748b}.quality dl{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:16px 0 0}.quality dl div{padding:12px;background:#f8fafc;border-radius:10px}.quality dt{font-size:.75rem;color:#64748b}.quality dd{margin:4px 0 0;font-size:1.35rem;font-weight:900}.records{margin-top:14px}.recordHead{display:flex;justify-content:space-between;gap:12px}.recordHead>span,.tableNote{color:#64748b}.tableWrap{overflow:auto}table{width:100%;border-collapse:collapse;font-size:.82rem;min-width:1050px}th,td{text-align:left;padding:10px;border-top:1px solid #e2e8f0;white-space:nowrap}th{font-size:.7rem;text-transform:uppercase;color:#64748b}.connectivity{margin-top:14px;border-radius:16px;padding:18px 20px;display:flex;justify-content:space-between;align-items:center;gap:18px}.connectivity a{font-weight:900;color:#0f766e;white-space:nowrap}@media(max-width:980px){.shell{grid-template-columns:1fr}.filters,.kpis,.grid{grid-template-columns:1fr 1fr}}@media(max-width:680px){.demoBanner,.head,.connectivity{display:grid}.actions{flex-wrap:wrap}.filters,.kpis,.grid{grid-template-columns:1fr}.quality dl{grid-template-columns:1fr}.connectivity a{white-space:normal}}
  `}</style>
  </main>;
}

function Filter({label,value,values,setValue}:{label:string;value:string;values:string[];setValue:(value:string)=>void}){
  return <label className="filter">{label}<select value={value} onChange={event=>setValue(event.target.value)}>{values.map(option=><option key={option}>{option}</option>)}</select></label>;
}
function Kpi({label,value}:{label:string;value:string}){return <article className="kpi"><strong>{value}</strong><span>{label}</span></article>}
function Panel({title,subtitle,children}:{title:string;subtitle:string;children:React.ReactNode}){return <article className="panel"><h2>{title}</h2><p>{subtitle}</p>{children}</article>}
function Bars({rows,onSelect,moneyValues=false,empty="No records in this selection."}:{rows:{name:string;value:number}[];onSelect?:(name:string)=>void;moneyValues?:boolean;empty?:string}){
  if(!rows.length)return <p className="empty">{empty}</p>;
  const max=Math.max(...rows.map(row=>row.value),1);
  return <div className="bars">{rows.slice(0,10).map(row=>{const content=<><span className="barLabel">{row.name}</span><span className="track"><span className="fill" style={{width:`${row.value/max*100}%`}}/></span><strong>{moneyValues?money(row.value):row.value}</strong></>;return onSelect?<button type="button" className="barRow clickable" key={row.name} onClick={()=>onSelect(row.name)}>{content}</button>:<div className="barRow" key={row.name}>{content}</div>})}</div>;
}
function group(rows:DemoInspection[],label:(row:DemoInspection)=>string,value:(row:DemoInspection)=>number=()=>1){
  const totals=new Map<string,number>();
  rows.forEach(row=>totals.set(label(row),(totals.get(label(row))||0)+value(row)));
  return Array.from(totals.entries()).map(([name,total])=>({name,value:total})).sort((a,b)=>b.value-a.value);
}
