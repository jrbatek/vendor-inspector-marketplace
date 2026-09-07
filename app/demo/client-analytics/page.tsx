"use client";

import { useMemo, useState } from "react";
import ClientWorkspaceSidebar from "@/components/ClientWorkspaceSidebar";
import { DEMO_INSPECTIONS, DEMO_NCR_RATE } from "@/lib/clientDemoInspections";

type ExpandView="project"|"country"|"commodity"|null;

export default function ClientAnalyticsDemo(){
  const [project,setProject]=useState("All");
  const [country,setCountry]=useState("All");
  const [commodity,setCommodity]=useState("All");
  const [ncr,setNcr]=useState("All");
  const [expand,setExpand]=useState<ExpandView>(null);
  const projects=["All",...Array.from(new Set(DEMO_INSPECTIONS.map(x=>x.project)))];
  const countries=["All",...Array.from(new Set(DEMO_INSPECTIONS.map(x=>x.country))).sort()];
  const commodities=["All",...Array.from(new Set(DEMO_INSPECTIONS.map(x=>x.commodity))).sort()];
  const filtered=useMemo(()=>DEMO_INSPECTIONS.filter(x=>(project==="All"||x.project===project)&&(country==="All"||x.country===country)&&(commodity==="All"||x.commodity===commodity)&&(ncr==="All"||(ncr==="With NCR"?x.ncr:!x.ncr))),[project,country,commodity,ncr]);
  const completed=filtered.filter(x=>x.status==="Completed");
  const ncrCount=completed.filter(x=>x.ncr).length;
  const projectCounts=projects.slice(1).map(name=>({name,count:filtered.filter(x=>x.project===name).length}));
  const countryCounts=countries.slice(1).map(name=>({name,count:filtered.filter(x=>x.country===name).length})).filter(x=>x.count).sort((a,b)=>b.count-a.count);
  const commodityCounts=commodities.slice(1).map(name=>({name,count:filtered.filter(x=>x.commodity===name).length})).filter(x=>x.count).sort((a,b)=>b.count-a.count);
  const maxProject=Math.max(...projectCounts.map(x=>x.count),1);
  const maxCountry=Math.max(...countryCounts.map(x=>x.count),1);
  const maxCommodity=Math.max(...commodityCounts.map(x=>x.count),1);

  function reset(){setProject("All");setCountry("All");setCommodity("All");setNcr("All");}
  function downloadData(){
    const headers=["Inspection ID","Project","Project Type","Supplier","City","Country","Commodity","Inspection Type","Inspector","Date","Status","NCR","NCR Type","Report ID"];
    const rows=filtered.map(x=>[x.id,x.project,x.projectType,x.supplier,x.city,x.country,x.commodity,x.inspectionType,x.inspector,x.date,x.status,x.ncr?"Yes":"No",x.ncrType,x.reportId]);
    const csv=[headers,...rows].map(row=>row.map(value=>`"${String(value).replaceAll('"','""')}"`).join(",")).join("\n");
    const blob=new Blob([csv],{type:"text/csv;charset=utf-8"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");a.href=url;a.download="inspectsource-client-demo-inspections.csv";a.click();URL.revokeObjectURL(url);
  }
  function drill(type:Exclude<ExpandView,null>,name:string){if(type==="project")setProject(name);if(type==="country")setCountry(name);if(type==="commodity")setCommodity(name);setExpand(null);}

  return <main className="shell">
    <ClientWorkspaceSidebar demo />
    <section className="workspace">
      <section className="demoBanner"><strong>Client Demo · Synthetic data</strong><span>Analytics below use the same 60 global inspection records shown in Inspection History.</span></section>
      <header className="head"><div><p className="eyebrow">Client Analytics</p><h1>Inspection performance</h1><p>Cross-filter the synthetic portfolio by project, geography, commodity, and NCR status.</p></div><div className="headActions"><button onClick={reset}>Reset filters</button><button className="download" onClick={downloadData}>↓ Download data</button></div></header>
      <section className="filters"><Filter label="Project" value={project} values={projects} setValue={setProject}/><Filter label="Country" value={country} values={countries} setValue={setCountry}/><Filter label="Commodity" value={commodity} values={commodities} setValue={setCommodity}/><Filter label="NCR" value={ncr} values={["All","With NCR","No NCR"]} setValue={setNcr}/></section>
      <section className="kpis"><Kpi label="Inspections in view" value={String(filtered.length)}/><Kpi label="Completed" value={String(completed.length)}/><Kpi label="Countries in view" value={String(new Set(filtered.map(x=>x.country)).size)}/><Kpi label="Completed NCR rate" value={`${completed.length?(ncrCount/completed.length*100).toFixed(1):"0.0"}%`}/></section>
      <section className="grid">
        <ChartPanel eyebrow="Portfolio" title="Inspections by project" onExpand={()=>setExpand("project")}>
          <Bars rows={projectCounts} max={maxProject} onSelect={name=>setProject(name)}/>
        </ChartPanel>
        <ChartPanel eyebrow="Geography" title="Top countries in current view" onExpand={()=>setExpand("country")}>
          <Bars rows={countryCounts.slice(0,10)} max={maxCountry} onSelect={name=>setCountry(name)}/>
        </ChartPanel>
        <ChartPanel eyebrow="Commodities" title="Inspections by commodity" onExpand={()=>setExpand("commodity")}>
          <Bars rows={commodityCounts.slice(0,10)} max={maxCommodity} onSelect={name=>setCommodity(name)}/>
        </ChartPanel>
        <article className="panel quality"><p className="eyebrow">Quality</p><h2>Non-conformance performance</h2><div className="qualityBig"><strong>{DEMO_NCR_RATE.toFixed(1)}%</strong><span>overall completed NCR rate</span></div><p>The synthetic portfolio contains one NCR across 55 completed inspections, keeping the rate close to 2%.</p></article>
      </section>
      <section className="panel tablePanel"><div className="panelHead"><div><p className="eyebrow">Inspection detail</p><h2>Filtered records</h2></div><span>{filtered.length} records</span></div><div className="tableWrap"><table><thead><tr><th>ID</th><th>Project</th><th>Supplier</th><th>Location</th><th>Commodity</th><th>Inspection</th><th>Status</th><th>NCR</th></tr></thead><tbody>{filtered.map(x=><tr key={x.id}><td>{x.id}</td><td>{x.project}</td><td>{x.supplier}</td><td>{x.city}, {x.country}</td><td>{x.commodity}</td><td>{x.inspectionType}</td><td>{x.status}</td><td>{x.ncr?x.ncrType:"None"}</td></tr>)}</tbody></table></div></section>
    </section>

    {expand&&<div className="modalBack" role="presentation" onMouseDown={()=>setExpand(null)}><section className="modal" role="dialog" aria-modal="true" aria-label={`Expanded ${expand} analytics`} onMouseDown={e=>e.stopPropagation()}><div className="modalHead"><div><p className="eyebrow">Expanded analytics</p><h2>{expand==="project"?"Inspections by project":expand==="country"?"Inspections by country":"Inspections by commodity"}</h2><p>Click any row to drill into that selection across the full analytics page.</p></div><button className="close" onClick={()=>setExpand(null)} aria-label="Close expanded analytics">×</button></div><div className="expandedRows">{(expand==="project"?projectCounts:expand==="country"?countryCounts:commodityCounts).map(x=><button key={x.name} onClick={()=>drill(expand,x.name)}><span><strong>{x.name}</strong><small>{x.count} inspection{x.count===1?"":"s"}</small></span><b>Drill in →</b></button>)}</div><div className="modalTable"><h3>Records in current view</h3><div className="tableWrap"><table><thead><tr><th>ID</th><th>Project</th><th>Country</th><th>Commodity</th><th>Supplier</th><th>Status</th></tr></thead><tbody>{filtered.slice(0,25).map(x=><tr key={x.id}><td>{x.id}</td><td>{x.project}</td><td>{x.country}</td><td>{x.commodity}</td><td>{x.supplier}</td><td>{x.status}</td></tr>)}</tbody></table></div></div></section></div>}

    <style jsx>{`.shell{max-width:1440px;margin:auto;padding:18px 18px 70px;display:grid;grid-template-columns:250px minmax(0,1fr);gap:20px}.workspace{min-width:0}.demoBanner,.head,.filters,.kpi,.panel{background:#fff;border:1px solid #dbe3ee}.demoBanner{display:flex;justify-content:space-between;gap:12px;padding:10px 14px;border-radius:12px;background:#f0fdfa;color:#115e59}.head{margin-top:14px;border-radius:16px;padding:24px;display:flex;justify-content:space-between;gap:20px}.head h1,.panel h2,.modal h2{margin:3px 0 8px}.head p,.panel p,.modal p{color:#64748b}.headActions{display:flex;gap:8px;align-items:flex-start}.head button{border:1px solid #cbd5e1;background:#fff;color:#0f172a;border-radius:9px;padding:10px 13px;font-weight:800;white-space:nowrap;cursor:pointer}.head button.download{background:#0f766e;color:#fff;border-color:#0f766e}.eyebrow{margin:0;font-size:.72rem;letter-spacing:.12em;text-transform:uppercase;font-weight:900;color:#0f766e}.filters{margin:14px 0;padding:14px;border-radius:14px;display:grid;grid-template-columns:repeat(4,1fr);gap:10px}.filter{display:grid;gap:5px;font-size:.74rem;font-weight:800}.filter select{padding:9px;border:1px solid #cbd5e1;border-radius:8px;background:#fff}.kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:14px}.kpi{padding:15px;border-radius:12px}.kpi strong{display:block;font-size:1.5rem}.kpi span{font-size:.75rem;color:#64748b}.grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}.panel{border-radius:16px;padding:20px;min-width:0}.qualityBig{display:grid;margin:18px 0}.qualityBig strong{font-size:3rem}.qualityBig span{color:#64748b}.tablePanel{margin-top:14px}.panelHead{display:flex;justify-content:space-between;gap:12px}.panelHead>span{color:#64748b}.tableWrap{overflow:auto}table{width:100%;border-collapse:collapse;font-size:.84rem}th,td{text-align:left;padding:10px;border-top:1px solid #e2e8f0;white-space:nowrap}th{font-size:.7rem;text-transform:uppercase;color:#64748b}.modalBack{position:fixed;inset:0;background:#0f172a99;z-index:1000;display:grid;place-items:center;padding:24px}.modal{width:min(1050px,96vw);max-height:88vh;overflow:auto;background:#fff;border-radius:18px;padding:24px;box-shadow:0 24px 70px #0f172a55}.modalHead{display:flex;justify-content:space-between;gap:20px}.close{width:42px;height:42px;border-radius:10px;border:1px solid #cbd5e1;background:#fff;font-size:1.8rem;cursor:pointer}.expandedRows{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin:18px 0}.expandedRows button{display:flex;justify-content:space-between;align-items:center;text-align:left;border:1px solid #e2e8f0;background:#f8fafc;border-radius:10px;padding:12px;cursor:pointer;color:#0f172a}.expandedRows button:hover{border-color:#0f766e;background:#f0fdfa}.expandedRows span{display:grid;gap:3px}.expandedRows small{color:#64748b}.expandedRows b{color:#0f766e}.modalTable{border-top:1px solid #e2e8f0;padding-top:12px}@media(max-width:980px){.shell{grid-template-columns:1fr}.filters,.kpis,.grid{grid-template-columns:1fr 1fr}}@media(max-width:720px){.demoBanner,.head{display:grid}.headActions{flex-wrap:wrap}.filters,.kpis,.grid,.expandedRows{grid-template-columns:1fr}}`}</style>
  </main>
}

function Filter({label,value,values,setValue}:{label:string;value:string;values:string[];setValue:(v:string)=>void}){return <label className="filter">{label}<select value={value} onChange={e=>setValue(e.target.value)}>{values.map(v=><option key={v}>{v}</option>)}</select></label>}
function Kpi({label,value}:{label:string;value:string}){return <article className="kpi"><strong>{value}</strong><span>{label}</span></article>}
function ChartPanel({eyebrow,title,onExpand,children}:{eyebrow:string;title:string;onExpand:()=>void;children:React.ReactNode}){return <article className="panel chartPanel"><div className="chartHead"><div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2></div><button className="expandButton" onClick={onExpand} title="Expand and drill into this chart" aria-label={`Expand ${title}`}>↗ Expand</button></div>{children}<style jsx>{`.chartHead{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}.chartHead h2{margin:3px 0 8px}.eyebrow{margin:0;font-size:.72rem;letter-spacing:.12em;text-transform:uppercase;font-weight:900;color:#0f766e}.expandButton{border:1px solid #cbd5e1;background:#fff;color:#334155;border-radius:8px;padding:7px 9px;font-weight:800;font-size:.76rem;cursor:pointer;white-space:nowrap}.expandButton:hover{border-color:#0f766e;color:#0f766e}`}</style></article>}
function Bars({rows,max,onSelect}:{rows:{name:string;count:number}[];max:number;onSelect:(name:string)=>void}){return <div className="bars">{rows.map(x=><button key={x.name} onClick={()=>onSelect(x.name)} title={`Filter to ${x.name}`}><span>{x.name}</span><i><b style={{width:`${x.count/max*100}%`}}/></i><strong>{x.count}</strong></button>)}<style jsx>{`.bars{display:grid;gap:10px;margin-top:10px}.bars button{display:grid;grid-template-columns:minmax(150px,220px) 1fr 36px;gap:10px;align-items:center;border:0;background:transparent;text-align:left;cursor:pointer;color:#0f172a;padding:3px 0}.bars button:hover span{color:#0f766e;text-decoration:underline}.bars span{font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.bars i{height:9px;background:#e2e8f0;border-radius:99px;overflow:hidden}.bars b{display:block;height:100%;background:#0f766e;border-radius:99px}.bars strong{text-align:right}@media(max-width:620px){.bars button{grid-template-columns:minmax(110px,1fr) 1fr 30px}}`}</style></div>}
