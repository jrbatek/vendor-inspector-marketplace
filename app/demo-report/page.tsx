type Props={searchParams:{id?:string;title?:string;inspection?:string;date?:string}};

export default function DemoReportPage({searchParams}:Props){
 const title=searchParams.title||"Vendor Inspection Report";
 const inspection=searchParams.inspection||"IS-DEMO";
 const date=searchParams.date||"Aug 22, 2026";
 return <main style={{maxWidth:900,margin:"0 auto",padding:"36px 20px 80px"}}>
  <section style={{border:"1px solid #e2e8f0",borderRadius:16,background:"#fff",overflow:"hidden"}}>
   <header style={{padding:28,borderBottom:"1px solid #e2e8f0"}}>
    <p style={{margin:"0 0 6px",fontSize:12,fontWeight:800,letterSpacing:1.5,textTransform:"uppercase",color:"#64748b"}}>InspectSource · Synthetic Demo Report</p>
    <h1 style={{margin:"0 0 8px",fontSize:30}}>{title}</h1>
    <p style={{margin:0,color:"#64748b"}}>Inspection {inspection} · {date}</p>
   </header>
   <div style={{padding:28}}>
    <div style={{padding:"14px 16px",border:"1px solid #f3c969",background:"#fff9e8",borderRadius:10,marginBottom:24,color:"#7a5410"}}><strong>Demo report format:</strong> InspectSource report layouts, branding, fields, approval workflows, terminology and client-required templates can be customized.</div>
    <h2>Inspection summary</h2><p style={{lineHeight:1.65,color:"#475569"}}>The assigned inspector attended the supplier facility and completed the planned surveillance activities for this visit. Records below are synthetic and are provided only to demonstrate how client reports could be presented through InspectSource.</p>
    <h2>Activities completed</h2><ul style={{lineHeight:1.8,color:"#334155"}}><li>Reviewed applicable inspection and test plan hold/witness points.</li><li>Verified material identification and traceability records.</li><li>Observed fabrication and inspection activities applicable to the visit scope.</li><li>Reviewed supplier documentation and outstanding action items.</li></ul>
    <h2>Findings</h2><div style={{padding:16,background:"#f8fafc",borderRadius:10}}><strong>Demo finding</strong><p style={{marginBottom:0,lineHeight:1.6,color:"#475569"}}>One documentation item remains open for supplier correction. No additional reportable deviations were identified during this visit.</p></div>
    <h2>Next action</h2><p style={{lineHeight:1.65,color:"#475569"}}>Follow up on the open documentation item and continue surveillance at the next scheduled inspection point.</p>
   </div>
  </section>
 </main>
}
