"use client";

import { useMemo, useState } from "react";

type Row = {
  id: string;
  month: string;
  region: string;
  country: string;
  commodity: string;
  projectType: string;
  timing: string;
  status: string;
  spend: number;
  inspections: number;
  ncr: boolean;
  ncrType: string;
  supplier: string;
};

const DATA: Row[] = [
  {id:"IS-4101",month:"Apr",region:"North America",country:"USA",commodity:"Pressure Vessels",projectType:"Vendor Inspection",timing:"On time",status:"Completed",spend:18400,inspections:4,ncr:false,ncrType:"None",supplier:"Gulf Fabrication"},
  {id:"IS-4102",month:"Apr",region:"Europe",country:"Germany",commodity:"Rotating Equipment",projectType:"Expediting",timing:"Late",status:"Completed",spend:11250,inspections:3,ncr:true,ncrType:"Documentation",supplier:"Rhein Turbo"},
  {id:"IS-4103",month:"May",region:"Middle East",country:"UAE",commodity:"Valves",projectType:"Vendor Inspection",timing:"On time",status:"Completed",spend:23600,inspections:6,ncr:true,ncrType:"Dimensional",supplier:"Emirates Valve Works"},
  {id:"IS-4104",month:"May",region:"Asia Pacific",country:"South Korea",commodity:"Heat Exchangers",projectType:"Source Inspection",timing:"On time",status:"Completed",spend:19750,inspections:5,ncr:false,ncrType:"None",supplier:"Busan Thermal"},
  {id:"IS-4105",month:"Jun",region:"North America",country:"Canada",commodity:"Electrical",projectType:"FAT Witness",timing:"On time",status:"Completed",spend:9800,inspections:2,ncr:true,ncrType:"Functional Test",supplier:"Prairie Controls"},
  {id:"IS-4106",month:"Jun",region:"Europe",country:"Italy",commodity:"Pumps",projectType:"Vendor Inspection",timing:"Late",status:"Completed",spend:15600,inspections:4,ncr:true,ncrType:"Material Traceability",supplier:"Milano Pumps"},
  {id:"IS-4107",month:"Jul",region:"Middle East",country:"Saudi Arabia",commodity:"Piping",projectType:"Source Inspection",timing:"On time",status:"Active",spend:27100,inspections:7,ncr:false,ncrType:"None",supplier:"Eastern Pipe"},
  {id:"IS-4108",month:"Jul",region:"Asia Pacific",country:"India",commodity:"Structural Steel",projectType:"Vendor Inspection",timing:"On time",status:"Completed",spend:22150,inspections:6,ncr:true,ncrType:"Welding",supplier:"Deccan Steel"},
  {id:"IS-4109",month:"Aug",region:"North America",country:"USA",commodity:"Rotating Equipment",projectType:"FAT Witness",timing:"On time",status:"Active",spend:14200,inspections:3,ncr:false,ncrType:"None",supplier:"Texas Compression"},
  {id:"IS-4110",month:"Aug",region:"Europe",country:"Norway",commodity:"Subsea Equipment",projectType:"Vendor Inspection",timing:"Late",status:"Completed",spend:31800,inspections:8,ncr:true,ncrType:"Coating",supplier:"Nordic Subsea"},
  {id:"IS-4111",month:"Sep",region:"Middle East",country:"Qatar",commodity:"Pressure Vessels",projectType:"Expediting",timing:"On time",status:"Active",spend:17400,inspections:4,ncr:false,ncrType:"None",supplier:"Doha Process Systems"},
  {id:"IS-4112",month:"Sep",region:"Asia Pacific",country:"Singapore",commodity:"Valves",projectType:"Source Inspection",timing:"On time",status:"Active",spend:12850,inspections:3,ncr:true,ncrType:"Documentation",supplier:"Lion City Valves"},
];

const fmt = new Intl.NumberFormat("en-US", {style:"currency", currency:"USD", maximumFractionDigits:0});
const optionValues = (key: keyof Row) => ["All", ...Array.from(new Set(DATA.map(row => String(row[key]))))];

