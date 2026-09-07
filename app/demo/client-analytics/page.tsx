"use client";

import { useMemo, useState } from "react";
import ClientWorkspaceSidebar from "@/components/ClientWorkspaceSidebar";
import { DEMO_INSPECTIONS, DEMO_NCR_RATE } from "@/lib/clientDemoInspections";

export default function ClientAnalyticsDemo(){
  const [project,setProject]=useState("All");
  const [country,setCountry]=useState("All");
  const [commodity,setCommodity]=useState("All");
  const [ncr,setNcr]=useState("All");
  const projects=["All",...Array.from(new Set(DEMO_INSPECTIONS.map(x=>x.project)))];
  const countries=["All",...Array.from(new Set(DEMO_INSPECTIONS.map(x=>x.country))).sort()];
  const commodities=["All",...Array.from(new Set(DEMO_INSPECTIONS.map(x=>x.commodity))).sort()];
  const filtered=useMemo(()=>DEMO_INSPECTIONS.filter(x=>(project==="All"||x.project===project)&&(country==="All"||x.country===country)&&(commodity==="All"||x.commodity===commodity)&&(ncr==="All"||(ncr==="With NCR"?x.ncr:!x.ncr))),[project,country,commodity,ncr]);
  const completed=filtered.filter(x=>x.status==="Completed");
  const ncrCount=completed.filter(x=>x.ncr).length;
  const projectCounts=projects.slice(1).map(name=>({name,count:filtered.filter(x=>x.project===name).length}));
  const countryCounts=countries.slice(1).map(name=>({name,count:filtered.filter(x=>x.country===name).length})).filter(x=>x.count).sort((a,b)=>b.count-a.count).slice(0,10);
  const maxProject=Math.max(...projectCounts.map(x=>x.count),1);
  const maxCountry=Math.max(...countryCounts.map(x=>x.count),1);
  return <main className="shell">
    <ClientWorkspaceSidebar demo />
    <section className="workspace">
      <section className="demoBanner"><strong>Client Demo · Synthetic data</strong><span>Analytics below use the same 60 global inspection records shown in Inspection History.</span></section>
      <header className="head"><div><p className="eyebrow">Client Analytics</p><h1>Inspection performance</h1><p>Cross-filter the synthetic portfolio by project, geography, commodity, and NCR status.</p></div><button onClick={()=>{setProject("All");setCountry("All");setCommodity("All");setNcr("All")}}>Reset filters</button></header>
      <section className="filters"><Filter label="Project" value={project} values={projects} setValue={setProject}/><Filter label="Country" value={country} values={countries} setValue={setCountry}/><Filter label="Commodity" value={commodity} values={commodities} setValue={setCommodity}/><Filter label="NCR" value={ncr} values={["All","With NCR","No NCR"]} setValue={setNcr}/></section>
      <section className="kpis"><Kpi label="Inspections in view" value={String(filtered.length)}/><Kpi label="Completed" value={String(completed.length)}/><Kpi label="Countries in view" value={String(new Set(filtered.map(x=>x.country)).size)}/><Kpi label="Completed NCR rate" value={`${completed.length?(ncrCount/completed.length*100).toFixed(1):"0.0"}%`}/></section>
      <section className="grid">
        <article className="panel"><p className="eyebrow">Portfolio</p><h2>Inspections by project</h2><div className="bars">{projectCounts.map(x=><button key={x.name} onClick={()=>setProject(x.name)}><span>{x.name}</span><i><b style={{width:`${x.count/maxProject*100}%`}}/></i><strong>{x.count}</strong></button>)}</div></article>
        <article className="panel"><p className="eyebrow">Geography</p><h2>Top countries in current view</h2><div className="bars">{countryCounts.map(x=><button key={x.name} onClick={()=>setCountry(x.name)}><span>{x.name}</span><i><b style={{width:`${x.count/maxCountry*100}%`}}/></i><strong>{x.count}</strong></button>)}</div></article>
        <article className="panel quality"><p className="eyebrow">Quality</p><h2>Non-conformance performance</h2><div className="qualityBig"><strong>{DEMO_NCR_RATE.toFixed(1)}%</strong><span>overall completed NCR rate</span></div><p>The synthetic portfolio intentionally contains one NCR across 55 completed inspections, keeping the rate close to the requested 2% benchmark.</p></article>
        <article className="panel"><p className="eyebrow">Project mix</p><h2>Three programs represented</h2><ul><li>Upstream offshore platform</li><li>Downstream refinery</li><li>Offshore wind farm</li></ul><p>Inspection activity spans global oil & gas and energy supply-chain manufacturers, fabricators, equipment shops and component suppliers.</p></article>
      </section>
      <section className="panel tablePanel"><div className="panelHead"><div><p className="eyebrow">Inspection detail</p><h2>Filtered records</h2></div><span>{filtered.length} records</span></div><div className="tableWrap"><table><thead><tr><th>ID</th><th>Project</th><th>Supplier</th><th>Location</th><th>Commodity</th><th>Inspection</th><th>Status</th><th>NCR</th></tr></thead><tbody>{filtered.map(x=><tr key={x.id}><td>{x.id}</td><td>{x.project}</td><td>{x.supplier}</td><td>{x.city}, {x.country}</td><td>{x.commodity}</td><td>{x.inspectionType}</td><td>{x.status}</td><td>{x.ncr?x.ncrType:"None"}</td></tr>)}</tbody></table></div></section>
    </section>
    <style jsx>{`.shell{max-width:1440px;margin:auto;padding:18px 18px 70px;display:grid;grid-template-columns:250px minmax(0,1fr);gap:20px}.workspace{min-width:0}.demoBanner,.head,.filters,.kpi,.panel{background:#fff;border:1px solid #dbe3ee}.demoBanner{display:flex;justify-content:space-between;gap:12px;padding:10px 14px;border-radius:12px;background:#f0fdfa;color:#115e59}.head{margin-top:14px;border-radius:16px;padding:24px;display:flex;justify-content:space-between;gap:20px}.head h1,.panel h2{margin:3px 0 8px}.head p,.panel p{color:#64748b}.head button{height:max-content;border:1px solid #cbd5e1;background:#fff;border-radius:9px;padding:9px 12px;font-weight:800}.eyebrow{margin:0;font-size:.72rem;letter-spacing:.12em;text-transform:uppercase;font-weight:900;color:#0f766e}.filters{margin:14px 0;padding:14px;border-radius:14px;display:grid;grid-template-columns:repeat(4,1fr);gap:10px}.filter{display:grid;gap:5px;font-size:.74rem;font-weight:800}.filter select{padding:9px;border:1px solid #cbd5e1;border-radius:8px;background:#fff}.kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:14px}.kpi{padding:15px;border-radius:12px}.kpi strong{display:block;font-size:1.5rem}.kpi span{font-size:.75rem;color:#64748b}.grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}.panel{border-radius:16px;padding:20px}.bars{display:grid;gap:10px}.bars button{display:grid;grid-template-columns:180px 1fr 34px;gap:10px;align-items:center;border:0;background:transparent;text-align:left;cursor:pointer}.bars i{height:9px;background:#e2e8f0;border-radius:99px;overflow:hidden}.bars b{display:block;height:100%;background:#0f766e;border-radius:99px}.qualityBig{display:grid;margin:18px 0}.qualityBig strong{font-size:3rem}.qualityBig span{color:#64748b}.tablePanel{margin-top:14px}.panelHead{display:flex;justify-content:space-between;gap:12px}.panelHead>span{color:#64748b}.tableWrap{overflow:auto}table{width:100%;border-collapse:collapse;font-size:.84rem}th,td{text-align:left;padding:10px;border-top:1px solid #e2e8f0;white-space:nowrap}th{font-size:.7rem;text-transform:uppercase;color:#64748b}@media(max-width:980px){.shell{grid-template-columns:1fr}.filters,.kpis,.grid{grid-template-columns:1fr 1fr}}@media(max-width:620px){.demoBanner,.head{display:grid}.filters,.kpis,.grid{grid-template-columns:1fr}.bars button{grid-template-columns:1fr 1fr 30px}}`}</style>
  </main>
}

function Filter({label,value,values,setValue}:{label:string;value:string;values:string[];setValue:(v:string)=>void}){return <label className="filter">{label}<select value={value} onChange={e=>setValue(e.target.value)}>{values.map(v=><option key={v}>{v}</option>)}</select></label>}
function Kpi({label,value}:{label:string;value:string}){return <article className="kpi"><strong>{value}</strong><span>{label}</span></article>}
