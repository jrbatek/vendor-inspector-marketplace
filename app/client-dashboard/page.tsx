"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase";

type Tab="request"|"active"|"history"|"analytics";
type SearchRow={id:string;request_text:string;result_count:number;status:string;created_at:string};
type InquiryRow={id:string;inspector_id:string;request_text:string;match_score:number|null;status:string;created_at:string};

export default function ClientDashboardPage(){
 const supabase=useMemo(()=>supabaseBrowser(),[]);
 const [tab,setTab]=useState<Tab>("request");
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

 return <main className="page">
  <section className="hero"><p className="eyebrow">Client workspace</p><h1>Manage your inspection program</h1><p>Request inspectors, follow active work, review history, and analyze performance from one workspace.</p></section>
  <nav className="tabs">
   <button className={tab==="request"?"active":""} onClick={()=>setTab("request")}>Request Inspection</button>
   <button className={tab==="active"?"active":""} onClick={()=>setTab("active")}>Inspections in Progress <b>{active.length}</b></button>
   <button className={tab==="history"?"active":""} onClick={()=>setTab("history")}>Inspection History <b>{history.length}</b></button>
   <button className={tab==="analytics"?"active":""} onClick={()=>setTab("analytics")}>Analytics</button>
  </nav>

  {message&&<p className="notice">{message}</p>}
  {!loading&&!message&&<section className="content">
   {tab==="request"&&<>
    <div className="sectionHead"><p className="eyebrow">Request Inspection</p><h2>Start the way you already work</h2><p>Use natural language, email, or structured selection. All three methods feed the same InspectSource matching workflow.</p></div>
    <div className="requestGrid">
     <article><span className="step">1</span><h3>Natural language request</h3><p>Describe the assignment in plain English and review ranked anonymous inspectors.</p><Link className="primary" href="/find-inspectors">Start natural-language request</Link></article>
     <article><span className="step">2</span><h3>Email your requirements</h3><p>Send requirements to InspectSource and let the AI Project Coordinator translate the email into the same staffing request.</p><a className="primary" href="mailto:inspectsource2026@gmail.com">Email InspectSource</a></article>
     <article><span className="step">3</span><h3>Select via an interface</h3><p>Build the requirement using standard client fields and dropdowns.</p><Link className="primary" href="/inspectors">Open structured selection</Link></article>
    </div>
    <section className="panel"><h3>Recent requests</h3>{searches.length===0?<p>No saved inspection searches yet.</p>:<div className="list">{searches.slice(0,5).map(x=><div className="listRow" key={x.id}><div><strong>{x.result_count} inspectors evaluated</strong><p>{x.request_text}</p></div><span>{new Date(x.created_at).toLocaleDateString()}</span></div>)}</div>}</section>
   </>}

   {tab==="active"&&<>
    <div className="sectionHead"><p className="eyebrow">Inspections in Progress</p><h2>Active inspection portfolio</h2><p>Current production data is shown from open client requests. As inspection execution data is wired in, this view will also show schedule, spend, reports, NCRs and client actions just like the Demo.</p></div>
    <div className="stats"><Stat label="Active" value={active.length}/><Stat label="Average match" value={`${avgMatch}%`}/><Stat label="Open requests" value={active.length}/><Stat label="Reports" value="Coming next"/></div>
    {active.length===0?<section className="empty"><h3>No inspections in progress</h3><p>Approved assignments will appear here automatically.</p><Link className="primary" href="/find-inspectors">Request an inspection</Link></section>:<div className="cards">{active.map(x=>{const open=expanded===x.id;return <article className="card" key={x.id}><button className="summary" onClick={()=>setExpanded(open?null:x.id)}><div><small>Inspector #{shortId(x.inspector_id)}</small><strong>{requestTitle(x.request_text)}</strong><span>{x.match_score??"—"}% match · {titleCase(x.status)}</span></div><span>{open?"−":"+"}</span></button>{open&&<div className="details"><p><strong>Request:</strong> {x.request_text}</p><div className="placeholderGrid"><Placeholder title="Schedule & progress"/><Placeholder title="Budget & actual"/><Placeholder title="Reports & NCRs"/><Placeholder title="Client actions"/></div><Link href={`/inspectors/${x.inspector_id}`}>Review inspector qualifications</Link></div>}</article>})}</div>}
   </>}

   {tab==="history"&&<>
    <div className="sectionHead"><p className="eyebrow">Inspection History</p><h2>Your complete inspection record</h2><p>Completed and closed client requests appear here today. The next data-model step will attach projects, reports, actual spend, NCRs and closeout records directly to each inspection.</p></div>
    <section className="apiBanner"><div><p className="eyebrow">Your data. Your systems.</p><h2>Get API access to all of your inspection data</h2><p>InspectSource will make client inspection records portable into ERP, procurement, data lakes, Power BI and internal applications.</p></div><div><code>GET /api/v1/client/inspections</code><code>GET /api/v1/client/reports</code><code>GET /api/v1/client/findings</code></div></section>
    {history.length===0?<section className="empty"><h3>No completed inspections yet</h3><p>Closed assignments will build your searchable inspection history.</p></section>:<div className="panel"><div className="historyHeader"><span>Inspection</span><span>Status</span><span>Inspector</span><span>Match</span><span>Date</span></div>{history.map(x=><div className="historyRow" key={x.id}><div><strong>{requestTitle(x.request_text)}</strong><small>{x.request_text}</small></div><span>{titleCase(x.status)}</span><span>#{shortId(x.inspector_id)}</span><span>{x.match_score??"—"}%</span><span>{new Date(x.created_at).toLocaleDateString()}</span></div>)}</div>}
   </>}

   {tab==="analytics"&&<>
    <div className="sectionHead"><p className="eyebrow">Analytics</p><h2>Inspection program performance</h2><p>This tab uses live client request data now and is structured for the richer cost, quality, schedule and anonymized peer analytics shown in the Demo.</p></div>
    <div className="analytics"><section className="panel"><h3>Current activity</h3><Metric label="Saved searches" value={String(searches.length)}/><Metric label="Inspector requests" value={String(inquiries.length)}/><Metric label="Average match score" value={`${avgMatch}%`}/></section><section className="panel"><h3>Workflow performance</h3><Metric label="Open assignments" value={String(active.length)}/><Metric label="Closed/completed" value={String(history.length)}/><Metric label="Completion rate" value={`${completionRate}%`}/></section><section className="panel benchmark"><h3>Anonymized peer benchmarking</h3><p>Once sufficient production inspection data exists, clients will be able to compare cost, schedule, NCR frequency, report turnaround and quality outcomes against anonymized comparable inspections.</p><strong>Peer identities and confidential project data will never be exposed.</strong></section></div>
   </>}
  </section>}

  <style jsx>{`
   .page{max-width:1220px;margin:auto;padding:30px 18px 80px}.hero,.content,.panel,.card,.empty{background:#fff;border:1px solid #dbe3ee}.hero{padding:30px;border-radius:18px}.hero h1,.sectionHead h2{margin:0}.hero p,.sectionHead p,.listRow p{color:#64748b}.eyebrow{margin:0 0 6px;font-size:.75rem;font-weight:900;letter-spacing:.12em;text-transform:uppercase;color:#475569}.tabs{display:grid;grid-template-columns:repeat(4,1fr);gap:3px;margin-top:18px;padding:3px;background:#e8eef7;border:1px solid #b8c5d8;border-radius:14px 14px 0 0}.tabs button{border:0;min-height:54px;padding:13px;background:#dbe5f2;color:#20324a;font-weight:900;cursor:pointer}.tabs button.active{background:#0f172a;color:white}.tabs b{margin-left:8px;background:#fff;color:#0f172a;border-radius:999px;padding:3px 7px}.content{border-top:0;border-radius:0 0 18px 18px;padding:30px}.requestGrid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}.requestGrid article{display:flex;flex-direction:column;border:1px solid #dbe3ee;border-radius:14px;padding:20px}.requestGrid p{color:#64748b}.step{display:grid;place-items:center;width:32px;height:32px;border-radius:50%;background:#0f172a;color:white;font-weight:900}.primary{display:inline-flex;justify-content:center;margin-top:auto;padding:11px 14px;border-radius:9px;background:#0f172a;color:#fff;text-decoration:none;font-weight:800}.panel{border-radius:14px;padding:20px;margin-top:18px}.list{display:grid;gap:8px}.listRow{display:flex;justify-content:space-between;gap:18px;padding:12px;border-top:1px solid #e2e8f0}.listRow p{margin:4px 0}.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:18px 0}.stat{padding:15px;background:#f8fafc;border-radius:10px}.stat strong{display:block;font-size:1.35rem}.stat span{font-size:.75rem;color:#64748b}.cards{display:grid;gap:9px}.card{border-radius:12px;overflow:hidden}.summary{width:100%;border:0;background:#fff;padding:15px;display:flex;justify-content:space-between;text-align:left;cursor:pointer}.summary div{display:flex;flex-direction:column}.summary small,.summary span,.historyRow small{color:#64748b}.details{padding:18px;border-top:1px solid #e2e8f0;background:#fcfdff}.placeholderGrid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:15px 0}.placeholder{padding:12px;background:#f8fafc;border-radius:9px}.placeholder span{display:block;color:#64748b;font-size:.74rem}.empty{padding:24px;border-radius:14px}.apiBanner{display:grid;grid-template-columns:1.4fr .8fr;gap:20px;margin:18px 0;padding:22px;background:#eff6ff;border:1px solid #93c5fd;border-radius:14px}.apiBanner div:last-child{display:flex;flex-direction:column;gap:8px;background:#0f172a;padding:14px;border-radius:10px}.apiBanner code{color:#fff;background:#1e293b;padding:8px;border-radius:6px}.historyHeader,.historyRow{display:grid;grid-template-columns:2fr .7fr .7fr .5fr .7fr;gap:12px;align-items:center}.historyHeader{font-size:.72rem;text-transform:uppercase;color:#64748b;font-weight:900}.historyRow{padding:13px 0;border-top:1px solid #e2e8f0}.historyRow div{display:flex;flex-direction:column}.analytics{display:grid;grid-template-columns:1fr 1fr;gap:14px}.benchmark{grid-column:1/-1;background:#f8fbff}.metric{display:flex;justify-content:space-between;padding:10px 0;border-top:1px solid #e2e8f0}@media(max-width:850px){.tabs,.requestGrid,.stats,.analytics{grid-template-columns:1fr}.placeholderGrid{grid-template-columns:1fr 1fr}.apiBanner{grid-template-columns:1fr}.historyHeader{display:none}.historyRow{grid-template-columns:1fr}.benchmark{grid-column:auto}}
  `}</style>
 </main>;
}

function shortId(id:string){return id.replace(/-/g,"").slice(-6).toUpperCase()}
function requestTitle(text:string){return text.length>72?`${text.slice(0,72)}…`:text}
function titleCase(v:string){return (v||"unknown").replace(/_/g," ").replace(/\b\w/g,m=>m.toUpperCase())}
function Stat({label,value}:{label:string;value:string|number}){return <div className="stat"><strong>{value}</strong><span>{label}</span></div>}
function Metric({label,value}:{label:string;value:string}){return <div className="metric"><span>{label}</span><strong>{value}</strong></div>}
function Placeholder({title}:{title:string}){return <div className="placeholder"><strong>{title}</strong><span>Production inspection data model to be connected</span></div>}
