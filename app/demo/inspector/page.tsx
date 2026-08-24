"use client";

import { useState } from "react";

type Tab = "opportunities" | "active" | "schedule" | "insights" | "profile" | "history";

const opportunities = [
  { title:"API 570 Piping Inspector", location:"Baytown, Texas", dates:"Sep 14 – Oct 4", rate:"$950/day", match:92, client:"Gulf Coast Refining Project" },
  { title:"Vendor Surveillance Inspector", location:"Rotterdam, Netherlands", dates:"Oct 12 – Oct 23", rate:"€880/day", match:84, client:"European Energy Expansion" },
  { title:"Welding Inspector", location:"Singapore", dates:"Nov 2 – Nov 20", rate:"SGD 900/day", match:78, client:"Asia Pacific Module Program" },
];

const active = [
  { title:"Pressure Vessel Fabrication Surveillance", project:"Gulf Coast Refinery Expansion", location:"Houston, Texas", progress:62, reports:8, earnings:"$9,350", status:"On schedule" },
  { title:"Skid Package Final Inspection", project:"LNG Compression Upgrade", location:"Lake Charles, Louisiana", progress:35, reports:3, earnings:"$4,100", status:"Client clarification needed" },
];

const schedule = [
  ["Aug 24","Skid package dimensional verification","Lake Charles, Louisiana","Confirmed"],
  ["Aug 26","Pressure vessel hydrotest witness","Houston, Texas","Confirmed"],
  ["Sep 2–4","Personal availability hold","Houston, Texas","Blocked"],
  ["Sep 14–Oct 4","API 570 turnaround support","Baytown, Texas","Pending response"],
  ["Oct 12–23","Vendor surveillance assignment","Rotterdam, Netherlands","Tentative"],
];

const selectionInsights = [
  {
    title:"API 570 Turnaround Support",
    location:"Baytown, Texas",
    date:"August 2026",
    yourMatch:86,
    selectedMatch:94,
    rank:"3 of 11 qualified candidates",
    outcome:"Not selected",
    source:"Client-provided feedback + matching data",
    strengths:["API 570 current and verified","18 years total inspection experience","Local Houston-area availability","Rate was competitive"],
    gaps:["Selected profile had more recent refinery piping assignments","Client preferred API 510 in addition to API 570","Selected profile had a slightly higher recent client rating"],
    improve:"Keep API 510 prominently verified and add more recent refinery/piping project history. These changes would also improve eligibility for similar turnaround assignments."
  },
  {
    title:"LNG Vendor Surveillance Inspector",
    location:"Rotterdam, Netherlands",
    date:"June 2026",
    yourMatch:79,
    selectedMatch:90,
    rank:"5 of 14 qualified candidates",
    outcome:"Not selected",
    source:"Based on matching data",
    strengths:["Strong pressure-equipment experience","International travel enabled","Report quality rated above peer median"],
    gaps:["Selected profile showed more recent LNG experience","Selected profile was already Europe-based","Travel timing created a two-day availability gap"],
    improve:"Add LNG-specific equipment/project history and keep travel availability current. Location and immediate availability were meaningful differentiators on this assignment."
  }
];

const ratingDimensions = [["Inspection quality","5.0"],["Report quality","4.9"],["Responsiveness","4.8"],["Schedule reliability","4.9"],["Professionalism","5.0"]];