export default function ClientAnalyticsDemo(){
  const [region,setRegion]=useState("All");
  const [commodity,setCommodity]=useState("All");
  const [projectType,setProjectType]=useState("All");
  const [timing,setTiming]=useState("All");
  const [ncr,setNcr]=useState("All");
  const [ncrType,setNcrType]=useState("All");

  const filtered=useMemo(()=>DATA.filter(r =>
    (region==="All"||r.region===region)&&
    (commodity==="All"||r.commodity===commodity)&&
    (projectType==="All"||r.projectType===projectType)&&
    (timing==="All"||r.timing===timing)&&
    (ncr==="All"||(ncr==="With NCR"?r.ncr:!r.ncr))&&
    (ncrType==="All"||r.ncrType===ncrType)
  ),[region,commodity,projectType,timing,ncr,ncrType]);

  const spend=filtered.reduce((s,r)=>s+r.spend,0);
  const inspections=filtered.reduce((s,r)=>s+r.inspections,0);
  const ncrCount=filtered.filter(r=>r.ncr).length;
  const onTime=filtered.length?Math.round(filtered.filter(r=>r.timing==="On time").length/filtered.length*100):0;
  const months=["Apr","May","Jun","Jul","Aug","Sep"];
  const monthly=months.map(month=>({month,value:filtered.filter(r=>r.month===month).reduce((s,r)=>s+r.spend,0)}));
  const maxMonth=Math.max(...monthly.map(x=>x.value),1);
  const regions=Array.from(new Set(DATA.map(x=>x.region))).map(name=>({name,count:filtered.filter(r=>r.region===name).length}));
  const maxRegion=Math.max(...regions.map(x=>x.count),1);

  function reset(){setRegion("All");setCommodity("All");setProjectType("All");setTiming("All");setNcr("All");setNcrType("All");}

  return <main className="page">
    <section className="demoBanner" aria-label="Demo mode notice"><strong>Client Demo · Synthetic data</strong><span>This analytics workspace is populated with deterministic sample records only. It never reads from or writes to a production tenant.</span></section>

    <header className="header"><div><p className="eyebrow">Client Analytics</p><h1>Inspection performance at a glance</h1><p>Explore spend, timing, geography, commodities, project types, and non-conformance patterns. Every slicer cross-filters the KPIs, charts, map-style geography view, and inspection detail below.</p></div><button onClick={reset}>Reset filters</button></header>

    <section className="filters" aria-label="Analytics filters">
      <Filter label="Region" value={region} setValue={setRegion} values={optionValues("region")}/>
      <Filter label="Commodity" value={commodity} setValue={setCommodity} values={optionValues("commodity")}/>
      <Filter label="Project type" value={projectType} setValue={setProjectType} values={optionValues("projectType")}/>
      <Filter label="Timing" value={timing} setValue={setTiming} values={optionValues("timing")}/>
      <Filter label="Non-conformance" value={ncr} setValue={setNcr} values={["All","With NCR","No NCR"]}/>
      <Filter label="NCR type" value={ncrType} setValue={setNcrType} values={optionValues("ncrType")}/>
    </section>

    <section className="kpis" aria-label="Key performance indicators">
      <Kpi label="Inspection spend" value={fmt.format(spend)} note={`${filtered.length} projects in view`}/>
      <Kpi label="Inspection visits" value={String(inspections)} note="Synthetic completed + active visits"/>
      <Kpi label="On-time rate" value={`${onTime}%`} note="Based on filtered projects"/>
      <Kpi label="Projects with NCR" value={String(ncrCount)} note={`${filtered.length?Math.round(ncrCount/filtered.length*100):0}% of projects in view`}/>
    </section>

    <section className="grid">
      <article className="panel"><div className="panelHead"><div><p className="eyebrow">Trend</p><h2>Monthly inspection spend</h2></div><span>USD</span></div><div className="bars" aria-label="Monthly spend chart">{monthly.map(x=><div className="barCol" key={x.month}><span className="barValue">{x.value?fmt.format(x.value):"—"}</span><div className="barTrack"><div className="bar" style={{height:`${Math.max(x.value/maxMonth*100,x.value?8:0)}%`}}/></div><strong>{x.month}</strong></div>)}</div></article>

      <article className="panel"><div className="panelHead"><div><p className="eyebrow">Geography</p><h2>Projects by region</h2></div><span>Map-style view</span></div><div className="map" role="img" aria-label="Synthetic inspection geography by region">{regions.map((x,i)=><button key={x.name} className={`pin pin${i+1}`} title={`${x.name}: ${x.count} projects`} onClick={()=>setRegion(x.name)} disabled={!x.count}><span>{x.count}</span><small>{x.name}</small></button>)}</div><p className="hint">Select a region marker to cross-filter the full dashboard.</p></article>

      <article className="panel"><div className="panelHead"><div><p className="eyebrow">Portfolio</p><h2>Project type mix</h2></div><span>{filtered.length} projects</span></div><div className="rankList">{optionValues("projectType").slice(1).map(name=>{const count=filtered.filter(r=>r.projectType===name).length;return <button key={name} onClick={()=>setProjectType(name)}><span>{name}</span><i><b style={{width:`${count/Math.max(filtered.length,1)*100}%`}}/></i><strong>{count}</strong></button>})}</div></article>

      <article className="panel"><div className="panelHead"><div><p className="eyebrow">Quality</p><h2>NCR type mix</h2></div><span>{ncrCount} projects with NCR</span></div><div className="rankList">{optionValues("ncrType").slice(1).filter(x=>x!=="None").map(name=>{const count=filtered.filter(r=>r.ncrType===name).length;return <button key={name} onClick={()=>setNcrType(name)}><span>{name}</span><i><b style={{width:`${count/Math.max(ncrCount,1)*100}%`}}/></i><strong>{count}</strong></button>})}</div></article>
    </section>

    <section className="panel detail"><div className="panelHead"><div><p className="eyebrow">Cross-filtered inspection detail</p><h2>Projects in current view</h2></div><span>{filtered.length} records</span></div>{filtered.length===0?<div className="empty">No synthetic records match the current filters. Reset filters to restore the full demo.</div>:<div className="tableWrap"><table><thead><tr><th>Project</th><th>Supplier</th><th>Location</th><th>Commodity</th><th>Project type</th><th>Timing</th><th>NCR</th><th>Spend</th></tr></thead><tbody>{filtered.map(r=><tr key={r.id}><td><strong>{r.id}</strong><small>{r.status}</small></td><td>{r.supplier}</td><td>{r.country}<small>{r.region}</small></td><td>{r.commodity}</td><td>{r.projectType}</td><td><span className={r.timing==="Late"?"pill late":"pill"}>{r.timing}</span></td><td>{r.ncr?<span className="pill issue">{r.ncrType}</span>:<span className="pill clear">None</span>}</td><td>{fmt.format(r.spend)}</td></tr>)}</tbody></table></div>}</section>

    <section className="footnote"><strong>Demo/live boundary</strong><p>These analytics prove the intended client experience using synthetic records. Production analytics must use authenticated client-scoped data and the same visual components; this demo does not create API credentials, alter matching rules, or seed synthetic rows into production.</p></section>

    <style jsx>{`
      .page{max-width:1440px;margin:auto;padding:20px 18px 70px;color:#0f172a}.demoBanner{display:flex;align-items:center;gap:12px;padding:10px 14px;border:1px solid #99f6e4;background:#f0fdfa;border-radius:12px;color:#115e59;font-size:.9rem}.demoBanner span{color:#0f766e}.header{display:flex;justify-content:space-between;gap:24px;align-items:flex-start;padding:24px 0 16px}.header h1,.panel h2{margin:0}.header p{max-width:900px;color:#64748b}.header button{border:1px solid #cbd5e1;background:white;border-radius:9px;padding:10px 14px;font-weight:800;cursor:pointer}.eyebrow{margin:0 0 5px;text-transform:uppercase;letter-spacing:.12em;font-size:.72rem;font-weight:900;color:#0f766e}.filters{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:10px;padding:14px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px}.kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:14px 0}.kpi{padding:17px;border:1px solid #dbe3ee;border-radius:14px;background:white}.kpi span,.kpi small{display:block;color:#64748b}.kpi strong{display:block;font-size:1.65rem;margin:4px 0}.grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}.panel{border:1px solid #dbe3ee;border-radius:16px;background:white;padding:20px;min-width:0}.panelHead{display:flex;justify-content:space-between;gap:16px;align-items:flex-start}.panelHead>span{font-size:.78rem;color:#64748b}.bars{height:250px;display:flex;gap:10px;align-items:end;padding-top:28px}.barCol{flex:1;height:100%;display:grid;grid-template-rows:24px 1fr 22px;text-align:center;gap:5px}.barValue{font-size:.68rem;color:#64748b}.barTrack{height:100%;background:#f1f5f9;border-radius:8px;display:flex;align-items:end;overflow:hidden}.bar{width:100%;background:linear-gradient(180deg,#38bdf8,#1d4ed8);border-radius:8px 8px 0 0}.barCol strong{font-size:.8rem}.map{height:250px;border-radius:14px;position:relative;overflow:hidden;background:radial-gradient(circle at 30% 30%,#dbeafe,transparent 28%),radial-gradient(circle at 65% 45%,#ccfbf1,transparent 24%),linear-gradient(135deg,#f8fafc,#e2e8f0)}.map:after{content:"";position:absolute;inset:14% 12%;border:2px dashed #cbd5e1;border-radius:48% 42% 44% 40%;transform:rotate(-5deg)}.pin{position:absolute;z-index:2;border:0;background:#0f766e;color:white;width:48px;height:48px;border-radius:50%;font-weight:900;cursor:pointer;box-shadow:0 5px 16px #0f172a22}.pin small{position:absolute;top:52px;left:50%;transform:translateX(-50%);color:#334155;white-space:nowrap;font-size:.66rem}.pin:disabled{opacity:.25;cursor:not-allowed}.pin1{left:14%;top:37%}.pin2{left:43%;top:26%}.pin3{left:57%;top:47%}.pin4{left:78%;top:55%}.hint{font-size:.78rem;color:#64748b}.rankList{display:grid;gap:8px;margin-top:14px}.rankList button{display:grid;grid-template-columns:minmax(130px,1fr) 1.4fr 28px;gap:10px;align-items:center;border:0;background:transparent;padding:7px 0;text-align:left;cursor:pointer}.rankList i{height:8px;border-radius:999px;background:#e2e8f0;overflow:hidden}.rankList b{display:block;height:100%;background:#0f766e;border-radius:999px}.detail{margin-top:14px}.tableWrap{overflow:auto;margin-top:12px}table{width:100%;border-collapse:collapse;font-size:.86rem}th{text-align:left;font-size:.7rem;text-transform:uppercase;letter-spacing:.05em;color:#64748b;padding:10px;border-bottom:1px solid #cbd5e1}td{padding:11px 10px;border-bottom:1px solid #e2e8f0;vertical-align:top}td small{display:block;color:#64748b;margin-top:3px}.pill{display:inline-block;padding:4px 7px;border-radius:999px;background:#ecfeff;color:#155e75;font-size:.74rem;font-weight:800}.pill.late,.pill.issue{background:#fff7ed;color:#9a3412}.pill.clear{background:#f0fdf4;color:#166534}.empty{padding:28px;text-align:center;color:#64748b}.footnote{margin-top:14px;border-left:4px solid #0f766e;background:#f8fafc;padding:14px 16px}.footnote p{margin:4px 0;color:#64748b}@media(max-width:1100px){.filters{grid-template-columns:repeat(3,1fr)}.kpis{grid-template-columns:repeat(2,1fr)}}@media(max-width:760px){.header{display:block}.header button{margin-top:8px}.filters,.kpis,.grid{grid-template-columns:1fr}.demoBanner{align-items:flex-start;flex-direction:column}.bars{height:210px}.panel{padding:16px}}
    `}</style>
  </main>;
}

function Filter({label,value,setValue,values}:{label:string;value:string;setValue:(v:string)=>void;values:string[]}){return <label style={{display:"grid",gap:5,fontSize:12,fontWeight:800,color:"#475569"}}>{label}<select value={value} onChange={e=>setValue(e.target.value)} style={{width:"100%",padding:"9px 8px",border:"1px solid #cbd5e1",borderRadius:8,background:"white",color:"#0f172a"}}>{values.map(v=><option value={v} key={v}>{v}</option>)}</select></label>}
function Kpi({label,value,note}:{label:string;value:string;note:string}){return <article className="kpi"><span>{label}</span><strong>{value}</strong><small>{note}</small></article>}
