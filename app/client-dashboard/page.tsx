"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase";

type Section="request"|"active"|"history"|"analytics"|"billing"|"contracts"|"profile";
type SearchRow={id:string;request_text:string;result_count:number;status:string;created_at:string};
type InquiryRow={id:string;inspector_id:string;request_text:string;match_score:number|null;status:string;created_at:string};

export default function ClientDashboardPage(){
 const supabase=useMemo(()=>supabaseBrowser(),[]);
 const [section,setSection]=useState<Section>("request");
 const [searches,setSearches]=useState<SearchRow[]>([]);
 const [inquiries,setInquiries]=useState<InquiryRow[]>([]);
 const [loading,setLoading]=useState(true);
 const [message,setMessage]=useState("");
 const [expanded,setExpanded]=useState<string|null>(null);

 useEffect(()=>{void load();},[]);
 async function load(){
  const {data:auth}=await supabase.auth.getUser();
  if(!auth.user){setMessage("Log in to view the client workspace.");setLoading(false);return;}
  const [s,i]=await Promise.all([
   supabase.from("client_search_requests").select("id,request_text,result_count,status,created_at").eq("client_id",auth.user.id).order("created_at",{ascending:false}),
   supabase.from("client_inquiries").select("id,inspector_id,request_text,match_score,status,created_at").eq("client_id",auth.user.id).order("created_at",{ascending:false})
  ]);
  if(s.error||i.error)setMessage(s.error?.message||i.error?.message||"Unable to load workspace.");
  setSearches((s.data||[]) as SearchRow[]);setInquiries((i.data||[]) as InquiryRow[]);setLoading(false);
 }

 const active=inquiries.filter(x=>!["declined","closed","completed"].includes((x.status||"").toLowerCase()));
 const history=inquiries.filter(x=>["declined","closed","completed"].includes((x.status||"").toLowerCase()));
 const avgMatch=inquiries.length?Math.round(inquiries.reduce((s,x)=>s+(x.match_score||0),0)/inquiries.length):0;
 const completionRate=inquiries.length?Math.round(history.length/inquiries.length*100):0;

 return <main className="shell">
  <aside className="sidebar">
   <div className="sideTitle"><span>Client Workspace</span><strong>InspectSource</strong></div>
   <SideButton active={section==="request"} onClick={()=>setSection("request")} label="Request Inspectors" />
   <div className="subnav">
    <Link href="/find-inspectors">Natural language</Link>
    <a href="mailto:inspectsource2026@gmail.com">Email requirements</a>
    <Link href="/inspectors">Structured selection</Link>
   </div>
   <SideButton active={section==="active"} onClick={()=>setSection("active")} label={`Inspections in Progress (${active.length})`} />
   <SideButton active={section==="history"} onClick={()=>setSection("history")} label="Inspection History" />
   <SideButton active={section==="analytics"} onClick={()=>setSection("analytics")} label="Analytics" />
   <SideButton active={section==="billing"} onClick={()=>setSection("billing")} label="Billing & Payment" />
   <SideButton active={section==="contracts"} onClick={()=>setSection("contracts")} label="Contracts" />
   <SideButton active={section==="profile"} onClick={()=>setSection("profile")} label="Profile" />
  </aside>

  <section className="workspace">
   <section className="hero"><p className="eyebrow">Client workspace</p><h1>Manage your inspection program</h1><p>Request inspectors, follow active work, review history, and manage the commercial side of your inspection program from one place.</p></section>
   {message&&<p className="notice">{message}</p>}
   {!loading&&!message&&<section className="content">
    {section==="request"&&<RequestSection searches={searches}/>} 
    {section==="active"&&<ActiveSection active={active} avgMatch={avgMatch} expanded={expanded} setExpanded={setExpanded}/>} 
    {section==="history"&&<HistorySection history={history}/>} 
    {section==="analytics"&&<AnalyticsSection searches={searches} inquiries={inquiries} active={active} history={history} avgMatch={avgMatch} completionRate={completionRate}/>} 
    {section==="billing"&&<PlaceholderSection eyebrow="Billing & Payment" title="Transparent billing and payment management" text="This area will show inspection charges, platform fees, invoices, payment status, purchase-order references, payment methods and downloadable billing records. InspectSource pricing will be shown clearly with no hidden inspector deductions." cards={["Invoices & statements","Payment methods","Purchase orders","Fee transparency"]}/>} 
    {section==="contracts"&&<PlaceholderSection eyebrow="Contracts" title="Inspection agreements in one place" text="Clients will be able to review, approve and retrieve master agreements, assignment-specific terms, statements of work and related documents here." cards={["Master service agreements","Statements of work","Assignment terms","Document archive"]}/>} 
    {section==="profile"&&<PlaceholderSection eyebrow="Profile" title="Organization and user profile" text="Manage company details, locations, users, roles, notification preferences, integrations and security settings." cards={["Company profile","Users & permissions","Notifications","Integrations & API"]}/>} 
   </section>}
  </section>

  <style jsx>{`
   .shell{max-width:1440px;margin:auto;padding:24px 18px 80px;display:grid;grid-template-columns:250px minmax(0,1fr);gap:20px}.sidebar{position:sticky;top:18px;height:max-content;background:#0f172a;border-radius:16px;padding:16px;color:#fff}.sideTitle{padding:8px 8px 16px;border-bottom:1px solid #334155;margin-bottom:10px}.sideTitle span{display:block;font-size:.7rem;letter-spacing:.12em;text-transform:uppercase;color:#94a3b8}.sideTitle strong{font-size:1.15rem}.subnav{display:grid;gap:3px;margin:2px 0 10px 12px;padding-left:10px;border-left:1px solid #334155}.subnav :global(a){color:#cbd5e1;text-decoration:none;padding:7px 8px;border-radius:7px;font-size:.84rem}.subnav :global(a:hover){background:#1e293b;color:#fff}.workspace{min-width:0}.hero,.content,.panel,.card,.empty,.placeholderSection{background:#fff;border:1px solid #dbe3ee}.hero{padding:30px;border-radius:18px}.hero h1,.sectionHead h2{margin:0}.hero p,.sectionHead p,.listRow p,.placeholderSection p{color:#64748b}.eyebrow{margin:0 0 6px;font-size:.75rem;font-weight:900;letter-spacing:.12em;text-transform:uppercase;color:#475569}.content{margin-top:16px;border-radius:18px;padding:30px}.requestGrid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}.requestGrid article{display:flex;flex-direction:column;border:1px solid #dbe3ee;border-radius:14px;padding:20px}.requestGrid p{color:#64748b}.step{display:grid;place-items:center;width:32px;height:32px;border-radius:50%;background:#0f172a;color:white;font-weight:900}.primary{display:inline-flex;justify-content:center;margin-top:auto;padding:11px 14px;border-radius:9px;background:#0f172a;color:#fff;text-decoration:none;font-weight:800}.panel{border-radius:14px;padding:20px;margin-top:18px}.list{display:grid;gap:8px}.listRow{display:flex;justify-content:space-between;gap:18px;padding:12px;border-top:1px solid #e2e8f0}.listRow p{margin:4px 0}.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:18px 0}.stat{padding:15px;background:#f8fafc;border-radius:10px}.stat strong{display:block;font-size:1.35rem}.stat span{font-size:.75rem;color:#64748b}.cards{display:grid;gap:9px}.card{border-radius:12px;overflow:hidden}.summary{width:100%;border:0;background:#fff;padding:15px;display:flex;justify-content:space-between;text-align:left;cursor:pointer}.summary div{display:flex;flex-direction:column}.summary small,.summary span,.historyRow small{color:#64748b}.details{padding:18px;border-top:1px solid #e2e8f0;background:#fcfdff}.placeholderGrid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:15px 0}.miniPlaceholder{padding:12px;background:#f8fafc;border-radius:9px}.miniPlaceholder span{display:block;color:#64748b;font-size:.74rem}.empty{padding:24px;border-radius:14px}.apiBanner{display:grid;grid-template-columns:1.4fr .8fr;gap:20px;margin:18px 0;padding:22px;background:#eff6ff;border:1px solid #93c5fd;border-radius:14px}.apiBanner div:last-child{display:flex;flex-direction:column;gap:8px;background:#0f172a;padding:14px;border-radius:10px}.apiBanner code{color:#fff;background:#1e293b;padding:8px;border-radius:6px}.historyHeader,.historyRow{display:grid;grid-template-columns:2fr .7fr .7fr .5fr .7fr;gap:12px;align-items:center}.historyHeader{font-size:.72rem;text-transform:uppercase;color:#64748b;font-weight:900}.historyRow{padding:13px 0;border-top:1px solid #e2e8f0}.historyRow div{display:flex;flex-direction:column}.analytics{display:grid;grid-template-columns:1fr 1fr;gap:14px}.benchmark{grid-column:1/-1;background:#f8fbff}.metric{display:flex;justify-content:space-between;padding:10px 0;border-top:1px solid #e2e8f0}.placeholderSection{border-radius:16px;padding:26px}.placeholderCards{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin-top:18px}.placeholderCards article{padding:18px;border:1px solid #e2e8f0;border-radius:12px;background:#f8fafc}.placeholderCards span{display:block;color:#64748b;font-size:.82rem;margin-top:5px}.notice{padding:12px 14px;border-radius:10px;background:#f1f5f9}@media(max-width:980px){.shell{grid-template-columns:1fr}.sidebar{position:static}.requestGrid,.stats,.analytics{grid-template-columns:1fr}.placeholderGrid,.placeholderCards{grid-template-columns:1fr 1fr}.apiBanner{grid-template-columns:1fr}.historyHeader{display:none}.historyRow{grid-template-columns:1fr}.benchmark{grid-column:auto}}@media(max-width:620px){.placeholderGrid,.placeholderCards{grid-template-columns:1fr}}
  `}</style>
 </main>;
}

