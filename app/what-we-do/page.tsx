import Link from "next/link";

export default function WhatWeDoPage(){
  return <main style={{maxWidth:1100,margin:"0 auto",padding:"48px 20px 72px"}}>
    <section style={{padding:"36px",border:"1px solid #e2e8f0",borderRadius:20,background:"#fff"}}>
      <p style={{fontSize:12,fontWeight:800,letterSpacing:".14em",textTransform:"uppercase",margin:0}}>Industrial inspection operating system</p>
      <h1 style={{fontSize:"clamp(2rem,5vw,4rem)",lineHeight:1.05,margin:"12px 0 18px"}}>Inspection resources, reporting and intelligence in one platform.</h1>
      <p style={{fontSize:18,lineHeight:1.6,color:"#475569",maxWidth:800}}>InspectSource helps industrial clients find qualified inspection support, coordinate assignments, capture structured inspection evidence and learn from inspection history. Inspectors get their own workspace for assignments, reporting, schedules and independent work.</p>
      <div style={{display:"flex",gap:12,flexWrap:"wrap",marginTop:24}}><Link href="/find-inspectors" style={{padding:"12px 16px",borderRadius:10,background:"#0f172a",color:"white",textDecoration:"none",fontWeight:800}}>Find Inspectors</Link><Link href="/inspectorhub" style={{padding:"12px 16px",borderRadius:10,border:"1px solid #cbd5e1",color:"#0f172a",textDecoration:"none",fontWeight:800}}>Explore InspectorHub</Link></div>
    </section>
    <section style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:16,marginTop:18}}>
      {[
        ["For Clients","Find and coordinate qualified inspectors, manage inspection activity and build useful inspection history."],
        ["For Inspectors","Maintain qualifications, availability, schedules, reports and work performed across multiple companies."],
        ["Inspection Intelligence","Turn submitted inspection records into structured supplier, asset and equipment intelligence that supports future planning."],
        ["Equipment Intelligence","Use reusable equipment knowledge to organize inspection activities, findings, test milestones and documentation without locking the platform to one industry."],
        ["Asset History","Create a permanent record of what was inspected, what evidence was captured and what changed over time."],
        ["Built for What Comes Next","Keep the evidence model independent of the inspection resource so humans, instruments, sensors, remote tools and future technologies can all contribute."],
      ].map(([title,text])=><article key={title} style={{padding:22,border:"1px solid #e2e8f0",borderRadius:16,background:"#fff"}}><h2 style={{marginTop:0,fontSize:20}}>{title}</h2><p style={{color:"#475569",lineHeight:1.55,marginBottom:0}}>{text}</p></article>)}
    </section>
  </main>
}