export default function InspectorDemoPage(){
  const [tab,setTab]=useState<Tab>("opportunities");
  const [showRatings,setShowRatings]=useState(false);
  return <main className="workspace">
    <section className="hero"><div><p className="eyebrow">Synthetic inspector demonstration</p><h1>Inspector workspace</h1><p>Manage opportunities, assignments, schedule, qualifications, feedback, reports and earnings through InspectSource.</p></div><div className="identity"><strong>Michael Torres</strong><span>API / Pressure Equipment Inspector</span><span>Houston, Texas</span><b>Verified by InspectSource</b></div></section>

    <nav className="tabs">
      <button className={tab==="opportunities"?"active":""} onClick={()=>setTab("opportunities")}>Opportunities <b>3</b></button>
      <button className={tab==="active"?"active":""} onClick={()=>setTab("active")}>Active Assignments <b>2</b></button>
      <button className={tab==="schedule"?"active":""} onClick={()=>setTab("schedule")}>Schedule & Calendar</button>
      <button className={tab==="insights"?"active":""} onClick={()=>setTab("insights")}>Selection Insights <b>2</b></button>
      <button className={tab==="profile"?"active":""} onClick={()=>setTab("profile")}>Profile & Qualifications</button>
      <button className={tab==="history"?"active":""} onClick={()=>setTab("history")}>History & Earnings</button>
    </nav>

    {tab==="opportunities"&&<section className="panel"><Header eyebrow="Matched opportunities" title="Work that fits your qualifications" right="Available Immediately"/><div className="cards">{opportunities.map(x=><article className="opportunity" key={x.title}><div className="score">{x.match}%</div><div><h3>{x.title}</h3><p>{x.client}</p><div className="chips"><span>{x.location}</span><span>{x.dates}</span><span>{x.rate}</span></div></div><div className="actions"><button>Review assignment</button><button className="secondary">Decline</button></div></article>)}</div></section>}

    {tab==="active"&&<section className="panel"><Header eyebrow="Current workload" title="Active inspection assignments" right="$13,450 earned"/><div className="cards">{active.map(x=><article className="assignment" key={x.title}><div className="row"><div><h3>{x.title}</h3><p>{x.project} · {x.location}</p></div><span className={x.status.includes("needed")?"attention":"good"}>{x.status}</span></div><div className="progress"><i style={{width:`${x.progress}%`}}/></div><div className="metrics"><span><b>{x.progress}%</b> complete</span><span><b>{x.reports}</b> reports</span><span><b>{x.earnings}</b> earnings</span><span><b>Next:</b> Inspection milestone</span></div></article>)}</div></section>}

    {tab==="schedule"&&<section className="panel"><Header eyebrow="Schedule & availability" title="Your inspection calendar" right="Update availability"/><div className="stats"><Stat label="Confirmed inspection days" value="7"/><Stat label="Tentative days" value="14"/><Stat label="Blocked days" value="3"/><Stat label="Next open date" value="Aug 27"/></div><div className="calendar"><div className="month"><h3>September 2026</h3><div className="weekdays">{["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d=><span key={d}>{d}</span>)}</div><div className="days">{Array.from({length:35},(_,i)=>i-1).map((d,i)=><span key={i} className={d>=14&&d<=30?"booked":d>=2&&d<=4?"blocked":""}>{d>0&&d<=30?d:""}</span>)}</div></div><div className="agenda"><h3>Upcoming</h3>{schedule.map(x=><div className="agendaRow" key={x[0]+x[1]}><b>{x[0]}</b><div><strong>{x[1]}</strong><span>{x[2]}</span></div><em>{x[3]}</em></div>)}</div></div></section>}

    {tab==="insights"&&<section className="panel"><Header eyebrow="Selection feedback" title="Learn from every opportunity" right="Private & anonymized"/><div className="insightIntro"><strong>Even when you are not selected, InspectSource helps you understand why.</strong><span>We never reveal another inspector’s identity. Client-provided reasons and system-derived matching insights are labeled separately.</span></div><div className="stats"><Stat label="Opportunities matched" value="24"/><Stat label="Shortlisted" value="15"/><Stat label="Selected" value="7"/><Stat label="Selection rate" value="47%"/></div><div className="cards">{selectionInsights.map(x=><article className="insight" key={x.title}><div className="row"><div><span className="source">{x.source}</span><h3>{x.title}</h3><p>{x.location} · {x.date}</p></div><span className="attention">{x.outcome}</span></div><div className="comparison"><div><span>Your match</span><strong>{x.yourMatch}%</strong></div><div><span>Selected profile</span><strong>{x.selectedMatch}%</strong></div><div><span>Your ranking</span><strong>{x.rank}</strong></div></div><div className="columns"><div><h4>Where you were strong</h4><ul>{x.strengths.map(y=><li key={y}>{y}</li>)}</ul></div><div><h4>What differentiated the selection</h4><ul>{x.gaps.map(y=><li key={y}>{y}</li>)}</ul></div></div><div className="improve"><strong>How to improve your chances</strong><span>{x.improve}</span></div></article>)}</div><div className="market"><h3>Your competitive position</h3><div className="columns"><div><strong>You outperform comparable inspectors in</strong><ul><li>Refinery and pressure-equipment experience</li><li>Client ratings and report quality</li><li>API credential coverage</li></ul></div><div><strong>Highest-value improvements</strong><ul><li>Add more recent LNG project history</li><li>Keep international availability current</li><li>Verify all supplemental API credentials</li></ul></div></div></div></section>}

    {tab==="profile"&&<section className="panel"><Header eyebrow="Marketplace profile" title="Qualifications clients can match against" right="Profile 94% complete"/><div className="profileGrid"><Info title="Professional experience" items={["18+ years inspection experience","Pressure Equipment / Piping","Independent inspector"]}/><Info title="Certifications" items={["API 570 — Current","API 510 — Current","AWS CWI — Current","TWIC — Current"]}/><Info title="Industries & equipment" items={["Refining / Petrochemical","LNG","Pressure vessels","Process piping","Heat exchangers"]}/><Info title="Availability & rates" items={["Available Immediately","Domestic travel","International travel up to 10 hours","$850/day standard rate"]}/></div></section>}

    {tab==="history"&&<section className="panel"><div className="stats"><Stat label="Completed assignments" value="47"/><Stat label="Reports submitted" value="186"/><Stat label="2026 earnings" value="$74,800"/><button className="rating" onClick={()=>setShowRatings(!showRatings)}><span>Client rating</span><strong>4.9 / 5</strong><small>{showRatings?"Hide detail":"View detail"}</small></button></div>{showRatings&&<div className="ratingPanel"><Header eyebrow="Client feedback" title="4.9 / 5 overall rating" right="32 ratings"/>{ratingDimensions.map(([l,v])=><div className="ratingRow" key={l}><span>{l}</span><div><i style={{width:`${Number(v)/5*100}%`}}/></div><b>{v}</b></div>)}</div>}<div className="history"><h2>Recent completed assignments</h2>{[["API 570 Turnaround Support","Corpus Christi, Texas · Jul 2026","$10,200"],["Pressure Vessel Final Inspection","Doha, Qatar · May 2026","$8,400"],["Vendor Surveillance Program","Rotterdam, Netherlands · Mar 2026","€12,750"]].map(x=><div className="historyRow" key={x[0]}><div><strong>{x[0]}</strong><span>{x[1]}</span></div><b>{x[2]} earned</b><span className="good">Completed</span></div>)}</div></section>}

    <style jsx>{`
      .workspace{max-width:1150px;margin:0 auto;padding:30px 18px 70px}.hero,.panel{background:#fff;border:1px solid #dbe3ee;border-radius:18px}.hero{padding:26px;display:flex;justify-content:space-between;gap:24px}.hero h1{margin:0}.hero p,.opportunity p,.assignment p,.insight p{color:#64748b}.eyebrow{margin:0 0 6px;font-size:.72rem;font-weight:900;letter-spacing:.12em;text-transform:uppercase;color:#475569}.identity{min-width:235px;padding:15px;border-radius:14px;background:#ecfdf5;display:grid;gap:4px}.identity span{font-size:.8rem;color:#475569}.identity b{color:#166534;font-size:.76rem}.tabs{display:grid;grid-template-columns:repeat(6,1fr);gap:3px;padding:3px;margin:18px 0;background:#e8eef7;border:1px solid #cbd5e1;border-radius:14px}.tabs button{padding:12px 8px;border:0;border-radius:10px;background:#dbe5f2;color:#20324a;font-weight:850;cursor:pointer}.tabs button.active{background:#0f172a;color:#fff}.tabs b{margin-left:4px;padding:2px 6px;border-radius:999px;background:#fff;color:#0f172a}.panel{padding:24px}.sectionHeader,.row{display:flex;justify-content:space-between;gap:15px;align-items:flex-start}.sectionHeader h2,.row h3{margin:0}.right{padding:7px 10px;border-radius:999px;background:#eff6ff;color:#1d4ed8;font-weight:850;font-size:.78rem}.cards{display:grid;gap:13px;margin-top:18px}.opportunity{display:grid;grid-template-columns:65px 1fr auto;gap:16px;padding:18px;border:1px solid #e2e8f0;border-radius:14px}.score{display:grid;place-items:center;width:56px;height:56px;border:2px solid #0f172a;border-radius:50%;font-weight:900}.chips{display:flex;gap:6px;flex-wrap:wrap}.chips span{padding:5px 8px;border-radius:999px;background:#f1f5f9;font-size:.76rem}.actions{display:flex;flex-direction:column;gap:6px}.actions button{padding:9px 12px;border:0;border-radius:9px;background:#0f172a;color:#fff;font-weight:800}.actions .secondary{background:#fff;color:#0f172a;border:1px solid #cbd5e1}.assignment,.insight{padding:19px;border:1px solid #e2e8f0;border-radius:14px}.good,.attention{padding:6px 9px;border-radius:999px;font-weight:850;font-size:.75rem}.good{background:#dcfce7;color:#166534}.attention{background:#fef3c7;color:#92400e}.progress{height:9px;background:#e2e8f0;border-radius:999px;margin:15px 0;overflow:hidden}.progress i{display:block;height:100%;background:#2563eb}.metrics,.stats,.comparison{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}.metrics span,.stats :global(.stat),.comparison>div{padding:12px;border-radius:11px;background:#f8fafc;border:1px solid #e2e8f0}.metrics span,.stats :global(.stat span),.comparison span{font-size:.76rem;color:#64748b}.stats :global(.stat strong),.comparison strong{display:block;font-size:1.25rem}.calendar{display:grid;grid-template-columns:1fr 1.25fr;gap:18px;margin-top:18px}.month,.agenda{padding:17px;border:1px solid #e2e8f0;border-radius:14px}.weekdays,.days{display:grid;grid-template-columns:repeat(7,1fr);gap:4px}.weekdays span{text-align:center;font-size:.7rem;color:#64748b}.days span{min-height:36px;display:grid;place-items:center;border-radius:7px;background:#f8fafc}.days .booked{background:#dbeafe;color:#1d4ed8;font-weight:900}.days .blocked{background:#fee2e2;color:#991b1b;font-weight:900}.agendaRow{display:grid;grid-template-columns:92px 1fr auto;gap:10px;padding:10px 0;border-top:1px solid #e2e8f0}.agendaRow div{display:grid}.agendaRow span,.agendaRow em{font-size:.75rem;color:#64748b}.insightIntro,.improve,.market{margin-top:16px;padding:15px;border-radius:12px;background:#eff6ff;display:grid;gap:4px}.source{font-size:.7rem;font-weight:900;text-transform:uppercase;letter-spacing:.06em;color:#1d4ed8}.comparison{grid-template-columns:1fr 1fr 2fr;margin:15px 0}.columns,.profileGrid{display:grid;grid-template-columns:1fr 1fr;gap:14px}.columns>div,.profileGrid :global(.info){padding:14px;border-radius:12px;background:#f8fafc;border:1px solid #e2e8f0}.columns h4,.profileGrid :global(.info h3){margin-top:0}.columns ul,.profileGrid :global(.info ul){padding-left:19px;margin-bottom:0}.profileGrid{margin-top:18px}.rating{padding:12px;border:1px solid #bfdbfe;border-radius:11px;background:#eff6ff;text-align:left;display:grid;cursor:pointer}.rating span,.rating small{font-size:.76rem;color:#64748b}.rating strong{font-size:1.25rem}.ratingPanel{margin-top:18px;padding:18px;border:1px solid #dbe3ee;border-radius:14px}.ratingRow{display:grid;grid-template-columns:160px 1fr 35px;gap:9px;align-items:center;margin:8px 0}.ratingRow div{height:8px;background:#e2e8f0;border-radius:999px;overflow:hidden}.ratingRow i{display:block;height:100%;background:#16a34a}.history{margin-top:22px}.historyRow{display:grid;grid-template-columns:1fr auto auto;gap:15px;padding:13px 0;border-top:1px solid #e2e8f0;align-items:center}.historyRow div{display:grid}.historyRow span{font-size:.78rem;color:#64748b}@media(max-width:900px){.tabs{grid-template-columns:repeat(3,1fr)}.calendar,.columns,.profileGrid{grid-template-columns:1fr}.metrics,.stats{grid-template-columns:1fr 1fr}}@media(max-width:650px){.hero{flex-direction:column}.opportunity{grid-template-columns:60px 1fr}.actions{grid-column:1/-1;flex-direction:row}.comparison{grid-template-columns:1fr}.historyRow{grid-template-columns:1fr}.tabs{grid-template-columns:1fr 1fr}}@media(max-width:480px){.tabs,.metrics,.stats{grid-template-columns:1fr}}
    `}</style>
  </main>
}

function Header({eyebrow,title,right}:{eyebrow:string;title:string;right:string}){return <div className="sectionHeader"><div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2></div><span className="right">{right}</span></div>}
function Stat({label,value}:{label:string;value:string}){return <div className="stat"><span>{label}</span><strong>{value}</strong></div>}
function Info({title,items}:{title:string;items:string[]}){return <div className="info"><h3>{title}</h3><ul>{items.map(x=><li key={x}>{x}</li>)}</ul></div>}