function SideButton({active,onClick,label}:{active:boolean;onClick:()=>void;label:string}){return <button onClick={onClick} style={{width:"100%",textAlign:"left",border:0,borderRadius:8,padding:"10px 9px",margin:"2px 0",background:active?"#fff":"transparent",color:active?"#0f172a":"#e2e8f0",fontWeight:800,cursor:"pointer"}}>{label}</button>}
function RequestSection({searches}:{searches:SearchRow[]}){return <><div className="sectionHead"><p className="eyebrow">Request Inspectors</p><h2>Start the way you already work</h2><p>Natural language, email and structured selection all feed the same InspectSource eligibility and ranking engine.</p></div><div className="requestGrid"><article><span className="step">1</span><h3>Natural language request</h3><p>Describe the assignment in plain English.</p><Link className="primary" href="/find-inspectors">Start natural-language request</Link></article><article><span className="step">2</span><h3>Email your requirements</h3><p>Send the requirement to InspectSource and let the AI Project Coordinator structure it.</p><a className="primary" href="mailto:inspectsource2026@gmail.com">Email InspectSource</a></article><article><span className="step">3</span><h3>Select via an interface</h3><p>Build the requirement using standard client fields.</p><Link className="primary" href="/inspectors">Open structured selection</Link></article></div><section className="panel"><h3>Recent requests</h3>{searches.length===0?<p>No saved inspection searches yet.</p>:<div className="list">{searches.slice(0,5).map(x=><div className="listRow" key={x.id}><div><strong>{x.result_count} inspectors evaluated</strong><p>{x.request_text}</p></div><span>{new Date(x.created_at).toLocaleDateString()}</span></div>)}</div>}</section></>}
function ActiveSection({active,avgMatch,expanded,setExpanded}:{active:InquiryRow[];avgMatch:number;expanded:string|null;setExpanded:(id:string|null)=>void}){return <><div className="sectionHead"><p className="eyebrow">Inspections in Progress</p><h2>Active inspection portfolio</h2><p>Open client requests appear here now; execution data will add schedule, spend, reports, NCRs and actions.</p></div><div className="stats"><Stat label="Active" value={active.length}/><Stat label="Average match" value={`${avgMatch}%`}/><Stat label="Open requests" value={active.length}/><Stat label="Reports" value="Coming next"/></div>{active.length===0?<section className="empty"><h3>No inspections in progress</h3><p>Approved assignments will appear here automatically.</p></section>:<div className="cards">{active.map(x=>{const open=expanded===x.id;return <article className="card" key={x.id}><button className="summary" onClick={()=>setExpanded(open?null:x.id)}><div><small>Inspector #{shortId(x.inspector_id)}</small><strong>{requestTitle(x.request_text)}</strong><span>{x.match_score??"—"}% match · {titleCase(x.status)}</span></div><span>{open?"−":"+"}</span></button>{open&&<div className="details"><p><strong>Request:</strong> {x.request_text}</p><div className="placeholderGrid"><MiniPlaceholder title="Schedule & progress"/><MiniPlaceholder title="Budget & actual"/><MiniPlaceholder title="Reports & NCRs"/><MiniPlaceholder title="Client actions"/></div><Link href={`/inspectors/${x.inspector_id}`}>Review inspector qualifications</Link></div>}</article>})}</div>}</>}
function HistorySection({history}:{history:InquiryRow[]}){return <><div className="sectionHead"><p className="eyebrow">Inspection History</p><h2>Your complete inspection record</h2><p>Completed and closed requests appear here today; project, report, spend and NCR records will attach to each inspection as those production models are wired in.</p></div><section className="apiBanner"><div><p className="eyebrow">Your data. Your systems.</p><h2>Get API access to all of your inspection data</h2><p>Move InspectSource data into ERP, procurement, data lakes, Power BI and internal applications.</p></div><div><code>GET /api/v1/client/inspections</code><code>GET /api/v1/client/reports</code><code>GET /api/v1/client/findings</code></div></section>{history.length===0?<section className="empty"><h3>No completed inspections yet</h3></section>:<div className="panel"><div className="historyHeader"><span>Inspection</span><span>Status</span><span>Inspector</span><span>Match</span><span>Date</span></div>{history.map(x=><div className="historyRow" key={x.id}><div><strong>{requestTitle(x.request_text)}</strong><small>{x.request_text}</small></div><span>{titleCase(x.status)}</span><span>#{shortId(x.inspector_id)}</span><span>{x.match_score??"—"}%</span><span>{new Date(x.created_at).toLocaleDateString()}</span></div>)}</div>}</>}
function AnalyticsSection({searches,inquiries,active,history,avgMatch,completionRate}:{searches:SearchRow[];inquiries:InquiryRow[];active:InquiryRow[];history:InquiryRow[];avgMatch:number;completionRate:number}){return <><div className="sectionHead"><p className="eyebrow">Analytics</p><h2>Inspection program performance</h2><p>Live request data now; richer cost, quality, schedule and anonymized peer analytics will build on this structure.</p></div><div className="analytics"><section className="panel"><h3>Current activity</h3><Metric label="Saved searches" value={String(searches.length)}/><Metric label="Inspector requests" value={String(inquiries.length)}/><Metric label="Average match score" value={`${avgMatch}%`}/></section><section className="panel"><h3>Workflow performance</h3><Metric label="Open assignments" value={String(active.length)}/><Metric label="Closed/completed" value={String(history.length)}/><Metric label="Completion rate" value={`${completionRate}%`}/></section><section className="panel benchmark"><h3>Anonymized peer benchmarking</h3><p>Compare cost, schedule, NCR frequency, report turnaround and quality outcomes against anonymized comparable inspections without exposing peer identities or confidential project data.</p></section></div></>}
function PlaceholderSection({eyebrow,title,text,cards}:{eyebrow:string;title:string;text:string;cards:string[]}){return <section className="placeholderSection"><p className="eyebrow">{eyebrow}</p><h2>{title}</h2><p>{text}</p><div className="placeholderCards">{cards.map(card=><article key={card}><strong>{card}</strong><span>Placeholder — production workflow to be connected.</span></article>)}</div></section>}
function shortId(id:string){return id.replace(/-/g,"").slice(-6).toUpperCase()}
function requestTitle(text:string){return text.length>72?`${text.slice(0,72)}…`:text}
function titleCase(v:string){return (v||"unknown").replace(/_/g," ").replace(/\b\w/g,m=>m.toUpperCase())}
function Stat({label,value}:{label:string;value:string|number}){return <div className="stat"><strong>{value}</strong><span>{label}</span></div>}
function Metric({label,value}:{label:string;value:string}){return <div className="metric"><span>{label}</span><strong>{value}</strong></div>}
function MiniPlaceholder({title}:{title:string}){return <div className="miniPlaceholder"><strong>{title}</strong><span>Production inspection data model to be connected</span></div>}
